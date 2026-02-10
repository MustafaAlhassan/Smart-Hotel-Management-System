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