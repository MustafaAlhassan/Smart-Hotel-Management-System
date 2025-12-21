import { RoomTypeModel } from "../../models/rooms/roomTypeModel";

interface AddRoomType {
  name: string;
  basePrice: number;
  capacity: number;
  description: string;
  amenities: string[];
}

export const addRoomType = async ({
  name,
  basePrice,
  capacity,
  description,
  amenities,
}: AddRoomType) => {
  const newRoomType = new RoomTypeModel({
    name,
    basePrice,
    capacity,
    description,
    amenities,
  });
  await newRoomType.save();
  return newRoomType;
};

export const removeRoomType = async (id: string) => {
  return await RoomTypeModel.findByIdAndDelete(id);
};
