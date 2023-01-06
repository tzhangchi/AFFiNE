import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getApis, token } from '@affine/datacenter';

const Editor = dynamic(() => import('../pages-content/DemoOnlineOnly/Editor'), {
  ssr: false,
});

const apis = getApis();

const Page = () => {
  const [login, setLogin] = useState(false);
  const [workspaceList, setWorkspaceList] = useState<any[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<number>();
  useEffect(() => {
    if (!login) {
      return;
    }
    apis.getWorkspaces().then(data => {
      console.log('get workspaces', data);
      setWorkspaceList(data);
    });
  }, [login]);
  useEffect(() => {
    const refreshToken = localStorage.getItem('testing-token');
    if (refreshToken) {
      console.log('refresh token', refreshToken);
      token.refreshToken(refreshToken);
    }

    const change = (user: any) => {
      setLogin(!!user);
      console.log('token', token.refresh);
      localStorage.setItem('testing-token', token.refresh);
    };
    token.onChange(change);

    return () => {
      token.offChange(change);
    };
  }, []);
  return (
    <div>
      <h1>Testing</h1>
      <div>
        <button
          onClick={() => {
            apis.signInWithGoogle?.();
          }}
        >
          Login
        </button>
        <span>&nbsp;&nbsp;</span>
        <button
          onClick={() => {
            apis.createWorkspace({ name: 'www', avatar: '123' }).then(data => {
              console.log('create data', data);
              apis.getWorkspaces().then(data => {
                console.log('get workspaces', data);
                setWorkspaceList(data);
              });
            });
          }}
        >
          create
        </button>
      </div>
      <div>
        <h5>Workspace list</h5>
        <ul>
          {workspaceList.map(workspace => {
            const active = currentWorkspace === workspace.id;
            return (
              <li key={workspace.id}>
                <span onClick={() => setCurrentWorkspace(workspace.id)}>
                  {workspace.id}
                </span>
                <span>&nbsp;&nbsp;</span>
                <button
                  disabled={active}
                  onClick={() => {
                    apis.deleteWorkspace({ id: workspace.id }).then(() => {
                      apis.getWorkspaces().then(data => {
                        console.log('get workspaces', data);
                        setWorkspaceList(data);
                      });
                    });
                  }}
                >
                  {`delete${active ? ' (disabled)' : ''}`}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {login && currentWorkspace ? (
        <Editor workspaceId={currentWorkspace} />
      ) : null}
    </div>
  );
};

export default Page;
