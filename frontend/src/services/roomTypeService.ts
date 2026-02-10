import type { IRoomType } from "../types/types";
import api from "./api";

export const roomTypeService = {
  getAllRoomTypes: async () => {
    const response = await api.get<IRoomType[]>("/room-types");
    return response.data;
  },

  getRoomTypeById: async (id: string) => {
    const response = await api.get<IRoomType>(`/room-types/${id}`);
    return response.data;
  },

  createRoomType: async (data: Omit<IRoomType, "_id" | "createdAt" | "updatedAt">) => {
    const response = await api.post<IRoomType>("/room-types", data);
    return response.data;
  },

  updateRoomType: async (id: string, data: Partial<IRoomType>) => {
    const response = await api.put<IRoomType>(`/room-types/${id}`, data);
    return response.data;
  },

  deleteRoomType: async (id: string) => {
    const response = await api.delete(`/room-types/${id}`);
    return response.data;
  },
};