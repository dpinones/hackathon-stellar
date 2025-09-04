import React, { useState, useEffect } from "react";
import { Layout, Button } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { connectWallet } from "../util/wallet";
import * as Client from "increment";
import { useSubmitRpcTx } from "../debug/hooks/useSubmitRpcTx";
import { useRpcPrepareTx } from "../debug/hooks/useRpcPrepareTx";
import { network } from "../contracts/util";
import { getNetworkHeaders } from "../debug/util/getNetworkHeaders";

const Home: React.FC = () => {
  const { address, signTransaction } = useWallet();
  const [counterValue, setCounterValue] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guessAmount, setGuessAmount] = useState<string>("1");
  const [willRise, setWillRise] = useState<boolean>(true);

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

  useEffect(() => {
    setIsConnected(Boolean(address));
    if (address) {
      void loadCounterValue();
    }
  }, [address]);

  // Handle transaction success
  useEffect(() => {
    if (isSubmitRpcSuccess) {
      void loadCounterValue();
      setIsLoading(false);
      setError(null);
    }
  }, [isSubmitRpcSuccess]);

  // Handle transaction error
  useEffect(() => {
    if (submitRpcError || prepareTxError) {
      console.error("Transaction Error:", { submitRpcError, prepareTxError });
      setError("Increment failed");
      setIsLoading(false);
    }
  }, [submitRpcError, prepareTxError]);

  // Handle prepare transaction success - trigger signing and submission
  useEffect(() => {
    if (prepareTxData && signTransaction && address) {
      console.log("📄 [HOME] Transaction prepared, now signing...");

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

          console.log("✅ [HOME] Transaction signed, submitting...");
          submitRpc({
            rpcUrl: network.rpcUrl,
            transactionXdr: signResult.signedTxXdr,
            networkPassphrase: network.passphrase,
            headers: getNetworkHeaders(network, "rpc"),
          });
        } catch (err) {
          console.error("Error in sign and submit:", err);
          setError("Increment failed");
          setIsLoading(false);
        }
      };

      void signAndSubmit();
    }
  }, [prepareTxData, signTransaction, address, submitRpc]);

  const loadCounterValue = () => {
    try {
      setError(null);
      // For now, just set a placeholder value since get_increment might not exist
      setCounterValue(0);
    } catch (err) {
      console.error("Error loading counter:", err);
      setError("Error loading counter");
      setCounterValue(0);
    }
  };

  const handleButtonClick = () => {
    if (!isConnected) {
      setIsLoading(true);
      setError(null);
      void connectWallet()
        .catch((err) => {
          console.error("Connection failed:", err);
          setError("Connection failed");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      if (!signTransaction) {
        setError("No signing function available");
        return;
      }

      setIsLoading(true);
      setError(null);

      // For now, just connect the wallet without calling any contract method
      setError("Wallet connected!");
      setIsLoading(false);
    }
  };

  const handleMakeGuess = () => {
    if (!address || !signTransaction) {
      setError("Please connect wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    const connectedContract = new Client.Client({
      networkPassphrase: "Standalone Network ; February 2017",
      contractId: "CADRDYOAZCYHF42BGXBMYZMSNG5JK2W3ME7LMINOXCD5OIDLTNHRLP43",
      rpcUrl: "http://localhost:8000/rpc",
      publicKey: address,
    });

    void connectedContract
      .make_guess(
        {
          user: address,
          will_rise: willRise,
          amount: BigInt(guessAmount),
        },
        {
          simulate: true,
        },
      )
      .then((tx) => {
        console.log("🚀 [HOME] Make guess transaction created and simulated");
        prepareTx({
          rpcUrl: network.rpcUrl,
          transactionXdr: tx.toXDR(),
          networkPassphrase: network.passphrase,
          headers: getNetworkHeaders(network, "rpc"),
        });
      })
      .catch((err) => {
        console.error("Make guess failed:", err);
        setError("Make guess failed");
        setIsLoading(false);
      });
  };

  const handleVerifyGuess = () => {
    if (!address || !signTransaction) {
      setError("Please connect wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    const connectedContract = new Client.Client({
      networkPassphrase: "Standalone Network ; February 2017",
      contractId: "CADRDYOAZCYHF42BGXBMYZMSNG5JK2W3ME7LMINOXCD5OIDLTNHRLP43",
      rpcUrl: "http://localhost:8000/rpc",
      publicKey: address,
    });

    void connectedContract
      .verify_guess(
        {
          user: address,
        },
        {
          simulate: true,
        },
      )
      .then((tx) => {
        console.log("🚀 [HOME] Verify guess transaction created and simulated");
        prepareTx({
          rpcUrl: network.rpcUrl,
          transactionXdr: tx.toXDR(),
          networkPassphrase: network.passphrase,
          headers: getNetworkHeaders(network, "rpc"),
        });
      })
      .catch((err) => {
        console.error("Verify guess failed:", err);
        setError("Verify guess failed");
        setIsLoading(false);
      });
  };

  return (
    <Layout.Content>
      <Layout.Inset>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "3rem", margin: 0 }}>Counter DApp</h1>

          <div
            style={{
              fontSize: "4rem",
              fontWeight: "bold",
              padding: "2rem",
              border: "2px solid #ccc",
              borderRadius: "1rem",
              minWidth: "200px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {counterValue !== null ? counterValue : "--"}
          </div>

          {error && (
            <div style={{ color: "red", fontSize: "1.2rem" }}>{error}</div>
          )}

          <Button
            size="lg"
            variant={isConnected ? "primary" : "secondary"}
            onClick={() => void handleButtonClick()}
            disabled={isLoading || isPrepareTxPending || isSubmitRpcPending}
            aria-label={isConnected ? "Increment counter" : "Connect wallet"}
            style={{
              fontSize: "1.5rem",
              padding: "1rem 2rem",
              minWidth: "200px",
              backgroundColor: isConnected ? "#28a745" : "#6c757d",
              borderColor: isConnected ? "#28a745" : "#6c757d",
            }}
          >
            {isLoading || isPrepareTxPending || isSubmitRpcPending
              ? "..."
              : isConnected
                ? "incrementar"
                : "conectate"}
          </Button>

          {isConnected && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                alignItems: "center",
                marginTop: "2rem",
                padding: "2rem",
                border: "1px solid #ddd",
                borderRadius: "1rem",
                backgroundColor: "#f8f9fa",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0" }}>Price Prediction Game</h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <label>Amount:</label>
                  <input
                    type="number"
                    value={guessAmount}
                    onChange={(e) => setGuessAmount(e.target.value)}
                    style={{
                      padding: "0.5rem",
                      fontSize: "1rem",
                      border: "1px solid #ccc",
                      borderRadius: "0.5rem",
                      width: "120px",
                    }}
                  />
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <label>Price will:</label>
                  <select
                    value={willRise ? "rise" : "fall"}
                    onChange={(e) => setWillRise(e.target.value === "rise")}
                    style={{
                      padding: "0.5rem",
                      fontSize: "1rem",
                      border: "1px solid #ccc",
                      borderRadius: "0.5rem",
                    }}
                  >
                    <option value="rise">Rise</option>
                    <option value="fall">Fall</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => void handleMakeGuess()}
                    disabled={
                      isLoading ||
                      isPrepareTxPending ||
                      isSubmitRpcPending ||
                      !guessAmount
                    }
                    style={{
                      backgroundColor: "#007bff",
                      borderColor: "#007bff",
                    }}
                  >
                    Make Guess
                  </Button>

                  <Button
                    size="md"
                    variant="secondary"
                    onClick={() => void handleVerifyGuess()}
                    disabled={
                      isLoading || isPrepareTxPending || isSubmitRpcPending
                    }
                    style={{
                      backgroundColor: "#6c757d",
                      borderColor: "#6c757d",
                    }}
                  >
                    Verify Guess
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Home;
