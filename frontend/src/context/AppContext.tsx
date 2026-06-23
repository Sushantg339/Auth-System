import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../lib/axios";
import { toast } from "react-toastify";
import type { NavigateFunction } from "react-router-dom";

type AppContextType = {
  user: any
  setUser: React.Dispatch<React.SetStateAction<any>>
  isAuth: boolean
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>
  loading: boolean
  logoutUser: React.Dispatch<React.SetStateAction<any>>
  logoutLoading: boolean
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user/profile");

      setUser(res.data.data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async (navigate: NavigateFunction) => {
    setLogoutLoading(true)
    try {
      const res = await api.post("/user/logout");
      toast.success(res.data.message);

      setIsAuth(false)
      setUser(null)
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLogoutLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, isAuth, setIsAuth, loading, logoutUser, logoutLoading}}>
      {children}
    </AppContext.Provider>
  );
};

export const AppData = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("App data must be used within an app provider");
  }

  return context;
};
