import React, { useEffect, useState } from "react";

interface VictoryAnimationProps {
  isVisible: boolean;
  winner: string;
  amount: string;
  onComplete?: () => void;
}

export const VictoryAnimation: React.FC<VictoryAnimationProps> = ({
  isVisible,
  winner,
  amount,
  onComplete,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const confettiParticles = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="confetti-particle"
      style={{
        position: "absolute",
        width: "10px",
        height: "10px",
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }}
    />
  ));

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        color: "white",
      }}
    >
      <style>
        {`
          @keyframes confetti-fall {
            from {
              transform: translateY(-100vh) rotate(0deg);
            }
            to {
              transform: translateY(100vh) rotate(360deg);
            }
          }
          
          .confetti-particle {
            animation: confetti-fall linear infinite;
          }
          
          @keyframes victory-pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
          
          .victory-content {
            animation: victory-pulse 2s ease-in-out infinite;
          }
        `}
      </style>

      {showConfetti && confettiParticles}

      <div className="victory-content" style={{ textAlign: "center", zIndex: 1001 }}>
        <div style={{ fontSize: "6rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#FFD700" }}>
          VICTORY!
        </h1>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          {winner} Wins!
        </div>
        <div style={{ fontSize: "1.5rem", color: "#90EE90" }}>
          You earned {amount} tokens! 💰
        </div>
        <div style={{ fontSize: "1rem", marginTop: "2rem", opacity: 0.8 }}>
          Congratulations, champion! 🏆
        </div>
      </div>
    </div>
  );
};

interface DefeatAnimationProps {
  isVisible: boolean;
  winner: string;
  onComplete?: () => void;
}

export const DefeatAnimation: React.FC<DefeatAnimationProps> = ({
  isVisible,
  winner,
  onComplete,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(139, 0, 0, 0.8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        color: "white",
      }}
    >
      <style>
        {`
          @keyframes shake {
            0%, 100% {
              transform: translateX(0);
            }
            10%, 30%, 50%, 70%, 90% {
              transform: translateX(-5px);
            }
            20%, 40%, 60%, 80% {
              transform: translateX(5px);
            }
          }
          
          .defeat-content {
            animation: shake 0.5s ease-in-out 3;
          }
        `}
      </style>

      <div className="defeat-content" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "6rem", marginBottom: "1rem" }}>😔</div>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#FF6B6B" }}>
          DEFEAT
        </h1>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          {winner} Won This Round
        </div>
        <div style={{ fontSize: "1.2rem", color: "#FFB3B3" }}>
          Better luck next time, warrior! 🛡️
        </div>
        <div style={{ fontSize: "1rem", marginTop: "2rem", opacity: 0.8 }}>
          The arena awaits your return...
        </div>
      </div>
    </div>
  );
};