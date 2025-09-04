import { Buffer } from "buffer";
import {
  Client as ContractClient,
  Spec as ContractSpec,
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
    contractId: "CADRDYOAZCYHF42BGXBMYZMSNG5JK2W3ME7LMINOXCD5OIDLTNHRLP43",
  },
};
export const Errors = {
  1: { message: "NoPrice" },
  2: { message: "LowBalance" },
  3: { message: "Broke" },
  4: { message: "NoGuesses" },
  5: { message: "TimeNotPassed" },
  6: { message: "WrongAnswer" },
};
export class Client extends ContractClient {
  options;
  static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options,
  ) {
    return ContractClient.deploy(null, options);
  }
  constructor(options) {
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
    this.options = options;
  }
  fromJSON = {
    make_guess: this.txFromJSON,
    verify_guess: this.txFromJSON,
    get_user_guesses: this.txFromJSON,
    get_user_guess_count: this.txFromJSON,
    hello: this.txFromJSON,
  };
}
