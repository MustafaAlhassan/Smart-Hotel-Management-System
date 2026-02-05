import { IRoom, RoomModel, RoomStatus } from "../../models/rooms/roomModel";

export const addRoom = async (
  data: Omit<IRoom, "_id" | "createdAt" | "updatedAt">
) => {
  const newRoom = new RoomModel(data);
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
  updateData: Partial<IRoom>
) => {
  return await RoomModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("roomType");
};

export const updateRoomStatus = async (
  roomId: string,
  newStatus: RoomStatus
) => {
  const room = await RoomModel.findByIdAndUpdate(
    roomId,
    { status: newStatus },
    { new: true, runValidators: true }
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
  return await RoomModel.findByIdAndDelete(id).populate("roomType");
};
