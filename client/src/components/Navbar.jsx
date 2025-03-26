import { NavLink } from "react-router-dom";
import "../assets/stylesheets/navbar.css";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [burgerBarOpen, setBurgerBarOpen] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const { logout } = useContext(AuthContext);
  const navLinks = ["Home", "Plans", "Recharge", "Withdrawal", "Invite"];

  useEffect(() => {
    const handleResize = () => {
      const innerWidth = window.innerWidth;

      if (innerWidth > 540) setBurgerBarOpen(false);
      setWidth(innerWidth);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [width]);

  return (
    <div className="nav-bar d-flex justify-content-center">
      <section className="d-flex justify-content-between mx-lg-5 align-items-center">
        <h1
          className="text-uppercase fw-bold m-0 me-3"
          title="Infinite Fortune"
        >
          IF
        </h1>
        <div
          className="burger-bar flex-column p-2"
          onClick={() => setBurgerBarOpen(!burgerBarOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <ul
          className={`list-unstyled m-0 align-items-center nav-lists ${
            burgerBarOpen || width > 540 ? "d-flex" : "d-none"
          }`}
        >
          {navLinks.map((navLink, index) => (
            <li key={index}>
              <NavLink
                to={`/dashboard/${navLink.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-decoration-none navbar-link ${
                    isActive ? "active-link" : ""
                  }`
                }
              >
                {navLink}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              className="btn ms-md-3 btn-sm shadow btn-outline-danger"
              onClick={() => logout()}
            >
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
}
