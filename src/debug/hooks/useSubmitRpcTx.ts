/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { useMutation } from "@tanstack/react-query";
import { rpc as StellarRpc, TransactionBuilder } from "@stellar/stellar-sdk";
import { delay } from "../util/delay";
import { isEmptyObject } from "../util/isEmptyObject";
import {
  NetworkHeaders,
  SubmitRpcError,
  SubmitRpcResponse,
} from "../types/types";

type SubmitRpcTxProps = {
  rpcUrl: string;
  transactionXdr: string;
  networkPassphrase: string;
  headers: NetworkHeaders;
};

export const useSubmitRpcTx = () => {
  const mutation = useMutation<
    SubmitRpcResponse,
    SubmitRpcError,
    SubmitRpcTxProps
  >({
    mutationFn: async ({
      rpcUrl,
      transactionXdr,
      networkPassphrase,
      headers,
    }: SubmitRpcTxProps) => {
      console.log("🌐 [SUBMIT RPC] Starting submission:", {
        rpcUrl,
        networkPassphrase,
        headers,
        xdrLength: transactionXdr?.length,
      });
      try {
        const transaction = TransactionBuilder.fromXDR(
          transactionXdr,
          networkPassphrase,
        );
        console.log("📦 [SUBMIT RPC] Transaction parsed:", transaction);

        const rpcServer = new StellarRpc.Server(rpcUrl, {
          headers: isEmptyObject(headers) ? undefined : { ...headers },
          allowHttp: new URL(rpcUrl).hostname === "localhost",
        });
        console.log("🌐 [SUBMIT RPC] Created RPC server");

        const sentTx = await rpcServer.sendTransaction(transaction);
        console.log("📤 [SUBMIT RPC] Transaction sent:", sentTx);

        if (sentTx.status !== "PENDING") {
          console.log(
            "❌ [SUBMIT RPC] Transaction not pending:",
            sentTx.status,
          );
          throw { status: sentTx.status, result: sentTx };
        }

        let txResponse;
        const MAX_ATTEMPTS = 10;
        let attempts = 0;

        while (attempts++ < MAX_ATTEMPTS && txResponse?.status !== "SUCCESS") {
          console.log(
            `⏳ [SUBMIT RPC] Polling attempt ${attempts}/${MAX_ATTEMPTS}`,
          );
          txResponse = await rpcServer.getTransaction(sentTx.hash);
          console.log(`📊 [SUBMIT RPC] Poll result:`, txResponse?.status);

          switch (txResponse.status) {
            case "FAILED":
              console.log("❌ [SUBMIT RPC] Transaction failed:", txResponse);
              throw { status: "FAILED", result: txResponse };
            case "NOT_FOUND":
              await delay(1000);
              continue;
            case "SUCCESS":
              console.log("✅ [SUBMIT RPC] Transaction succeeded!");
              break;
            default:
            // Do nothing
          }
        }

        if (attempts >= MAX_ATTEMPTS || txResponse?.status !== "SUCCESS") {
          console.log("⏰ [SUBMIT RPC] Transaction timed out");
          throw { status: "TIMEOUT", result: txResponse };
        }

        const submittedTx = TransactionBuilder.fromXDR(
          txResponse.envelopeXdr,
          networkPassphrase,
        );
        // TS doesn't recognize operations property even though it is there
        const operations = submittedTx?.operations || [];

        const finalResult = {
          hash: sentTx.hash,
          result: txResponse,
          operationCount: operations.length,
          fee: submittedTx.fee,
        };
        console.log("🎉 [SUBMIT RPC] Final success result:", finalResult);
        return finalResult;
      } catch (e) {
        console.log("💥 [SUBMIT RPC] Error caught:", e);
        throw {
          status: "ERROR",
          result: {
            status: "ERROR",
            latestLedger: "",
            latestLedgerCloseTime: "",
            errorResult: e,
          },
        };
      }
    },
  });

  return mutation;
};
