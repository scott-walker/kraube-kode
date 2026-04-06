import { memo, useState } from 'react';
import { useConnections, useActiveConnectionId } from '../../state/selectors';
import { createAndActivateConnection, updateConnection, deleteConnection, switchConnection } from '../../state/connection-actions';
import { useConnectionForm } from '../../hooks/useConnectionForm';
import { Icons } from '../../icons';
import ConfirmDialog from '../shared/ConfirmDialog';
import type { Connection } from '../../types';
import './ConnectionsSection.css';
import './sections.css';

export default memo(function ConnectionsSection() {
  const connections = useConnections();
  const activeId = useActiveConnectionId();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="conn-list">
      {connections.map(conn =>
        editingId === conn.id ? (
          <EditForm key={conn.id} conn={conn} onDone={() => setEditingId(null)} />
        ) : (
          <ConnectionCard
            key={conn.id}
            conn={conn}
            isActive={conn.id === activeId}
            canDelete
            onActivate={() => switchConnection(conn.id)}
            onEdit={() => setEditingId(conn.id)}
            onDelete={() => setDeletingId(conn.id)}
          />
        ),
      )}

      {adding ? (
        <AddForm onDone={() => setAdding(false)} />
      ) : (
        <button className="conn-add-btn" onClick={() => setAdding(true)}>
          + Add Connection
        </button>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Connection"
          message={`Delete "${connections.find(c => c.id === deletingId)?.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { deleteConnection(deletingId); setDeletingId(null); }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
});

// ─── Card ───

interface CardProps {
  conn: Connection;
  isActive: boolean;
  canDelete: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ConnectionCard = memo(function ConnectionCard({ conn, isActive, canDelete, onActivate, onEdit, onDelete }: CardProps) {
  const detail = [conn.executable || 'claude', conn.configDir].filter(Boolean).join(' · ');

  return (
    <div className={`conn-card${isActive ? ' is-active' : ''}`} onClick={onActivate}>
      <div className="conn-card__info">
        <div className="conn-card__name">{conn.name}</div>
        <div className="conn-card__detail">{detail}</div>
      </div>
      <div className="conn-card__actions">
        <button className="conn-card__btn" onClick={e => { e.stopPropagation(); onEdit(); }}>
          <Icons.Edit size={14} />
        </button>
        {canDelete && (
          <button className="conn-card__btn conn-card__btn--danger" onClick={e => { e.stopPropagation(); onDelete(); }}>
            <Icons.Trash size={14} />
          </button>
        )}
      </div>
    </div>
  );
});

// ─── Edit Form ───

function EditForm({ conn, onDone }: { conn: Connection; onDone: () => void }) {
  const { form, update, isValid } = useConnectionForm(conn);

  const handleSave = async () => {
    if (!isValid) return;
    await updateConnection({ ...conn, ...form });
    onDone();
  };

  return (
    <div className="conn-edit">
      <ConnectionFormFields form={form} update={update} />
      <div className="conn-edit__actions">
        <button className="conn-edit__btn conn-edit__btn--cancel" onClick={onDone}>Cancel</button>
        <button className="conn-edit__btn conn-edit__btn--save" disabled={!isValid} onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

// ─── Add Form ───

function AddForm({ onDone }: { onDone: () => void }) {
  const { form, update, isValid } = useConnectionForm();

  const handleCreate = async () => {
    if (!isValid) return;
    await createAndActivateConnection(form);
    onDone();
  };

  return (
    <div className="conn-edit">
      <ConnectionFormFields form={form} update={update} autoFocusName />
      <div className="conn-edit__actions">
        <button className="conn-edit__btn conn-edit__btn--cancel" onClick={onDone}>Cancel</button>
        <button className="conn-edit__btn conn-edit__btn--save" disabled={!isValid} onClick={handleCreate}>Create & Connect</button>
      </div>
    </div>
  );
}

// ─── Shared form fields ───

interface FieldsProps {
  form: { name: string; executable: string; configDir: string };
  update: (patch: Record<string, string>) => void;
  autoFocusName?: boolean;
}

function ConnectionFormFields({ form, update, autoFocusName }: FieldsProps) {
  const pickDir = async () => {
    const dir = await window.connection.pickDirectory();
    if (dir) update({ configDir: dir });
  };

  return (
    <div className="conn-edit__fields">
      <div>
        <label className="settings-form__label">Name</label>
        <input value={form.name} onChange={e => update({ name: e.target.value })}
          placeholder="e.g. Personal" className="settings-form__input" autoFocus={autoFocusName} />
      </div>
      <div>
        <label className="settings-form__label">Claude CLI path</label>
        <input value={form.executable} onChange={e => update({ executable: e.target.value })}
          placeholder="claude" className="settings-form__input" />
      </div>
      <div>
        <label className="settings-form__label">Config directory</label>
        <div className="settings-form__input-with-action">
          <input value={form.configDir} onChange={e => update({ configDir: e.target.value })}
            placeholder="~/.claude (default)" className="settings-form__input" />
          <button className="settings-form__input-action" onClick={pickDir} type="button">
            <Icons.Folder size={14} />
          </button>
        </div>
        <span className="settings-form__hint">CLAUDE_CONFIG_DIR — leave empty for default</span>
      </div>
    </div>
  );
}
