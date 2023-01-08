// import { describe, test, expect } from '@jest/globals';
import { describe, test, expect } from 'vitest';
import { getDataCenter } from './utils';

describe('datacenter local provider', () => {
  test('create workspace', async () => {
    const dc = await getDataCenter();
    const workspaceName = 'test create workspace';
    const workspace = await dc.createWorkspace(workspaceName);
  });
});
