import React, { useEffect, useRef, useState } from "react";

//basic generate outfit functionality 

export default function Generate() {
  const outfits = ["Shirt + Pants", "Dress"];

  const [isRolling, setIsRolling] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [finalIndex, setFinalIndex] = useState<number | null>(null);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const startRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    setHasGeneratedOnce(true);
    setFinalIndex(null);

    intervalRef.current = window.setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % outfits.length);
    }, 100);

    setTimeout(() => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const chosen = Math.floor(Math.random() * outfits.length);
      setDisplayIndex(chosen);
      setFinalIndex(chosen);
      setIsRolling(false);
    }, 3000);
  };

  const buttonLabel = isRolling ? "Generating..." : hasGeneratedOnce ? "Try again" : "Generate";

  return (
    <div style={{ padding: 20 }}>
      <h1>Outfit Generator</h1>
      <button onClick={startRoll} disabled={isRolling}>
        {buttonLabel}
      </button>
      <div style={{ marginTop: 20 }}>
        {outfits.map((item, idx) => (
          <div
            key={idx}
            style={{
              fontWeight: idx === displayIndex ? "bold" : "normal",
              color: finalIndex === idx ? "green" : "black",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
