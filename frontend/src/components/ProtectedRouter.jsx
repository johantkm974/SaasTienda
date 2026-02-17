import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRouter(){

  const user = localStorage.getItem('user_session')

  if (!user){
    return <Navigate to="/login" />
  }

  return <Outlet/>
}