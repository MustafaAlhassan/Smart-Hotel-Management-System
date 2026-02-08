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

export const findAllGuests = async (page: number, limit: number, search: string) => {
  const skip = (page - 1) * limit;

  let query: any = {};

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query = {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ],
    };
  }

  const [guests, total] = await Promise.all([
    GuestModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    GuestModel.countDocuments(query)
  ]);

  return {
    guests,
    total,
    totalPages: Math.ceil(total / limit)
  };
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
