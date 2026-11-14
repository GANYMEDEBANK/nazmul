const API = "https://api.github.com";

export class GitHubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function validRepo(repo: string): boolean {
  return /^[\w.-]+\/[\w.-]+$/.test(repo);
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function call(token: string, path: string, init?: RequestInit) {
  const response = await fetch(API + path, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!response.ok) {
    let message = response.statusText;
    try {
      message = (await response.json()).message || message;
    } catch {}
    throw new GitHubError(response.status, message);
  }
  return response.json();
}

export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function fromBase64(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export async function checkAccess(token: string, repo: string): Promise<string> {
  const user = await call(token, "/user");
  const info = await call(token, `/repos/${repo}`);
  if (!info.permissions || !info.permissions.push) {
    throw new GitHubError(403, "This token cannot write to the repository.");
  }
  return user.login as string;
}

export async function readFile(token: string, repo: string, branch: string, path: string) {
  try {
    const file = await call(token, `/repos/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`);
    return { sha: file.sha as string, text: fromBase64(file.content as string) };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

export async function writeFile(
  token: string,
  repo: string,
  branch: string,
  path: string,
  base64: string,
  message: string,
  sha?: string,
): Promise<string> {
  const result = await call(token, `/repos/${repo}/contents/${encodePath(path)}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: base64, branch, ...(sha ? { sha } : {}) }),
  });
  return result.content.sha as string;
}
