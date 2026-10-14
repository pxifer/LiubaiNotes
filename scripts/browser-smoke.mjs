import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const profile = path.join(root, "build", "browser-smoke-profile");
const portFile = path.join(profile, "DevToolsActivePort");
const appUrl = pathToFileURL(path.join(root, "dist", "index.html")).href;
const screenshotPath = path.join(root, "docs", "assets", "edge-main-1280x800.png");

await rm(profile, { recursive: true, force: true });
await mkdir(profile, { recursive: true });

const edge = spawn(edgePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-debugging-port=0",
  "--window-size=1280,800",
  "--force-device-scale-factor=1",
  `--user-data-dir=${profile}`,
  appUrl
], { stdio: "ignore" });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retry(action, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try { return await action(); } catch (error) { lastError = error; await delay(100); }
  }
  throw lastError || new Error("Timed out");
}

let socket;
try {
  const [port] = (await retry(() => readFile(portFile, "utf8"))).trim().split(/\r?\n/);
  const targets = await retry(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    if (!response.ok) throw new Error(`DevTools returned ${response.status}`);
    return response.json();
  });
  const page = targets.find((target) => target.type === "page" && target.url.startsWith("file:"));
  assert.ok(page, "App page was not opened by Edge");

  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let sequence = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  await retry(async () => assert.equal(await evaluate("document.readyState"), "complete"));
  await evaluate("localStorage.clear(); location.reload();");
  await retry(async () => assert.equal(await evaluate("document.readyState"), "complete"));
  await delay(100);

  await evaluate(`(() => {
    document.querySelector('#emptyNewButton').click();
    const title = document.querySelector('#titleInput');
    const body = document.querySelector('#bodyInput');
    title.value = '浏览器冒烟测试';
    body.value = '自动保存、搜索、置顶与删除';
    title.dispatchEvent(new Event('input', { bubbles: true }));
    body.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await retry(async () => assert.equal(await evaluate("!document.querySelector('#editorPanel').hidden"), true));
  await delay(400);

  const saved = await evaluate(`JSON.parse(localStorage.getItem('liubai.notes.v1'))[0]`);
  assert.equal(saved.title, "浏览器冒烟测试");
  assert.equal(saved.body, "自动保存、搜索、置顶与删除");

  const searched = await evaluate(`(() => {
    const search = document.querySelector('#searchInput');
    search.value = '不存在的关键词';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    return document.querySelector('#notesList').textContent.includes('没有找到');
  })()`);
  assert.equal(searched, true);

  const pinned = await evaluate(`(() => {
    document.querySelector('#pinButton').click();
    return JSON.parse(localStorage.getItem('liubai.notes.v1'))[0].pinned;
  })()`);
  assert.equal(pinned, true);

  await evaluate(`(() => {
    const search = document.querySelector('#searchInput');
    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
    fromSurface: true
  });
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));

  const deleted = await evaluate(`(() => {
    document.querySelector('#deleteButton').click();
    const opened = !document.querySelector('#deleteModal').hidden;
    document.querySelector('#confirmDeleteButton').click();
    return { opened, count: JSON.parse(localStorage.getItem('liubai.notes.v1')).length };
  })()`);
  assert.deepEqual(deleted, { opened: true, count: 0 });

  console.log("Browser smoke passed: create, autosave, search, pin, delete confirmation.");
} finally {
  socket?.close();
  edge.kill();
}
