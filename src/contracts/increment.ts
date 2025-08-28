import * as Client from "increment";

// Testnet configuration as per requirements
export default new Client.Client({
  networkPassphrase: "Test SDF Network ; September 2015",
  contractId: "CAA2P2IWRA2P6PQS7PCEK2JUPZI6ERKFBZZM37HSMEOZNPZ2MKKJ7ZPI",
  rpcUrl: "https://soroban-testnet.stellar.org",
  publicKey: undefined,
});
