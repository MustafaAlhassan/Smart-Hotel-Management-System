import { IRoom, RoomModel, RoomStatus } from "../../models/rooms/roomModel";
import { RoomTypeModel } from "../../models/rooms/roomTypeModel";

export const addRoom = async (
  data: Omit<IRoom, "_id" | "createdAt" | "updatedAt">,
) => {
  if (!data.roomNumber?.toString().trim()) throw new Error("Room number is required");
  if (!data.roomType) throw new Error("Room type is required");
  if (data.floor === undefined || data.floor === null) throw new Error("Floor number is required");
  if (isNaN(Number(data.floor)) || Number(data.floor) < 0) throw new Error("Floor must be a valid non-negative number");

  const roomType = await RoomTypeModel.findById(data.roomType);
  if (!roomType) throw new Error("The selected room type does not exist");

  const existing = await RoomModel.findOne({ roomNumber: data.roomNumber });
  if (existing) {
    const err: any = new Error("Room number already exists");
    err.code = 11000;
    err.keyPattern = { roomNumber: 1 };
    throw err;
  }

  const newRoom = new RoomModel({ ...data, floor: Number(data.floor) });
  await RoomTypeModel.findByIdAndUpdate(data.roomType, { $inc: { roomCount: 1 } });
  await newRoom.save();
  return newRoom.populate("roomType");
};

export const getRoomById = async (id: string) => {
  const room = await RoomModel.findById(id).populate("roomType");
  if (!room) throw new Error(`Room with ID "${id}" was not found`);
  return room;
};

export const findAllRooms = async (status?: RoomStatus) => {
  if (status && !Object.values(RoomStatus).includes(status)) {
    throw new Error(`Invalid status filter "${status}". Valid values are: ${Object.values(RoomStatus).join(", ")}`);
  }
  const filter = status ? { status } : {};
  return await RoomModel.find(filter).populate("roomType");
};

export const updateRoomInfo = async (id: string, updateData: Partial<IRoom>) => {
  const oldRoom = await RoomModel.findById(id);
  if (!oldRoom) throw new Error(`Room with ID "${id}" was not found`);

  if (updateData.floor !== undefined) {
    if (isNaN(Number(updateData.floor)) || Number(updateData.floor) < 0) {
      throw new Error("Floor must be a valid non-negative number");
    }
    updateData.floor = Number(updateData.floor);
  }

  if (updateData.roomNumber !== undefined) {
    const trimmed = updateData.roomNumber.toString().trim();
    if (!trimmed) throw new Error("Room number cannot be empty");
    const duplicate = await RoomModel.findOne({ roomNumber: trimmed, _id: { $ne: id } });
    if (duplicate) {
      const err: any = new Error("Room number already exists");
      err.code = 11000;
      err.keyPattern = { roomNumber: 1 };
      throw err;
    }
    updateData.roomNumber = trimmed;
  }

  if (updateData.status && !Object.values(RoomStatus).includes(updateData.status)) {
    throw new Error(`Invalid status "${updateData.status}". Valid values are: ${Object.values(RoomStatus).join(", ")}`);
  }

  const isTypeChanged =
    updateData.roomType &&
    updateData.roomType.toString() !== oldRoom.roomType.toString();

  if (isTypeChanged) {
    const newRoomType = await RoomTypeModel.findById(updateData.roomType);
    if (!newRoomType) throw new Error("The selected room type does not exist");

    await RoomTypeModel.findByIdAndUpdate(oldRoom.roomType, { $inc: { roomCount: -1 } });
    await RoomTypeModel.findByIdAndUpdate(updateData.roomType, { $inc: { roomCount: 1 } });
  }

  const updatedRoom = await RoomModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("roomType");

  return updatedRoom;
};

export const updateRoomStatus = async (roomId: string, newStatus: RoomStatus) => {
  if (!Object.values(RoomStatus).includes(newStatus)) {
    throw new Error(`Invalid status "${newStatus}". Valid values are: ${Object.values(RoomStatus).join(", ")}`);
  }

  const room = await RoomModel.findById(roomId);
  if (!room) throw new Error(`Room with ID "${roomId}" was not found`);

  if (room.status === newStatus) {
    throw new Error(`Room is already marked as "${newStatus}"`);
  }

  if (room.status === RoomStatus.OCCUPIED && newStatus !== RoomStatus.DIRTY) {
    throw new Error(`Occupied rooms can only be marked as "Dirty" after checkout`);
  }

  return await RoomModel.findByIdAndUpdate(
    roomId,
    { status: newStatus },
    { new: true, runValidators: true },
  );
};

export const markRoomAsDirty = async (roomId: string) => {
  return await updateRoomStatus(roomId, RoomStatus.DIRTY);
};

export const markRoomAsClean = async (roomId: string) => {
  return await updateRoomStatus(roomId, RoomStatus.AVAILABLE);
};

export const markRoomAsOccupied = async (roomId: string) => {
  return await updateRoomStatus(roomId, RoomStatus.OCCUPIED);
};

export const removeRoom = async (id: string) => {
  const room = await RoomModel.findById(id).populate("roomType");
  if (!room) throw new Error(`Room with ID "${id}" was not found`);

  if (room.status === RoomStatus.OCCUPIED) {
    throw new Error(`Cannot delete room "${room.roomNumber}" because it is currently occupied`);
  }

  await RoomTypeModel.findByIdAndUpdate(room.roomType, { $inc: { roomCount: -1 } });
  return await RoomModel.findByIdAndDelete(id).populate("roomType");
};