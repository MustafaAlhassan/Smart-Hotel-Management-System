import { GuestModel, IGuest } from "../models/guestModel";


export const addGuest = async (
  data: Omit<IGuest, "_id" | "createdAt" | "updatedAt">
) => {
  const newGuest = new GuestModel(data);
  await newGuest.save();
  return newGuest;
};

export const getGuestById = async (id: string) => {
  return await GuestModel.findById(id);
};

export const findAllGuests = async () => {
  return await GuestModel.find();
};

export const updateGuestInfo = async (
  id: string,
  updateData: Partial<IGuest>
) => {
  return await GuestModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const removeGuest = async (id: string) => {
  return await GuestModel.findByIdAndDelete(id);
};
