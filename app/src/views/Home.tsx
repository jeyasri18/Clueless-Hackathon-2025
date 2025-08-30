import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const sectionStyle: React.CSSProperties = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const heroTextStyle: React.CSSProperties = {
    fontFamily: "Cursive, sans-serif",
    fontSize: "4rem",
    textAlign: "center",
  };

  const contentSectionStyle: React.CSSProperties = {
    ...sectionStyle,
    backgroundColor: "#e0e0e0",
    fontSize: "2rem",
    flexDirection: "column", // so text and button stack
  };

  return (
    <div style={{ scrollBehavior: "smooth" }}>
      <section style={{ ...sectionStyle, backgroundColor: "#f5f5f5" }}>
        <h1 style={heroTextStyle}>Watcha Wearin'?</h1>
      </section>

      <section style={contentSectionStyle}>
        <p>Ready to generate your next ootd?</p>
        <Link to="/generate">
          <button
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "1.2rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#000",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Generate
          </button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
