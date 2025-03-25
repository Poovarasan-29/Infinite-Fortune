import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { TextField, Button } from "@mui/material";
import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import BarLoading from "../components/BarLoading";

const schema = Yup.object().shape({
  email: Yup.string().matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  password: Yup.string().required().min(6).max(12),
});

export default function Login() {
  const location = useLocation();

  const [passwordTypeByEye, setPasswordTypeByEye] = useState("password");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { login } = useContext(AuthContext);

  async function onSubmit(datas) {
    setLoading(true);
    try {
      if (location.pathname.startsWith("/admin")) {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "admin/login",
          datas
        );
        login(res.data.token);
        toast.success(res.data.message, { autoClose: 1400 });
        navigate("/admin/dashboard/home");
      } else {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "login",
          datas
        );
        login(res.data.token);
        toast.success(res.data.message, { autoClose: 1400 });
        navigate("/dashboard/home");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.response.data.message, { autoClose: 1700 });
    }
  }
  return (
    <>
      <title>Login</title>
      <div
        style={{ height: "100vh" }}
        className="d-flex align-items-center justify-content-center row"
      >
        <form
          className="border p-4 rounded col-11 col-sm-9 col-md-7 col-lg-6 col-xl-5 col-xxl-4 d-flex flex-column gap-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <center
            className="text-uppercase"
            style={{ fontWeight: "bold", fontSize: "42px" }}
          >
            Infinite Fortune
          </center>
          <TextField
            label="Email*"
            variant="outlined"
            name="email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
          />
          <div className="position-relative">
            <TextField
              label="Password*"
              name="password"
              type={passwordTypeByEye}
              variant="outlined"
              fullWidth
              sx={{ input: { paddingRight: "55px" } }}
              {...register("password")}
              error={!!errors.password}
            />
            <span
              className="position-absolute"
              style={{ right: "15px", top: "11px" }}
              onClick={() =>
                passwordTypeByEye == "password"
                  ? setPasswordTypeByEye("text")
                  : setPasswordTypeByEye("password")
              }
            >
              <i
                className={
                  watch("password").length == 0
                    ? ""
                    : passwordTypeByEye == "password"
                    ? "bi bi-eye fs-4"
                    : "bi bi-eye-slash fs-4"
                }
              ></i>
            </span>
          </div>
          <Link
            to={"/forgot-password"}
            className="text-deoration-none text-end"
          >
            Forgot password?
          </Link>
          <Button
            type="submit"
            variant="contained"
            className="py-2"
            color="primary"
          >
            Login
          </Button>
          <p className="text-center">
            Don't Have an account?{" "}
            <Link to={"/"} className="text-decoration-none">
              Sign up
            </Link>
          </p>
        </form>
        {loading && (
          <div style={{ position: "fixed" }}>
            <BarLoading />
          </div>
        )}
      </div>
    </>
  );
}
