import {
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import RechargeHistory from "./RechargeHistory";

export default function Recharge() {
  const [viewInstructionOpen, setViewInstructionOpen] = useState(false);
  const [selectedUpi, setSelectedUpi] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const { userData, notificationPermission } = useContext(AuthContext);

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [viewRechargeHistory, setViewRechargeHistory] = useState(false);

  const handleUpiSelection = (e) => {
    setSelectedUpi(e.target.value);
    navigator.clipboard.writeText(e.target.value).then(() => {
      toast.success("UPI id Copied!", { autoClose: 1000 });
    });
  };

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (selectedUpi.length == 0) {
      toast.error("Select the UPI ID used for payment", { autoClose: 2000 });
    }
    if (amount < 200) {
      toast.warning("Amount minimum ₹200", { autoClose: 2000 });
    }
    if (transactionId.length == 0) {
      return toast.warning("Enter Transaction Id", { autoClose: 2000 });
    }
    let removeLeadingZeroAmount = amount;
    let count = 0;
    while (removeLeadingZeroAmount[count] == "0") {
      count++;
    }

    removeLeadingZeroAmount = removeLeadingZeroAmount.slice(count);
    setAmount(removeLeadingZeroAmount);
    if (
      selectedUpi.length != 0 &&
      removeLeadingZeroAmount >= 200 &&
      transactionId.length !== 0
    ) {
      setIsFormSubmitted(true);
      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "recharge",
          {
            userId: userData.userId,
            selectedUpi,
            amount: removeLeadingZeroAmount,
            transactionId,
          }
        );
        // Send Notification
        // if (notificationPermission == "granted") {
        //   new Notification("Recharge in Progress!", {
        //     body: `Your recharge of ₹${amount} will be added to your dashboard by 11:59 PM today.`,
        //     icon: "/favicon/apple-touch-icon.png",
        //   });
        // } else {
        //   toast.warning("Please allow notification to get alerts!");
        // }

        setSelectedUpi("");
        setAmount("");
        setTransactionId("");
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
      <title>Recharge</title>
      <div className="d-flex">
        {!viewInstructionOpen && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setViewRechargeHistory(!viewRechargeHistory);
            }}
          >
            {viewRechargeHistory ? (
              <i className="bi bi-x-lg" title="close"></i>
            ) : (
              <span title="view">Recharge History</span>
            )}
          </button>
        )}
        {!viewRechargeHistory && (
          <button
            className="btn btn-warning ms-auto"
            onClick={() => setViewInstructionOpen(!viewInstructionOpen)}
          >
            {viewInstructionOpen ? (
              <i className="bi bi-x-lg" title="close"></i>
            ) : (
              <span title="view">Instructions</span>
            )}
          </button>
        )}
      </div>
      {viewInstructionOpen && (
        <div className="m-3">
          <p style={{ fontSize: "22px" }}>
            <i className="bi bi-bar-chart-steps text-primary fs-4 mx-1"></i>{" "}
            Recharge Instructions
          </p>
          <ol className="d-flex flex-column gap-2">
            <li>
              <span className="fw-light">Select a UPI ID</span> from the list
              below.
            </li>
            <li>
              <span className="fw-light">Make the payment</span> using any UPI
              app (Google Pay, PhonePe, Paytm, etc.).
            </li>
            {/* <li>
              <span className="fw-light">Take a screenshot</span> of the
              successful payment.
            </li> */}
            <li>
              <span className="fw-light">Return to this page</span> and follow
              these steps:
              <ul>
                <li>Select the UPI ID used for payment.</li>
                <li>Enter the paid amount.</li>
                <li>Provide the transaction ID.</li>
                {/* <li>Upload the payment screenshot.</li> */}
              </ul>
            </li>
            <li>
              Click the <span className="fw-light">Submit</span> button.
            </li>
          </ol>
          <p style={{ fontSize: "22px" }}>⏳ Processing Time</p>
          <ul>
            <li>
              The amount will be reflected in your dashboard within 2 hours.
            </li>
          </ul>
          <p style={{ fontSize: "22px" }}>⚠️ Important Notes</p>
          <ol>
            <li>
              Ensure you enter the correct{" "}
              <span className="fw-light">transaction ID</span> to avoid delays.
            </li>
            {/* <li>
              The uploaded{" "}
              <span className="fw-light">screenshot must be clear</span> and
              show payment details
            </li> */}
            <li>
              If the amount is not updated within{" "}
              <span className="fw-light">2 hours</span>, contact support.
            </li>
          </ol>
        </div>
      )}

      {viewRechargeHistory ? (
        <RechargeHistory />
      ) : (
        <>
          <p className="mt-3">Use these UPI's for deposit</p>

          <FormControl className="ms-3 w-100 overflow-hidden">
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              name="radio-buttons-group"
              onChange={handleUpiSelection}
              value={selectedUpi}
              title="Click to Copy"
              style={{ width: "fit-content" }}
            >
              <FormControlLabel
                value="spking222005@okaxis"
                control={<Radio />}
                label="spking222005@okaxis"
              />
              {/* <FormControlLabel
                value="6384889012@paytm"
                control={<Radio />}
                label="6384889012@paytm"
              />
              <FormControlLabel
                value="6384889012"
                control={<Radio />}
                label="6384889012"
              />
              <FormControlLabel
                value="phonepe.6384.hdfc"
                control={<Radio />}
                label="phonepe.6384.hdfc"
              /> */}
            </RadioGroup>
            <mark className="me-4 my-2">
              Hint: Click on the UPI ID to copy and make the payment, then
              proceed to submit the form below.
            </mark>

            <div className="m-3 w-75 d-flex flex-column gap-3">
              <TextField
                label="Enter amount"
                type="number"
                fullWidth
                required
                helperText="Minimum ₹200"
                onChange={(e) => setAmount(e.target.value)}
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
                label="Enter Transaction Id"
                onChange={(e) => setTransactionId(e.target.value)}
                required
                fullWidth
                value={transactionId}
              />
              <Button
                type="submit"
                variant="contained"
                className="py-2"
                color="primary"
                fullWidth
                disabled={isFormSubmitted}
                onClick={handleFormSubmit}
              >
                Submit
              </Button>
            </div>
            <mark className="me-4">
              Note: Don't save these UPI's for future payment
            </mark>
          </FormControl>
        </>
      )}
    </div>
  );
}
