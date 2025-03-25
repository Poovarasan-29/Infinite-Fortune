import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const Protected = ({ children }) => {
  const { token, setUserData } = useContext(AuthContext);
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    let isMounted = true; // Track component mount state
    if (token) {
      axios
        .get(import.meta.env.VITE_API_URL + "protected", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (isMounted) {
            setUserData(res.data.user);
          }
        })
        .catch(() => {
          if (isMounted) {
            setTokenExpired(true);
          }
        });
    }
    return () => {
      isMounted = false; // Cleanup function to prevent memory leaks
    };
  }, [token]);

  if (!token || tokenExpired) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default Protected;
