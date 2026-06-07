/**
 * Simple cookie storage implementation
 */
export class CookieStore {
  set(key: string, value: string, options?: { maxAge?: number; path?: string }): void {
    let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

    if (options?.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options?.path) {
      cookieString += `; path=${options.path}`;
    }

    document.cookie = cookieString;
  }

  get(key: string): string | null {
    const name = `${encodeURIComponent(key)}=`;
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name)) {
        return decodeURIComponent(cookie.substring(name.length));
      }
    }

    return null;
  }

  delete(key: string): void {
    this.set(key, "", { maxAge: 0 });
  }
}

export function createCookieStore(): CookieStore {
  return new CookieStore();
}
