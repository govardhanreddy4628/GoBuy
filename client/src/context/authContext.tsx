// context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, { setAccessToken } from "../api/api_utility";
import { useCart } from "./cartContext";

export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "admin";
  fullName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
const [isAuthLoading, setIsAuthLoading] = useState(true);
const isAuthenticated = !!user; 

  const LOGOUT_FLAG = "didLogout";

  // Rehydrate session
  useEffect(() => {
    const initAuth = async () => {
      // ✅ HARD STOP after logout
      if (sessionStorage.getItem(LOGOUT_FLAG) === "true") {
        setUser(null);
        setAccessToken(null);
        setIsAuthLoading(false);
        return;
      }

      try {
        const refreshRes = await api.get("/api/v1/user/auth/refresh");
        const accessToken = refreshRes.data?.accessToken;
        if (!accessToken) throw new Error("No access token");

        setAccessToken(accessToken);

        const meRes = await api.get("/api/v1/user/me");
        setUser(meRes.data?.user || null);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, []);


  //Logout
  const logout = async () => {
    try {
      await api.post("/api/v1/user/logout");
    } catch { }
    finally {
      sessionStorage.setItem(LOGOUT_FLAG, "true"); // ✅ IMPORTANT
      setAccessToken(null);
      setUser(null);
    }
  };


  const value = useMemo(
  () => ({
    user,
    isAuthenticated,
    isAuthLoading,
    setUser,
    logout,
  }),
  [user, isAuthLoading, isAuthenticated]
);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
