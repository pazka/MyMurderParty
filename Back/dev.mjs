// `npm run dev` without ts-node (TypeScript 7 ships a native tsc and no JS compiler API).
// Node built-ins only: fs.watch on the sources -> one-shot `tsc` into dist/ -> `node --watch` restarts
// the server when dist/ changes. (`tsc --watch` of TypeScript 7.0 missed edits in containers, so the
// watching is done here.) Runs from Back/ like the old `nodemon index.ts`: same cwd for .env,
// version.txt and public/. `npm run dev` compiles once before starting this script.
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';

const tscBin = fileURLToPath(new URL('./node_modules/typescript/bin/tsc', import.meta.url));
const posix = process.platform !== 'win32';
const node = (args) => spawn(process.execPath, args, { stdio: 'inherit', detached: posix });

const server = node(['--watch', 'dist/index.js']);

let compiling = null;
let again = false;
let timer = null;
const compile = () => {
  if (compiling) { again = true; return; }
  console.log('[dev] change detected, compiling...');
  compiling = node([tscBin]);
  compiling.on('exit', (code) => {
    console.log(code === 0 ? '[dev] compiled' : `[dev] tsc exited with ${code}`);
    compiling = null;
    if (again) { again = false; compile(); }
  });
};
const ignored = /^(node_modules|dist)([\\/]|$)|^\.git([\\/]|$)/;
const watcher = watch('.', { recursive: true }, (_event, file) => {
  if (!file || ignored.test(file) || !/\.(ts|js|mjs|json)$/.test(file)) return;
  clearTimeout(timer);
  timer = setTimeout(compile, 200);
});

const stop = () => {
  watcher.close();
  clearTimeout(timer);
  for (const c of [server, compiling]) {
    if (!c || c.exitCode !== null || c.signalCode !== null) continue;
    try { posix ? process.kill(-c.pid, 'SIGTERM') : c.kill(); } catch { /* already gone */ }
  }
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
server.on('exit', (code) => { stop(); process.exitCode = code ?? 0; });
