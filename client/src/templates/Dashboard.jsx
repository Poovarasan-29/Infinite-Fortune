import { Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../components/Home";
import Recharge from "../components/Recharge";
import Withdrawal from "../components/Withdrawal";
import Invite from "../components/Invite";
import Protected from "../components/Protected";
import Plans from "../components/Plans";
import Loading from "../components/Loading";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <div className="dashboard mx-auto my-3 container-md">
        <Routes>
          <Route
            path="/"
            element={
              <Protected>
                <Home />
              </Protected>
            }
          />
          <Route
            path="/home"
            element={
              <Protected>
                <Home />
              </Protected>
            }
          />
          <Route
            path="/plans"
            element={
              <Protected>
                <Plans />
              </Protected>
            }
          />
          <Route
            path="/recharge"
            element={
              <Protected>
                <Recharge />
              </Protected>
            }
          />
          <Route
            path="/withdrawal"
            element={
              <Protected>
                <Withdrawal />
              </Protected>
            }
          />
          <Route
            path="/invite"
            element={
              <Protected>
                <Invite />
              </Protected>
            }
          />
          <Route
            path="/loading"
            element={
              <Protected>
                <Loading />
              </Protected>
            }
          />
        </Routes>
      </div>
    </>
  );
}
