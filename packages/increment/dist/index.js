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
    contractId: "CAO63URIW64YD4BXBNHFUWNI23FXP4HC46RROOG35RTKUCHCATVNEMN7",
  },
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
        "AAAAAAAAAEBJbmNyZW1lbnQgaW5jcmVtZW50cyBhbiBpbnRlcm5hbCBjb3VudGVyLCBhbmQgcmV0dXJucyB0aGUgdmFsdWUuAAAACWluY3JlbWVudAAAAAAAAAAAAAABAAAABA==",
        "AAAAAAAAAAAAAAANZ2V0X2luY3JlbWVudAAAAAAAAAAAAAABAAAABA==",
      ]),
      options,
    );
    this.options = options;
  }
  fromJSON = {
    increment: this.txFromJSON,
    get_increment: this.txFromJSON,
  };
}
