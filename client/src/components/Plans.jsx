import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loading from "./Loading";
import { Helmet } from "react-helmet-async";
// import ConformationPopUp from "./ConformationPopUp";

export default function Plans() {
  const plans = [
    {
      image: "HoneyCake.webp",
      price: "Free",
      profit: "5",
      text: "A piece of Honey Cake",
    },
    {
      image: "Vannila.webp",
      price: "₹200",
      profit: "20",
      text: "1KG Vannila",
    },
    {
      image: "Chocolate.webp",
      price: "₹400",
      profit: "50",
      text: "1KG Chocolate",
    },
    {
      image: "ButterScotch.webp",
      price: "₹600",
      profit: "75",
      text: "1KG ButterScotch",
    },
    {
      image: "IceCake.webp",
      price: "₹900",
      profit: "100",
      text: "1KG Ice Cake",
    },
  ];
  const [balance, setBalance] = useState(null);
  const { userData } = useContext(AuthContext);
  const [isBuyClicked, setIsBuyClicked] = useState(false);

  async function getBalance() {
    const res = await axios.get(
      import.meta.env.VITE_API_URL + "getUserDatasForDashboard",
      {
        params: {
          userId: userData?.userId,
        },
      }
    );
    setBalance(res.data.rechargedBalance);
  }
  useEffect(() => {
    if (userData?.userId) getBalance();
  }, [userData]);

  function handleBuyPlan(e) {
    const index = e.target.value;
    setIsBuyClicked(index);
  }
  async function handleBuyConfirmButton() {
    // isBuyClicked == false no items selected
    // If any selectesd the isBuyClicked Has index of the clicked item
    if (isBuyClicked !== false) {
      setIsBuyClicked(false);

      try {
        const res = await axios.post(
          import.meta.env.VITE_API_URL + "buy-plan",
          {
            choosedPlanData: {
              image: plans[isBuyClicked].image,
              text: plans[isBuyClicked].text,
              price:
                plans[isBuyClicked].price == "Free"
                  ? 0
                  : parseInt(plans[isBuyClicked].price.slice(1)),
              profit: parseInt(plans[isBuyClicked].profit),
            },
            userId: userData.userId,
          }
        );
        toast.success(res.data.message, { autoClose: 1400 });
        if (userData?.userId) getBalance();
      } catch (error) {
        toast.error(error.response.data.message, { autoClose: 1400 });
      }
    }
  }

  return (
    <div>
      <Helmet>
        <title>Buy plans</title>
        <meta
          name="description"
          content="Explore a variety of cake investment plans with unique pricing and profit rates. Choose a plan, recharge your account, and grow your daily earnings with our Infinite Fortune platform."
        />
        {/* Open Graph (OG) for Social Media Sharing */}
        <meta property="og:title" content="Infinite Fortune plans" />
        <meta
          property="og:description"
          content="Buy cakes and increse the daily profit amount"
        />
      </Helmet>
      {balance ? (
        <div
          style={
            isBuyClicked ? { filter: "blur(5px)", pointerEvents: "none" } : {}
          }
        >
          <p className="fw-light m-0 mb-3" style={{ fontSize: "30px" }}>
            Available Balance <br />
            <span className="fw-light" style={{ fontSize: "30px" }}>
              <span>
                <i
                  className="bi bi-currency-rupee"
                  style={{ fontSize: "27px" }}
                >
                  {balance > 0 ? balance : 0}
                </i>
              </span>
            </span>
          </p>
          <div className="d-flex justify-content-center flex-wrap">
            {plans.map((plan, index) => (
              <div className=" p-1" key={index}>
                <div className="card" style={{ width: "14rem" }}>
                  <img
                    src={`/images/plansImages/${plan.image}`}
                    className="card-img-top"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {plan.price} -{" "}
                      <span className="fw-light font-monospace">
                        {plan.profit}/day
                      </span>
                    </h5>
                    <p className="card-text ">{plan.text}</p>
                    <button
                      className="btn btn-primary"
                      value={index}
                      onClick={handleBuyPlan}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Loading />
      )}
      {isBuyClicked !== false && (
        <div className="p-3 py-4 border shadow-lg rounded plan-confirmation-box">
          <p className="h4 fw-light mb-3 fw-bold">Are you sure want to buy?</p>
          <p className="m-0">
            {plans[isBuyClicked].text} - {plans[isBuyClicked].price}
          </p>
          <p className="m-0" style={{ fontSize: "14px", letterSpacing: "1px" }}>
            Earn ₹{plans[isBuyClicked].profit}/day
          </p>
          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-danger"
              onClick={() => setIsBuyClicked(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-success"
              onClick={handleBuyConfirmButton}
            >
              Buy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
