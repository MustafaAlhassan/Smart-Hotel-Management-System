import api from "./api";
import type { IRoom } from "../types/types.ts";

export const roomService = {
  getAllRooms: async () => {
    const response = await api.get<IRoom[]>("/rooms");
    return response.data;
  },

  createRoom: async (data: FormData) => {
    const response = await api.post<IRoom>("/rooms", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateRoom: async (id: string, data: FormData) => {
    const response = await api.put<IRoom>(`/rooms/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateRoomStatus: async (id: string, status: string) => {
    const response = await api.patch(`/rooms/${id}/status`, { status });
    return response.data;
  },

  deleteRoom: async (id: string) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};
