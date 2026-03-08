import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api from "../services/api";

export interface IHotelInfo {
  _id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  taxRate: number;
  currency: string;
}

interface HotelContextValue {
  hotel: IHotelInfo | null;
  loading: boolean;
  refreshHotel: () => Promise<void>;
}

const HotelContext = createContext<HotelContextValue>({
  hotel: null,
  loading: true,
  refreshHotel: async () => {},
});

export const HotelProvider = ({ children }: { children: React.ReactNode }) => {
  const [hotel, setHotel] = useState<IHotelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHotel = useCallback(async () => {
    try {
      const res = await api.get("/hotel");
      setHotel(res.data);
    } catch {
      setHotel(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotel();
  }, [fetchHotel]);

  return (
    <HotelContext.Provider value={{ hotel, loading, refreshHotel: fetchHotel }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => useContext(HotelContext);
