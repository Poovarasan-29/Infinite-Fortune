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
      } catch (error) {
        setIsFormSubmitted(false);
        toast.success(error.response.data.message, { autoClose: 1400 });
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
            <h5
              className="text-warning p-2 mt-3"
              style={{ borderBottom: "2px solid black" }}
            >
              Wait for completion before withdrawing
            </h5>
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
