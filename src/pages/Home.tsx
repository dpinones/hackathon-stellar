import React, { useState, useEffect } from "react";
import { Layout, Button } from "@stellar/design-system";
import { useWallet } from "../hooks/useWallet";
import { connectWallet } from "../util/wallet";
import incrementContract from "../contracts/increment";
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

  const loadCounterValue = async () => {
    try {
      setError(null);
      const result = await incrementContract.get_increment();
      setCounterValue(result.result || 0);
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

      // Create a new contract client with the connected wallet
      const connectedContract = new Client.Client({
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CAA2P2IWRA2P6PQS7PCEK2JUPZI6ERKFBZZM37HSMEOZNPZ2MKKJ7ZPI",
        rpcUrl: "https://soroban-testnet.stellar.org",
        publicKey: address,
      });

      // Step 1: Create and simulate the transaction (same as debugger)
      void connectedContract
        .increment({
          simulate: true,
        })
        .then((tx) => {
          console.log(
            "🚀 [HOME] Transaction created and simulated, now preparing...",
          );

          // Step 2: Prepare the transaction (same as debugger)
          prepareTx({
            rpcUrl: network.rpcUrl,
            transactionXdr: tx.toXDR(),
            networkPassphrase: network.passphrase,
            headers: getNetworkHeaders(network, "rpc"),
          });
        })
        .catch((err) => {
          console.error("Increment failed:", err);
          setError("Increment failed");
          setIsLoading(false);
        });
    }
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
        </div>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Home;
