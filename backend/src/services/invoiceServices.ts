import { InvoiceModel, IInvoiceServiceItem } from "../models/invoiceModel";
import { BookingModel, BookingStatus } from "../models/bookingModel";
import { ServiceModel, IService } from "../models/serviceModel";
import { HotelModel } from "../models/hotelModel";
import { UserModel } from "../models/userModel";
import { validateDiscountCode } from "./hotelService";

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

const computeTotals = (
  totalRoomCharge: number,
  totalServiceCharge: number,
  rawTaxAmount: number,
  TAX_RATE: number,
  discountAmount: number,
): {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmountDue: number;
} => {
  const subtotal = totalRoomCharge + totalServiceCharge;

  const clampedDiscount = Math.min(discountAmount, subtotal);

  const taxableAmount = parseFloat((subtotal - clampedDiscount).toFixed(2));
  const taxAmount =
    subtotal > 0
      ? parseFloat(((rawTaxAmount / subtotal) * taxableAmount).toFixed(2))
      : 0;

  const totalAmountDue = parseFloat((taxableAmount + taxAmount).toFixed(2));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discountAmount: parseFloat(clampedDiscount.toFixed(2)),
    taxableAmount,
    taxAmount,
    totalAmountDue,
  };
};

export const createInvoice = async (
  bookingId: string,
  createdBy: string,
  serviceRequestItems: { serviceId: string; quantity: number }[] = [],
  discountCode?: string,
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

  let rawTaxAmount = totalRoomCharge * TAX_RATE; // room is always taxable
  let totalServiceCharge = 0;
  const processedServices: IInvoiceServiceItem[] = [];

  for (const item of serviceRequestItems) {
    const serviceDoc = (await ServiceModel.findById(
      item.serviceId,
    )) as IService;
    if (!serviceDoc) throw new Error(`Service not found: ${item.serviceId}`);

    const itemTotal = serviceDoc.price * item.quantity;
    totalServiceCharge += itemTotal;

    if (serviceDoc.isTaxable) {
      rawTaxAmount += itemTotal * TAX_RATE;
    }

    processedServices.push({
      service: serviceDoc._id,
      name: serviceDoc.name,
      quantity: item.quantity,
      price: serviceDoc.price,
      total: itemTotal,
    });
  }

  let appliedDiscount: {
    code: string;
    type: "percentage" | "fixed";
    value: number;
    discountAmount: number;
  } | null = null;
  let discountAmount = 0;

  if (discountCode) {
    const subtotal = totalRoomCharge + totalServiceCharge;
    const result = await validateDiscountCode(discountCode, subtotal);

    await HotelModel.updateOne(
      { "discountCodes.code": result.discountCode.code },
      { $inc: { "discountCodes.$.usedCount": 1 } },
    );

    discountAmount = result.discountAmount;
    appliedDiscount = {
      code: result.discountCode.code,
      type: result.discountCode.type,
      value: result.discountCode.value,
      discountAmount: result.discountAmount,
    };
  }

  const totals = computeTotals(
    totalRoomCharge,
    totalServiceCharge,
    rawTaxAmount,
    TAX_RATE,
    discountAmount,
  );

  const newInvoice = new InvoiceModel({
    booking: bookingId,
    createdBy,
    usedServices: processedServices,
    totalRoomCharge,
    totalServiceCharge,
    subtotal: totals.subtotal,
    appliedDiscount,
    discountAmount: totals.discountAmount,
    taxableAmount: totals.taxableAmount,
    taxAmount: totals.taxAmount,
    totalAmountDue: totals.totalAmountDue,
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
  paymentStatus: "Paid" | "Pending",
  paymentMethod?: string,
) => {
  const invoice = await InvoiceModel.findByIdAndUpdate(
    id,
    { paymentStatus, paymentMethod },
    { new: true, runValidators: true },
  ).populate("booking");

  if (!invoice) throw new Error("Invoice not found");

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
  if (invoice.paymentStatus === "Paid")
    throw new Error("Cannot add services to a paid invoice.");
  if (!serviceDoc) throw new Error("Service not found");

  const itemTotal = serviceDoc.price * quantity;

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

  const rawTaxAmount =
    invoice.totalRoomCharge * TAX_RATE +
    invoice.usedServices.reduce((sum, item) => {
      return sum;
    }, 0) +
    (serviceDoc.isTaxable ? itemTotal * TAX_RATE : 0) +
    (invoice.taxableAmount > 0
      ? (invoice.taxAmount / invoice.taxableAmount) *
        (invoice.subtotal - invoice.totalRoomCharge * TAX_RATE)
      : 0);

  const correctRawTax =
    invoice.totalRoomCharge * TAX_RATE +
    (serviceDoc.isTaxable ? itemTotal * TAX_RATE : 0) +
    invoice.taxAmount;

  const totals = computeTotals(
    invoice.totalRoomCharge,
    invoice.totalServiceCharge,
    correctRawTax,
    TAX_RATE,
    invoice.discountAmount,
  );

  invoice.subtotal = totals.subtotal;
  invoice.taxableAmount = totals.taxableAmount;
  invoice.taxAmount = totals.taxAmount;
  invoice.totalAmountDue = totals.totalAmountDue;

  return await invoice.save();
};

export const applyDiscountToInvoice = async (
  invoiceId: string,
  discountCode: string,
) => {
  const invoice = await InvoiceModel.findById(invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  if (invoice.paymentStatus === "Paid") {
    throw new Error("Cannot apply a discount to a paid invoice.");
  }

  if (invoice.appliedDiscount) {
    throw new Error(
      `A discount code "${invoice.appliedDiscount.code}" is already applied to this invoice.`,
    );
  }

  const result = await validateDiscountCode(discountCode, invoice.subtotal);

  await HotelModel.updateOne(
    { "discountCodes.code": result.discountCode.code },
    { $inc: { "discountCodes.$.usedCount": 1 } },
  );

  const recoveredRawTax =
    invoice.taxableAmount > 0
      ? (invoice.taxAmount / invoice.taxableAmount) * invoice.subtotal
      : invoice.taxAmount;

  const TAX_RATE = await getHotelTaxRate();

  const totals = computeTotals(
    invoice.totalRoomCharge,
    invoice.totalServiceCharge,
    recoveredRawTax,
    TAX_RATE,
    result.discountAmount,
  );

  invoice.appliedDiscount = {
    code: result.discountCode.code,
    type: result.discountCode.type,
    value: result.discountCode.value,
    discountAmount: result.discountAmount,
  };
  invoice.discountAmount = totals.discountAmount;
  invoice.taxableAmount = totals.taxableAmount;
  invoice.taxAmount = totals.taxAmount;
  invoice.totalAmountDue = totals.totalAmountDue;

  return await invoice.save();
};

export const removeDiscountFromInvoice = async (invoiceId: string) => {
  const invoice = await InvoiceModel.findById(invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  if (invoice.paymentStatus === "Paid") {
    throw new Error("Cannot remove a discount from a paid invoice.");
  }

  if (!invoice.appliedDiscount) {
    throw new Error("No discount code is applied to this invoice.");
  }

  await HotelModel.updateOne(
    { "discountCodes.code": invoice.appliedDiscount.code },
    { $inc: { "discountCodes.$.usedCount": -1 } },
  );

  const recoveredRawTax =
    invoice.taxableAmount > 0
      ? (invoice.taxAmount / invoice.taxableAmount) * invoice.subtotal
      : invoice.taxAmount;

  const TAX_RATE = await getHotelTaxRate();

  const totals = computeTotals(
    invoice.totalRoomCharge,
    invoice.totalServiceCharge,
    recoveredRawTax,
    TAX_RATE,
    0,
  );

  invoice.appliedDiscount;
  invoice.discountAmount = 0;
  invoice.taxableAmount = totals.taxableAmount;
  invoice.taxAmount = totals.taxAmount;
  invoice.totalAmountDue = totals.totalAmountDue;

  return await invoice.save();
};
