// Visual use cases covered by the harness (ids from TESTING.md "Visual use cases").
// Each: { id, path, steps?, ready?, mask?, fixText?, settle? }.
// - steps(page, base): what a player does before the shot (login, create a party, clicks), Node built-ins only.
//   Every shot starts in a NEW browser context: a fresh player with no cookie and no localStorage.
// - ready: a JS expression that must become true before the shot.
// - fixText: { selector: text } replaced before the shot. A party's id (XXX-DDD) is drawn by the server and
//   room names must be unique on it, so the room header is pinned to a fixed name and id.
// - fixJs: JS run in the page before the shot (after fixText), for what fixText cannot pin.
// - mask: CSS selectors made invisible before the shot (layout kept).
// Pictures of the game (characters, objects, maps) live on https://sharing.hosh.it: the harness resolves
// every host but dev.localhost to nothing (visual/cdp.mjs), so they are shown broken, the same way each run.
export const WIDTHS = [1400, 1024, 390];

let seq = 0;
const ROOM_HEADER = {
  ".header-small > span.small-text:first-of-type": "Visual party",
  ".header-small b .clean-font": "[ABC-123] ",
};
const PLAYER = "Visual Alice";
// A player without a character gets one of two "?" portraits at random (CharacterMiniature.tsx,
// Math.random() > 0.5 ? whoman : who_man): both are shown as whoman.png before the shot.
const SAME_PORTRAIT = `(async () => {
  const imgs = [...document.querySelectorAll(".character-wrapper img")].filter((i) => /\\/(whoman|who_man)-[^/]*$/.test(i.src));
  if (!imgs.length) return true;
  // the hashed file name of whoman.png, read from the page's own bundle (same origin)
  const bundle = await (await fetch(document.querySelector("script[type=module][src]").src)).text();
  const m = /\\/?assets\\/whoman-[\\w-]+\\.png/.exec(bundle);
  if (!m) throw new Error("whoman.png not found in the bundle");
  const src = new URL(m[0].startsWith("/") ? m[0] : "/" + m[0], location.origin).href;
  for (const i of imgs) i.src = src;
  await Promise.all(imgs.map((i) => i.decode()));
  return true;
})()`;

const js = (v) => JSON.stringify(v);
async function must(p, expression, what) {
  if (!(await p.waitFor(expression))) throw new Error(`step failed: ${what}`);
}
async function click(p, sel, label = "") {
  await must(p, `(() => {
    const e = [...document.querySelectorAll(${js(sel)})].find((x) => x.innerText.includes(${js(label)}) && !x.disabled);
    if (!e) return false;
    e.click();
    return true;
  })()`, `click ${sel} "${label}"`);
}
// like a user: focus, select all, insertText (fires the input events React's onChange reads)
async function type(p, sel, value) {
  await must(p, `(() => { const e = document.querySelector(${js(sel)}); if (!e) return false; e.focus(); e.select(); return true; })()`, `focus ${sel}`);
  await p.send("Input.insertText", { text: value });
}
async function login(p) {
  await must(p, `location.pathname === "/new-user" && !!document.querySelector("#createuser #username")`, "login form");
  await type(p, "#username", PLAYER);
  await click(p, "#createuser button", "That's me !");
  await must(p, `location.pathname === "/choose-party" && document.body.innerText.includes("Hello ${PLAYER} !")`, "choose-party");
}
async function createParty(p, game) {
  await login(p);
  await type(p, "#roomName", `Visual party ${process.pid}-${++seq}`);
  if (game) {
    await must(p, `(() => { const s = document.querySelector("#gameType"); if (!s) return false;
      const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set;
      set.call(s, ${js(game)}); s.dispatchEvent(new Event("change", { bubbles: true })); return s.value === ${js(game)}; })()`, `game ${game}`);
  }
  await click(p, "#createroom button", "Create a party");
  await must(p, `/^\\/party\\/[A-Z]{3}-[0-9]{3}$/.test(location.pathname) && !!document.querySelector(".header-small .logout")`, "party created");
}
const inParty = (game) => async (p) => createParty(p, game);
const partyThen = (button, pathRe, game) => async (p) => {
  await createParty(p, game);
  await click(p, ".head-actions button", button);
  await must(p, `${pathRe}.test(location.pathname)`, `${button} page`);
};

export const CASES = [
  // ---------- home (logged out) ----------
  { id: "H1-new-user", path: "/", ready: `location.pathname === "/new-user" && !!document.querySelector("#createuser #username")` },
  // ---------- choose a party (logged in, no party) ----------
  { id: "C1-choose-party", path: "/", steps: login },
  {
    id: "C2-choose-party-code-typed", path: "/",
    steps: async (p) => { await login(p); await type(p, "#roomID", "abc123"); },
    ready: `document.querySelector("#roomID").value === "ABC-123" && !document.querySelector("#joinroom button").disabled`,
  },
  // ---------- inside a party (default game: La mort du mysterieux Dr Vaticant) ----------
  { id: "P1-party-inventory", path: "/", steps: inParty(), fixText: ROOM_HEADER, fixJs: SAME_PORTRAIT },
  { id: "P2-party-scenario", path: "/", steps: partyThen("Scenario", "/\\/scenario$/"), fixText: ROOM_HEADER, fixJs: SAME_PORTRAIT },
  { id: "P3-party-messagerie", path: "/", steps: partyThen("Messagerie", "/\\/events$/"), fixText: ROOM_HEADER, fixJs: SAME_PORTRAIT },
  {
    id: "P4-party-characters", path: "/", fixText: ROOM_HEADER, fixJs: SAME_PORTRAIT,
    steps: async (p) => {
      await createParty(p);
      await click(p, ".head .character .character-wrapper");
      await must(p, `/\\/characters$/.test(location.pathname)`, "characters page");
    },
  },
  {
    id: "P5-party-character-page", path: "/", fixText: ROOM_HEADER, fixJs: SAME_PORTRAIT, settle: 600,
    steps: async (p) => {
      await createParty(p);
      await click(p, ".head .character .character-wrapper");
      await must(p, `/\\/characters$/.test(location.pathname)`, "characters page");
      await click(p, ".character-list-wrapper .frame .character-wrapper");
      await must(p, `/\\/characters\\/[^/]+$/.test(location.pathname)`, "character page");
    },
  },
  // ---------- the other game ----------
  { id: "P6-tutorial-inventory", path: "/", steps: inParty("Tutorial Game"), fixText: ROOM_HEADER, fixJs: SAME_PORTRAIT },
  { id: "P7-tutorial-scenario", path: "/", steps: partyThen("Scenario", "/\\/scenario$/", "Tutorial Game"), fixText: ROOM_HEADER, fixJs: SAME_PORTRAIT },
  // /objects/<game> (printable QR sheet) and /test are not covered: no link leads to them and the server
  // redirects every unknown path to / (Back/index.ts), so a player cannot reach them today (TESTING.md).
];
