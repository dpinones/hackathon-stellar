import React, { useEffect, useState } from "react";

interface BattleProgressProps {
  timeRemaining: number;
  totalTime: number;
  currency1: {
    symbol: string;
    flag: string;
    name: string;
  };
  currency2: {
    symbol: string;
    flag: string;
    name: string;
  };
  chosenCurrency: number;
  pairColor: string;
}

export const BattleProgress: React.FC<BattleProgressProps> = ({
  timeRemaining,
  totalTime,
  currency1,
  currency2,
  chosenCurrency,
  pairColor,
}) => {
  const [isUrgent, setIsUrgent] = useState(false);
  const [showHypeMessage, setShowHypeMessage] = useState(false);

  const progressPercentage = ((totalTime - timeRemaining) / totalTime) * 100;
  
  useEffect(() => {
    // Show urgency when less than 30 seconds remain
    setIsUrgent(timeRemaining <= 30);
    
    // Show hype messages at specific intervals
    if (timeRemaining === 30 || timeRemaining === 10) {
      setShowHypeMessage(true);
      const timer = setTimeout(() => setShowHypeMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHypeMessage = () => {
    if (timeRemaining === 30) return "30 seconds left! 🔥";
    if (timeRemaining === 10) return "Final countdown! ⚡";
    return "";
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <style>
        {`
          @keyframes battle-pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 ${pairColor}40;
            }
            50% {
              box-shadow: 0 0 0 20px ${pairColor}00;
            }
          }
          
          @keyframes urgent-blink {
            0%, 100% {
              color: #ff4444;
            }
            50% {
              color: #ffffff;
            }
          }
          
          @keyframes slide-in {
            from {
              transform: translateY(-50px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          .battle-arena {
            animation: battle-pulse 2s infinite;
          }
          
          .urgent-timer {
            animation: urgent-blink 1s infinite;
          }
          
          .hype-message {
            animation: slide-in 0.5s ease-out;
          }
        `}
      </style>

      {showHypeMessage && (
        <div
          className="hype-message"
          style={{
            position: "absolute",
            top: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: pairColor,
            color: "white",
            padding: "10px 20px",
            borderRadius: "25px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            zIndex: 100,
          }}
        >
          {getHypeMessage()}
        </div>
      )}

      <div
        className="battle-arena"
        style={{
          border: `3px solid ${pairColor}`,
          borderRadius: "1rem",
          padding: "2rem",
          backgroundColor: isUrgent ? "#2a1a1a" : "#f8f9fa",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Progress Bar Background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: `linear-gradient(to right, ${pairColor}20 0%, ${pairColor}20 ${progressPercentage}%, transparent ${progressPercentage}%, transparent 100%)`,
            transition: "all 0.5s ease",
          }}
        />

        <div style={{ position: "relative", zIndex: 10 }}>
          {/* Timer Display */}
          <div
            className={isUrgent ? "urgent-timer" : ""}
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "1rem",
              color: isUrgent ? "#ff4444" : pairColor,
            }}
          >
            {formatTime(timeRemaining)}
          </div>

          {/* Battle Visualization */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1rem",
                borderRadius: "0.5rem",
                backgroundColor: chosenCurrency === 0 ? pairColor : "transparent",
                color: chosenCurrency === 0 ? "white" : "inherit",
                border: chosenCurrency === 0 ? `2px solid ${pairColor}` : "2px solid #ddd",
                transform: chosenCurrency === 0 ? "scale(1.05)" : "scale(1)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                {currency1.flag}
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {currency1.symbol}
              </div>
              {chosenCurrency === 0 && (
                <div style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>
                  YOUR CHAMPION! 👑
                </div>
              )}
            </div>

            {/* Battle Animation */}
            <div
              style={{
                fontSize: "2rem",
                animation: isUrgent ? "urgent-blink 0.5s infinite" : "none",
              }}
            >
              ⚔️
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1rem",
                borderRadius: "0.5rem",
                backgroundColor: chosenCurrency === 1 ? pairColor : "transparent",
                color: chosenCurrency === 1 ? "white" : "inherit",
                border: chosenCurrency === 1 ? `2px solid ${pairColor}` : "2px solid #ddd",
                transform: chosenCurrency === 1 ? "scale(1.05)" : "scale(1)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
                {currency2.flag}
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {currency2.symbol}
              </div>
              {chosenCurrency === 1 && (
                <div style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>
                  YOUR CHAMPION! 👑
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e9ecef",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: `${progressPercentage}%`,
                height: "100%",
                backgroundColor: pairColor,
                transition: "width 1s ease",
                background: `linear-gradient(90deg, ${pairColor} 0%, ${pairColor}80 100%)`,
              }}
            />
          </div>

          {/* Status Message */}
          <div
            style={{
              textAlign: "center",
              fontSize: "1.1rem",
              color: isUrgent ? "#ff4444" : "#666",
              fontWeight: isUrgent ? "bold" : "normal",
            }}
          >
            {isUrgent
              ? "🚨 FINAL MOMENTS! THE BATTLE REACHES ITS CLIMAX! 🚨"
              : "Battle in progress... May the strongest currency win! 🏆"}
          </div>
        </div>
      </div>
    </div>
  );
};