import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "react-bootstrap";

export default function RechargeHistory() {
  const { userData } = useContext(AuthContext);
  const [datas, setDatas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = datas.slice(startIndex, endIndex);

  const totalPages = Math.ceil(datas.length / itemsPerPage);

  useEffect(() => {
    async function getRechargeHistoryDatas() {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + "getUserRechargeHistory",
        {
          params: {
            userId: userData.userId,
          },
        }
      );
      setDatas(res.data.rechargeHistory);
    }
    getRechargeHistoryDatas();
  }, []);

  return (
    <div className="table-responsive mx-4 rounded rounded-3 mt-3">
      <table className="table table-hover table-bordered">
        <thead>
          <tr className="text-center">
            <th>No</th>
            <th>Amount</th>
            <th>UPI</th>
            <th>Transaction ID</th>
            <th>Status</th>
          </tr>
        </thead>
        {datas.length !== 0 ? (
          <tbody>
            {currentData.map((data, index) => (
              <tr key={index} className="text-center">
                <td>{index + 1}</td>
                <td>{data.amount}</td>
                <td>{data.selectedUpi}</td>
                <td>{data.transactionId}</td>
                <td
                  className={
                    data.status == "Success"
                      ? "text-success"
                      : data.status == "Pending"
                      ? "text-warning"
                      : "text-danger"
                  }
                >
                  {data.status}
                </td>
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan={5} className="text-center">
                No data found
              </td>
            </tr>
          </tbody>
        )}
      </table>
      {datas.length !== 0 && (
        <div className="d-flex justify-content-between mt-3">
          <Button
            variant="primary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="primary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
