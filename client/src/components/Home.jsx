import { useContext, useEffect, useState } from "react";
import "../assets/stylesheets/home.css";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import Loading from "./Loading";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";

export default function Home() {
  const { userData, setNotificationPermission, notificationPermission } =
    useContext(AuthContext);
  const [userFullDatas, setUserFullDatas] = useState();

  useEffect(() => {
    if (userData?.userId) {
      axios
        .get(import.meta.env.VITE_API_URL + "getUserDatasForDashboard", {
          params: { userId: userData?.userId },
        })
        .then((res) => {
          setUserFullDatas(res.data);
          if (!res.data?.isClaimedToday) {
            if (notificationPermission == "granted") {
              new Notification("Boost Your Earnings Today!", {
                body: "Unlock today's profits! Purchase a plan now to maximize your rewards.",
                icon: "/favicon/apple-touch-icon.png",
              });
            } else {
              toast.warning("Please allow notification to get alerts!");
            }
          }
        })
        .catch((err) => console.error(err));
    }

    if (Notification.permission == "default") {
      Notification.requestPermission().then((permission) =>
        setNotificationPermission(permission)
      );
    }
  }, [userData]);

  function handleDailyCheckIn(e) {
    axios
      .post(import.meta.env.VITE_API_URL + "daily-check-in", {
        userId: userData?.userId,
      })
      .then((res) => setUserFullDatas(res.data))
      .catch((err) => console.error(err));
  }

  return (
    <>
      <Helmet>
        <title>Infinite Fortune</title>
        <meta
          name="description"
          content="Welcome to Infinite Fortune! Check out your balance, referrals, commissions, and explore investment plans."
        />
        {/* Open Graph (OG) for Social Media Sharing */}
        <meta property="og:title" content="Infinite Fortune" />
        <meta property="og:description" content="Life time money earnings" />
      </Helmet>
      {userFullDatas ? (
        <div>
          <div className="d-flex justify-content-between align-items-center name-today-claim-div">
            <p className="display-6 ps-2">{userFullDatas?.name}!</p>
            <div></div>
            {userFullDatas?.dailyClaim > 0 ? (
              <div>
                {userFullDatas?.isClaimedToday && (
                  <p className="m-0 text-center" style={{ fontSize: "10px" }}>
                    Today claimed
                  </p>
                )}
                <button
                  className="btn btn-light border shadow"
                  onClick={handleDailyCheckIn}
                  disabled={userFullDatas?.isClaimedToday}
                  title="Check in Now"
                >
                  Check in : ₹{userFullDatas?.dailyClaim}
                </button>
              </div>
            ) : (
              <Link
                to={"/dashboard/plans"}
                className="btn btn-outline-info me-3 shadow"
              >
                Buy Plan
              </Link>
            )}
          </div>
          <div className="home row row-cols-sm-2 row-cols-lg-4 row-cols-1 d-flex flex-wrap justify-content-start mx-auto">
            <div className="py-2 outer-box">
              <div className="w-100 box border p-2 px-5 rounded text-center d-flex flex-column justify-content-around align-items-center">
                <div className="d-flex justify-content-center align-items-center rounded rounded-4">
                  <i className="bi bi-currency-rupee display-3 text-white"></i>
                </div>
                <p>Withdrawal Balance</p>
                <h4>{userFullDatas?.withdrawalBalanace || 0}</h4>
              </div>
            </div>
            <div className="py-2 outer-box">
              <div className="w-100 box border p-2 px-5 rounded text-center d-flex flex-column justify-content-around align-items-center">
                <div className="d-flex justify-content-center align-items-center rounded rounded-4">
                  <i className="bi bi-wallet2 display-3 text-white"></i>
                </div>
                <p>Plan Commission</p>
                <h4>{userFullDatas?.balance || 0}</h4>
              </div>
            </div>
            <div className="py-2 outer-box">
              <div className="w-100 box border p-2 px-5 rounded text-center d-flex flex-column justify-content-around align-items-center">
                <div className="d-flex justify-content-center align-items-center rounded rounded-4">
                  <i className="bi bi-cash-coin display-3 text-white"></i>
                </div>
                <p>Referral Commission</p>
                <h4>{userFullDatas?.commission || 0}</h4>
              </div>
            </div>

            <div className="py-2 outer-box">
              <div className="w-100 box border p-2 px-5 rounded text-center d-flex flex-column justify-content-around align-items-center">
                <div className="d-flex justify-content-center align-items-center rounded rounded-4">
                  <i className="bi bi-piggy-bank display-3 text-white"></i>
                </div>
                <p>Recharge Balance</p>
                <h4>{userFullDatas?.rechargedBalance || 0}</h4>
              </div>
            </div>

            <div className="py-2 outer-box">
              <div className="w-100 box border p-2 px-5 rounded text-center d-flex flex-column justify-content-around align-items-center">
                <div className="d-flex justify-content-center align-items-center rounded rounded-4">
                  <i className="bi bi-people display-3 text-white"></i>
                </div>
                <p>Total Invites</p>
                <h4>{userFullDatas?.referrals?.length}</h4>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}
