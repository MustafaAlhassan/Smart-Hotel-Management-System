export enum RoomStatus {
  AVAILABLE = "Available",
  OCCUPIED = "Occupied",
  DIRTY = "Dirty",
  MAINTENANCE = "Maintenance",
}

// Your original working IRoomType
export interface IRoomType {
  _id: string;
  name: string;
  basePrice: number;
  capacity: number;
  description?: string;
  amenities: string[];
  createdAt?: string;
  updatedAt?: string;
}

// NEW: Add this to fix the export error in Rooms.tsx
export interface IRoom {
  _id: string;
  roomNumber: string;
  roomType: string | IRoomType;
  status: RoomStatus;
  floor: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}
