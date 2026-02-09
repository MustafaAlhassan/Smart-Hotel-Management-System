import { IRoomType, RoomTypeModel } from "../../models/rooms/roomTypeModel";

export const addRoomType = async (
  data: Omit<IRoomType, "_id" | "createdAt" | "updatedAt">
) => {
  const newRoomType = new RoomTypeModel(data);
  await newRoomType.save();
  return newRoomType;
};

export const getRoomTypeById = async (id: string) => {
  return await RoomTypeModel.findById(id);
};

export const findAllRoomTypes = async () => {
  return await RoomTypeModel.find();
};

export const updateRoomTypeInfo = async (
  id: string,
  updateData: Partial<IRoomType>
) => {
  return await RoomTypeModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const removeRoomType = async (id: string) => {
  return await RoomTypeModel.findByIdAndDelete(id);
};
