import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
} from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
  readonly standalone: {
    readonly networkPassphrase: "Standalone Network ; February 2017";
    readonly contractId: "CDGTVQLR363AIFPDJ5ZALFJ7BB7ZN2ODYOBPMEK4UQJOEHI5DOOMTLW6";
  };
};
export declare const Errors: {
  1: {
    message: string;
  };
  2: {
    message: string;
  };
  3: {
    message: string;
  };
  4: {
    message: string;
  };
  5: {
    message: string;
  };
  6: {
    message: string;
  };
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
    }: {
      user: string;
      will_rise: boolean;
      amount: i128;
    },
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
    {
      user,
    }: {
      user: string;
    },
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
    {
      user,
    }: {
      user: string;
    },
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
    {
      user,
    }: {
      user: string;
    },
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
    {
      to,
    }: {
      to: string;
    },
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
export declare class Client extends ContractClient {
  readonly options: ContractClientOptions;
  static deploy<T = Client>(
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
  ): Promise<AssembledTransaction<T>>;
  constructor(options: ContractClientOptions);
  readonly fromJSON: {
    make_guess: (
      json: string,
    ) => AssembledTransaction<
      Result<boolean, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    verify_guess: (
      json: string,
    ) => AssembledTransaction<
      Result<boolean, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    get_user_guesses: (json: string) => AssembledTransaction<Guess[]>;
    get_user_guess_count: (json: string) => AssembledTransaction<number>;
    hello: (json: string) => AssembledTransaction<string[]>;
  };
}
