import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { TextField, Button } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import BarLoading from "./BarLoading";

const schema = Yup.object().shape({
  email: Yup.string().matches(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Invalid email address"
  ),
  otp: Yup.string().when("$otpSent", (otpSent, schema) =>
    otpSent ? schema.required("OTP is required") : schema
  ),
  password: Yup.string().required("Password is required").min(6).max(12),
});

export default function ForgotPassword() {
  const [passwordTypeByEye, setPasswordTypeByEye] = useState("password");
  const [otpSent, setOtpSent] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [time, setTime] = useState(299); // 5 minutes in seconds
  const [running, setRunning] = useState(false);
  const [signupHover, setSignupHover] = useState(false);
  const [loginHover, setLoginHover] = useState(false);
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
      otp: "",
      otpSent: false,
    },
    context: { otpSent },
  });

  useEffect(() => {
    let interval;
    if (running && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      setRunning(false);
    }
    return () => clearInterval(interval);
  }, [running, time]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const otpSentWatch = watch("otpSent", otpSent);
  function handleEmailIsValid(e) {
    const email = e.target.value;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(pattern.test(email));
  }
  async function onSubmit(datas) {
    setLoading(true);
    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "forgot-password-request",
        datas
      );
      toast.success(res.data.message, { autoClose: 1400 });
      navigate("/login");
    } catch (error) {
      toast.error(error.response.data.message, { autoClose: 1700 });
    } finally {
      setLoading(false);
    }
  }
  async function handleOtpSentButton() {
    if (isValidEmail) {
      const toasterLoading = toast.loading("OTP sending to email", {
        theme: "dark",
      });
      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "forgot-password-send-otp",
          { email: watch("email") }
        );

        if (res.status == 202) {
          setOtpSent(true);
          setValue("otpSent", true);
          toast.dismiss(toasterLoading);
          setTimeout(() => {
            toast.success("OTP has been sent to your email", {
              autoClose: 1200,
            });
          }, 600);
          setRunning(true);
          setTime(299);
        } else {
          toast.error(res.data.message, {
            autoClose: 1600,
          });
        }
      } catch (error) {
        toast.dismiss(toasterLoading);
        setTimeout(() => {
          toast.error(error.response.data.message, { autoClose: 1500 });
        }, 450);
      }
    }
  }

  function handleSubmitBtn() {
    if (!otpSent) {
      toast.error("Verify email before changing password", { autoClose: 1000 });
    }
  }

  return (
    <>
      <title>Forgot Password</title>
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
          <center
            className="text-uppercae fw-light"
            style={{ fontSize: "25px" }}
          >
            Forgot Password
          </center>
          <div className="d-flex gap-2">
            <TextField
              label="Email*"
              name="email"
              variant="outlined"
              disabled={otpSent ? true : false}
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              onChange={(e) => {
                handleEmailIsValid(e);
                setValue("email", e.target.value, { shouldValidate: true });
              }}
            />
            {!otpSent && (
              <Button
                variant="contained"
                style={{
                  letterSpacing: "1px",
                  cursor: isValidEmail ? "pointer" : "not-allowed",
                  backgroundColor: !isValidEmail && "gray",
                  height: "55px",
                }}
                onClick={handleOtpSentButton}
              >
                verify
              </Button>
            )}
          </div>

          {otpSentWatch && (
            <TextField
              label="OTP*"
              variant="outlined"
              fullWidth
              {...register("otp")}
              error={!!errors.otp}
              helperText={errors.otp?.message}
              sx={{ input: { letterSpacing: "2em", fontWeight: "bold" } }}
            />
          )}
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
              helperText={errors.password?.message}
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
          <div className={`${!otpSent && "d-none"}`}>
            <Button
              onClick={handleOtpSentButton}
              disabled={time !== 0}
              variant="outlined"
            >
              Resend
            </Button>
            <span
              className={`${time == 0 && "d-none"} ps-2 `}
              style={{ fontSize: "14px" }}
            >
              {formatTime(time)}
            </span>
          </div>

          <Button
            type="submit"
            variant="contained"
            className="py-2"
            color="primary"
            onClick={handleSubmitBtn}
          >
            Change Password
          </Button>
          <p className="text-center d-flex justify-content-center gap-5">
            <Link
              to={"/"}
              className="text-decoration-none p-1"
              onMouseEnter={() => setSignupHover(true)}
              onMouseLeave={() => setSignupHover(false)}
            >
              <Button variant={`${signupHover && "outlined"}`}>Sign up</Button>
            </Link>
            <Link
              to={"/login"}
              className="text-decoration-none p-1"
              onMouseEnter={() => setLoginHover(true)}
              onMouseLeave={() => setLoginHover(false)}
            >
              <Button variant={`${loginHover && "outlined"}`}>Login</Button>
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
