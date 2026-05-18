/**
 * Cookie store.
 * @returns The cookie store instance.
 */
export function createCookieStore() {
  const isBrowser = typeof document !== "undefined";

  return {
    /**
     * Get a cookie value by name.
     * @param name - The name of the cookie to retrieve.
     * @returns The value of the cookie, or null if not found.
     */
    get(name: string): string | null {
      if (!isBrowser) return null;
      const nameEQ = `${name}=`;
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c?.charAt(0) === " ") c = c.substring(1, c.length);
        if (c?.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },

    /**
     * Set a cookie value by name.
     * @param name - The name of the cookie to set.
     * @param value - The value of the cookie to set.
     * @param days - The number of days to set the cookie to expire.
     */
    set(name: string, value: string, days?: number): void {
      if (!isBrowser) return;
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = `; expires=${date.toUTCString()}`;
      }
      document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
    },

    /**
     * Delete a cookie by name.
     * @param name - The name of the cookie to delete.
     */
    delete(name: string): void {
      if (!isBrowser) return;
      this.set(name, "", -1);
    },
  };
}
