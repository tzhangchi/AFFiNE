import type { DocProvider } from '@blocksuite/store';
import { WebsocketProvider } from './sync';
import { token } from '../../apis/token';

export class WebsocketProviderForTesting
  extends WebsocketProvider
  implements DocProvider
{
  constructor(room: string, ydoc: any, options?: { awareness?: any }) {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
      window.location.host
    }/api/sync/`;
    super(wsUrl, room, ydoc, {
      ...options,
      params: {
        token: token.refresh,
      },
    });
  }

  public clearData() {
    // Do noting for now
    return Promise.resolve();
  }
}
