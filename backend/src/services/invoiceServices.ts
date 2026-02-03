import { InvoiceModel, IInvoiceServiceItem } from "../models/invoiceModel";
import { BookingModel } from "../models/bookingModel";
import { ServiceModel, IService } from "../models/serviceModel";

const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diffTime = Math.abs(
    new Date(checkOut).getTime() - new Date(checkIn).getTime()
  );
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 1 : diffDays;
};

export const createInvoice = async (
  bookingId: string,
  serviceRequestItems: { serviceId: string; quantity: number }[] = []
) => {
  const existingInvoice = await InvoiceModel.findOne({ booking: bookingId });
  if (existingInvoice) {
    throw new Error("Invoice already exists for this booking");
  }

  const booking = await BookingModel.findById(bookingId).populate({
    path: "room",
    populate: { path: "roomType" },
  });

  if (!booking) throw new Error("Booking not found");

  const TAX_RATE = 0.1;
  const roomPrice = (booking.room as any).roomType.basePrice;
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const totalRoomCharge = roomPrice * nights;

  let totalTaxAmount = totalRoomCharge * TAX_RATE;
  let totalServiceCharge = 0;
  const processedServices: IInvoiceServiceItem[] = [];

  for (const item of serviceRequestItems) {
    const serviceDoc = (await ServiceModel.findById(
      item.serviceId
    )) as IService;

    if (!serviceDoc) throw new Error(`Service not found: ${item.serviceId}`);

    const itemTotal = serviceDoc.price * item.quantity;
    totalServiceCharge += itemTotal;

    if (serviceDoc.isTaxable) {
      totalTaxAmount += itemTotal * TAX_RATE;
    }

    processedServices.push({
      service: serviceDoc._id,
      quantity: item.quantity,
      price: serviceDoc.price,
      total: itemTotal,
    });
  }

  const totalAmountDue = totalRoomCharge + totalServiceCharge + totalTaxAmount;

  const newInvoice = new InvoiceModel({
    booking: bookingId,
    usedServices: processedServices,
    totalRoomCharge,
    totalServiceCharge,
    taxAmount: totalTaxAmount,
    totalAmountDue,
    paymentStatus: "Pending",
  });

  return await newInvoice.save();
};

export const findAllInvoices = async () => {
  return await InvoiceModel.find()
    .sort({ createdAt: -1 }) 
    .populate("booking", "guest room")
    .populate("usedServices.service", "name");
};

export const getInvoiceById = async (id: string) => {
  return await InvoiceModel.findById(id)
    .populate("booking")
    .populate("usedServices.service");
};

export const getInvoiceByBookingId = async (bookingId: string) => {
  return await InvoiceModel.findOne({ booking: bookingId })
    .populate("booking")
    .populate("usedServices.service");
};

export const updateInvoiceStatus = async (
  id: string,
  paymentStatus: "Paid" | "Pending" | "Partially Paid",
  paymentMethod?: string
) => {
  return await InvoiceModel.findByIdAndUpdate(
    id,
    { paymentStatus, paymentMethod },
    { new: true, runValidators: true }
  );
};