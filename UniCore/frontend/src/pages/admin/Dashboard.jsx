import NexavisionDashboard from "./NexavisionDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import { useAuth } from "../../contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  return user?.role === 'super_admin' ? <SuperAdminDashboard /> : <NexavisionDashboard />;
}
