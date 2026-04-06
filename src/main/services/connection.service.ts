import crypto from 'node:crypto';
import type { IStoragePort } from '../../core/ports/storage.port';
import type { Connection } from '../../core/types/connection';

export class ConnectionService {
  constructor(private storage: IStoragePort) {}

  list(): Connection[] {
    return this.storage.getConnections();
  }

  get(id: string): Connection | null {
    return this.storage.getConnection(id);
  }

  create(data: Omit<Connection, 'id'>): Connection {
    const conn: Connection = { id: crypto.randomUUID(), ...data };
    this.storage.createConnection(conn);
    return conn;
  }

  update(conn: Connection): Connection {
    this.storage.updateConnection(conn);
    return conn;
  }

  delete(id: string): void {
    this.storage.deleteConnection(id);
    const activeId = this.getActiveId();
    if (activeId === id) this.setActiveId('');
  }

  getActiveId(): string {
    return this.storage.getSetting('activeConnectionId', '');
  }

  setActiveId(id: string): void {
    this.storage.setSetting('activeConnectionId', id);
  }

  getActive(): Connection | null {
    const id = this.getActiveId();
    return id ? this.get(id) : null;
  }
}
