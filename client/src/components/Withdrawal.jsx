import { FormControl, TextField, Button } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import WithdrawalHistory from "./WithdrawalHistory";

export default function Withdrawal() {
  const [amount, setAmount] = useState("");
  const [transferToUPI, setTransferToUPI] = useState("");
  const { userData } = useContext(AuthContext);
  const [userDatas, setUserDatas] = useState(0);

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [viewWithdrawalHistory, setViewWithdrawalHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.userId)
      axios
        .get(import.meta.env.VITE_API_URL + "getUserDatasForDashboard", {
          params: {
            userId: userData.userId,
          },
        })
        .then((res) => setUserDatas(res.data))
        .catch((err) => {
          toast.error("Someting went wrong! Please Re-login");
          setTimeout(() => {
            navigate("/login");
          }, 500);
        });
  }, [userData]);

  const waitingWithdrawal = userDatas.withdrawalRequests?.filter(
    (val) => val.status == "Pending"
  ).length
    ? true
    : false;

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!userDatas.withdrawalBalanace || userDatas.withdrawalBalanace < 200) {
      return toast.warning("Low withdrawal balance", { autoClose: 2000 });
    }

    if (amount > userDatas.withdrawalBalanace) {
      toast.warning(
        "Available balance " + userDatas.withdrawalBalanace + " only",
        {
          autoClose: 2000,
        }
      );
      return;
    }
    if (amount < 200) {
      toast.warning("Amount minimum ₹200", { autoClose: 2000 });
    }
    if (transferToUPI.length == 0) {
      toast.warning("Enter Your UPI Id", { autoClose: 2000 });
    }
    let removeLeadingZeroAmount = amount;
    let count = 0;
    while (removeLeadingZeroAmount[count] == "0") {
      count++;
    }

    removeLeadingZeroAmount = removeLeadingZeroAmount.slice(count);
    setAmount(removeLeadingZeroAmount);
    if (removeLeadingZeroAmount >= 200 && transferToUPI.length !== 0) {
      setIsFormSubmitted(true);
      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "withdrawal",
          {
            userId: userData.userId,
            amount: removeLeadingZeroAmount,
            transferToUPI,
          }
        );
        setAmount("");
        setTransferToUPI("");
        setIsFormSubmitted(false);
        toast.success(res.data.message, { autoClose: 1400 });

        // Notification
        if ("Notification" in window) {
          setTimeout(async () => {
            if (Notification.permission === "granted") {
              new Notification("Withdrawal in Progress!", {
                body: `Your withdrawal of ₹${removeLeadingZeroAmount} is being processed and will be credited by 11:59 PM today.`,
                icon: "/favicon/apple-touch-icon.png",
              });
            } else if (Notification.permission !== "denied") {
              const permission = await Notification.requestPermission();
              if (permission === "granted") {
                new Notification("Withdrawal in Progress!", {
                  body: `Your withdrawal of ₹${removeLeadingZeroAmount} is being processed and will be credited by 11:59 PM today.`,
                  icon: "/favicon/apple-touch-icon.png",
                });
              } else {
                toast.warning("Please allow notifications to get alerts!", {
                  autoClose: 1300,
                });
              }
            } else {
              toast.warning(
                "Notifications are blocked. Enable them in settings.",
                {
                  autoClose: 1300,
                }
              );
            }
          }, 1000);
        } else {
          toast.error("Your browser does not support notifications.", {
            autoClose: 1300,
          });
        }
      } catch (error) {
        setIsFormSubmitted(false);
        toast.error(error.response.data.message, { autoClose: 1400 });
      }
    }
  }

  return (
    <div>
      <title>Withdrawal</title>
      <div className="d-flex">
        <button
          className="btn btn-secondary"
          onClick={() => {
            setViewWithdrawalHistory(!viewWithdrawalHistory);
          }}
        >
          {viewWithdrawalHistory ? (
            <i className="bi bi-x-lg" title="close"></i>
          ) : (
            <span title="view">Withdrawal History</span>
          )}
        </button>
      </div>

      {viewWithdrawalHistory ? (
        <WithdrawalHistory />
      ) : (
        <>
          {userDatas.withdrawalBalanace < 200 && (
            <p className="text-danger mt-3">Low withdrawal balance</p>
          )}
          {waitingWithdrawal && (
            <h6
              className="text-warning p-2 mt-3 border shadow"
              style={{
                letterSpacing: "1px",
                wordSpacing: "5px",
                textAlign: "justify",
              }}
            >
              Your withdrawal request is being processed. Please wait for
              completion before submitting another request. Thank you for your
              patience.
            </h6>
          )}
          <FormControl className="ms-3 w-100 overflow-hidden">
            <div className="m-3 w-75 d-flex flex-column gap-3">
              <TextField
                label="Enter amount"
                type="number"
                fullWidth
                disabled={waitingWithdrawal}
                required
                helperText={`Min ₹200 Max ₹${
                  userDatas.withdrawalBalanace
                    ? userDatas.withdrawalBalanace
                    : 0
                }`}
                onChange={(e) => setAmount(e.target.value.trim())}
                value={amount}
                onKeyDown={(e) => {
                  if (
                    e.key == "e" ||
                    e.key == "E" ||
                    e.key == "-" ||
                    e.key == "+"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
              {amount && (
                <p style={{ fontSize: "14px", marginLeft: "10px" }}>
                  <span className="mark">20% tax</span> You will get ₹
                  {Math.floor(amount - (20 / 100) * amount)}
                </p>
              )}
              <TextField
                label="Enter Your UPI Id"
                onChange={(e) => setTransferToUPI(e.target.value.trim())}
                required
                fullWidth
                disabled={waitingWithdrawal}
                value={transferToUPI}
              />
              <Button
                type="submit"
                variant="contained"
                className="py-2"
                color="primary"
                fullWidth
                disabled={isFormSubmitted || waitingWithdrawal}
                onClick={handleFormSubmit}
              >
                Submit
              </Button>
            </div>
            <mark className="me-4">
              Note: Check the UPI ID before submitting to avoid withdrawal loss.
            </mark>
          </FormControl>
        </>
      )}
    </div>
  );
}
