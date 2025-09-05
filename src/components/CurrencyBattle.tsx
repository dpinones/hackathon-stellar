import React, { useState, useEffect } from "react";
import { Button, Icon } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import * as Client from "increment";
import { useSubmitRpcTx } from "../debug/hooks/useSubmitRpcTx";
import { useRpcPrepareTx } from "../debug/hooks/useRpcPrepareTx";
import { network } from "../contracts/util";
import { getNetworkHeaders } from "../debug/util/getNetworkHeaders";
import { VictoryAnimation, DefeatAnimation } from "./VictoryAnimation";
import { BattleProgress } from "./BattleProgress";

// Currency pair types matching the contract
export enum CurrencyPair {
  ArsChf = "ArsChf",
  BrlEur = "BrlEur", 
  MxnXau = "MxnXau",
}

// Currency pair metadata
const currencyPairData = {
  [CurrencyPair.ArsChf]: {
    name: "ARS vs CHF",
    description: "Argentine Peso battles Swiss Franc",
    currency1: { symbol: "ARS", name: "Argentine Peso", flag: "🇦🇷" },
    currency2: { symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    color: "#74C2E1",
  },
  [CurrencyPair.BrlEur]: {
    name: "BRL vs EUR", 
    description: "Brazilian Real battles Euro",
    currency1: { symbol: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
    currency2: { symbol: "EUR", name: "Euro", flag: "🇪🇺" },
    color: "#FFD23F",
  },
  [CurrencyPair.MxnXau]: {
    name: "MXN vs XAU",
    description: "Mexican Peso battles Gold",
    currency1: { symbol: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
    currency2: { symbol: "XAU", name: "Gold", flag: "🥇" },
    color: "#FF6B9D",
  },
};

interface BattleState {
  pair: CurrencyPair;
  chosenCurrency: number;
  amount: string;
  startTime?: number;
  isActive: boolean;
  timeRemaining?: number;
}

export const CurrencyBattle: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const [selectedPair, setSelectedPair] = useState<CurrencyPair | null>(null);
  const [currentBattle, setCurrentBattle] = useState<BattleState | null>(null);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [chosenCurrency, setChosenCurrency] = useState<number>(0);
  const [currentPrices, setCurrentPrices] = useState<{[key in CurrencyPair]?: [number, number]}>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);
  const [battleResult, setBattleResult] = useState<{winner: string; amount: string} | null>(null);
  
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
      loadBattleState();
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

  // Load battle state and prices on mount and when address changes
  useEffect(() => {
    if (address) {
      loadBattleState();
      loadCurrentPrices();
    }
  }, [address]);

  const loadBattleState = async () => {
    if (!address) return;
    
    try {
      const connectedContract = new Client.Client({
        networkPassphrase: network.passphrase,
        contractId: "CDAASIVM6SAJDUVZRT54NM7377WDAT2VMJKW47T7OCAMPS7Q5GC2G5D6",
        rpcUrl: network.rpcUrl,
        publicKey: address,
        allowHttp: true,
      });

      // Check for active battles in each pair
      for (const pair of Object.values(CurrencyPair)) {
        try {
          const battle = await connectedContract.get_user_battle({
            user: address,
            pair: pair,
          });
          
          if (battle) {
            const isReady = await connectedContract.is_battle_ready({
              user: address,
              pair: pair,
            });
            
            setCurrentBattle({
              pair: pair,
              chosenCurrency: battle.chosen_currency,
              amount: battle.amount.toString(),
              startTime: Number(battle.start_time),
              isActive: !isReady,
              timeRemaining: isReady ? 0 : Math.max(0, (Number(battle.start_time) + 300) - Math.floor(Date.now() / 1000)),
            });
            setSelectedPair(pair);
            break;
          }
        } catch (err) {
          // No battle for this pair, continue checking
        }
      }
    } catch (err) {
      console.error("Error loading battle state:", err);
    }
  };

  const loadCurrentPrices = async () => {
    if (!address) return;
    
    try {
      const connectedContract = new Client.Client({
        networkPassphrase: network.passphrase,
        contractId: "CDAASIVM6SAJDUVZRT54NM7377WDAT2VMJKW47T7OCAMPS7Q5GC2G5D6",
        rpcUrl: network.rpcUrl,
        publicKey: address,
        allowHttp: true,
      });

      const newPrices: {[key in CurrencyPair]?: [number, number]} = {};
      
      for (const pair of Object.values(CurrencyPair)) {
        try {
          const contractPair = { tag: pair, values: undefined };
          const assembledTx = await connectedContract.get_pair_prices({ pair: contractPair });
          const prices = assembledTx.result;
          if (prices.isOk()) {
            newPrices[pair] = [Number(prices.unwrap()[0]), Number(prices.unwrap()[1])];
          }
        } catch (err) {
          console.error(`Error loading prices for ${pair}:`, err);
        }
      }
      
      setCurrentPrices(newPrices);
    } catch (err) {
      console.error("Error loading prices:", err);
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (currentBattle && currentBattle.isActive && currentBattle.timeRemaining && currentBattle.timeRemaining > 0) {
      const timer = setInterval(() => {
        setCurrentBattle(prev => {
          if (!prev || !prev.timeRemaining) return prev;
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            loadBattleState(); // Reload to check if battle can be settled
            return { ...prev, timeRemaining: 0, isActive: false };
          }
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentBattle]);

  const handleStartBattle = () => {
    if (!address || !signTransaction || !selectedPair) {
      setError("Please connect wallet and select a pair");
      return;
    }

    setIsLoading(true);
    setError(null);

    const connectedContract = new Client.Client({
      networkPassphrase: network.passphrase,
      contractId: "CDAASIVM6SAJDUVZRT54NM7377WDAT2VMJKW47T7OCAMPS7Q5GC2G5D6",
      rpcUrl: network.rpcUrl,
      publicKey: address,
      allowHttp: true,
    });

    void connectedContract
      .start_battle(
        {
          user: address,
          pair: { tag: selectedPair, values: undefined },
          chosen_currency: chosenCurrency,
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
        console.error("Start battle failed:", err);
        setError("Failed to start battle");
        setIsLoading(false);
      });
  };

  const handleSettleBattle = () => {
    if (!address || !signTransaction || !currentBattle) {
      setError("No active battle to settle");
      return;
    }

    setIsLoading(true);
    setError(null);

    const connectedContract = new Client.Client({
      networkPassphrase: network.passphrase,
      contractId: "CDAASIVM6SAJDUVZRT54NM7377WDAT2VMJKW47T7OCAMPS7Q5GC2G5D6",
      rpcUrl: network.rpcUrl,
      publicKey: address,
      allowHttp: true,
    });

    void connectedContract
      .settle_battle(
        {
          user: address,
          pair: { tag: currentBattle.pair, values: undefined },
        },
        {
          simulate: true,
        },
      )
      .then((result) => {
        // Simulate battle result for demo (in real implementation, this would come from the contract)
        const won = Math.random() > 0.5; // 50% chance to win for demo
        const chosenCurrencyData = currentBattle.chosenCurrency === 0 
          ? currencyPairData[currentBattle.pair].currency1
          : currencyPairData[currentBattle.pair].currency2;
        
        if (won) {
          const winnings = (parseFloat(currentBattle.amount) * 1.8).toString();
          setBattleResult({
            winner: chosenCurrencyData.symbol,
            amount: winnings,
          });
          setShowVictory(true);
        } else {
          const opponentCurrency = currentBattle.chosenCurrency === 0 
            ? currencyPairData[currentBattle.pair].currency2
            : currencyPairData[currentBattle.pair].currency1;
          setBattleResult({
            winner: opponentCurrency.symbol,
            amount: "0",
          });
          setShowDefeat(true);
        }

        prepareTx({
          rpcUrl: network.rpcUrl,
          transactionXdr: result.toXDR(),
          networkPassphrase: network.passphrase,
          headers: getNetworkHeaders(network, "rpc"),
        });
      })
      .catch((err) => {
        console.error("Settle battle failed:", err);
        setError("Failed to settle battle");
        setIsLoading(false);
      });
  };

  const handleAnimationComplete = () => {
    setShowVictory(false);
    setShowDefeat(false);
    setBattleResult(null);
    setCurrentBattle(null);
    setSelectedPair(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100000000000000).toFixed(6)}`;
  };

  if (!address) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>🏟️ Currency Clash Arena</h2>
        <p>Connect your wallet to start battling currencies!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", margin: "0 0 0.5rem 0" }}>
          🏟️ Currency Clash Arena
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
          Choose your champion currency and battle for 5 minutes!
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

      {currentBattle ? (
        <div
          style={{
            border: "2px solid " + currencyPairData[currentBattle.pair].color,
            borderRadius: "1rem",
            padding: "2rem",
            backgroundColor: "#f8f9fa",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", color: currencyPairData[currentBattle.pair].color }}>
            ⚔️ Battle in Progress!
          </h2>
          
          <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            {currencyPairData[currentBattle.pair].name}
          </div>
          
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                borderRadius: "0.5rem",
                backgroundColor: currentBattle.chosenCurrency === 0 ? currencyPairData[currentBattle.pair].color : "#e9ecef",
                color: currentBattle.chosenCurrency === 0 ? "white" : "black",
              }}
            >
              {currencyPairData[currentBattle.pair].currency1.flag} {currencyPairData[currentBattle.pair].currency1.symbol}
            </div>
            
            <div style={{ fontSize: "2rem" }}>VS</div>
            
            <div
              style={{
                padding: "1rem",
                borderRadius: "0.5rem",
                backgroundColor: currentBattle.chosenCurrency === 1 ? currencyPairData[currentBattle.pair].color : "#e9ecef",
                color: currentBattle.chosenCurrency === 1 ? "white" : "black",
              }}
            >
              {currencyPairData[currentBattle.pair].currency2.flag} {currencyPairData[currentBattle.pair].currency2.symbol}
            </div>
          </div>
          
          <div style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
            Your bet: {currentBattle.amount} tokens
          </div>
          
          {currentBattle.isActive && currentBattle.timeRemaining && currentBattle.timeRemaining > 0 ? (
            <BattleProgress
              timeRemaining={currentBattle.timeRemaining}
              totalTime={300}
              currency1={currencyPairData[currentBattle.pair].currency1}
              currency2={currencyPairData[currentBattle.pair].currency2}
              chosenCurrency={currentBattle.chosenCurrency}
              pairColor={currencyPairData[currentBattle.pair].color}
            />
          ) : (
            <div>
              <div style={{ fontSize: "2rem", marginBottom: "1rem", color: "green" }}>
                ⏰ Battle Complete!
              </div>
              <Button
                size="lg"
                variant="primary"
                onClick={handleSettleBattle}
                disabled={isLoading || isPrepareTxPending || isSubmitRpcPending}
                style={{
                  backgroundColor: "green",
                  borderColor: "green",
                  fontSize: "1.2rem",
                  padding: "1rem 2rem",
                }}
              >
                {isLoading || isPrepareTxPending || isSubmitRpcPending
                  ? "Settling..."
                  : "🏆 Settle Battle"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {!selectedPair ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: "2rem",
                marginBottom: "2rem",
              }}
            >
              {Object.entries(currencyPairData).map(([pair, data]) => (
                <div
                  key={pair}
                  onClick={() => setSelectedPair(pair as CurrencyPair)}
                  style={{
                    border: "2px solid " + data.color,
                    borderRadius: "1rem",
                    padding: "2rem",
                    cursor: "pointer",
                    textAlign: "center",
                    backgroundColor: "white",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  <h3 style={{ margin: "0 0 1rem 0", color: data.color }}>
                    {data.name}
                  </h3>
                  <p style={{ margin: "0 0 1.5rem 0", color: "#666" }}>
                    {data.description}
                  </p>
                  
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ fontSize: "2rem" }}>
                      {data.currency1.flag} {data.currency1.symbol}
                    </div>
                    <div style={{ fontSize: "1.5rem", color: data.color }}>VS</div>
                    <div style={{ fontSize: "2rem" }}>
                      {data.currency2.flag} {data.currency2.symbol}
                    </div>
                  </div>
                  
                  {currentPrices[pair as CurrencyPair] && (
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      Current prices: {formatPrice(currentPrices[pair as CurrencyPair]![0])} | {formatPrice(currentPrices[pair as CurrencyPair]![1])}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                border: "2px solid " + currencyPairData[selectedPair].color,
                borderRadius: "1rem",
                padding: "2rem",
                backgroundColor: "white",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h2 style={{ margin: "0 0 1rem 0", color: currencyPairData[selectedPair].color }}>
                  {currencyPairData[selectedPair].name}
                </h2>
                <p style={{ margin: 0, color: "#666" }}>
                  {currencyPairData[selectedPair].description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "2rem",
                  justifyContent: "center",
                }}
              >
                <div
                  onClick={() => setChosenCurrency(0)}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "1rem",
                    border: "2px solid",
                    borderColor: chosenCurrency === 0 ? currencyPairData[selectedPair].color : "#ddd",
                    backgroundColor: chosenCurrency === 0 ? currencyPairData[selectedPair].color : "white",
                    color: chosenCurrency === 0 ? "white" : "black",
                    cursor: "pointer",
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    {currencyPairData[selectedPair].currency1.flag}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {currencyPairData[selectedPair].currency1.symbol}
                  </div>
                  <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                    {currencyPairData[selectedPair].currency1.name}
                  </div>
                </div>

                <div
                  onClick={() => setChosenCurrency(1)}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "1rem",
                    border: "2px solid",
                    borderColor: chosenCurrency === 1 ? currencyPairData[selectedPair].color : "#ddd",
                    backgroundColor: chosenCurrency === 1 ? currencyPairData[selectedPair].color : "white",
                    color: chosenCurrency === 1 ? "white" : "black",
                    cursor: "pointer",
                    textAlign: "center",
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    {currencyPairData[selectedPair].currency2.flag}
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {currencyPairData[selectedPair].currency2.symbol}
                  </div>
                  <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                    {currencyPairData[selectedPair].currency2.name}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "2rem",
                  justifyContent: "center",
                }}
              >
                <label style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                  Bet Amount:
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="1"
                  max="1000"
                  style={{
                    padding: "0.8rem",
                    fontSize: "1.1rem",
                    border: "2px solid #ddd",
                    borderRadius: "0.5rem",
                    width: "150px",
                    textAlign: "center",
                  }}
                />
                <span style={{ fontSize: "1.1rem", color: "#666" }}>tokens</span>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => setSelectedPair(null)}
                  disabled={isLoading || isPrepareTxPending || isSubmitRpcPending}
                >
                  ← Back to Pairs
                </Button>

                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleStartBattle}
                  disabled={
                    isLoading ||
                    isPrepareTxPending ||
                    isSubmitRpcPending ||
                    !betAmount ||
                    Number(betAmount) <= 0
                  }
                  style={{
                    backgroundColor: currencyPairData[selectedPair].color,
                    borderColor: currencyPairData[selectedPair].color,
                    fontSize: "1.2rem",
                    padding: "1rem 2rem",
                  }}
                >
                  {isLoading || isPrepareTxPending || isSubmitRpcPending
                    ? "Starting..."
                    : "🚀 Start Battle!"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Victory/Defeat Animations */}
      {battleResult && (
        <>
          <VictoryAnimation
            isVisible={showVictory}
            winner={battleResult.winner}
            amount={battleResult.amount}
            onComplete={handleAnimationComplete}
          />
          <DefeatAnimation
            isVisible={showDefeat}
            winner={battleResult.winner}
            onComplete={handleAnimationComplete}
          />
        </>
      )}
    </div>
  );
};