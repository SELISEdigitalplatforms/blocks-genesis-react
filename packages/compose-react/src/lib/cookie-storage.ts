export interface CookieStorageOptions {
  expires?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

export class CookieStorage {
  private decodeValue = (value: string) => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  private encodeValue = (value: string) => {
    try {
      return encodeURIComponent(value);
    } catch {
      return value;
    }
  };

  private getCookies = (): Record<string, string> => {
    if (!isBrowser()) return {};
    return document.cookie.split(";").reduce(
      (cookies, part) => {
        const [name, ...valueParts] = part.trim().split("=");
        if (!name) return cookies;
        cookies[name] = valueParts.join("=");
        return cookies;
      },
      {} as Record<string, string>,
    );
  };

  private getCookieValue = (name: string) => {
    if (!isBrowser()) return null;
    const cookies = this.getCookies();
    return cookies[name] ? cookies[name] : null;
  };

  private setCookieValue = (name: string, value: string) => {
    if (!isBrowser()) return;
    document.cookie = `${name}=${value}`;
  };

  private deleteCookieValue = (name: string) => {
    const cookies = this.getCookies();
    if (!cookies[name]) return;
    delete cookies[name];
    document.cookie = Object.entries(cookies)
      .map(([key, val]) => `${key}=${val}`)
      .join("; ");
  };

  public getItem(name: string): string {
    const rawValue = this.getCookieValue(name);
    if (!rawValue) return "";
    return this.decodeValue(rawValue);
  }
  public setItem(
    name: string,
    value: string,
    options?: CookieStorageOptions,
  ): void {
    const cookieOptions = Object.entries(options || {})
      .map(([key, val]) => {
        if (typeof val === "boolean") {
          return val ? key : "";
        }
        return `${key}=${val}`;
      })
      .filter(Boolean)
      .join("; ");
    const cookieValue = `${this.encodeValue(value)}; ${cookieOptions}`;
    this.setCookieValue(name, cookieValue);
  }

  public removeItem(name: string): void {
    this.deleteCookieValue(name);
  }
}
