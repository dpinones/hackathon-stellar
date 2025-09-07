import React, { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import * as Client from "increment";
import { useSubmitRpcTx } from "../debug/hooks/useSubmitRpcTx";
import { useRpcPrepareTx } from "../debug/hooks/useRpcPrepareTx";
import { network } from "../contracts/util";
import { getNetworkHeaders } from "../debug/util/getNetworkHeaders";

// Prediction types matching the new contract
export enum Prediction {
  Up = "Up",
  Down = "Down", 
  Stable = "Stable",
}

interface RoundState {
  roundNumber: number;
  startTime: number;
  startPrice: number;
  endPrice?: number;
  isSettled: boolean;
  winningPrediction?: Prediction;
  totalPool: number;
  upPool: number;
  downPool: number;
  stablePool: number;
  timeRemaining?: number;
  isActive: boolean;
}

interface UserBet {
  prediction: Prediction;
  amount: string;
  roundNumber: number;
}

export const CurrencyBattle: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const [currentRound, setCurrentRound] = useState<RoundState | null>(null);
  const [userBet, setUserBet] = useState<UserBet | null>(null);
  const [betAmount, setBetAmount] = useState<string>("");
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [userWinnings, setUserWinnings] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedRounds, setCompletedRounds] = useState<number[]>([]);
  
  const {
    mutate: prepareTx,
    isPending: isPrepareTxPending,
    data: prepareTxData,
    error: prepareTxError,
  } = useRpcPrepareTx();

  const {
    mutate: submitRpc,
    isPending: isSubmitRpcPending,
    isSuccess: isSubmitRpcSuccess,
    error: submitRpcError,
  } = useSubmitRpcTx();

  // Handle transaction success
  useEffect(() => {
    if (isSubmitRpcSuccess) {
      setIsLoading(false);
      setError(null);
      loadState();
    }
  }, [isSubmitRpcSuccess]);

  // Handle transaction error
  useEffect(() => {
    if (submitRpcError || prepareTxError) {
      console.error("Transaction Error:", { submitRpcError, prepareTxError });
      setError("Transaction failed");
      setIsLoading(false);
    }
  }, [submitRpcError, prepareTxError]);

  // Handle prepare transaction success - trigger signing and submission
  useEffect(() => {
    if (prepareTxData && signTransaction && address) {
      const signAndSubmit = async () => {
        try {
          const signResult = await signTransaction(
            prepareTxData.transactionXdr,
            {
              address: address,
              networkPassphrase: network.passphrase,
            },
          );

          if (!signResult.signedTxXdr) {
            throw new Error("Transaction signing failed");
          }

          submitRpc({
            rpcUrl: network.rpcUrl,
            transactionXdr: signResult.signedTxXdr,
            networkPassphrase: network.passphrase,
            headers: getNetworkHeaders(network, "rpc"),
          });
        } catch (err) {
          console.error("Error in sign and submit:", err);
          setError("Transaction failed");
          setIsLoading(false);
        }
      };

      void signAndSubmit();
    }
  }, [prepareTxData, signTransaction, address, submitRpc]);

  // Load state on mount and when address changes
  useEffect(() => {
    if (address) {
      loadState();
    }
  }, [address]);

  const getContract = () => {
    if (!address) return null;
    console.log("Creating contract client with:", {
      contractId: "CBOR3RRXFRXAYJH5B4JQC6BZTVJDRVXO2XHU4NCMQMG66M6GQUT4AJHM",
      rpcUrl: network.rpcUrl,
      passphrase: network.passphrase,
      address: address
    });
    return new Client.Client({
      networkPassphrase: network.passphrase,
      contractId: "CBOR3RRXFRXAYJH5B4JQC6BZTVJDRVXO2XHU4NCMQMG66M6GQUT4AJHM",
      rpcUrl: network.rpcUrl,
      publicKey: address,
      allowHttp: true,
    });
  };

  const loadState = async () => {
    const contract = getContract();
    if (!contract) return;
    
    try {
      console.log("Loading contract state...");

      // Get current round - handle both success and error cases
      try {
        const currentRoundTx = await contract.get_current_round();
        const simResult = await currentRoundTx.simulate();
        
        console.log("currentRoundTx Simulation result:", simResult.result);
        console.log("simResult.result type:", typeof simResult.result);
        console.log("simResult.result keys:", simResult.result ? Object.keys(simResult.result) : "null");
        
        // Handle the Result wrapper (Ok/Err structure)
        let round: any = null;
        if (simResult.result && typeof simResult.result === 'object') {
          // Check if it's wrapped in an Ok result
          if ('value' in simResult.result) {
            console.log("Found value property, extracting...");
            round = simResult.result.value;
          } else {
            // Direct result
            console.log("Using direct result...");
            round = simResult.result;
          }
        }
        
        console.log("Parsed round data:", round);
        console.log("round type:", typeof round);
        console.log("round keys:", round ? Object.keys(round) : "null");
        console.log("round.round_number:", round?.round_number);
        console.log("round.round_number type:", typeof round?.round_number);
        console.log("round.round_number !== undefined:", round?.round_number !== undefined);
        
        if (round && round.round_number !== undefined) {
          console.log("Found current round:", round);
          
          const currentTime = Math.floor(Date.now() / 1000);
          const timeRemaining = Math.max(0, (Number(round.start_time) + 300) - currentTime);
          const isActive = !round.is_settled && timeRemaining > 0;

          // Handle winning_prediction
          let winningPrediction: Prediction | undefined;
          if (round.winning_prediction) {
            if (typeof round.winning_prediction === 'object' && 'tag' in round.winning_prediction) {
              winningPrediction = round.winning_prediction.tag as Prediction;
            } else if (typeof round.winning_prediction === 'string') {
              winningPrediction = round.winning_prediction as Prediction;
            }
          }

          setCurrentRound({
            roundNumber: Number(round.round_number),
            startTime: Number(round.start_time),
            startPrice: Number(round.start_price),
            endPrice: round.end_price ? Number(round.end_price) : undefined,
            isSettled: round.is_settled,
            winningPrediction,
            totalPool: Number(round.total_pool),
            upPool: Number(round.up_pool),
            downPool: Number(round.down_pool),
            stablePool: Number(round.stable_pool),
            timeRemaining,
            isActive,
          });

          // Check if user has a bet in current round
          const userBets = round.bets?.filter((bet: any) => bet.user === address) || [];
          if (userBets.length > 0) {
            const bet = userBets[0];
            
            // Handle prediction type conversion
            let predictionValue: Prediction;
            if (bet.prediction && typeof bet.prediction === 'object' && 'tag' in bet.prediction) {
              predictionValue = bet.prediction.tag as Prediction;
            } else {
              predictionValue = bet.prediction as unknown as Prediction;
            }
            
            setUserBet({
              prediction: predictionValue,
              amount: bet.amount.toString(),
              roundNumber: Number(round.round_number),
            });
          } else {
            setUserBet(null);
          }
        } else {
          console.log("No current round (contract returned error or empty result)");
          setCurrentRound(null);
          setUserBet(null);
        }
      } catch (err) {
        console.log("No current round available (simulation failed):", err);
        setCurrentRound(null);
        setUserBet(null);
      }

      // Get user winnings - use simple approach
      try {
        const winningsTx = await contract.get_user_winnings({ user: address! });
        const simResult = await winningsTx.simulate();
        setUserWinnings(Number(simResult.result || 0));
      } catch (err) {
        console.log("Could not fetch user winnings:", err);
        setUserWinnings(0);
      }

      // Get current ARS price
      try {
        const priceTx = await contract.get_current_ars_price();
        const simResult = await priceTx.simulate();
        console.log("Current price result:", simResult.result);
        
        let price: any = null;
        if (simResult.result && typeof simResult.result === 'object') {
          if ('value' in simResult.result) {
            price = simResult.result.value;
          } else {
            price = simResult.result;
          }
        }
        
        if (price !== null) {
          setCurrentPrice(Number(price));
        }
      } catch (err) {
        console.log("Could not fetch current price:", err);
      }

      console.log("State loading completed");

    } catch (err) {
      console.error("Error loading state:", err);
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (currentRound && currentRound.isActive && currentRound.timeRemaining && currentRound.timeRemaining > 0) {
      const timer = setInterval(() => {
        setCurrentRound(prev => {
          if (!prev || !prev.timeRemaining) return prev;
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            loadState(); // Reload to check if round can be settled
            return { ...prev, timeRemaining: 0, isActive: false };
          }
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentRound]);

  const handlePlaceBet = () => {
    if (!address || !signTransaction || !selectedPrediction || !betAmount) {
      setError("Please select prediction and enter bet amount");
      return;
    }

    setIsLoading(true);
    setError(null);

    const contract = getContract();
    if (!contract) return;

    void contract
      .place_bet(
        {
          user: address,
          prediction: { tag: selectedPrediction, values: undefined },
          amount: BigInt(betAmount),
        },
        {
          simulate: true,
        },
      )
      .then((tx) => {
        prepareTx({
          rpcUrl: network.rpcUrl,
          transactionXdr: tx.toXDR(),
          networkPassphrase: network.passphrase,
          headers: getNetworkHeaders(network, "rpc"),
        });
      })
      .catch((err) => {
        console.error("Place bet failed:", err);
        setError("Failed to place bet");
        setIsLoading(false);
      });
  };

  const handleClaimWinnings = () => {
    if (!address || !signTransaction) {
      setError("Please connect wallet");
      return;
    }

    setIsLoading(true);
    setError(null);

    const contract = getContract();
    if (!contract) return;

    void contract
      .claim_winnings(
        {
          user: address,
        },
        {
          simulate: true,
        },
      )
      .then((tx) => {
        prepareTx({
          rpcUrl: network.rpcUrl,
          transactionXdr: tx.toXDR(),
          networkPassphrase: network.passphrase,
          headers: getNetworkHeaders(network, "rpc"),
        });
      })
      .catch((err) => {
        console.error("Claim winnings failed:", err);
        setError("Failed to claim winnings");
        setIsLoading(false);
      });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return `$${(price / 1000000000000).toFixed(6)}`;
  };

  const getPredictionColor = (prediction: Prediction) => {
    switch (prediction) {
      case Prediction.Up: return "#28a745";
      case Prediction.Down: return "#dc3545";  
      case Prediction.Stable: return "#ffc107";
      default: return "#6c757d";
    }
  };

  const getPredictionIcon = (prediction: Prediction) => {
    switch (prediction) {
      case Prediction.Up: return "📈";
      case Prediction.Down: return "📉";
      case Prediction.Stable: return "➡️";
      default: return "❓";
    }
  };

  if (!address) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>🏟️ Currency Clash Arena</h2>
        <p>Connect your wallet to start predicting ARS price movements!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", margin: "0 0 0.5rem 0" }}>
          🏟️ ARS Price Arena
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
          Predict if ARS will rise, fall, or stay stable over 5 minutes!
        </p>
      </div>

      {error && (
        <div
          style={{
            color: "red",
            backgroundColor: "#fee",
            padding: "1rem",
            borderRadius: "0.5rem",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          {error}
        </div>
      )}

      {/* User Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid #ddd",
          textAlign: "center",
        }}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>💰 Claimable Winnings</h4>
          <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#28a745" }}>
            ${userWinnings}
          </p>
          {userWinnings > 0 && (
            <button
              onClick={handleClaimWinnings}
              disabled={isLoading || isPrepareTxPending || isSubmitRpcPending}
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.25rem",
                border: "none",
                backgroundColor: "#28a745",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Claim Now
            </button>
          )}
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid #ddd",
          textAlign: "center",
        }}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>📊 Current ARS Price</h4>
          <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "#007bff" }}>
            {currentPrice ? formatPrice(currentPrice) : "Loading..."}
          </p>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid #ddd",
          textAlign: "center",
        }}>
          <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>🏁 Completed Rounds</h4>
          <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#6c757d" }}>
            {completedRounds.length}
          </p>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "2rem", 
        marginBottom: "2rem" 
      }}>
        {/* Left Side - Betting Form - Always visible */}
        <div style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "1rem",
          border: "2px solid #28a745",
        }}>
          <h2 style={{ margin: "0 0 2rem 0", color: "#28a745", textAlign: "center" }}>
            🎯 Place Your Prediction
          </h2>

          {/* Prediction Selection */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Predict ARS Price Movement</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              {Object.values(Prediction).map(prediction => (
                <button
                  key={prediction}
                  onClick={() => setSelectedPrediction(prediction)}
                  style={{
                    padding: "1rem",
                    borderRadius: "0.75rem",
                    border: "2px solid",
                    borderColor: selectedPrediction === prediction ? getPredictionColor(prediction) : "#ddd",
                    backgroundColor: selectedPrediction === prediction ? getPredictionColor(prediction) : "white",
                    color: selectedPrediction === prediction ? "white" : "#333",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    {getPredictionIcon(prediction)}
                  </div>
                  <div>{prediction}</div>
                  <div style={{ fontSize: "0.7rem", marginTop: "0.25rem", opacity: 0.8 }}>
                    {prediction === Prediction.Up && "> +0.05%"}
                    {prediction === Prediction.Down && "< -0.05%"}
                    {prediction === Prediction.Stable && "-0.05% to +0.05%"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Bet Amount</h4>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter amount"
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  fontSize: "1rem",
                  border: "2px solid #ddd",
                  borderRadius: "0.5rem",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
              {[1, 10, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount.toString())}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #6c757d",
                    borderRadius: "0.25rem",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Place Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={
              isLoading ||
              isPrepareTxPending ||
              isSubmitRpcPending ||
              !selectedPrediction ||
              !betAmount ||
              Number(betAmount) <= 0
            }
            style={{
              width: "100%",
              padding: "1rem 2rem",
              borderRadius: "0.75rem",
              border: "none",
              fontSize: "1.2rem",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: "#28a745",
              color: "white",
              opacity: (isLoading || isPrepareTxPending || isSubmitRpcPending || !selectedPrediction || !betAmount || Number(betAmount) <= 0) ? 0.6 : 1,
            }}
          >
            {isLoading || isPrepareTxPending || isSubmitRpcPending
              ? "Placing Bet..."
              : "🎯 Place Bet"}
          </button>
        </div>

        {/* Right Side - Current Round */}
        {currentRound && (
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "1rem",
            border: "2px solid #007bff",
          }}>
            <h2 style={{ margin: "0 0 1rem 0", color: "#007bff", textAlign: "center" }}>
              🎯 Round #{currentRound.roundNumber}
            </h2>

            {/* Timer */}
            {currentRound.isActive && currentRound.timeRemaining !== undefined && (
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#dc3545" }}>
                  ⏰ {formatTime(currentRound.timeRemaining)}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  Time remaining to settle
                </div>
              </div>
            )}

            {/* Round Info */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", color: "#333" }}>Round Details</h4>
              <div style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                <div><strong>Start Price:</strong> {formatPrice(currentRound.startPrice)}</div>
                {currentRound.endPrice && (
                  <div><strong>End Price:</strong> {formatPrice(currentRound.endPrice)}</div>
                )}
                <div><strong>Total Pool:</strong> ${currentRound.totalPool}</div>
                <div><strong>Status:</strong> {currentRound.isSettled ? "🏁 Settled" : currentRound.isActive ? "⏳ Active" : "⏰ Ready to Settle"}</div>
                {currentRound.winningPrediction && (
                  <div style={{ color: getPredictionColor(currentRound.winningPrediction) }}>
                    <strong>Winner:</strong> {getPredictionIcon(currentRound.winningPrediction)} {currentRound.winningPrediction}
                  </div>
                )}
              </div>
            </div>

            {/* Pool Breakdown */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", color: "#333" }}>Pool Distribution</h4>
              <div style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                <div style={{ color: getPredictionColor(Prediction.Up) }}>
                  📈 <strong>Up Pool:</strong> ${currentRound.upPool}
                </div>
                <div style={{ color: getPredictionColor(Prediction.Down) }}>
                  📉 <strong>Down Pool:</strong> ${currentRound.downPool}
                </div>
                <div style={{ color: getPredictionColor(Prediction.Stable) }}>
                  ➡️ <strong>Stable Pool:</strong> ${currentRound.stablePool}
                </div>
              </div>
            </div>

            {/* User's Bet */}
            {userBet && userBet.roundNumber === currentRound.roundNumber && (
              <div style={{
                backgroundColor: "#e8f4f8",
                padding: "1rem",
                borderRadius: "0.5rem",
                textAlign: "center",
                border: "1px solid #007bff",
              }}>
                <h4 style={{ margin: "0 0 0.5rem 0", color: "#007bff" }}>Your Bet</h4>
                <div style={{ fontSize: "1rem" }}>
                  <span style={{ color: getPredictionColor(userBet.prediction) }}>
                    {getPredictionIcon(userBet.prediction)} {userBet.prediction}
                  </span>
                  {" - "}
                  <strong>${userBet.amount}</strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Price History */}
      {priceHistory.length > 0 && (
        <div style={{
          backgroundColor: "white",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          border: "1px solid #ddd",
        }}>
          <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>📈 Recent ARS Price History</h4>
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
            {priceHistory.map((price, index) => (
              <div
                key={index}
                style={{
                  minWidth: "120px",
                  padding: "0.75rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "0.25rem",
                  textAlign: "center",
                  border: "1px solid #ddd",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.25rem" }}>
                  #{index + 1}
                </div>
                <div style={{ fontWeight: "bold", fontFamily: "monospace" }}>
                  {formatPrice(price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};