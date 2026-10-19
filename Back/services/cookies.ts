import { parseCookie } from 'cookie';

// Cookie header parsing as cookie 0.5 did it, on cookie >= 2 (which no longer strips quotes):
// a value starting with a double quote loses its first and last character, then is URL-decoded if it has a '%'.
const decode = (value: string): string => {
    const v = value.charCodeAt(0) === 0x22 ? value.slice(1, -1) : value;
    if (v.indexOf('%') === -1) return v;
    try {
        return decodeURIComponent(v);
    } catch {
        return v;
    }
};

// Typed like cookie 0.5: a missing cookie is undefined at runtime, as it always was.
export const parseCookies = (header: string | undefined): Record<string, string> =>
    parseCookie(header ?? '', { decode }) as Record<string, string>;
