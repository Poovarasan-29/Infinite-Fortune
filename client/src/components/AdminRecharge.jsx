import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AdminRecharge() {
  const [datas, setDatas] = useState([]);
  useEffect(() => {
    async function getDatas() {
      try {
        const res = await axios.get(
          import.meta.env.VITE_API_URL + "getAdminRechargeRequests"
        );
        setDatas(res.data.rechargeRequestDatas);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
    getDatas();
  }, []);

  async function acceptRechargeRequest(e) {
    const data = {
      userId: e.currentTarget.getAttribute("data-userid"),
      transactionId: e.currentTarget.getAttribute("data-transactionid"),
    };

    try {
      const res = await axios.put(
        import.meta.env.VITE_API_URL + `success-recharge-request/`,
        data
      );
      setDatas(res.data.rechargeRequests);
      toast.success(res.data.message, { autoClose: 2000 });
    } catch (error) {
      toast.error(error.response.data.message, { autoClose: 2000 });
    }
  }
  async function rejectRechargeRequest(e) {
    const data = {
      userId: e.currentTarget.getAttribute("data-userid"),
      transactionId: e.currentTarget.getAttribute("data-transactionid"),
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

  return (
    <div className="table-responsive mx-4 rounded rounded-3 ">
      <table className="table table-hover">
        <thead>
          <tr className="text-center">
            <th>No</th>
            <th>UserId</th>
            <th>Amount</th>
            <th>UPI</th>
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
                <td>{data.selectedUpi}</td>
                <td>{data.transactionId}</td>

                <td>
                  <button
                    className="btn btn-danger py-0 px-1"
                    data-userid={data.userId}
                    data-transactionid={data.transactionId}
                    onClick={rejectRechargeRequest}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-success py-0 px-1"
                    data-userid={data.userId}
                    data-transactionid={data.transactionId}
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
