import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./templates/Register";
import Login from "./templates/Login";
import Dashboard from "./templates/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./templates/AdminDashboard";
import ForgotPassword from "./components/ForgotPassword";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
