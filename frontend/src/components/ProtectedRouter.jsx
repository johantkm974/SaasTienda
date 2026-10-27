import { Navigate, Outlet } from "react-router-dom";
import { getToken, isTokenExpired } from "../api";

export function ProtectedRouter(){

  const user = getToken()

  if (!user || isTokenExpired()){
    return <Navigate to="/login" />
  }

  return <Outlet/>
}
