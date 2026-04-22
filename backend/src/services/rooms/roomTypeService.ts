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
  const roomType = await getRoomTypeById(id);
  if (!roomType) throw new Error("Room Type is Not Found");

  if (roomType.roomCount > 0) {
    throw new Error("You cannot delete a room Type who has related to Rooms.");
  }

  return await RoomTypeModel.findByIdAndDelete(id);
};
