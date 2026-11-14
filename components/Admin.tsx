"use client";

import { useEffect, useRef, useState } from "react";
import { GitHubError, checkAccess, readFile, toBase64, validRepo, writeFile } from "@/lib/github";
import { schema, type Field, type SectionSchema } from "@/lib/schema";

type Row = Record<string, unknown>;
type Data = Record<string, Row | Row[]>;
type Session = { token: string; repo: string; branch: string; login: string };

const CONTENT_PATH = "content/site.json";
const STORE_KEY = "admin-session";
const MAX_UPLOAD = 5 * 1024 * 1024;
const IDLE_LIMIT = 30 * 60 * 1000;
const envRepo = process.env.NEXT_PUBLIC_REPO || "";
const envBranch = process.env.NEXT_PUBLIC_BRANCH || "main";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const previews = new Map<string, string>();

type Upload = (file: File, stem: string) => Promise<string | null>;

function explain(error: unknown): string {
  if (error instanceof GitHubError) {
    if (error.status === 401) return "GitHub rejected the token. Check that it is correct and not expired.";
    if (error.status === 403) return `Access denied. ${error.message}`;
    if (error.status === 404) return "Repository not found, or the token has no access to it.";
    if (error.status === 409 || error.status === 422) return "The file changed on GitHub since you loaded it. Reload, then make your edit again.";
    return `GitHub error ${error.status}: ${error.message}`;
  }
  return "Could not reach GitHub. Check your connection.";
}

function FieldInput({
  field,
  value,
  onChange,
  onUpload,
  stem,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  onUpload: Upload;
  stem: string;
}) {
  const id = useRef(`f-${Math.random().toString(36).slice(2)}`).current;
  if (field.type === "image") {
    const path = String(value ?? "");
    return (
      <div className="field">
        <label htmlFor={id}>{field.label}</label>
        {path && (
          <div className="image-row">
            <img
              className="thumb"
              src={previews.get(path) || base + path}
              alt=""
              onError={(e) => (e.currentTarget.style.visibility = "hidden")}
            />
            <code>{path}</code>
            <button type="button" className="btn small danger" onClick={() => onChange("")}>
              Remove
            </button>
          </div>
        )}
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const uploaded = await onUpload(file, stem);
            if (uploaded) onChange(uploaded);
          }}
        />
        {field.hint && <p className="hint">{field.hint}</p>}
      </div>
    );
  }
  const text = field.type === "lines" ? (Array.isArray(value) ? value.join("\n") : "") : String(value ?? "");
  const update = (raw: string) => onChange(field.type === "lines" ? raw.split("\n") : raw);
  return (
    <div className="field">
      <label htmlFor={id}>{field.label}</label>
      {field.type === "area" || field.type === "lines" ? (
        <textarea id={id} rows={field.type === "lines" ? 5 : 3} value={text} onChange={(e) => update(e.target.value)} />
      ) : (
        <input id={id} type="text" value={text} onChange={(e) => update(e.target.value)} />
      )}
      {field.hint && <p className="hint">{field.hint}</p>}
    </div>
  );
}

function ListEditor({
  section,
  rows,
  onChange,
  onUpload,
}: {
  section: SectionSchema;
  rows: Row[];
  onChange: (rows: Row[]) => void;
  onUpload: Upload;
}) {
  const [open, setOpen] = useState<number | null>(null);

  function add() {
    const blank: Row = {};
    section.fields.forEach((f) => (blank[f.key] = f.type === "lines" ? [] : ""));
    onChange([blank, ...rows]);
    setOpen(0);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
    setOpen(to);
  }

  function remove(index: number) {
    onChange(rows.filter((_, i) => i !== index));
    setOpen(null);
  }

  return (
    <div>
      <button type="button" className="btn" onClick={add}>
        Add new
      </button>
      <ul className="rows">
        {rows.map((row, i) => (
          <li key={i} className="row">
            <div className="row-head">
              <button type="button" className="row-title" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {String(row[section.titleKey || ""] || "Untitled")}
              </button>
              <button type="button" className="btn small" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button type="button" className="btn small" onClick={() => move(i, i + 1)} disabled={i === rows.length - 1} aria-label="Move down">
                ↓
              </button>
              <button type="button" className="btn small danger" onClick={() => remove(i)}>
                Delete
              </button>
            </div>
            {open === i && (
              <div className="row-body">
                {section.fields.map((field) => (
                  <FieldInput
                    key={field.key}
                    field={field}
                    value={row[field.key]}
                    onUpload={onUpload}
                    stem={section.key}
                    onChange={(v) => onChange(rows.map((r, j) => (j === i ? { ...r, [field.key]: v } : r)))}
                  />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState(envRepo);
  const [keep, setKeep] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [sha, setSha] = useState("");
  const [active, setActive] = useState(schema[0].key);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string; keep?: boolean } | null>(null);

  async function load(next: Session) {
    const file = await readFile(next.token, next.repo, next.branch, CONTENT_PATH);
    if (!file) throw new GitHubError(404, "content/site.json is missing.");
    setData(JSON.parse(file.text));
    setSha(file.sha);
    setDirty(false);
  }

  async function signIn(nextToken: string, nextRepo: string, remember: boolean) {
    setBusy(true);
    setNotice(null);
    try {
      if (!validRepo(nextRepo)) throw new GitHubError(404, "Use the form owner/repository.");
      const login = await checkAccess(nextToken, nextRepo);
      const next = { token: nextToken, repo: nextRepo, branch: envBranch, login };
      await load(next);
      setSession(next);
      setToken("");
      if (remember) {
        try {
          sessionStorage.setItem(STORE_KEY, JSON.stringify({ token: nextToken, repo: nextRepo }));
        } catch {}
      }
    } catch (error) {
      setNotice({ kind: "error", text: explain(error) });
      try {
        sessionStorage.removeItem(STORE_KEY);
      } catch {}
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {}
    setSession(null);
    setData(null);
    setDirty(false);
    setNotice(null);
  }

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        signIn(parsed.token, parsed.repo, true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!session) return;
    let timer = window.setTimeout(signOut, IDLE_LIMIT);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(signOut, IDLE_LIMIT);
    };
    window.addEventListener("keydown", reset);
    window.addEventListener("pointerdown", reset);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("pointerdown", reset);
    };
  }, [session]);

  function change(key: string, value: Row | Row[]) {
    setData((current) => (current ? { ...current, [key]: value } : current));
    setDirty(true);
    setNotice((current) => (current?.keep ? current : null));
  }

  async function save() {
    if (!session || !data) return;
    setBusy(true);
    setNotice(null);
    try {
      const text = JSON.stringify(data, null, 2) + "\n";
      const nextSha = await writeFile(session.token, session.repo, session.branch, CONTENT_PATH, toBase64(text), "Update site content from admin", sha);
      setSha(nextSha);
      setDirty(false);
      setNotice({ kind: "ok", text: "Saved. The public site updates in about two minutes." });
    } catch (error) {
      setNotice({ kind: "error", text: explain(error) });
    } finally {
      setBusy(false);
    }
  }

  async function reload() {
    if (!session) return;
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setBusy(true);
    setNotice(null);
    try {
      await load(session);
    } catch (error) {
      setNotice({ kind: "error", text: explain(error) });
    } finally {
      setBusy(false);
    }
  }

  async function putFile(file: File, name: string): Promise<string | null> {
    if (!session) return null;
    if (file.size > MAX_UPLOAD) {
      setNotice({ kind: "error", text: "The file is larger than 5 MB." });
      return null;
    }
    setBusy(true);
    setNotice(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      const path = `public/uploads/${name}`;
      const existing = await readFile(session.token, session.repo, session.branch, path).catch(() => null);
      await writeFile(session.token, session.repo, session.branch, path, btoa(binary), `Upload ${name} from admin`, existing?.sha);
      setNotice({ kind: "ok", text: "Uploaded. Now press Save and publish.", keep: true });
      return `/uploads/${name}`;
    } catch (error) {
      setNotice({ kind: "error", text: explain(error) });
      return null;
    } finally {
      setBusy(false);
    }
  }

  const uploadImage: Upload = async (file, stem) => {
    const extension = IMAGE_TYPES[file.type];
    if (!extension) {
      setNotice({ kind: "error", text: "The image must be a JPG, PNG or WebP file." });
      return null;
    }
    const uploaded = await putFile(file, `${stem}-${Date.now()}.${extension}`);
    if (uploaded) previews.set(uploaded, URL.createObjectURL(file));
    return uploaded;
  };

  async function uploadCv(file: File | undefined) {
    if (!data || !file) return;
    if (file.type !== "application/pdf") {
      setNotice({ kind: "error", text: "The CV must be a PDF." });
      return;
    }
    const uploaded = await putFile(file, "cv.pdf");
    if (uploaded) change("profile", { ...(data.profile as Row), cv: uploaded });
  }

  if (!session || !data) {
    return (
      <main className="admin-login">
        <form
          className="panel"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            signIn(token.trim(), repo.trim(), keep);
          }}
        >
          <h1>Site admin</h1>
          <p className="hint">Sign in with a GitHub access token that can write to this site's repository. The token is sent only to GitHub.</p>
          {!envRepo && (
            <div className="field">
              <label htmlFor="repo">Repository</label>
              <input id="repo" type="text" placeholder="owner/repository" value={repo} onChange={(e) => setRepo(e.target.value)} required />
            </div>
          )}
          <div className="field">
            <label htmlFor="token">Access token</label>
            <input id="token" type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" spellCheck={false} required />
          </div>
          <label className="check">
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
            Keep me signed in until I close this tab
          </label>
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? "Checking…" : "Sign in"}
          </button>
          {notice && (
            <p className={`notice ${notice.kind}`} role="alert">
              {notice.text}
            </p>
          )}
          <a className="back" href={`${base}/`}>
            Back to site
          </a>
        </form>
      </main>
    );
  }

  const section = schema.find((s) => s.key === active) as SectionSchema;
  const value = data[section.key];

  return (
    <div className="admin">
      <header className="admin-bar">
        <strong>Site admin</strong>
        <span className="who">
          {session.login} · {session.repo}
        </span>
        <span className="grow" />
        {dirty && <span className="unsaved">Unsaved changes</span>}
        <button type="button" className="btn" onClick={reload} disabled={busy}>
          Reload
        </button>
        <button type="button" className="btn primary" onClick={save} disabled={busy || !dirty}>
          {busy ? "Working…" : "Save and publish"}
        </button>
        <button type="button" className="btn" onClick={signOut}>
          Sign out
        </button>
      </header>
      {notice && (
        <p className={`notice ${notice.kind}`} role="status">
          {notice.text}{" "}
          {notice.kind === "ok" && !notice.keep && (
            <a href={`https://github.com/${session.repo}/actions`} target="_blank" rel="noopener noreferrer">
              See build progress
            </a>
          )}
        </p>
      )}
      <div className="admin-body">
        <nav className="tabs" aria-label="Content sections">
          {schema.map((s) => (
            <button key={s.key} type="button" className={s.key === active ? "tab on" : "tab"} onClick={() => setActive(s.key)}>
              {s.label}
            </button>
          ))}
        </nav>
        <section className="panel">
          <h1>{section.label}</h1>
          {section.kind === "object" ? (
            <>
              {section.fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={(value as Row)?.[field.key]}
                  onUpload={uploadImage}
                  stem={section.key}
                  onChange={(v) => change(section.key, { ...(value as Row), [field.key]: v })}
                />
              ))}
              {section.key === "profile" && (
                <div className="uploads">
                  <div className="field">
                    <label htmlFor="up-cv">Upload CV (PDF, up to 5 MB)</label>
                    <input id="up-cv" type="file" accept="application/pdf" disabled={busy} onChange={(e) => uploadCv(e.target.files?.[0])} />
                    <p className="hint">The uploaded CV is public. Remove anything private from it first.</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <ListEditor key={section.key} section={section} rows={(value as Row[]) || []} onChange={(rows) => change(section.key, rows)} onUpload={uploadImage} />
          )}
        </section>
      </div>
    </div>
  );
}
