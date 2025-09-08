import React, { useState, useEffect } from "react";
import { Layout, Button } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { connectWallet } from "../util/wallet";
import { CurrencyBattle } from "../components/CurrencyBattle";

const Home: React.FC = () => {
  const { address } = useWallet();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsConnected(Boolean(address));
  }, [address]);

  const handleConnectWallet = () => {
    setError(null);
    void connectWallet()
      .catch((err) => {
        console.error("Connection failed:", err);
        setError("Connection failed");
      });
  };

  if (!isConnected) {
    return (
      <Layout.Content>
        <Layout.Inset>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2rem",
              padding: "4rem 2rem",
              textAlign: "center",
              minHeight: "60vh",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "8rem", marginBottom: "1rem" }}>🏟️</div>
            <h1 style={{ fontSize: "3.5rem", margin: 0, color: "#333" }}>
              ARS Price Arena
            </h1>
            <p style={{ fontSize: "1.3rem", color: "#666", maxWidth: "600px", lineHeight: "1.6" }}>
              Predict if ARS will rise, fall, or stay stable over 5 minutes!
            </p>

            {error && (
              <div
                style={{
                  color: "red",
                  backgroundColor: "#fee",
                  padding: "1rem 2rem",
                  borderRadius: "0.5rem",
                  fontSize: "1.1rem",
                }}
              >
                {error}
              </div>
            )}

            <Button
              size="lg"
              variant="primary"
              onClick={handleConnectWallet}
              style={{
                fontSize: "1.5rem",
                padding: "1.2rem 3rem",
                backgroundColor: "#FF6B9D",
                borderColor: "#FF6B9D",
                borderRadius: "2rem",
              }}
            >
              🔗 Connect Wallet to Enter Arena
            </Button>

            {/* <div
              style={{
                marginTop: "3rem",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "2rem",
                maxWidth: "800px",
              }}
            >
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⚔️</div>
                <h3 style={{ color: "#333", margin: "0 0 0.5rem 0" }}>Epic Battles</h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  Engage in 5-minute currency battles with real-time price data
                </p>
              </div>
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>💰</div>
                <h3 style={{ color: "#333", margin: "0 0 0.5rem 0" }}>Win Rewards</h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  Earn 1.8x your stake for predicting the winning currency
                </p>
              </div>
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏆</div>
                <h3 style={{ color: "#333", margin: "0 0 0.5rem 0" }}>Glory & Fame</h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  Celebrate victories with epic animations and effects
                </p>
              </div>
            </div> */}
          </div>
        </Layout.Inset>
      </Layout.Content>
    );
  }

  return (
    <Layout.Content>
      <Layout.Inset>
        <CurrencyBattle />
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Home;
