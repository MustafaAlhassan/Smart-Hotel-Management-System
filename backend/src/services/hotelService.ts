import { HotelModel, IDiscountCode, IHotel } from "../models/hotelModel";

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

export const addDiscountCode = async (
  data: Omit<IDiscountCode, "usedCount">,
): Promise<IHotel> => {
  const hotel = await HotelModel.findOne();
  if (!hotel) {
    throw new Error("No hotel settings found. Please create them first.");
  }

  const normalized = data.code.toUpperCase().trim();

  const alreadyExists = hotel.discountCodes.some(
    (dc) => dc.code === normalized,
  );
  if (alreadyExists) {
    throw new Error(`Discount code "${normalized}" already exists.`);
  }

  if (data.type === "percentage" && (data.value <= 0 || data.value > 100)) {
    throw new Error("Percentage discount value must be between 1 and 100.");
  }

  if (data.type === "fixed" && data.value <= 0) {
    throw new Error("Fixed discount value must be greater than 0.");
  }

  if (
    data.validFrom &&
    data.validUntil &&
    new Date(data.validFrom) >= new Date(data.validUntil)
  ) {
    throw new Error("validFrom must be before validUntil.");
  }

  hotel.discountCodes.push({ ...data, code: normalized, usedCount: 0 });
  await hotel.save();
  return hotel;
};

export const updateDiscountCode = async (
  code: string,
  updates: Partial<Omit<IDiscountCode, "code" | "usedCount">>,
): Promise<IHotel> => {
  const hotel = await HotelModel.findOne();
  if (!hotel) {
    throw new Error("No hotel settings found.");
  }

  const normalized = code.toUpperCase().trim();
  const discountCode = hotel.discountCodes.find((dc) => dc.code === normalized);
  if (!discountCode) {
    throw new Error(`Discount code "${normalized}" not found.`);
  }

  const newType = updates.type ?? discountCode.type;
  const newValue = updates.value ?? discountCode.value;

  if (newType === "percentage" && (newValue <= 0 || newValue > 100)) {
    throw new Error("Percentage discount value must be between 1 and 100.");
  }

  if (newType === "fixed" && newValue <= 0) {
    throw new Error("Fixed discount value must be greater than 0.");
  }

  const newValidFrom = updates.validFrom ?? discountCode.validFrom;
  const newValidUntil = updates.validUntil ?? discountCode.validUntil;
  if (
    newValidFrom &&
    newValidUntil &&
    new Date(newValidFrom) >= new Date(newValidUntil)
  ) {
    throw new Error("validFrom must be before validUntil.");
  }

  Object.assign(discountCode, updates);
  await hotel.save();
  return hotel;
};

export const deleteDiscountCode = async (code: string): Promise<IHotel> => {
  const hotel = await HotelModel.findOne();
  if (!hotel) {
    throw new Error("No hotel settings found.");
  }

  const normalized = code.toUpperCase().trim();
  const index = hotel.discountCodes.findIndex((dc) => dc.code === normalized);
  if (index === -1) {
    throw new Error(`Discount code "${normalized}" not found.`);
  }

  hotel.discountCodes.splice(index, 1);
  await hotel.save();
  return hotel;
};

export const validateDiscountCode = async (
  code: string,
  bookingAmount: number,
): Promise<{ discountCode: IDiscountCode; discountAmount: number }> => {
  const hotel = await HotelModel.findOne();
  if (!hotel) {
    throw new Error("No hotel settings found.");
  }

  const normalized = code.toUpperCase().trim();
  const discountCode = hotel.discountCodes.find((dc) => dc.code === normalized);

  if (!discountCode) {
    throw new Error(`Discount code "${normalized}" is invalid.`);
  }

  if (!discountCode.isActive) {
    throw new Error(`Discount code "${normalized}" is no longer active.`);
  }

  const now = new Date();
  if (discountCode.validFrom && now < new Date(discountCode.validFrom)) {
    throw new Error(`Discount code "${normalized}" is not yet valid.`);
  }

  if (discountCode.validUntil && now > new Date(discountCode.validUntil)) {
    throw new Error(`Discount code "${normalized}" has expired.`);
  }

  if (
    discountCode.usageLimit != null &&
    discountCode.usedCount >= discountCode.usageLimit
  ) {
    throw new Error(
      `Discount code "${normalized}" has reached its usage limit.`,
    );
  }

  if (
    discountCode.minBookingAmount != null &&
    bookingAmount < discountCode.minBookingAmount
  ) {
    throw new Error(
      `This discount code requires a minimum booking amount of ${hotel.currency}${discountCode.minBookingAmount}.`,
    );
  }

  let discountAmount: number;
  if (discountCode.type === "percentage") {
    discountAmount = (bookingAmount * discountCode.value) / 100;
    if (
      discountCode.maxDiscountAmount != null &&
      discountAmount > discountCode.maxDiscountAmount
    ) {
      discountAmount = discountCode.maxDiscountAmount;
    }
  } else {
    discountAmount = Math.min(discountCode.value, bookingAmount);
  }

  return {
    discountCode,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
  };
};
