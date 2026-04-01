import { useState, useEffect, useRef, useCallback } from "react";

// ─── Icons ───
const Icons = {
  Plus: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Send: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>,
  Mic: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="9" y="1" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>,
  MicActive: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5"><rect x="9" y="1" width="6" height="12" rx="3"/><path fill="none" strokeWidth="1.5" strokeLinecap="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>,
  File: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Folder: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  Settings: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Moon: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  Sun: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Brain: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a5 5 0 015 5c0 .9-.2 1.7-.7 2.4A5 5 0 0119 14c0 1.5-.7 2.9-1.8 3.8A4 4 0 0113 22h-2a4 4 0 01-4.2-4.2A5 5 0 015 14a5 5 0 012.7-4.6A5 5 0 017 7a5 5 0 015-5z"/><path d="M12 2v20"/></svg>,
  Terminal: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  Code: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  Search: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  X: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Check: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronRight: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronDown: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Refresh: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  Play: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Pause: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Stop: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>,
  Plug: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22v-5M9 8V1M15 8V1M18 8H6a2 2 0 00-2 2v2c0 4.4 3.6 8 8 8s8-3.6 8-8v-2a2 2 0 00-2-2z"/></svg>,
  Memory: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 4v16M4 14h16"/></svg>,
  Loop: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  Eye: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Copy: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Git: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v1a2 2 0 01-2 2H8a2 2 0 01-2-2V9M12 12v3"/></svg>,
  Paperclip: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>,
  Sidebar: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>,
  Zap: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Clock: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  AlertCircle: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Layers: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Users: ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Pin: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 17v5M9.5 2.1L5.6 6a2 2 0 000 2.8l.1.1a2 2 0 002.8 0l.3-.3a1 1 0 011.4 0l2.2 2.2a1 1 0 010 1.4l-.3.3a2 2 0 000 2.8l.1.1a2 2 0 002.8 0l3.9-3.9a2 2 0 000-2.8l-.1-.1a2 2 0 00-2.8 0l-.3.3a1 1 0 01-1.4 0L12 6.6a1 1 0 010-1.4l.3-.3a2 2 0 000-2.8l-.1-.1a2 2 0 00-2.7 0z"/></svg>,
};

// ─── Animated dots ───
const PulsingDots = () => (
  <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 4, height: 4, borderRadius: "50%", background: "var(--accent)",
        opacity: 0.4, animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
  </span>
);

// ─── Typing indicator ───
const TypingBar = ({ active }) => (
  <div style={{
    height: 2, background: active ? "var(--accent)" : "transparent",
    borderRadius: 1, transition: "all 0.4s ease",
    animation: active ? "typing-bar 2s ease-in-out infinite" : "none",
    opacity: active ? 1 : 0,
  }} />
);

// ─── Collapsible Section ───
const Collapsible = ({ title, icon, children, defaultOpen = false, accent = false, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 2 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%",
        background: "none", border: "none", padding: "6px 0", cursor: "pointer",
        color: accent ? "var(--accent)" : "var(--fg-secondary)", fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em",
        transition: "color 0.2s",
      }}>
        <span style={{ transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)", display: "flex" }}>
          <Icons.ChevronRight size={12} />
        </span>
        {icon}
        <span style={{ textTransform: "uppercase", fontWeight: 500 }}>{title}</span>
        {badge && <span style={{
          background: "var(--accent)", color: "#fff", borderRadius: 6,
          padding: "1px 6px", fontSize: 10, fontWeight: 600, marginLeft: "auto",
        }}>{badge}</span>}
      </button>
      <div style={{
        overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
        maxHeight: open ? 600 : 0, opacity: open ? 1 : 0,
      }}>
        <div style={{ paddingLeft: 20, paddingTop: 4 }}>{children}</div>
      </div>
    </div>
  );
};

// ─── Tool Call Block ───
const ToolCallBlock = ({ name, status, detail, duration }) => {
  const isRunning = status === "running";
  const isDone = status === "done";
  const isError = status === "error";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
      background: "var(--bg-elevated)", borderRadius: 8,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
      transition: "all 0.3s ease",
    }}>
      <span style={{ display: "flex", color: isError ? "var(--error)" : isRunning ? "var(--accent)" : "var(--fg-tertiary)", transition: "color 0.3s" }}>
        {isRunning ? <span style={{ animation: "spin 1.5s linear infinite", display: "flex" }}><Icons.Refresh size={14} /></span>
          : isError ? <Icons.AlertCircle size={14} />
          : <Icons.Check size={14} />}
      </span>
      <span style={{ color: "var(--fg-primary)", fontWeight: 500 }}>{name}</span>
      {detail && <span style={{ color: "var(--fg-tertiary)", fontSize: 11 }}>{detail}</span>}
      <span style={{ marginLeft: "auto", color: "var(--fg-tertiary)", fontSize: 11 }}>
        {isRunning ? <PulsingDots /> : duration ? `${duration}s` : ""}
      </span>
    </div>
  );
};

// ─── Code Block ───
const CodeBlock = ({ code, language, filename }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", background: "var(--bg-code)", marginTop: 8 }}>
      <div style={{
        display: "flex", alignItems: "center", padding: "8px 14px",
        background: "var(--bg-code-header)", gap: 8,
      }}>
        <Icons.Code size={12} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--fg-tertiary)", fontWeight: 500 }}>
          {filename || language}
        </span>
        <button onClick={handleCopy} style={{
          marginLeft: "auto", background: "none", border: "none", cursor: "pointer",
          color: copied ? "var(--success)" : "var(--fg-tertiary)", display: "flex",
          transition: "color 0.2s", padding: 2,
        }}>
          {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
        </button>
      </div>
      <pre style={{
        padding: "14px 16px", margin: 0, fontSize: 12.5, lineHeight: 1.6,
        fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-code)",
        overflowX: "auto",
      }}>{code}</pre>
    </div>
  );
};

// ─── Diff Block ───
const DiffBlock = ({ filename, additions, deletions }) => (
  <div style={{ borderRadius: 10, overflow: "hidden", background: "var(--bg-code)", marginTop: 8 }}>
    <div style={{ display: "flex", alignItems: "center", padding: "8px 14px", background: "var(--bg-code-header)", gap: 8 }}>
      <Icons.Edit size={12} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--fg-tertiary)", fontWeight: 500 }}>{filename}</span>
      <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
        <span style={{ color: "var(--success)" }}>+{additions}</span>{" "}
        <span style={{ color: "var(--error)" }}>-{deletions}</span>
      </span>
    </div>
    <pre style={{ padding: "10px 16px", margin: 0, fontSize: 12, lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ color: "var(--error)", opacity: 0.8 }}>- const oldFunction = () =&gt; {"{"}</div>
      <div style={{ color: "var(--error)", opacity: 0.8 }}>-   return null;</div>
      <div style={{ color: "var(--error)", opacity: 0.8 }}>- {"}"}</div>
      <div style={{ color: "var(--success)" }}>+ const newFunction = async () =&gt; {"{"}</div>
      <div style={{ color: "var(--success)" }}>+   const result = await fetchData();</div>
      <div style={{ color: "var(--success)" }}>+   return result;</div>
      <div style={{ color: "var(--success)" }}>+ {"}"}</div>
    </pre>
  </div>
);

// ─── File Pill ───
const FilePill = ({ name, onRemove }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 8px",
    background: "var(--bg-elevated)", borderRadius: 6, fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-secondary)",
    animation: "fade-in 0.25s ease",
  }}>
    <Icons.File size={12} />
    <span>{name}</span>
    {onRemove && <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-tertiary)", display: "flex", padding: 0 }}>
      <Icons.X size={12} />
    </button>}
  </div>
);

// ─── Thinking Block ───
const ThinkingBlock = ({ content, phase }) => {
  const phases = {
    thinking: { icon: <Icons.Brain size={14} />, label: "Thinking", color: "var(--accent)" },
    planning: { icon: <Icons.Layers size={14} />, label: "Planning", color: "var(--warning)" },
    reading: { icon: <Icons.Eye size={14} />, label: "Reading files", color: "var(--info)" },
    searching: { icon: <Icons.Search size={14} />, label: "Searching codebase", color: "var(--info)" },
    subagent: { icon: <Icons.Users size={14} />, label: "Sub-agent working", color: "var(--success)" },
  };
  const p = phases[phase] || phases.thinking;
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 10, background: "var(--bg-elevated)",
      borderLeft: `2px solid ${p.color}`, marginBottom: 8,
      animation: "slide-up 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: content ? 6 : 0 }}>
        <span style={{ color: p.color, display: "flex" }}>{p.icon}</span>
        <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, color: p.color }}>{p.label}</span>
        {!content && <PulsingDots />}
      </div>
      {content && <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--fg-tertiary)", paddingLeft: 22, fontStyle: "italic" }}>{content}</div>}
    </div>
  );
};

// ─── Approval Request ───
const ApprovalBlock = ({ tool, command, onApprove, onDeny }) => (
  <div style={{
    padding: 16, borderRadius: 12, background: "var(--bg-elevated)",
    borderLeft: "2px solid var(--warning)", animation: "slide-up 0.3s ease",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <Icons.AlertCircle size={16} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-primary)" }}>Permission Required</span>
    </div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--fg-secondary)", padding: "8px 12px", background: "var(--bg-code)", borderRadius: 8, marginBottom: 12 }}>
      <span style={{ color: "var(--fg-tertiary)" }}>{tool}:</span> {command}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onApprove} style={{
        padding: "7px 20px", borderRadius: 8, border: "none", cursor: "pointer",
        background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace", transition: "opacity 0.2s",
      }}>Allow</button>
      <button onClick={onDeny} style={{
        padding: "7px 20px", borderRadius: 8, border: "none", cursor: "pointer",
        background: "var(--bg-tertiary)", color: "var(--fg-secondary)", fontSize: 12, fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace", transition: "opacity 0.2s",
      }}>Deny</button>
      <button style={{
        padding: "7px 20px", borderRadius: 8, border: "none", cursor: "pointer",
        background: "var(--bg-tertiary)", color: "var(--fg-tertiary)", fontSize: 12, fontWeight: 500,
        fontFamily: "'JetBrains Mono', monospace", marginLeft: "auto",
      }}>Always allow</button>
    </div>
  </div>
);

// ─── Loop Progress ───
const LoopProgress = ({ current, total, label }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
    background: "var(--bg-elevated)", borderRadius: 8,
  }}>
    <span style={{ display: "flex", color: "var(--accent)", animation: "spin 2s linear infinite" }}>
      <Icons.Loop size={14} />
    </span>
    <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-secondary)" }}>{label}</span>
    <div style={{ flex: 1, height: 3, background: "var(--bg-tertiary)", borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        height: "100%", background: "var(--accent)", borderRadius: 2,
        width: `${(current / total) * 100}%`, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-tertiary)" }}>{current}/{total}</span>
  </div>
);

// ─── Token Counter ───
const TokenCounter = ({ input, output }) => (
  <div style={{
    display: "flex", gap: 12, fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
    color: "var(--fg-tertiary)", padding: "6px 0",
  }}>
    <span>↑ {(input / 1000).toFixed(1)}k</span>
    <span>↓ {(output / 1000).toFixed(1)}k</span>
    <span>Σ {((input + output) / 1000).toFixed(1)}k tokens</span>
  </div>
);

// ─── Main App ───
export default function ClaudeCodeApp() {
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("sessions");
  const [recording, setRecording] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [activeSession, setActiveSession] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mcpOpen, setMcpOpen] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const sessions = [
    { id: 0, name: "Convervox Frontend", project: "~/convervox", time: "2m ago", active: true },
    { id: 1, name: "Fix auth middleware", project: "~/api-server", time: "1h ago", active: false },
    { id: 2, name: "Database migration", project: "~/backend", time: "3h ago", active: false },
    { id: 3, name: "README update", project: "~/claude-connector", time: "yesterday", active: false },
  ];

  const mcpServers = [
    { name: "filesystem", status: "connected", tools: 12 },
    { name: "github", status: "connected", tools: 8 },
    { name: "postgres", status: "disconnected", tools: 5 },
    { name: "notion", status: "connected", tools: 16 },
    { name: "browser", status: "error", tools: 3 },
  ];

  const memories = [
    "Prefers TypeScript strict mode",
    "Uses pnpm as package manager",
    "Convention: kebab-case for file names",
    "Runs tests before commit",
    "Purple accent #6c5ce7 for Convervox",
  ];

  const isDark = theme === "dark";
  const themeVars = isDark ? {
    "--bg-primary": "#282a36",
    "--bg-secondary": "#21222e",
    "--bg-elevated": "#2f3142",
    "--bg-tertiary": "#383a4e",
    "--bg-code": "#1e1f2b",
    "--bg-code-header": "#252635",
    "--fg-primary": "#f0f0f8",
    "--fg-secondary": "#a0a0b8",
    "--fg-tertiary": "#6a6a88",
    "--fg-code": "#d0d0e0",
    "--accent": "#7c6cf0",
    "--accent-dim": "rgba(124,108,240,0.14)",
    "--accent-medium": "rgba(124,108,240,0.28)",
    "--success": "#4ade80",
    "--error": "#f87171",
    "--warning": "#fbbf24",
    "--info": "#60a5fa",
    "--scrollbar": "#3a3c50",
  } : {
    "--bg-primary": "#fafafa",
    "--bg-secondary": "#f0f0f3",
    "--bg-elevated": "#e8e8ee",
    "--bg-tertiary": "#dddde6",
    "--bg-code": "#f2f2f6",
    "--bg-code-header": "#e8e8ee",
    "--fg-primary": "#1a1a24",
    "--fg-secondary": "#5c5c72",
    "--fg-tertiary": "#8888a0",
    "--fg-code": "#2a2a36",
    "--accent": "#6c5ce7",
    "--accent-dim": "rgba(108,92,231,0.08)",
    "--accent-medium": "rgba(108,92,231,0.18)",
    "--success": "#16a34a",
    "--error": "#dc2626",
    "--warning": "#d97706",
    "--info": "#2563eb",
    "--scrollbar": "#d0d0dc",
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachedFiles(prev => [...prev, ...files.map(f => f.name)]);
  }, []);

  return (
    <div style={{
      ...themeVars,
      width: "100%", height: "100vh", display: "flex", fontFamily: "'DM Sans', system-ui, sans-serif",
      background: "var(--bg-primary)", color: "var(--fg-primary)", overflow: "hidden",
      transition: "background 0.4s ease, color 0.4s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--scrollbar); border-radius: 3px; }
        @keyframes pulse-dot { 0%, 100% { opacity: 0.25; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }
        @keyframes typing-bar { 0%, 100% { transform: scaleX(0); transform-origin: left; } 25% { transform: scaleX(1); transform-origin: left; } 50% { transform: scaleX(1); transform-origin: right; } 75% { transform: scaleX(0); transform-origin: right; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes mic-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(124,108,240,0.4); } 50% { box-shadow: 0 0 0 10px rgba(124,108,240,0); } }
        @keyframes glow-line { 0% { left: -30%; } 100% { left: 130%; } }
        @keyframes sidebar-in { from { opacity: 0; width: 0; } to { opacity: 1; width: 280px; } }
        button:hover { opacity: 0.85; }
        button:active { transform: scale(0.97); }
        textarea:focus { outline: none; }
        input:focus { outline: none; }
      `}</style>

      {/* ═══ Sidebar ═══ */}
      {sidebarOpen && (
        <div style={{
          width: 280, minWidth: 280, height: "100%", background: "var(--bg-secondary)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "fade-in 0.3s ease",
          transition: "background 0.4s ease",
        }}>
          {/* Sidebar header */}
          <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icons.Terminal size={14} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>Claude Code</div>
              <div style={{ fontSize: 11, color: "var(--fg-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>v1.0.42 — opus-4</div>
            </div>
          </div>

          {/* Sidebar tabs */}
          <div style={{ display: "flex", padding: "0 16px", gap: 2, marginBottom: 8 }}>
            {[
              { key: "sessions", icon: <Icons.Terminal size={14} />, label: "Sessions" },
              { key: "mcp", icon: <Icons.Plug size={14} />, label: "MCP" },
              { key: "memory", icon: <Icons.Memory size={14} />, label: "Memory" },
            ].map(tab => (
              <button key={tab.key} onClick={() => setSidebarTab(tab.key)} style={{
                flex: 1, padding: "8px 0", background: sidebarTab === tab.key ? "var(--accent-dim)" : "transparent",
                border: "none", borderRadius: 8, cursor: "pointer",
                color: sidebarTab === tab.key ? "var(--accent)" : "var(--fg-tertiary)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                transition: "all 0.2s ease", fontSize: 10, fontWeight: 500, letterSpacing: "0.04em",
                textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace",
              }}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
            {/* Sessions Tab */}
            {sidebarTab === "sessions" && (
              <div>
                <button style={{
                  width: "100%", padding: "10px 12px", background: "var(--accent-dim)",
                  border: "none", borderRadius: 10, cursor: "pointer", color: "var(--accent)",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500,
                  transition: "all 0.2s ease", marginBottom: 12,
                }}>
                  <Icons.Plus size={16} />
                  New Session
                </button>
                {sessions.map(s => (
                  <button key={s.id} onClick={() => setActiveSession(s.id)} style={{
                    width: "100%", padding: "10px 12px", background: activeSession === s.id ? "var(--bg-elevated)" : "transparent",
                    border: "none", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    marginBottom: 2, transition: "all 0.2s ease", display: "flex", flexDirection: "column", gap: 3,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {s.active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />}
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: s.active ? 12 : 0 }}>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-tertiary)" }}>{s.project}</span>
                      <span style={{ fontSize: 10, color: "var(--fg-tertiary)", marginLeft: "auto" }}>{s.time}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* MCP Tab */}
            {sidebarTab === "mcp" && (
              <div>
                <div style={{ fontSize: 11, color: "var(--fg-tertiary)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 4px 10px", fontWeight: 500 }}>
                  Connected Servers
                </div>
                {mcpServers.map(s => (
                  <div key={s.name} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 10px",
                    borderRadius: 10, marginBottom: 2, cursor: "pointer",
                    transition: "background 0.2s",
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: s.status === "connected" ? "var(--success)" : s.status === "error" ? "var(--error)" : "var(--fg-tertiary)",
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>{s.tools} tools</div>
                    </div>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-tertiary)", display: "flex" }}>
                      <Icons.Settings size={14} />
                    </button>
                  </div>
                ))}
                <button style={{
                  width: "100%", padding: "10px 12px", background: "var(--bg-elevated)",
                  border: "none", borderRadius: 10, cursor: "pointer", color: "var(--fg-secondary)",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500,
                  transition: "all 0.2s ease", marginTop: 10,
                }}>
                  <Icons.Plus size={14} />
                  Add MCP Server
                </button>
              </div>
            )}

            {/* Memory Tab */}
            {sidebarTab === "memory" && (
              <div>
                <div style={{ fontSize: 11, color: "var(--fg-tertiary)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 4px 10px", fontWeight: 500 }}>
                  Project Memory
                </div>
                {memories.map((m, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px",
                    borderRadius: 8, marginBottom: 2, fontSize: 13, color: "var(--fg-secondary)", lineHeight: 1.5,
                  }}>
                    <span style={{ color: "var(--fg-tertiary)", flexShrink: 0, paddingTop: 2 }}>•</span>
                    <span style={{ flex: 1 }}>{m}</span>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-tertiary)", display: "flex", flexShrink: 0, opacity: 0.5 }}>
                      <Icons.X size={12} />
                    </button>
                  </div>
                ))}
                <button style={{
                  width: "100%", padding: "10px 12px", background: "var(--bg-elevated)",
                  border: "none", borderRadius: 10, cursor: "pointer", color: "var(--fg-secondary)",
                  display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500,
                  transition: "all 0.2s ease", marginTop: 10,
                }}>
                  <Icons.Plus size={14} />
                  Add Memory
                </button>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: "var(--fg-tertiary)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 4px 10px", fontWeight: 500 }}>
                    CLAUDE.md
                  </div>
                  <div style={{
                    padding: "10px 12px", borderRadius: 10, background: "var(--bg-elevated)",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--fg-tertiary)", lineHeight: 1.6,
                  }}>
                    # Convervox Project<br />
                    Stack: React + Vite + TailwindCSS<br />
                    API: REST + WebSocket<br />
                    Voice: ElevenLabs + Whisper
                  </div>
                  <button style={{
                    marginTop: 6, background: "none", border: "none", cursor: "pointer",
                    color: "var(--accent)", fontSize: 12, fontWeight: 500, padding: "4px 0",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Icons.Edit size={12} />
                    Edit CLAUDE.md
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} style={{
              background: "var(--bg-elevated)", border: "none", borderRadius: 8,
              width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--fg-secondary)", transition: "all 0.3s ease",
            }}>
              {isDark ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
            </button>
            <button onClick={() => setSettingsOpen(true)} style={{
              background: "var(--bg-elevated)", border: "none", borderRadius: 8,
              width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--fg-secondary)", transition: "all 0.3s ease",
            }}>
              <Icons.Settings size={16} />
            </button>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 10, color: "var(--fg-tertiary)", fontFamily: "'JetBrains Mono', monospace" }}>
              opus-4-0626
            </div>
          </div>
        </div>
      )}

      {/* ═══ Main Area ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", position: "relative" }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {dragOver && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 100,
            background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)", animation: "fade-in 0.15s ease",
          }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              color: "var(--accent)",
            }}>
              <Icons.Paperclip size={48} />
              <span style={{ fontSize: 16, fontWeight: 500 }}>Drop files to attach</span>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", padding: "12px 24px", gap: 12,
          flexShrink: 0, minHeight: 52,
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--fg-tertiary)", display: "flex", transition: "color 0.2s",
          }}>
            <Icons.Sidebar size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{sessions[activeSession].name}</span>
            <span style={{
              fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-tertiary)",
              background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 4,
            }}>{sessions[activeSession].project}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-tertiary)" }}>connected</span>
          </div>
        </div>

        {/* ═══ Chat Area ═══ */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>

            {/* User message */}
            <div style={{ marginBottom: 32, animation: "slide-up 0.3s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, background: "var(--bg-elevated)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600, color: "var(--fg-secondary)",
                }}>M</div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>You</span>
                <span style={{ fontSize: 11, color: "var(--fg-tertiary)", marginLeft: "auto" }}>2 min ago</span>
              </div>
              <div style={{ paddingLeft: 32, fontSize: 14, lineHeight: 1.7, color: "var(--fg-primary)" }}>
                Refactor the voice pipeline to use WebRTC instead of WebSocket for real-time audio streaming. The current implementation has latency issues. Also update the tests.
              </div>
              <div style={{ paddingLeft: 32, marginTop: 8, display: "flex", gap: 6 }}>
                <FilePill name="voice-pipeline.ts" />
                <FilePill name="rtc-config.json" />
              </div>
            </div>

            {/* Claude response */}
            <div style={{ marginBottom: 32, animation: "slide-up 0.3s ease 0.1s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, background: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icons.Zap size={12} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Claude</span>
                <TokenCounter input={12400} output={3200} />
              </div>

              <div style={{ paddingLeft: 32, display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Thinking phases */}
                <ThinkingBlock phase="thinking" content="I need to refactor the voice pipeline from WebSocket to WebRTC. Let me first understand the current architecture by reading the relevant files." />

                <ThinkingBlock phase="reading" content="Reading voice-pipeline.ts, rtc-config.json, and the test files to understand the current implementation..." />

                <ThinkingBlock phase="planning" content="Plan: 1) Create RTCPeerConnection wrapper 2) Replace WS message handlers with data channels 3) Add ICE candidate handling 4) Update codec negotiation 5) Migrate tests" />

                {/* Tool calls */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <ToolCallBlock name="Read" detail="src/voice/pipeline.ts" status="done" duration="0.2" />
                  <ToolCallBlock name="Read" detail="src/voice/ws-handler.ts" status="done" duration="0.1" />
                  <ToolCallBlock name="Search" detail="WebRTC references in codebase" status="done" duration="0.8" />
                  <ToolCallBlock name="Read" detail="tests/voice-pipeline.test.ts" status="done" duration="0.2" />
                </div>

                {/* Text response */}
                <div style={{ fontSize: 14, lineHeight: 1.75, color: "var(--fg-primary)" }}>
                  I've analyzed the current voice pipeline. The WebSocket implementation buffers audio chunks at 20ms intervals before sending, which introduces ~60-80ms of latency. Here's the WebRTC refactor:
                </div>

                {/* Code output */}
                <CodeBlock language="typescript" filename="src/voice/rtc-pipeline.ts" code={`export class RTCVoicePipeline {
  private pc: RTCPeerConnection;
  private audioChannel: RTCDataChannel;
  private mediaStream: MediaStream;

  constructor(config: RTCConfig) {
    this.pc = new RTCPeerConnection({
      iceServers: config.iceServers,
      iceCandidatePoolSize: 10,
    });
    this.setupDataChannel();
  }

  private setupDataChannel() {
    this.audioChannel = this.pc.createDataChannel('audio', {
      ordered: false,
      maxRetransmits: 0,
    });
  }

  async connect(offer: RTCSessionDescriptionInit) {
    await this.pc.setRemoteDescription(offer);
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    return answer;
  }
}`} />

                {/* Diff */}
                <DiffBlock filename="src/voice/pipeline.ts" additions={42} deletions={28} />

                {/* More tool calls */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <ToolCallBlock name="Write" detail="src/voice/rtc-pipeline.ts" status="done" duration="0.3" />
                  <ToolCallBlock name="Edit" detail="src/voice/pipeline.ts" status="done" duration="0.2" />
                  <ToolCallBlock name="Write" detail="tests/rtc-pipeline.test.ts" status="done" duration="0.4" />
                </div>

                {/* Sub-agent */}
                <ThinkingBlock phase="subagent" content="Running sub-agent to verify test coverage and fix any import issues..." />

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <ToolCallBlock name="Bash" detail="pnpm test --filter voice" status="done" duration="3.4" />
                </div>

                {/* Terminal output block */}
                <div style={{ borderRadius: 10, overflow: "hidden", background: "var(--bg-code)" }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "8px 14px", background: "var(--bg-code-header)", gap: 8 }}>
                    <Icons.Terminal size={12} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--fg-tertiary)", fontWeight: 500 }}>Terminal Output</span>
                  </div>
                  <pre style={{ padding: "10px 16px", margin: 0, fontSize: 12, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-code)" }}>
{`✓ RTCVoicePipeline › creates peer connection (4ms)
✓ RTCVoicePipeline › establishes data channel (12ms)
✓ RTCVoicePipeline › handles ICE candidates (8ms)
✓ RTCVoicePipeline › streams audio chunks (23ms)
✓ RTCVoicePipeline › reconnects on failure (15ms)

Tests: 5 passed, 5 total
Time:  3.2s`}</pre>
                </div>

                {/* Loop progress */}
                <LoopProgress current={5} total={5} label="Test iterations" />

                {/* Final text */}
                <div style={{ fontSize: 14, lineHeight: 1.75, color: "var(--fg-primary)" }}>
                  All 5 tests pass. The refactored pipeline uses WebRTC data channels with <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 4 }}>ordered: false</code> and <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 4 }}>maxRetransmits: 0</code> for minimal latency. Expected latency improvement: ~60ms → ~15ms.
                </div>

                {/* Summary stats */}
                <div style={{
                  display: "flex", gap: 24, padding: "12px 0", marginTop: 4,
                  fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-tertiary)",
                }}>
                  <span>3 files modified</span>
                  <span>1 file created</span>
                  <span style={{ color: "var(--success)" }}>+42 lines</span>
                  <span style={{ color: "var(--error)" }}>-28 lines</span>
                  <span>5/5 tests pass</span>
                </div>
              </div>
            </div>

            {/* Approval request */}
            <div style={{ marginBottom: 32, animation: "slide-up 0.3s ease 0.2s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, background: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icons.Zap size={12} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Claude</span>
              </div>
              <div style={{ paddingLeft: 32, display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 14, lineHeight: 1.75, color: "var(--fg-primary)" }}>
                  I'd like to commit these changes. Here's what I'll run:
                </div>
                <ApprovalBlock
                  tool="Bash"
                  command='git add -A && git commit -m "refactor: migrate voice pipeline to WebRTC"'
                  onApprove={() => {}}
                  onDeny={() => {}}
                />
              </div>
            </div>

            {/* Currently streaming response */}
            <div style={{ marginBottom: 32, animation: "slide-up 0.3s ease 0.3s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, background: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icons.Zap size={12} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Claude</span>
                <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ animation: "spin 2s linear infinite", display: "inline-flex" }}><Icons.Refresh size={11} /></span>
                  streaming
                </span>
              </div>
              <div style={{ paddingLeft: 32, display: "flex", flexDirection: "column", gap: 10 }}>
                <ThinkingBlock phase="thinking" />
                <ToolCallBlock name="Read" detail="src/voice/codec-negotiator.ts" status="running" />
                <TypingBar active={true} />
              </div>
            </div>

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* ═══ Input Area ═══ */}
        <div style={{ flexShrink: 0, padding: "0 24px 20px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            {/* Attached files */}
            {attachedFiles.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, paddingLeft: 4 }}>
                {attachedFiles.map((f, i) => (
                  <FilePill key={i} name={f} onRemove={() => setAttachedFiles(prev => prev.filter((_, j) => j !== i))} />
                ))}
              </div>
            )}

            {/* Input box */}
            <div style={{
              background: "var(--bg-secondary)", borderRadius: 16, padding: "4px",
              transition: "background 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                {/* Attach button */}
                <label style={{
                  width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--fg-tertiary)", borderRadius: 12,
                  transition: "color 0.2s", flexShrink: 0,
                }}>
                  <Icons.Paperclip size={18} />
                  <input type="file" multiple style={{ display: "none" }} onChange={e => {
                    const files = Array.from(e.target.files || []);
                    setAttachedFiles(prev => [...prev, ...files.map(f => f.name)]);
                  }} />
                </label>

                {/* Text input */}
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Ask Claude to code something..."
                  rows={1}
                  style={{
                    flex: 1, background: "transparent", border: "none", resize: "none",
                    fontSize: 14, color: "var(--fg-primary)", padding: "10px 4px",
                    fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.5,
                    minHeight: 40, maxHeight: 160,
                  }}
                  onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
                />

                {/* Mic button */}
                <button
                  onClick={() => setRecording(!recording)}
                  style={{
                    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                    background: recording ? "var(--accent)" : "transparent",
                    border: "none", borderRadius: 12, cursor: "pointer",
                    color: recording ? "#fff" : "var(--fg-tertiary)",
                    transition: "all 0.3s ease", flexShrink: 0,
                    animation: recording ? "mic-pulse 1.5s ease-in-out infinite" : "none",
                  }}
                >
                  {recording ? <Icons.MicActive size={18} /> : <Icons.Mic size={18} />}
                </button>

                {/* Send / Stop button */}
                <button style={{
                  width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                  background: inputValue.trim() ? "var(--accent)" : "transparent",
                  border: "none", borderRadius: 12, cursor: "pointer",
                  color: inputValue.trim() ? "#fff" : "var(--fg-tertiary)",
                  transition: "all 0.3s ease", flexShrink: 0,
                }}>
                  <Icons.Send size={16} />
                </button>
              </div>

              {/* Bottom bar with options */}
              <div style={{
                display: "flex", alignItems: "center", padding: "4px 8px 4px", gap: 4,
              }}>
                {[
                  { label: "Auto-approve", icon: <Icons.Check size={12} />, active: false },
                  { label: "Loop mode", icon: <Icons.Loop size={12} />, active: true },
                  { label: "Verbose", icon: <Icons.Eye size={12} />, active: false },
                ].map((opt, i) => (
                  <button key={i} style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                    background: opt.active ? "var(--accent-dim)" : "transparent",
                    border: "none", borderRadius: 6, cursor: "pointer",
                    color: opt.active ? "var(--accent)" : "var(--fg-tertiary)",
                    fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}>
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
                <div style={{ flex: 1 }} />
                <span style={{
                  fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "var(--fg-tertiary)",
                  opacity: 0.6,
                }}>
                  ⌘ Enter to send • Shift+Enter for newline
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Settings Panel Overlay ═══ */}
      {settingsOpen && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex", animation: "fade-in 0.2s ease" }}>
          <div onClick={() => setSettingsOpen(false)} style={{ flex: 1, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }} />
          <div style={{
            width: 400, height: "100%", background: "var(--bg-secondary)", padding: 28,
            overflowY: "auto", animation: "slide-up 0.3s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>Settings</span>
              <button onClick={() => setSettingsOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--fg-tertiary)", display: "flex" }}>
                <Icons.X size={20} />
              </button>
            </div>

            <Collapsible title="Model" icon={<Icons.Brain size={12} />} defaultOpen>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {["claude-opus-4-0626", "claude-sonnet-4-0514", "claude-haiku-4-5"].map((m, i) => (
                  <button key={m} style={{
                    padding: "10px 12px", borderRadius: 8, background: i === 0 ? "var(--accent-dim)" : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                    color: i === 0 ? "var(--accent)" : "var(--fg-secondary)",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    transition: "all 0.2s ease",
                  }}>{m}</button>
                ))}
              </div>
            </Collapsible>

            <Collapsible title="Permissions" icon={<Icons.AlertCircle size={12} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
                {["File read", "File write", "Bash commands", "Network access", "MCP tools"].map((p, i) => (
                  <div key={p} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "var(--fg-secondary)" }}>{p}</span>
                    <div style={{
                      width: 36, height: 20, borderRadius: 10,
                      background: i < 3 ? "var(--accent)" : "var(--bg-tertiary)",
                      cursor: "pointer", padding: 2, transition: "background 0.3s ease",
                      display: "flex", alignItems: i < 3 ? "center" : "center",
                      justifyContent: i < 3 ? "flex-end" : "flex-start",
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%", background: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </Collapsible>

            <Collapsible title="Appearance" icon={<Icons.Eye size={12} />}>
              <div style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
                <button style={{
                  flex: 1, padding: "12px", borderRadius: 10,
                  background: isDark ? "var(--accent-dim)" : "var(--bg-elevated)",
                  border: "none", cursor: "pointer",
                  color: isDark ? "var(--accent)" : "var(--fg-secondary)",
                  fontSize: 12, fontWeight: 500, transition: "all 0.2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                }}>
                  <Icons.Moon size={18} />
                  Dark
                </button>
                <button style={{
                  flex: 1, padding: "12px", borderRadius: 10,
                  background: !isDark ? "var(--accent-dim)" : "var(--bg-elevated)",
                  border: "none", cursor: "pointer",
                  color: !isDark ? "var(--accent)" : "var(--fg-secondary)",
                  fontSize: 12, fontWeight: 500, transition: "all 0.2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                }}>
                  <Icons.Sun size={18} />
                  Light
                </button>
              </div>
            </Collapsible>

            <Collapsible title="Loop Settings" icon={<Icons.Loop size={12} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 12, color: "var(--fg-tertiary)", display: "block", marginBottom: 6 }}>Max iterations</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[5, 10, 25, 50, "∞"].map(n => (
                      <button key={n} style={{
                        flex: 1, padding: "8px", borderRadius: 8,
                        background: n === 25 ? "var(--accent-dim)" : "var(--bg-elevated)",
                        border: "none", cursor: "pointer",
                        color: n === 25 ? "var(--accent)" : "var(--fg-secondary)",
                        fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                        transition: "all 0.2s",
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
            </Collapsible>

            <Collapsible title="Context" icon={<Icons.Layers size={12} />}>
              <div style={{ fontSize: 12, color: "var(--fg-tertiary)", lineHeight: 1.6, paddingBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span>Token usage</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>48.2k / 200k</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-tertiary)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "24%", background: "var(--accent)", borderRadius: 2 }} />
                </div>
              </div>
            </Collapsible>
          </div>
        </div>
      )}
    </div>
  );
}
