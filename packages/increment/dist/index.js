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
        contractId: "CC26NFIAZQEXW3KHUXGGK2PUMQ4JRUSQD4NLVBTWBRTYYAATZ4PDDVFC",
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
            "AAAAAQAAAAAAAAAAAAAAC1BhcnRpY2lwYW50AAAAAAMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAPY2hvc2VuX2N1cnJlbmN5AAAAAAQAAAAAAAAABHVzZXIAAAAT",
            "AAAAAQAAAAAAAAAAAAAABkJhdHRsZQAAAAAABgAAAAAAAAAKaXNfc2V0dGxlZAAAAAAAAQAAAAAAAAAEcGFpcgAAB9AAAAAMQ3VycmVuY3lQYWlyAAAAAAAAAAxwYXJ0aWNpcGFudHMAAAPqAAAH0AAAAAtQYXJ0aWNpcGFudAAAAAAAAAAADXN0YXJ0X3ByaWNlXzEAAAAAAAALAAAAAAAAAA1zdGFydF9wcmljZV8yAAAAAAAACwAAAAAAAAAKc3RhcnRfdGltZQAAAAAABg==",
            "AAAAAAAAAAAAAAAWZmV0Y2hfbGFzdF9maXZlX3ByaWNlcwAAAAAAAQAAAAAAAAAGdGlja2VyAAAAAAARAAAAAQAAA+kAAAPqAAAACwAAAAM=",
            "AAAAAAAAAAAAAAAMc3RhcnRfYmF0dGxlAAAABAAAAAAAAAAEdXNlcgAAABMAAAAAAAAABHBhaXIAAAfQAAAADEN1cnJlbmN5UGFpcgAAAAAAAAAPY2hvc2VuX2N1cnJlbmN5AAAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAAAQAAAAM=",
            "AAAAAAAAAAAAAAANc2V0dGxlX2JhdHRsZQAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAARwYWlyAAAH0AAAAAxDdXJyZW5jeVBhaXIAAAABAAAD6QAAAAEAAAAD",
            "AAAAAAAAAAAAAAAKZ2V0X2JhdHRsZQAAAAAAAQAAAAAAAAAEcGFpcgAAB9AAAAAMQ3VycmVuY3lQYWlyAAAAAQAAA+gAAAfQAAAABkJhdHRsZQAA",
            "AAAAAAAAAAAAAAARaXNfdXNlcl9pbl9iYXR0bGUAAAAAAAACAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAEcGFpcgAAB9AAAAAMQ3VycmVuY3lQYWlyAAAAAQAAAAE=",
            "AAAAAAAAAAAAAAAPZ2V0X3BhaXJfcHJpY2VzAAAAAAEAAAAAAAAABHBhaXIAAAfQAAAADEN1cnJlbmN5UGFpcgAAAAEAAAPpAAAD7QAAAAIAAAALAAAACwAAAAM=",
            "AAAAAAAAAAAAAAAPaXNfYmF0dGxlX3JlYWR5AAAAAAEAAAAAAAAABHBhaXIAAAfQAAAADEN1cnJlbmN5UGFpcgAAAAEAAAAB",
            "AAAAAAAAAAAAAAATZ2V0X2F2YWlsYWJsZV9wYWlycwAAAAAAAAAAAQAAA+oAAAfQAAAADEN1cnJlbmN5UGFpcg==",
            "AAAAAAAAAAAAAAAFaGVsbG8AAAAAAAABAAAAAAAAAAJ0bwAAAAAAEAAAAAEAAAPqAAAAEA=="]), options);
        this.options = options;
    }
    fromJSON = {
        fetch_last_five_prices: (this.txFromJSON),
        start_battle: (this.txFromJSON),
        settle_battle: (this.txFromJSON),
        get_battle: (this.txFromJSON),
        is_user_in_battle: (this.txFromJSON),
        get_pair_prices: (this.txFromJSON),
        is_battle_ready: (this.txFromJSON),
        get_available_pairs: (this.txFromJSON),
        hello: (this.txFromJSON)
    };
}
