import * as Client from 'increment';
import { rpcUrl } from './util';

export default new Client.Client({
  networkPassphrase: 'Standalone Network ; February 2017',
  contractId: 'CDAASIVM6SAJDUVZRT54NM7377WDAT2VMJKW47T7OCAMPS7Q5GC2G5D6',
  rpcUrl,
  publicKey: undefined,
});
