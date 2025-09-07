import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  standalone: {
    networkPassphrase: "Standalone Network ; February 2017",
    contractId: "CBOR3RRXFRXAYJH5B4JQC6BZTVJDRVXO2XHU4NCMQMG66M6GQUT4AJHM",
  }
} as const

export const Errors = {
  1: {message:"NoPrice"},
  2: {message:"LowBalance"},
  3: {message:"InsufficientFunds"},
  4: {message:"NoActiveRound"},
  5: {message:"RoundNotSettled"},
  6: {message:"RoundAlreadySettled"},
  7: {message:"BettingClosed"},
  8: {message:"InvalidPrediction"},
  9: {message:"NoWinnings"},
  10: {message:"OracleTimeout"}
}

export type Prediction = {tag: "Up", values: void} | {tag: "Down", values: void} | {tag: "Stable", values: void};


export interface Bet {
  amount: i128;
  prediction: Prediction;
  user: string;
}


export interface Round {
  bets: Array<Bet>;
  down_pool: i128;
  end_price: Option<i128>;
  is_settled: boolean;
  round_number: u32;
  stable_pool: i128;
  start_price: i128;
  start_time: u64;
  total_pool: i128;
  up_pool: i128;
  winning_prediction: Option<Prediction>;
}

export type DataKey = {tag: "CurrentRound", values: void} | {tag: "Round", values: readonly [u32]} | {tag: "UserWinnings", values: readonly [string]} | {tag: "LastSettleTime", values: void} | {tag: "RoundCounter", values: void};

export interface Client {
  /**
   * Construct and simulate a place_bet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  place_bet: ({user, prediction, amount}: {user: string, prediction: Prediction, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a claim_winnings transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_winnings: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a get_current_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_current_round: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<Round>>>

  /**
   * Construct and simulate a get_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_round: ({round_number}: {round_number: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<Round>>>

  /**
   * Construct and simulate a get_current_round_number transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_current_round_number: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_total_rounds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_total_rounds: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_completed_rounds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_completed_rounds: ({limit}: {limit: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<u32>>>

  /**
   * Construct and simulate a get_user_winnings transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_winnings: ({user}: {user: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_round_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_round_stats: ({round_number}: {round_number: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<readonly [i128, i128, i128, i128]>>>

  /**
   * Construct and simulate a get_current_ars_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_current_ars_price: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a fetch_last_five_ars_prices transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  fetch_last_five_ars_prices: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<Array<i128>>>>

  /**
   * Construct and simulate a is_betting_open transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_betting_open: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a is_round_ready_to_settle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_round_ready_to_settle: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACgAAAAAAAAAHTm9QcmljZQAAAAABAAAAAAAAAApMb3dCYWxhbmNlAAAAAAACAAAAAAAAABFJbnN1ZmZpY2llbnRGdW5kcwAAAAAAAAMAAAAAAAAADU5vQWN0aXZlUm91bmQAAAAAAAAEAAAAAAAAAA9Sb3VuZE5vdFNldHRsZWQAAAAABQAAAAAAAAATUm91bmRBbHJlYWR5U2V0dGxlZAAAAAAGAAAAAAAAAA1CZXR0aW5nQ2xvc2VkAAAAAAAABwAAAAAAAAARSW52YWxpZFByZWRpY3Rpb24AAAAAAAAIAAAAAAAAAApOb1dpbm5pbmdzAAAAAAAJAAAAAAAAAA1PcmFjbGVUaW1lb3V0AAAAAAAACg==",
        "AAAAAgAAAAAAAAAAAAAAClByZWRpY3Rpb24AAAAAAAMAAAAAAAAAAAAAAAJVcAAAAAAAAAAAAAAAAAAERG93bgAAAAAAAAAAAAAABlN0YWJsZQAA",
        "AAAAAQAAAAAAAAAAAAAAA0JldAAAAAADAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACnByZWRpY3Rpb24AAAAAB9AAAAAKUHJlZGljdGlvbgAAAAAAAAAAAAR1c2VyAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAABVJvdW5kAAAAAAAACwAAAAAAAAAEYmV0cwAAA+oAAAfQAAAAA0JldAAAAAAAAAAACWRvd25fcG9vbAAAAAAAAAsAAAAAAAAACWVuZF9wcmljZQAAAAAAA+gAAAALAAAAAAAAAAppc19zZXR0bGVkAAAAAAABAAAAAAAAAAxyb3VuZF9udW1iZXIAAAAEAAAAAAAAAAtzdGFibGVfcG9vbAAAAAALAAAAAAAAAAtzdGFydF9wcmljZQAAAAALAAAAAAAAAApzdGFydF90aW1lAAAAAAAGAAAAAAAAAAp0b3RhbF9wb29sAAAAAAALAAAAAAAAAAd1cF9wb29sAAAAAAsAAAAAAAAAEndpbm5pbmdfcHJlZGljdGlvbgAAAAAD6AAAB9AAAAAKUHJlZGljdGlvbgAA",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABQAAAAAAAAAAAAAADEN1cnJlbnRSb3VuZAAAAAEAAAAAAAAABVJvdW5kAAAAAAAAAQAAAAQAAAABAAAAAAAAAAxVc2VyV2lubmluZ3MAAAABAAAAEwAAAAAAAAAAAAAADkxhc3RTZXR0bGVUaW1lAAAAAAAAAAAAAAAAAAxSb3VuZENvdW50ZXI=",
        "AAAAAAAAAAAAAAAJcGxhY2VfYmV0AAAAAAAAAwAAAAAAAAAEdXNlcgAAABMAAAAAAAAACnByZWRpY3Rpb24AAAAAB9AAAAAKUHJlZGljdGlvbgAAAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAAAQAAAAD",
        "AAAAAAAAAAAAAAAOY2xhaW1fd2lubmluZ3MAAAAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+kAAAALAAAAAw==",
        "AAAAAAAAAAAAAAARZ2V0X2N1cnJlbnRfcm91bmQAAAAAAAAAAAAAAQAAA+kAAAfQAAAABVJvdW5kAAAAAAAAAw==",
        "AAAAAAAAAAAAAAAJZ2V0X3JvdW5kAAAAAAAAAQAAAAAAAAAMcm91bmRfbnVtYmVyAAAABAAAAAEAAAPoAAAH0AAAAAVSb3VuZAAAAA==",
        "AAAAAAAAAAAAAAAYZ2V0X2N1cnJlbnRfcm91bmRfbnVtYmVyAAAAAAAAAAEAAAAE",
        "AAAAAAAAAAAAAAAQZ2V0X3RvdGFsX3JvdW5kcwAAAAAAAAABAAAABA==",
        "AAAAAAAAAAAAAAAUZ2V0X2NvbXBsZXRlZF9yb3VuZHMAAAABAAAAAAAAAAVsaW1pdAAAAAAAAAQAAAABAAAD6gAAAAQ=",
        "AAAAAAAAAAAAAAARZ2V0X3VzZXJfd2lubmluZ3MAAAAAAAABAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAAL",
        "AAAAAAAAAAAAAAAPZ2V0X3JvdW5kX3N0YXRzAAAAAAEAAAAAAAAADHJvdW5kX251bWJlcgAAAAQAAAABAAAD6AAAA+0AAAAEAAAACwAAAAsAAAALAAAACw==",
        "AAAAAAAAAAAAAAAVZ2V0X2N1cnJlbnRfYXJzX3ByaWNlAAAAAAAAAAAAAAEAAAPpAAAACwAAAAM=",
        "AAAAAAAAAAAAAAAaZmV0Y2hfbGFzdF9maXZlX2Fyc19wcmljZXMAAAAAAAAAAAABAAAD6QAAA+oAAAALAAAAAw==",
        "AAAAAAAAAAAAAAAPaXNfYmV0dGluZ19vcGVuAAAAAAAAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAAYaXNfcm91bmRfcmVhZHlfdG9fc2V0dGxlAAAAAAAAAAEAAAAB" ]),
      options
    )
  }
  public readonly fromJSON = {
    place_bet: this.txFromJSON<Result<u32>>,
        claim_winnings: this.txFromJSON<Result<i128>>,
        get_current_round: this.txFromJSON<Result<Round>>,
        get_round: this.txFromJSON<Option<Round>>,
        get_current_round_number: this.txFromJSON<u32>,
        get_total_rounds: this.txFromJSON<u32>,
        get_completed_rounds: this.txFromJSON<Array<u32>>,
        get_user_winnings: this.txFromJSON<i128>,
        get_round_stats: this.txFromJSON<Option<readonly [i128, i128, i128, i128]>>,
        get_current_ars_price: this.txFromJSON<Result<i128>>,
        fetch_last_five_ars_prices: this.txFromJSON<Result<Array<i128>>>,
        is_betting_open: this.txFromJSON<boolean>,
        is_round_ready_to_settle: this.txFromJSON<boolean>
  }
}