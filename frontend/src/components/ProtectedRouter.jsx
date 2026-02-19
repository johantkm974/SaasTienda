import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRouter(){

  const user = localStorage.getItem('token-user')

  if (!user){
    return <Navigate to="/login" />
  }

  return <Outlet/>
}