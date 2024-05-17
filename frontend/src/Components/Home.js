import React from "react";
import BannerBackground from "../Assets/home-banner-background (1).png";
import BannerImage from "../Assets/—Pngtree—illustration of a man working_5361915.png";
import Navbar from "./Navbar";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const Home = () => {
 

  return (
    <div className="home-container">
      <Navbar />
      <div className="home-banner-container">
        <div className="home-bannerImage-container">
          <img src={BannerBackground} alt="" />
        </div>
        <div className="home-text-section">
          <h1 className="primary-heading">
            Securing Your World One Home at a Time
          </h1>
          <p className="primary-text">
            encapsulates our dedication to safeguarding your environment,
            reinforcing each residence's defenses to ensure tranquility.
          </p>
            <Link to ='/attendance' className="secondary-button">View history now <FiArrowRight />{" "}</Link>
            

        </div>
        <div className="home-image-section">
          <img src={BannerImage} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Home;
