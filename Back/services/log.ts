// Logging standard (pazka/hosh-management AGENTS.md section 11): stdout only, one JSON object per line with
// ts, level, service, version, event (stable snake_case name, the thing to count), msg, then the line's own
// fields. Never a session id (it is the player's login), a cookie, a room password, a player or room name,
// a socket payload, a raw path or query string, a user agent or an IP.
import crypto from 'crypto';
import { performance } from 'perf_hooks';
import { NextFunction, Request, Response } from 'express';

export const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
export type Level = keyof typeof LEVELS;
export const SERVICE = 'my-murder-party';
// a request slower than this is logged at warn
export const SLOW_MS = 1000;
// the variables the server reads: the startup line lists the ones that are set, never their values
export const CONFIG_NAMES = ['ENV', 'PORT', 'LOG_LEVEL', 'APP_LOG_LEVEL', 'APP_VERSION'];

type Fields = { [k: string]: unknown };
type Emit = (event: string, msg: string, fields?: Fields) => void;
export type Logger = { level: Level, debug: Emit, info: Emit, warn: Emit, error: Emit };

// level: debug | info | warn | error (anything else: info)
export function createLogger(level: string, out: { write: (s: string) => unknown }, version: string): Logger {
    const name: Level = level in LEVELS ? level as Level : 'info';
    const min = LEVELS[name];
    const emit = (lvl: Level): Emit => (event, msg, fields = {}) => {
        if (LEVELS[lvl] < min) return;
        out.write(JSON.stringify({
            ts: new Date().toISOString(), level: lvl, service: SERVICE, version, event, msg, ...fields,
        }) + '\n');
    };
    return { level: name, debug: emit('debug'), info: emit('info'), warn: emit('warn'), error: emit('error') };
}

// LOG_LEVEL, or APP_LOG_LEVEL (the name the box template passes), default info
export function levelFromEnv(env: NodeJS.ProcessEnv = process.env): string {
    return env.LOG_LEVEL || env.APP_LOG_LEVEL || 'info';
}

export const log = createLogger(levelFromEnv(), process.stdout, process.env.APP_VERSION || 'dev');

export function configNamesSet(env: NodeJS.ProcessEnv = process.env): string[] {
    return CONFIG_NAMES.filter(n => env[n] !== undefined && env[n] !== '');
}

// The `err` field of an error line: type, message, code, and the stack's "at ..." frames under the message.
// Each string of `hide` (a path, a request URL...) is replaced by "<hidden>".
export function errField(e: unknown, hide: string[] = []): { err: Fields } {
    const secrets = hide.filter(h => typeof h === 'string' && h.length > 1).sort((a, b) => b.length - a.length);
    const clean = (s: unknown) => secrets.reduce((t, h) => t.split(h).join('<hidden>'), String(s));
    if (e instanceof Error) {
        const type = e.name || 'Error';
        const message = clean(e.message);
        const frames = String(e.stack || '').split('\n').filter(l => /^\s+at /.test(l)).map(clean);
        const err: Fields = { type, message, stack: [`${type}: ${message}`, ...frames].join('\n') };
        const code = (e as { code?: unknown }).code;
        if (code) err.code = String(code);
        return { err };
    }
    return { err: { type: typeof e, message: clean(e) } };
}

// The edge's X-Request-Id when it is a plain token of at most 64 characters, else a new one.
export function requestId(header: string | string[] | undefined): string {
    const v = Array.isArray(header) ? header[0] : header;
    return typeof v === 'string' && /^[A-Za-z0-9._:-]{1,64}$/.test(v) ? v : crypto.randomUUID();
}

// The route template of a request: never the raw path or its query string.
// Express routes are case-insensitive with an optional trailing slash, so the template is too.
export function routeOf(url: string | undefined): string {
    const p = String(url || '').split('?')[0];
    for (const n of ['healthz', 'session', 'info', 'users', 'rooms']) if (new RegExp(`^/${n}/?$`, 'i').test(p)) return '/' + n;
    if (p === '/') return '/';
    if (/^\/assets\/[^/]+$/.test(p)) return '/assets/:file';
    if (/^\/[^/]+$/.test(p)) return '/:file';
    return '(other)';
}

const failures = new WeakMap<Response, unknown>();

// First middleware: X-Request-Id on every answer, then one line when the answer is done, only if it matters:
// a 5xx (error, with `err`), a slow answer (warn); anything else at debug; /healthz never above debug.
export function requestLogger(logger: Logger = log, now: () => number = () => performance.now()) {
    return (req: Request, res: Response, next: NextFunction) => {
        const start = now();
        const reqId = requestId(req.headers['x-request-id']);
        res.setHeader('X-Request-Id', reqId);
        const url = req.originalUrl || req.url;
        // "close" also fires when an answer is cut short, which "finish" never sees
        res.on('close', () => {
            const route = routeOf(url);
            const fields: Fields = { req_id: reqId, method: req.method, route, status: res.statusCode, dur_ms: Math.round(now() - start) };
            if (!res.writableFinished) fields.aborted = true;
            const failure = failures.get(res);
            if (route === '/healthz') logger.debug('healthz', 'healthz', fields);
            else if (res.statusCode >= 500) logger.error('request_failed', 'server error',
                failure === undefined ? fields : { ...fields, ...errField(failure, [url, url.split('?')[0]]) });
            else if ((fields.dur_ms as number) > SLOW_MS) logger.warn('request_slow', 'slow request', fields);
            else logger.debug('request', 'request', fields);
        });
        next();
    };
}

// Error middleware: remembers the error for the request line, then lets Express answer exactly as before.
export function errorRecorder(err: unknown, req: Request, res: Response, next: NextFunction) {
    failures.set(res, err);
    next(err);
}
