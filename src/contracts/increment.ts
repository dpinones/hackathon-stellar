import * as Client from 'increment';
import { rpcUrl } from './util';

export default new Client.Client({
  networkPassphrase: 'Standalone Network ; February 2017',
  contractId: 'CDZYNPNLCGWC77QL74MQIFMSWNF6KXZNW3UEONC45VGSPZZ5MNT55UR2',
  rpcUrl,
  publicKey: undefined,
});
