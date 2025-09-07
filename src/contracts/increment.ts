import * as Client from 'increment';
import { rpcUrl } from './util';

export default new Client.Client({
  networkPassphrase: 'Standalone Network ; February 2017',
  contractId: 'CBOR3RRXFRXAYJH5B4JQC6BZTVJDRVXO2XHU4NCMQMG66M6GQUT4AJHM',
  rpcUrl,
  publicKey: undefined,
});
