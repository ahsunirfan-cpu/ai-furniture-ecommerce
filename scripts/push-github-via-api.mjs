#!/usr/bin/env node
/**
 * One-shot push of current repo to an empty GitHub repo via Git Data API.
 * Requires GH_TOKEN with repo scope.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const owner = process.env.GITHUB_OWNER || "ahsunirfan-cpu";
const repo = process.env.GITHUB_REPO || "ai-furniture-ecommerce";
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

if (!token?.trim()) {
  console.error("Missing GH_TOKEN or GITHUB_TOKEN");
  process.exit(1);
}

const api = (path, opts = {}) =>
  fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.headers || {}),
    },
  });

const files = execSync("git ls-files -z", { encoding: "buffer" })
  .toString()
  .split("\0")
  .filter(Boolean);

async function createBlob(path) {
  const content = readFileSync(path);
  const res = await api(`/repos/${owner}/${repo}/git/blobs`, {
    method: "POST",
    body: JSON.stringify({
      content: content.toString("base64"),
      encoding: "base64",
    }),
  });
  if (!res.ok) {
    throw new Error(`blob ${path}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return { path, mode: "100644", type: "blob", sha: json.sha };
}

async function main() {
  console.log(`Pushing ${files.length} files to ${owner}/${repo}...`);
  const tree = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    tree.push(await createBlob(f));
    if ((i + 1) % 20 === 0) console.log(`  blobs ${i + 1}/${files.length}`);
  }

  const treeRes = await api(`/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ tree }),
  });
  if (!treeRes.ok) throw new Error(`tree: ${treeRes.status} ${await treeRes.text()}`);
  const { sha: treeSha } = await treeRes.json();

  const headRes = await api(`/repos/${owner}/${repo}/git/ref/heads/main`);
  const parent =
    headRes.status === 200 ? (await headRes.json()).object.sha : undefined;

  const commitRes = await api(`/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({
      message: "RoomCraft client demo — full source from Cursor Origin",
      tree: treeSha,
      parents: parent ? [parent] : [],
    }),
  });
  if (!commitRes.ok)
    throw new Error(`commit: ${commitRes.status} ${await commitRes.text()}`);
  const { sha: commitSha } = await commitRes.json();

  const refRes = parent
    ? await api(`/repos/${owner}/${repo}/git/refs/heads/main`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commitSha, force: true }),
      })
    : await api(`/repos/${owner}/${repo}/git/refs`, {
        method: "POST",
        body: JSON.stringify({ ref: "refs/heads/main", sha: commitSha }),
      });
  if (!refRes.ok) throw new Error(`ref: ${refRes.status} ${await refRes.text()}`);

  console.log(`Done. commit ${commitSha.slice(0, 7)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});