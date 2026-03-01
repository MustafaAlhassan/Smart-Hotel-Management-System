import { HotelModel, IHotel } from "../models/hotelModel";

export const getHotel = async (): Promise<IHotel | null> => {
  return await HotelModel.findOne();
};

export const createHotel = async (data: Partial<IHotel>): Promise<IHotel> => {
  const existing = await HotelModel.findOne();
  if (existing) {
    throw new Error("Hotel settings already exist. Use update instead.");
  }
  return await HotelModel.create(data);
};

export const updateHotel = async (
  data: Partial<IHotel>,
): Promise<IHotel | null> => {
  const hotel = await HotelModel.findOne();
  if (!hotel) {
    throw new Error("No hotel settings found. Please create them first.");
  }
  return await HotelModel.findByIdAndUpdate(hotel._id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteHotel = async (): Promise<void> => {
  const hotel = await HotelModel.findOne();
  if (!hotel) {
    throw new Error("No hotel settings found to delete.");
  }
  await HotelModel.findByIdAndDelete(hotel._id);
};
