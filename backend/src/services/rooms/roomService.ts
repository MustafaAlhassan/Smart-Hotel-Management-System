import { IRoom, RoomModel } from "../../models/rooms/roomModel";

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

export const findAllRoom = async () => {
  return await RoomModel.find().populate("roomType");
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

export const removeRoom = async (id: string) => {
  return await RoomModel.findByIdAndDelete(id).populate("roomType");
};
