import * as Client from 'increment';
import { rpcUrl } from './util';

export default new Client.Client({
  networkPassphrase: 'Standalone Network ; February 2017',
  contractId: 'CBURMY6GFXUNAGOVFC4RBJSEXALNI7QBHRZZZ6XGYSGYERNX5ONS4O4D',
  rpcUrl,
  publicKey: undefined,
});
