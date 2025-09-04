import * as Client from "increment";
import { rpcUrl } from "./util";

export default new Client.Client({
  networkPassphrase: "Test SDF Network ; September 2015",
  contractId: "CDGTVQLR363AIFPDJ5ZALFJ7BB7ZN2ODYOBPMEK4UQJOEHI5DOOMTLW6",
  rpcUrl,
  publicKey: undefined,
});
