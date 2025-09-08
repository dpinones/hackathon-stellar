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
        contractId: "CC2AJHUB5VJTCPDGOEHV4YDCHHVYY3AN2L5ZM3OI37W5ED72BV3RS7VP",
    }
};
export const Errors = {
    1: { message: "NoPrice" },
    2: { message: "LowBalance" },
    3: { message: "InsufficientFunds" },
    4: { message: "NoActiveRound" },
    5: { message: "RoundNotSettled" },
    6: { message: "RoundAlreadySettled" },
    7: { message: "BettingClosed" },
    8: { message: "InvalidPrediction" },
    9: { message: "NoWinnings" },
    10: { message: "OracleTimeout" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACgAAAAAAAAAHTm9QcmljZQAAAAABAAAAAAAAAApMb3dCYWxhbmNlAAAAAAACAAAAAAAAABFJbnN1ZmZpY2llbnRGdW5kcwAAAAAAAAMAAAAAAAAADU5vQWN0aXZlUm91bmQAAAAAAAAEAAAAAAAAAA9Sb3VuZE5vdFNldHRsZWQAAAAABQAAAAAAAAATUm91bmRBbHJlYWR5U2V0dGxlZAAAAAAGAAAAAAAAAA1CZXR0aW5nQ2xvc2VkAAAAAAAABwAAAAAAAAARSW52YWxpZFByZWRpY3Rpb24AAAAAAAAIAAAAAAAAAApOb1dpbm5pbmdzAAAAAAAJAAAAAAAAAA1PcmFjbGVUaW1lb3V0AAAAAAAACg==",
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
            "AAAAAAAAAAAAAAAYaXNfcm91bmRfcmVhZHlfdG9fc2V0dGxlAAAAAAAAAAEAAAAB"]), options);
        this.options = options;
    }
    fromJSON = {
        place_bet: (this.txFromJSON),
        claim_winnings: (this.txFromJSON),
        get_current_round: (this.txFromJSON),
        get_round: (this.txFromJSON),
        get_current_round_number: (this.txFromJSON),
        get_total_rounds: (this.txFromJSON),
        get_completed_rounds: (this.txFromJSON),
        get_user_winnings: (this.txFromJSON),
        get_round_stats: (this.txFromJSON),
        get_current_ars_price: (this.txFromJSON),
        fetch_last_five_ars_prices: (this.txFromJSON),
        is_betting_open: (this.txFromJSON),
        is_round_ready_to_settle: (this.txFromJSON)
    };
}
