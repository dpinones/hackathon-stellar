import * as Client from 'increment';
import { rpcUrl } from './util';

export default new Client.Client({
  networkPassphrase: 'est SDF Network ; September 2015',
  contractId: 'CAA2P2IWRA2P6PQS7PCEK2JUPZI6ERKFBZZM37HSMEOZNPZ2MKKJ7ZPI',
  rpcUrl,
  publicKey: undefined,
});
