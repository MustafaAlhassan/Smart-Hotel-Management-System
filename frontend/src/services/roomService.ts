import api from "./api";
import type { IRoom } from "../types/types.ts";

export const roomService = {
  // GET all rooms
  getAllRooms: async () => {
    // Ensure no trailing slash if backend is strict
    const response = await api.get<IRoom[]>("/rooms");
    return response.data;
  },

  // POST a new room
  createRoom: async (data: any) => {
    const response = await api.post<IRoom>("/rooms", data);
    return response.data;
  },

  // PUT update room
  updateRoom: async (id: string, data: any) => {
    const response = await api.put<IRoom>(`/rooms/${id}`, data);
    return response.data;
  },

  // DELETE a room
  deleteRoom: async (id: string) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};
