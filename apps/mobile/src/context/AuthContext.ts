import { createContext } from "react";
import { AuthContextData } from "../types/AuthContextData";

export const AuthContext = createContext({} as AuthContextData);
