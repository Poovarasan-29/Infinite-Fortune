import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userData, setUserData] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification.permission
  );

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        userData,
        setUserData,
        notificationPermission,
        setNotificationPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
