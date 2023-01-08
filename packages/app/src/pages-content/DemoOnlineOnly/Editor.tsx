/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { EditorContainer } from '@blocksuite/editor';
import { Workspace, Text } from '@blocksuite/store';
import {
  WebsocketProviderForTesting,
  getApis,
  token,
} from '@affine/datacenter';
import { BlockSchema } from '@blocksuite/blocks/models';

const Editor = ({ workspaceId }: { workspaceId: number }) => {
  const [pages, setPages] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const workspace = useRef<Workspace>();
  const [currentPage, setCurrentPage] = useState<string>();

  useEffect(() => {
    (async () => {
      workspace.current = new Workspace({
        room: String(workspaceId),
        providers: [WebsocketProviderForTesting],
      }).register(BlockSchema);

      // @ts-expect-error global variable for debug.
      window.workspace = workspace.current;

      workspace.current?.signals.pageRemoved.on(ret => {
        console.log('pageRemoved', ret);
        if (workspace.current?.meta.pageMetas) {
          setPages(workspace.current.meta.pageMetas);
        }
      });

      workspace.current?.signals.pageAdded.on(pageId => {
        console.log('pageAdded', pageId);
        const page = workspace.current?.getPage(pageId);
        if (!page) {
          throw new Error('Create page failed');
        }

        if (page.isEmpty) {
          const pageBlockId = page.addBlock({
            flavour: 'affine:page',
            title: 'Welcome to BlockSuite playground',
          });

          const groupId = page.addBlock(
            {
              flavour: 'affine:group',
            },
            pageBlockId
          );

          page.addBlock(
            {
              flavour: 'affine:paragraph',
              text: new Text(
                page,
                'This playground is a demo environment built with BlockSuite.'
              ),
            },
            groupId
          );
        }
        if (workspace.current?.meta.pageMetas) {
          setPages(workspace.current.meta.pageMetas);
        }

        setCurrentPage(pageId);
      });

      if (token.isLogin) {
        const apis = getApis();

        const updates = await apis.downloadWorkspace(String(workspaceId));
        Workspace.Y.applyUpdate(workspace.current.doc, new Uint8Array(updates));
        console.log('updates', updates);
        workspace.current.doc.getMap('space:meta');
      }

      if (!workspace.current.meta.pageMetas.length) {
        workspace.current.createPage('page0');
      }
    })();
  }, [workspaceId]);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (currentPage) {
      const editor = new EditorContainer();
      const page = workspace.current?.getPage(currentPage);
      if (!page) {
        throw new Error('Not found.');
      }
      editor.page = page;

      containerRef.current?.appendChild(editor);
    }
    return () => {
      while (containerEl?.firstChild) {
        containerEl?.firstChild.remove();
      }
    };
  }, [currentPage]);

  return (
    <div>
      <div>
        <h5>Pages</h5>
        <div>
          <button
            onClick={() => {
              workspace.current?.createPage(`Untitled+${Date.now()}`);
            }}
          >
            create
          </button>
        </div>
        <ul>
          {pages.map(page => {
            const active = page.id === currentPage;
            return (
              <li key={page.id}>
                <span
                  onClick={() => {
                    setCurrentPage(page.id);
                  }}
                >
                  {page.id}
                </span>
                <span>&nbsp;&nbsp;</span>
                <button
                  disabled={active}
                  onClick={() => {
                    workspace.current?.removePage(page.id);
                  }}
                >
                  {`Delete${active ? ' (disabled)' : ''}`}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="demo-workspace" ref={containerRef} />
    </div>
  );
};

export default Editor;
