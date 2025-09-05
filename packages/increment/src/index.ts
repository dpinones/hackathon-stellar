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
    contractId: "CDZYNPNLCGWC77QL74MQIFMSWNF6KXZNW3UEONC45VGSPZZ5MNT55UR2",
  }
} as const

export const Errors = {
  1: {message:"NoPrice"},
  2: {message:"LowBalance"},
  3: {message:"Broke"},
  4: {message:"NoBattle"},
  5: {message:"TimeNotPassed"},
  6: {message:"InvalidPair"},
  7: {message:"BattleAlreadyExists"},
  8: {message:"TooClose"}
}

export type CurrencyPair = {tag: "ArsChf", values: void} | {tag: "BrlEur", values: void} | {tag: "MxnXau", values: void};


export interface Battle {
  amount: i128;
  chosen_currency: u32;
  pair: CurrencyPair;
  start_price_1: i128;
  start_price_2: i128;
  start_time: u64;
  user: string;
}

export interface Client {
  /**
   * Construct and simulate a start_battle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  start_battle: ({user, pair, chosen_currency, amount}: {user: string, pair: CurrencyPair, chosen_currency: u32, amount: i128}, options?: {
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
  }) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a settle_battle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  settle_battle: ({user, pair}: {user: string, pair: CurrencyPair}, options?: {
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
  }) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a get_user_battle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_battle: ({user, pair}: {user: string, pair: CurrencyPair}, options?: {
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
  }) => Promise<AssembledTransaction<Option<Battle>>>

  /**
   * Construct and simulate a get_pair_prices transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pair_prices: ({pair}: {pair: CurrencyPair}, options?: {
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
  }) => Promise<AssembledTransaction<Result<readonly [i128, i128]>>>

  /**
   * Construct and simulate a is_battle_ready transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_battle_ready: ({user, pair}: {user: string, pair: CurrencyPair}, options?: {
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
   * Construct and simulate a get_available_pairs transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_available_pairs: (options?: {
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
  }) => Promise<AssembledTransaction<Array<CurrencyPair>>>

  /**
   * Construct and simulate a hello transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  hello: ({to}: {to: string}, options?: {
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
  }) => Promise<AssembledTransaction<Array<string>>>

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
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAAHTm9QcmljZQAAAAABAAAAAAAAAApMb3dCYWxhbmNlAAAAAAACAAAAAAAAAAVCcm9rZQAAAAAAAAMAAAAAAAAACE5vQmF0dGxlAAAABAAAAAAAAAANVGltZU5vdFBhc3NlZAAAAAAAAAUAAAAAAAAAC0ludmFsaWRQYWlyAAAAAAYAAAAAAAAAE0JhdHRsZUFscmVhZHlFeGlzdHMAAAAABwAAAAAAAAAIVG9vQ2xvc2UAAAAI",
        "AAAAAgAAAAAAAAAAAAAADEN1cnJlbmN5UGFpcgAAAAMAAAAAAAAAAAAAAAZBcnNDaGYAAAAAAAAAAAAAAAAABkJybEV1cgAAAAAAAAAAAAAAAAAGTXhuWGF1AAA=",
        "AAAAAQAAAAAAAAAAAAAABkJhdHRsZQAAAAAABwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAA9jaG9zZW5fY3VycmVuY3kAAAAABAAAAAAAAAAEcGFpcgAAB9AAAAAMQ3VycmVuY3lQYWlyAAAAAAAAAA1zdGFydF9wcmljZV8xAAAAAAAACwAAAAAAAAANc3RhcnRfcHJpY2VfMgAAAAAAAAsAAAAAAAAACnN0YXJ0X3RpbWUAAAAAAAYAAAAAAAAABHVzZXIAAAAT",
        "AAAAAAAAAAAAAAAMc3RhcnRfYmF0dGxlAAAABAAAAAAAAAAEdXNlcgAAABMAAAAAAAAABHBhaXIAAAfQAAAADEN1cnJlbmN5UGFpcgAAAAAAAAAPY2hvc2VuX2N1cnJlbmN5AAAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAAAQAAAAM=",
        "AAAAAAAAAAAAAAANc2V0dGxlX2JhdHRsZQAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAARwYWlyAAAH0AAAAAxDdXJyZW5jeVBhaXIAAAABAAAD6QAAAAEAAAAD",
        "AAAAAAAAAAAAAAAPZ2V0X3VzZXJfYmF0dGxlAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAARwYWlyAAAH0AAAAAxDdXJyZW5jeVBhaXIAAAABAAAD6AAAB9AAAAAGQmF0dGxlAAA=",
        "AAAAAAAAAAAAAAAPZ2V0X3BhaXJfcHJpY2VzAAAAAAEAAAAAAAAABHBhaXIAAAfQAAAADEN1cnJlbmN5UGFpcgAAAAEAAAPpAAAD7QAAAAIAAAALAAAACwAAAAM=",
        "AAAAAAAAAAAAAAAPaXNfYmF0dGxlX3JlYWR5AAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAARwYWlyAAAH0AAAAAxDdXJyZW5jeVBhaXIAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAATZ2V0X2F2YWlsYWJsZV9wYWlycwAAAAAAAAAAAQAAA+oAAAfQAAAADEN1cnJlbmN5UGFpcg==",
        "AAAAAAAAAAAAAAAFaGVsbG8AAAAAAAABAAAAAAAAAAJ0bwAAAAAAEAAAAAEAAAPqAAAAEA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    start_battle: this.txFromJSON<Result<boolean>>,
        settle_battle: this.txFromJSON<Result<boolean>>,
        get_user_battle: this.txFromJSON<Option<Battle>>,
        get_pair_prices: this.txFromJSON<Result<readonly [i128, i128]>>,
        is_battle_ready: this.txFromJSON<boolean>,
        get_available_pairs: this.txFromJSON<Array<CurrencyPair>>,
        hello: this.txFromJSON<Array<string>>
  }
}