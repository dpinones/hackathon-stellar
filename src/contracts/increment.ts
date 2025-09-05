import * as Client from 'increment';
import { rpcUrl } from './util';

export default new Client.Client({
  networkPassphrase: 'Standalone Network ; February 2017',
  contractId: 'CBAUFX4VFYDXP2V4ZHFFW5H2PYUHPGSWJ4ABXTVY54B533DIYYZDHP34',
  rpcUrl,
  publicKey: undefined,
});
