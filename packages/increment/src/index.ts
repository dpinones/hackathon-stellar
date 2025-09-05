import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
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
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  standalone: {
    networkPassphrase: "Standalone Network ; February 2017",
    contractId: "CDGTVQLR363AIFPDJ5ZALFJ7BB7ZN2ODYOBPMEK4UQJOEHI5DOOMTLW6",
  },
} as const;

export const Errors = {
  1: { message: "NoPrice" },
  2: { message: "LowBalance" },
  3: { message: "Broke" },
  4: { message: "NoGuesses" },
  5: { message: "TimeNotPassed" },
  6: { message: "WrongAnswer" },
};

export interface Guess {
  amount: i128;
  time: u64;
  user: string;
  will_rise: boolean;
}

export interface Client {
  /**
   * Construct and simulate a make_guess transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  make_guess: (
    {
      user,
      will_rise,
      amount,
    }: { user: string; will_rise: boolean; amount: i128 },
    options?: {
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
    },
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a verify_guess transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  verify_guess: (
    { user }: { user: string },
    options?: {
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
    },
  ) => Promise<AssembledTransaction<Result<boolean>>>;

  /**
   * Construct and simulate a get_user_guesses transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_guesses: (
    { user }: { user: string },
    options?: {
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
    },
  ) => Promise<AssembledTransaction<Array<Guess>>>;

  /**
   * Construct and simulate a get_user_guess_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_user_guess_count: (
    { user }: { user: string },
    options?: {
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
    },
  ) => Promise<AssembledTransaction<u32>>;

  /**
   * Construct and simulate a hello transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  hello: (
    { to }: { to: string },
    options?: {
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
    },
  ) => Promise<AssembledTransaction<Array<string>>>;
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
      },
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABgAAAAAAAAAHTm9QcmljZQAAAAABAAAAAAAAAApMb3dCYWxhbmNlAAAAAAACAAAAAAAAAAVCcm9rZQAAAAAAAAMAAAAAAAAACU5vR3Vlc3NlcwAAAAAAAAQAAAAAAAAADVRpbWVOb3RQYXNzZWQAAAAAAAAFAAAAAAAAAAtXcm9uZ0Fuc3dlcgAAAAAG",
        "AAAAAQAAAAAAAAAAAAAABUd1ZXNzAAAAAAAABAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAR0aW1lAAAABgAAAAAAAAAEdXNlcgAAABMAAAAAAAAACXdpbGxfcmlzZQAAAAAAAAE=",
        "AAAAAAAAAAAAAAAKbWFrZV9ndWVzcwAAAAAAAwAAAAAAAAAEdXNlcgAAABMAAAAAAAAACXdpbGxfcmlzZQAAAAAAAAEAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAAAQAAAAM=",
        "AAAAAAAAAAAAAAAMdmVyaWZ5X2d1ZXNzAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6QAAAAEAAAAD",
        "AAAAAAAAAAAAAAAQZ2V0X3VzZXJfZ3Vlc3NlcwAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+oAAAfQAAAABUd1ZXNzAAAA",
        "AAAAAAAAAAAAAAAUZ2V0X3VzZXJfZ3Vlc3NfY291bnQAAAABAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAAE",
        "AAAAAAAAAAAAAAAFaGVsbG8AAAAAAAABAAAAAAAAAAJ0bwAAAAAAEAAAAAEAAAPqAAAAEA==",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    make_guess: this.txFromJSON<Result<boolean>>,
    verify_guess: this.txFromJSON<Result<boolean>>,
    get_user_guesses: this.txFromJSON<Array<Guess>>,
    get_user_guess_count: this.txFromJSON<u32>,
    hello: this.txFromJSON<Array<string>>,
  };
}
