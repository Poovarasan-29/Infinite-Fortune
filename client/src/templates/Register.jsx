import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { TextField, Button } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BarLoading from "../components/BarLoading";

const schema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address")
    .required("Email is required"),
  otp: Yup.string().when("$otpSent", (otpSent, schema) =>
    otpSent ? schema.required("OTP is required") : schema
  ),
  password: Yup.string().required("Password is required").min(6).max(12),
  referrer: Yup.string().notRequired(),
});

export default function Register() {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [passwordTypeByEye, setPasswordTypeByEye] = useState("password");
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      otp: "",
      password: "",
      referrer: "",
      otpSent: false,
    },
    context: { otpSent },
  });

  useEffect(() => {
    const refferalCode = searchParams.get("referral");
    setValue("referrer", refferalCode);
  }, []);

  const otpSentWatch = watch("otpSent", otpSent);

  async function onSubmit(datas) {
    setLoading(true);
    const res = await axios.post(
      import.meta.env.VITE_API_URL + "signup",
      datas
    );

    let toastId;
    if (res.data.success == false) {
      toastId = toast.error(res.data.message, { autoClose: 1500 });
    } else {
      toastId = toast.success(res.data.message, { autoClose: 1500 });
    }
    setLoading(false);
    setTimeout(() => {
      if (res.status == 201) {
        toast.dismiss(toastId);
        navigate("/login");
      }
    }, 1000);
  }

  function handleEmailIsValid(e) {
    const email = e.target.value;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(pattern.test(email));
  }

  function handleSignupBtn() {
    if (otpSent == false) {
      toast.warning("Verify the email", { autoClose: 1500 });
    }
  }

  async function handleOtpSentButton() {
    if (isValidEmail) {
      const toasterLoading = toast.loading("OTP sending to email", {
        theme: "dark",
      });
      setIsValidEmail(false);
      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "send-otp",
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
        setIsValidEmail(true);
      }
    }
  }
  return (
    <>
      <title>Sign up</title>
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
            label="Name*"
            variant="outlined"
            name="name"
            fullWidth
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

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
          <TextField
            label="Referral code"
            name="referrer"
            variant="outlined"
            fullWidth
            {...register("referrer")}
            error={!!errors.referrer}
            helperText={errors.referrer?.message}
          />
          <Button
            type="submit"
            variant="contained"
            className="py-2"
            color="primary"
            onClick={handleSignupBtn}
          >
            Sign up
          </Button>
          <p className="text-center">
            Already Have an account?{" "}
            <Link to={"/login"} className="text-decoration-none">
              Login
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
