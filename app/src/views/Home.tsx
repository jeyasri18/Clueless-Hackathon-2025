// Home.tsx
import React from "react";

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
  };

  return (
    <div style={{ scrollBehavior: "smooth" }}>
      <section style={{ ...sectionStyle, backgroundColor: "#f5f5f5" }}>
        <h1 style={heroTextStyle}>Watcha Wearin'?</h1>
      </section>

      <section style={contentSectionStyle}>
        <p>Ready to generate your next ootd?</p>
      </section>

      {/* <section style={contentSectionStyle}>
        <p>Another section. Add images, products, or anything here.</p>
      </section> */}
    </div>
  );
};

export default Home;
