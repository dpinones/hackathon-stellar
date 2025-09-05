import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    standalone: {
        networkPassphrase: "Standalone Network ; February 2017",
        contractId: "CDAASIVM6SAJDUVZRT54NM7377WDAT2VMJKW47T7OCAMPS7Q5GC2G5D6",
    }
};
export const Errors = {
    1: { message: "NoPrice" },
    2: { message: "LowBalance" },
    3: { message: "Broke" },
    4: { message: "NoBattle" },
    5: { message: "TimeNotPassed" },
    6: { message: "InvalidPair" },
    7: { message: "BattleAlreadyExists" },
    8: { message: "TooClose" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAAHTm9QcmljZQAAAAABAAAAAAAAAApMb3dCYWxhbmNlAAAAAAACAAAAAAAAAAVCcm9rZQAAAAAAAAMAAAAAAAAACE5vQmF0dGxlAAAABAAAAAAAAAANVGltZU5vdFBhc3NlZAAAAAAAAAUAAAAAAAAAC0ludmFsaWRQYWlyAAAAAAYAAAAAAAAAE0JhdHRsZUFscmVhZHlFeGlzdHMAAAAABwAAAAAAAAAIVG9vQ2xvc2UAAAAI",
            "AAAAAgAAAAAAAAAAAAAADEN1cnJlbmN5UGFpcgAAAAMAAAAAAAAAAAAAAAZBcnNDaGYAAAAAAAAAAAAAAAAABkJybEV1cgAAAAAAAAAAAAAAAAAGTXhuWGF1AAA=",
            "AAAAAQAAAAAAAAAAAAAABkJhdHRsZQAAAAAABwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAA9jaG9zZW5fY3VycmVuY3kAAAAABAAAAAAAAAAEcGFpcgAAB9AAAAAMQ3VycmVuY3lQYWlyAAAAAAAAAA1zdGFydF9wcmljZV8xAAAAAAAACwAAAAAAAAANc3RhcnRfcHJpY2VfMgAAAAAAAAsAAAAAAAAACnN0YXJ0X3RpbWUAAAAAAAYAAAAAAAAABHVzZXIAAAAT",
            "AAAAAAAAAAAAAAAMc3RhcnRfYmF0dGxlAAAABAAAAAAAAAAEdXNlcgAAABMAAAAAAAAABHBhaXIAAAfQAAAADEN1cnJlbmN5UGFpcgAAAAAAAAAPY2hvc2VuX2N1cnJlbmN5AAAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAAAQAAAAM=",
            "AAAAAAAAAAAAAAANc2V0dGxlX2JhdHRsZQAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAARwYWlyAAAH0AAAAAxDdXJyZW5jeVBhaXIAAAABAAAD6QAAAAEAAAAD",
            "AAAAAAAAAAAAAAAPZ2V0X3VzZXJfYmF0dGxlAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAARwYWlyAAAH0AAAAAxDdXJyZW5jeVBhaXIAAAABAAAD6AAAB9AAAAAGQmF0dGxlAAA=",
            "AAAAAAAAAAAAAAAPZ2V0X3BhaXJfcHJpY2VzAAAAAAEAAAAAAAAABHBhaXIAAAfQAAAADEN1cnJlbmN5UGFpcgAAAAEAAAPpAAAD7QAAAAIAAAALAAAACwAAAAM=",
            "AAAAAAAAAAAAAAAPaXNfYmF0dGxlX3JlYWR5AAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAARwYWlyAAAH0AAAAAxDdXJyZW5jeVBhaXIAAAABAAAAAQ==",
            "AAAAAAAAAAAAAAATZ2V0X2F2YWlsYWJsZV9wYWlycwAAAAAAAAAAAQAAA+oAAAfQAAAADEN1cnJlbmN5UGFpcg==",
            "AAAAAAAAAAAAAAAFaGVsbG8AAAAAAAABAAAAAAAAAAJ0bwAAAAAAEAAAAAEAAAPqAAAAEA=="]), options);
        this.options = options;
    }
    fromJSON = {
        start_battle: (this.txFromJSON),
        settle_battle: (this.txFromJSON),
        get_user_battle: (this.txFromJSON),
        get_pair_prices: (this.txFromJSON),
        is_battle_ready: (this.txFromJSON),
        get_available_pairs: (this.txFromJSON),
        hello: (this.txFromJSON)
    };
}
