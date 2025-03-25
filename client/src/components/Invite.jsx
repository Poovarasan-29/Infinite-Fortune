import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { Helmet } from "react-helmet-async";

export default function Invite() {
  const { userData } = useContext(AuthContext);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    setInviteLink(`${window.location.origin}/?referral=${userData?.userId}`);
  }, [userData]);
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast.success("Invite link copied", { autoClose: 1000 });
    });
  };
  return (
    <div>
      <Helmet>
        <title>Invite new user</title>
        <meta
          name="description"
          content="Invite new users to our Infinite Fortune platform and earn 30% commission from their recharge amount. Share your referral link and grow your network effortlessly."
        />
        {/* Open Graph (OG) for Social Media Sharing */}
        <meta property="og:title" content="Invite and Earn" />
        <meta
          property="og:description"
          content="Share your referral link and grow your network effortlessly."
        />
      </Helmet>
      <h1 className="text-center display-6 fw-bold">
        Invite and Get 30% Commission
      </h1>
      <img
        src="/images/refer-and-earn.webp"
        width={"100%"}
        alt="refer and earn"
        className="rounded rounded-4"
      />
      <div className="m-3">
        <p style={{ fontSize: "22px" }}>✅ Steps to get Referral amount</p>
        <ol>
          <li>
            <b>Invite Your Friends</b> - Share your referral link with friends.
          </li>
          <li>
            <b>Minimum Recharge Requirement</b> - The invitee must recharge at
            least ₹200 to be considered a valid user.
          </li>
          <li>
            <b>Earnings from Invitee</b> - Once your invitee completes the
            minimum recharge, you will earn 30% of their recharged amount.
          </li>
          <li>
            <b>Direct Referral Only</b> - Only direct referrals will be counted
            for rewards.
          </li>
        </ol>
      </div>
      <div className="m-3">
        <p style={{ fontSize: "22px" }}>💰 Example Earnings Calculation</p>
        <ol>
          <li>If your invitee recharges ₹200, you earn ₹60 (30%)</li>
          <li>If they recharge ₹500, you earn ₹150 (30%).</li>
        </ol>
      </div>
      <div className="m-3 mb-5">
        <p style={{ fontSize: "22px" }}>⚠️ Important Notes</p>
        <ol>
          <li>
            The referral will be invalid if the invitee does not meet the
            minimum recharge requirement.
          </li>
          <li>
            Referral rewards are only applicable to direct invitees (no
            multi-level referrals).
          </li>
          <li>
            The invite system is subject to change based on platform policies.
          </li>
        </ol>
      </div>
      <div className="w-100 d-flex justify-content-center">
        <button
          onClick={handleCopy}
          className="btn btn-primary refer-link-btn py-2"
          title="Click to Copy"
          style={{
            fontSize: "20px",
            position: "fixed",
            bottom: "20px",
            border: "2px solid white",
          }}
        >
          Refer and Earn
        </button>
      </div>
    </div>
  );
}
