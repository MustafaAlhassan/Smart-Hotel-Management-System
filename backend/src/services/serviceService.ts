import { ServiceModel, IService } from "../models/serviceModel";

export const addService = async (
  data: Omit<IService, "_id" | "createdAt" | "updatedAt">
) => {
  const newService = new ServiceModel(data);
  await newService.save();
  return newService;
};

export const getServiceById = async (id: string) => {
  return await ServiceModel.findById(id);
};

export const findAllServices = async () => {
  return await ServiceModel.find();
};

export const updateServiceInfo = async (
  id: string,
  updateData: Partial<IService>
) => {
  return await ServiceModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

export const removeService = async (id: string) => {
  return await ServiceModel.findByIdAndDelete(id);
};
