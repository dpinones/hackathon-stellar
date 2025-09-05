import * as Client from 'increment';
import { rpcUrl } from './util';

export default new Client.Client({
  networkPassphrase: 'Standalone Network ; February 2017',
  contractId: 'CC26NFIAZQEXW3KHUXGGK2PUMQ4JRUSQD4NLVBTWBRTYYAATZ4PDDVFC',
  rpcUrl,
  publicKey: undefined,
});
