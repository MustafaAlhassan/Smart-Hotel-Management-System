import { IRoom, RoomModel, RoomStatus } from "../../models/rooms/roomModel";
import { RoomTypeModel } from "../../models/rooms/roomTypeModel";
import { getRoomTypeById } from "./roomTypeService";

export const addRoom = async (
  data: Omit<IRoom, "_id" | "createdAt" | "updatedAt">,
) => {
  const newRoom = new RoomModel(data);
  await RoomTypeModel.findByIdAndUpdate(data.roomType, {
    $inc: { bookingCount: 1 },
  });
  await newRoom.save();
  return newRoom.populate("roomType");
};

export const getRoomById = async (id: string) => {
  return await RoomModel.findById(id).populate("roomType");
};

export const findAllRooms = async (status?: RoomStatus) => {
  const filter = status ? { status } : {};
  return await RoomModel.find(filter).populate("roomType");
};

export const updateRoomInfo = async (
  id: string,
  updateData: Partial<IRoom>,
) => {
  const oldRoom = await RoomModel.findById(id);
  if (!oldRoom) throw new Error("Room is Not Found");

  const isTypeChanged =
    updateData.roomType &&
    updateData.roomType.toString() !== oldRoom.roomType.toString();

  if (isTypeChanged) {
    const newRoomType = await RoomTypeModel.findById(updateData.roomType);
    if (!newRoomType) throw new Error("The new Room Type is not found");

    await RoomTypeModel.findByIdAndUpdate(oldRoom.roomType, {
      $inc: { roomCount: -1 },
    });

    await RoomTypeModel.findByIdAndUpdate(updateData.roomType, {
      $inc: { roomCount: 1 },
    });
  }

  const updatedRoom = await RoomModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("roomType");

  return updatedRoom;
};

export const updateRoomStatus = async (
  roomId: string,
  newStatus: RoomStatus,
) => {
  const room = await RoomModel.findByIdAndUpdate(
    roomId,
    { status: newStatus },
    { new: true, runValidators: true },
  );

  if (!room) throw new Error("Room not found");
  return room;
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
  const room = await getRoomById(id);

  if (!room) throw new Error("Room is Not Found");
  await RoomTypeModel.findByIdAndUpdate(room.roomType.id, {
    $inc: { bookingCount: -1 },
  });

  return await RoomModel.findByIdAndDelete(id).populate("roomType");
};
