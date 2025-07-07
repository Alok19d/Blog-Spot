import { useSelector } from "react-redux"
import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedRoute() {
  const { profile } = useSelector(state => state.user);

  return profile ? <Outlet /> : <Navigate to='/signin' />
}
