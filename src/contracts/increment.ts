import * as Client from 'increment';
import { rpcUrl } from './util';

export default new Client.Client({
  networkPassphrase: 'Standalone Network ; February 2017',
  contractId: 'CC2AJHUB5VJTCPDGOEHV4YDCHHVYY3AN2L5ZM3OI37W5ED72BV3RS7VP',
  rpcUrl,
  publicKey: undefined,
});
