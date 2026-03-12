import { InvoiceModel, IInvoiceServiceItem } from "../models/invoiceModel";
import { BookingModel, BookingStatus } from "../models/bookingModel";
import { ServiceModel, IService } from "../models/serviceModel";
import { HotelModel } from "../models/hotelModel";
import { UserModel } from "../models/userModel";
import { markRoomAsDirty } from "./rooms/roomService";

const calculateNights = (checkIn: Date, checkOut: Date): number => {
  const diffTime = Math.abs(
    new Date(checkOut).getTime() - new Date(checkIn).getTime(),
  );
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 1 : diffDays;
};

const getHotelTaxRate = async (): Promise<number> => {
  const hotel = await HotelModel.findOne().select("taxRate");
  if (!hotel) return 0;
  return hotel.taxRate;
};

export const createInvoice = async (
  bookingId: string,
  createdBy: string,
  serviceRequestItems: { serviceId: string; quantity: number }[] = [],
) => {
  const existingInvoice = await InvoiceModel.findOne({ booking: bookingId });
  if (existingInvoice) {
    throw new Error("Invoice already exists for this booking");
  }

  const [booking, TAX_RATE] = await Promise.all([
    BookingModel.findById(bookingId).populate({
      path: "room",
      populate: { path: "roomType" },
    }),
    getHotelTaxRate(),
  ]);

  if (!booking) throw new Error("Booking not found");

  if (booking.status !== BookingStatus.CHECKED_IN) {
    throw new Error(
      `Invoice can only be created for checked-in bookings. Current status: ${booking.status}`,
    );
  }

  const roomPrice = (booking.room as any).roomType.basePrice;
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const totalRoomCharge = roomPrice * nights;

  let totalTaxAmount = totalRoomCharge * TAX_RATE;
  let totalServiceCharge = 0;
  const processedServices: IInvoiceServiceItem[] = [];

  for (const item of serviceRequestItems) {
    const serviceDoc = (await ServiceModel.findById(item.serviceId)) as IService;
    if (!serviceDoc) throw new Error(`Service not found: ${item.serviceId}`);

    const itemTotal = serviceDoc.price * item.quantity;
    totalServiceCharge += itemTotal;

    if (serviceDoc.isTaxable) {
      totalTaxAmount += itemTotal * TAX_RATE;
    }

    processedServices.push({
      service: serviceDoc._id,
      name: serviceDoc.name,
      quantity: item.quantity,
      price: serviceDoc.price,
      total: itemTotal,
    });
  }

  const totalAmountDue = totalRoomCharge + totalServiceCharge + totalTaxAmount;

  const newInvoice = new InvoiceModel({
    booking: bookingId,
    createdBy,
    usedServices: processedServices,
    totalRoomCharge,
    totalServiceCharge,
    taxAmount: totalTaxAmount,
    totalAmountDue,
    paymentStatus: "Pending",
  });

  const savedInvoice = await newInvoice.save();

  await UserModel.findByIdAndUpdate(createdBy, {
    $inc: { invoicesCreated: 1 },
  });

  return savedInvoice;
};

export const findAllInvoices = async () => {
  return await InvoiceModel.find()
    .sort({ createdAt: -1 })
    .populate("booking", "guest room")
    .populate("usedServices.service", "name")
    .populate("createdBy", "firstName lastName username role");
};

export const getInvoiceById = async (id: string) => {
  return await InvoiceModel.findById(id)
    .populate("booking")
    .populate("usedServices.service")
    .populate("createdBy", "firstName lastName username role");
};

export const getInvoiceByBookingId = async (bookingId: string) => {
  return await InvoiceModel.findOne({ booking: bookingId })
    .populate("booking")
    .populate("usedServices.service")
    .populate("createdBy", "firstName lastName username role");
};

export const updateInvoiceStatus = async (
  id: string,
  paymentStatus: "Paid" | "Pending" | "Partially Paid",
  paymentMethod?: string,
) => {
  const invoice = await InvoiceModel.findByIdAndUpdate(
    id,
    { paymentStatus, paymentMethod },
    { new: true, runValidators: true },
  ).populate("booking");

  if (!invoice) throw new Error("Invoice not found");

  if (paymentStatus === "Paid" && invoice.booking) {
    const booking: any = invoice.booking;
    await markRoomAsDirty(booking.room);
  }

  return invoice;
};

export const addServiceToInvoice = async (
  invoiceId: string,
  serviceId: string,
  quantity: number,
) => {
  const [invoice, serviceDoc, TAX_RATE] = await Promise.all([
    InvoiceModel.findById(invoiceId),
    ServiceModel.findById(serviceId) as Promise<IService | null>,
    getHotelTaxRate(),
  ]);

  if (!invoice) throw new Error("Invoice not found");
  if (!serviceDoc) throw new Error("Service not found");

  const itemTotal = serviceDoc.price * quantity;
  const taxOnItem = serviceDoc.isTaxable ? itemTotal * TAX_RATE : 0;

  invoice.usedServices.push({
    service: serviceDoc._id,
    name: serviceDoc.name,
    quantity,
    price: serviceDoc.price,
    total: itemTotal,
  });

  invoice.totalServiceCharge = invoice.usedServices.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  invoice.taxAmount += taxOnItem;
  invoice.totalAmountDue =
    invoice.totalRoomCharge + invoice.totalServiceCharge + invoice.taxAmount;

  return await invoice.save();
};