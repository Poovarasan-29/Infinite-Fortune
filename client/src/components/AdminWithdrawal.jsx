import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AdminWithdrawal() {
  const [datas, setDatas] = useState([]);
  const [fromAdminTransactionId, setFromAdminTransactionId] = useState("");
  useEffect(() => {
    async function getDatas() {
      try {
        const res = await axios.get(
          import.meta.env.VITE_API_URL + "admin-withdrawal-requests"
        );
        setDatas(res.data);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
    getDatas();
  }, []);


  async function rejectRechargeRequest(e) {
    const data = {
      userId: e.currentTarget.getAttribute("data-userid"),
      transferToUPI: e.currentTarget.getAttribute("data-transferToUPI"),
    };

    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `rejected-recharge-request/`,
        data
      );
      setDatas(res.data.rechargeRequests);
      toast.success(res.data.message, { autoClose: 2000 });
    } catch (error) {
      toast.error(error.response.data.message, { autoClose: 2000 });
    }
  }

  const acceptRechargeRequest = async (event) => {
    const row = event.currentTarget.closest("tr"); // Get the row where the button was clicked
    const transactionId = row.querySelector("input").value.trim(); // Get the input value

    if (!transactionId) {
      alert("Please enter a Transaction ID before accepting.");
      return;
    }

    const userId = event.currentTarget.getAttribute("data-userid");
    const transferToUPI =
      event.currentTarget.getAttribute("data-transfertoupi");
    const amount = event.currentTarget.getAttribute("data-amount");

    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `success-withdrawal-request`,
        { userId, amount, transactionId, transferToUPI }
      );
      setDatas(res.data.withdrawalRequests);
      toast.success(res.data.message, { autoClose: 2000 });
    } catch (error) {
      toast.error(error.response.data.message, { autoClose: 2000 });
    }
  };

  return (
    <div className="table-responsive mx-4 rounded rounded-3 ">
      <table className="table table-hover">
        <thead>
          <tr className="text-center">
            <th>No</th>
            <th>UserId</th>
            <th>Amount</th>
            <th>Transfer to UPI</th>
            <th>Transaction ID</th>
            <th>Rejected</th>
            <th>Accepted</th>
          </tr>
        </thead>
        {datas.length !== 0 ? (
          <tbody>
            {datas.map((data, index) => (
              <tr key={index} className="text-center">
                <td>{index + 1}</td>
                <td>{data.userId}</td>
                <td>{data.amount}</td>
                <td>{data.transferToUPI}</td>
                <td className="" style={{ width: "200px" }}>
                  <input
                    type="text"
                    className="m-0 px-2 border"
                    style={{ width: "200px", outlineColor: "blue" }}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-danger py-0 px-1"
                    data-userid={data.userId}
                    data-transfertoupi={data.transferToUPI}
                    data-amount={data.amount}
                    // onClick={rejectRechargeRequest}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-success py-0 px-1"
                    data-userid={data.userId}
                    data-transfertoupi={data.transferToUPI}
                    data-amount={data.amount}
                    // onClick={acceptRechargeRequest}
                    onClick={acceptRechargeRequest}
                  >
                    <i className="bi bi-check"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={7} className="text-center">
                No data found
              </td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
}
