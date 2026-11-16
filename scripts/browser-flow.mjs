// Browser test of the front's client-side navigation (react-router), CI only (never on the box).
// Drives Chrome over the DevTools protocol with Node's built-in fetch + WebSocket: no package installed
// (same approach as pazka/hosh-hub tools/interact.mjs). It pins what the built front does TODAY, so a
// react-router / React / Vite upgrade is judged on real navigation, not only on "the bundle is served".
//
//   node scripts/browser-flow.mjs <base url>      e.g. http://dev.localhost:9874/
//
// The front picks its server from window.location.hostname (Front/src/services/config.ts): any host other
// than localhost / dev.localhost means https://murder.hosh.it, i.e. production. So the image runs with
// ENV=STAGING and the page is opened on dev.localhost:9874 (the STAGING origin of both configs), and Chrome
// resolves every other host name to nothing: this test can never reach a real server.
//
// Chrome: CDP_PORT=<port> uses a Chrome already started with --remote-debugging-port (CI starts it on the
// runner and runs this script with the image's own node); otherwise it spawns $CHROME or google-chrome.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const base = (process.argv[2] || "http://dev.localhost:9874/").replace(/\/?$/, "/");
const origin = new URL(base).origin;

let chrome = null;
let port = Number(process.env.CDP_PORT || 0);
if (!port) {
  port = 9339;
  chrome = spawn(process.env.CHROME || "google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--mute-audio", "--no-first-run",
    `--remote-debugging-port=${port}`, `--user-data-dir=/tmp/mmp-cdp-${process.pid}`,
    `--host-resolver-rules=MAP dev.localhost 127.0.0.1, MAP localhost 127.0.0.1, MAP * ~NOTFOUND`,
    "about:blank",
  ], { stdio: "ignore" });
}

const results = [];
let failed = 0;
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};
const die = (msg) => { console.error(`BROWSER FLOW FAIL: ${msg}`); if (chrome) chrome.kill(); process.exit(1); };

// ---------- CDP plumbing (one browser connection, one flat session per page) ----------
let browserWs;
for (let i = 0; i < 100 && !browserWs; i++) {
  try { browserWs = (await (await fetch(`http://127.0.0.1:${port}/json/version`)).json()).webSocketDebuggerUrl; }
  catch { await sleep(200); }
}
if (!browserWs) die("Chrome did not start");
const ws = new WebSocket(browserWs);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
const pageErrors = [];
const foreign = new Set();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    const { res, rej } = pending.get(d.id);
    pending.delete(d.id);
    d.error ? rej(new Error(d.error.message)) : res(d.result);
  } else if (d.method === "Runtime.exceptionThrown") {
    pageErrors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
  } else if (d.method === "Network.requestWillBeSent") {
    const u = d.params.request.url;
    if (/^(https?|wss?):/.test(u) && new URL(u).origin !== origin) foreign.add(new URL(u).host);
  }
};
const raw = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
});

// A page in its own browser context (own cookies + localStorage = one player).
const newPlayer = async () => {
  const { browserContextId } = await raw("Target.createBrowserContext", { disposeOnDetach: true });
  const { targetId } = await raw("Target.createTarget", { url: "about:blank", browserContextId });
  const { sessionId } = await raw("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => raw(method, params, sessionId);
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(`evaluate failed: ${expression}\n${r.exceptionDetails.text}`);
    return r.result.value;
  };
  const path = () => evaluate("location.pathname");
  const waitFor = async (expression, what, ms = 10000) => {
    const end = Date.now() + ms;
    let last;
    while (Date.now() < end) {
      try { last = await evaluate(expression); if (last) return last; } catch { /* page navigating */ }
      await sleep(100);
    }
    return null;
  };
  const waitPath = async (re, ms = 10000) => {
    const ok = await waitFor(`${re}.test(location.pathname)`, String(re), ms);
    return ok ? path() : null;
  };
  const text = () => evaluate("document.body ? document.body.innerText : ''");
  const goto = async (url) => { await send("Page.navigate", { url }); await sleep(300); };
  // Click the first element matching `sel` whose text includes `label` (React listens to real clicks).
  const click = (sel, label = "") => evaluate(`(() => {
    const e = [...document.querySelectorAll(${JSON.stringify(sel)})]
      .find((x) => x.innerText.includes(${JSON.stringify(label)}) && !x.disabled);
    if (!e) return false;
    e.click();
    return true;
  })()`);
  // Type like a user: focus, select all, then insertText (fires the input events React's onChange reads).
  const type = async (sel, value) => {
    const ok = await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return false; e.focus(); e.select(); return true; })()`);
    if (!ok) return false;
    await send("Input.insertText", { text: value });
    return true;
  };
  return { send, evaluate, path, waitFor, waitPath, text, goto, click, type };
};

const ROOM = /^\/party\/[A-Z]{3}-[0-9]{3}$/;
const ROOM_NAME = `Nav party ${process.pid}`; // room names are unique on the server
try {
  // ---------- player 1: login, create a party, move around inside it ----------
  const a = await newPlayer();
  await a.goto(base);
  check("/ sends a new visitor to /new-user", (await a.waitPath(/^\/new-user$/)) === "/new-user", await a.path());
  check("home header and login form are shown",
    !!(await a.waitFor(`document.body.innerText.includes("Murder Party") && !!document.querySelector("#createuser #username")`)));
  check("new-user page text", (await a.text()).includes("Welcome ! Who are you ?"));

  await a.type("#username", "Nav Alice");
  await a.click("#createuser button", "That's me !");
  check("login -> /choose-party", (await a.waitPath(/^\/choose-party$/)) === "/choose-party", await a.path());
  check("choose-party greets the player", !!(await a.waitFor(`document.body.innerText.includes("Hello Nav Alice !")`)));
  check("join button disabled until the code is XXX-DDD",
    await a.evaluate(`document.querySelector("#joinroom button").disabled === true`));

  await a.type("#roomName", ROOM_NAME);
  await a.click("#createroom button", "Create a party");
  const room = await a.waitPath(ROOM);
  check("create a party -> /party/<XXX-DDD>", !!room, await a.path());
  if (!room) throw new Error("no party created, the rest of the flow depends on it");
  const roomId = room.split("/")[2];
  check("room header shows the room name and [id]",
    !!(await a.waitFor(`document.querySelector(".header-small") && document.querySelector(".header-small").innerText.includes(${JSON.stringify(ROOM_NAME)}) && document.querySelector(".header-small").innerText.includes("[${roomId}]")`)));
  check("party page: no Inventaire button on the inventory itself",
    !(await a.evaluate(`[...document.querySelectorAll(".head-actions button")].some((b) => b.innerText.includes("Inventaire"))`)));

  await a.click(".head-actions button", "Scenario");
  check("Scenario -> /party/<id>/scenario", (await a.waitPath(/\/scenario$/)) === `/party/${roomId}/scenario`, await a.path());
  check("Inventaire button appears on a sub page",
    !!(await a.waitFor(`[...document.querySelectorAll(".head-actions button")].some((b) => b.innerText.includes("Inventaire"))`)));

  await a.click(".head-actions button", "Messagerie");
  check("Messagerie from a sub page -> /party/<id>/events (relative to the party, not to the sub page)",
    (await a.waitPath(/\/events$/)) === `/party/${roomId}/events`, await a.path());

  await a.click(".head-actions button", "Inventaire");
  check("Inventaire -> back to /party/<id>", (await a.waitPath(ROOM)) === `/party/${roomId}`, await a.path());

  await a.click(".head .character .character-wrapper", "");
  check("character miniature -> /party/<id>/characters",
    (await a.waitPath(/\/characters$/)) === `/party/${roomId}/characters`, await a.path());

  // browser history (back / forward) walks the same entries
  await a.evaluate("history.back()");
  check("back -> /party/<id>", (await a.waitPath(ROOM)) === `/party/${roomId}`, await a.path());
  await a.evaluate("history.back()");
  check("back -> /party/<id>/events", (await a.waitPath(/\/events$/)) === `/party/${roomId}/events`, await a.path());
  await a.evaluate("history.back()");
  check("back -> /party/<id>/scenario", (await a.waitPath(/\/scenario$/)) === `/party/${roomId}/scenario`, await a.path());
  await a.evaluate("history.forward()");
  check("forward -> /party/<id>/events", (await a.waitPath(/\/events$/)) === `/party/${roomId}/events`, await a.path());
  check("still in the party after history moves", (await a.text()).includes(`[${roomId}]`));

  // a full reload of a deep link: the player stays in the party, but lands on its inventory
  // (PartyRoom sends to / while the stored room loads, / sends back to /party/<id>)
  await a.send("Page.reload", {});
  await sleep(1500);
  check("reload of /party/<id>/events -> /party/<id> (same party)", (await a.waitPath(ROOM)) === `/party/${roomId}`, await a.path());
  check("room header back after reload", !!(await a.waitFor(`document.body.innerText.includes("[${roomId}]")`)));

  // ---------- player 2: login, join the party by its code ----------
  const b = await newPlayer();
  await b.goto(base);
  check("player 2: / -> /new-user", (await b.waitPath(/^\/new-user$/)) === "/new-user", await b.path());
  await b.type("#username", "Nav Bob");
  await b.click("#createuser button", "That's me !");
  check("player 2: login -> /choose-party", (await b.waitPath(/^\/choose-party$/)) === "/choose-party", await b.path());
  await b.waitFor(`!!document.querySelector("#roomID")`);
  await b.type("#roomID", roomId.replace("-", "").toLowerCase());
  check("room code input formats to XXX-DDD", (await b.evaluate(`document.querySelector("#roomID").value`)) === roomId);
  await b.click("#joinroom button", "Join a party");
  check("player 2: join by code -> /party/<id>", (await b.waitPath(ROOM)) === `/party/${roomId}`, await b.path());
  check("player 2 sees the same room header", !!(await b.waitFor(`document.body.innerText.includes("[${roomId}]") && document.body.innerText.includes(${JSON.stringify(ROOM_NAME)})`)));

  // ---------- logout from the room header ----------
  await a.click(".header-small button.logout", "Logout");
  check("logout -> /new-user", (await a.waitPath(/^\/new-user$/)) === "/new-user", await a.path());
  check("logged out: login form again", !!(await a.waitFor(`!!document.querySelector("#createuser #username")`)));

} catch (e) {
  check("browser flow ran to the end", false, e.message);
}

check("no uncaught page error", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
// Other origins (the game's pictures on sharing.hosh.it) resolve to nothing on purpose; list them for the log.
console.log(`foreign hosts requested (resolved to nothing): ${[...foreign].sort().join(", ") || "none"}`);
console.log(`${results.length - failed}/${results.length} browser checks passed`);
if (chrome) chrome.kill();
ws.close();
process.exit(failed ? 1 : 0);
