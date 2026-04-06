import { useStore } from './store';
import type { Connection } from '../types';

export async function loadConnections(): Promise<void> {
  const [connections, active] = await Promise.all([
    window.connection.list(),
    window.connection.getActive(),
  ]);
  useStore.setState({
    connections,
    activeConnectionId: active?.id ?? '',
    connectionSetupRequired: connections.length === 0,
  });
}

export async function createConnection(data: Omit<Connection, 'id'>): Promise<Connection> {
  const conn = await window.connection.create(data);
  const connections = await window.connection.list();
  useStore.setState({ connections, connectionSetupRequired: false });
  return conn;
}

export async function createAndActivateConnection(data: Omit<Connection, 'id'>): Promise<void> {
  const conn = await createConnection(data);
  await switchConnection(conn.id);
}

export async function updateConnection(conn: Connection): Promise<void> {
  await window.connection.update(conn);
  const connections = await window.connection.list();
  useStore.setState({ connections });
}

export async function deleteConnection(id: string): Promise<void> {
  await window.connection.delete(id);
  const updated = await window.connection.list();
  const activeId = useStore.getState().activeConnectionId;

  if (updated.length === 0) {
    useStore.setState({
      connections: [],
      activeConnectionId: '',
      connectionSetupRequired: true,
      sdkStatus: 'initializing',
      sdkMessage: '',
      sessions: [],
      activeSessionId: '',
      messages: [],
    });
    return;
  }

  if (activeId === id) {
    await switchConnection(updated[0].id);
  }
  useStore.setState({ connections: updated });
}

export async function switchConnection(id: string): Promise<void> {
  useStore.setState({
    activeConnectionId: id,
    sessions: [],
    sessionsLoading: true,
    sessionsLimit: 30,
    sessionsHasMore: true,
    activeSessionId: '',
    messages: [],
  });
  const { instant } = await window.connection.setActive(id);
  if (!instant) {
    useStore.setState({ sdkStatus: 'initializing', sdkMessage: 'Switching connection…' });
  }
}
