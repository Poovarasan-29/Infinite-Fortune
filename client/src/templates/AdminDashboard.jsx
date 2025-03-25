import { Link, Route, Routes } from "react-router-dom";
import AdminRecharge from "../components/AdminRecharge";
import AdminWithdrawal from "../components/AdminWithdrawal";

export default function AdminDashboard() {
  return (
    <>
      <ul
        className="list-unstyled d-flex gap-4 w-100 justify-content-center p-3"
        style={{ borderBottom: "2px solid" }}
      >
        <li>
          <Link className="text-decoration-none" to={"/admin/dashboard/"}>
            Home
          </Link>
        </li>
        <li>
          <Link
            className="text-decoration-none"
            to={"/admin/dashboard/recharge"}
          >
            Recharge
          </Link>
        </li>
        <li>
          <Link
            className="text-decoration-none"
            to={"/admin/dashboard/withdrawal"}
          >
            Withdrawal
          </Link>
        </li>
      </ul>
      <Routes>
        <Route path="recharge" element={<AdminRecharge />} />
        <Route path="withdrawal" element={<AdminWithdrawal />} />
      </Routes>
    </>
  );
}
