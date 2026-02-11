export enum RoomStatus {
  AVAILABLE = "Available",
  OCCUPIED = "Occupied",
  MAINTENANCE = "Maintenance",
}

export interface IRoom {
  _id: string;
  roomNumber: string;
  roomType: string | IRoomType; // Can be ID or populated object
  floor: number;
  status: RoomStatus;
  image?: string;
}

export interface IRoomType {
  _id: string;
  name: string;
  basePrice: number;
  capacity: number;
  amenities: string[];
  description?: string;
}
