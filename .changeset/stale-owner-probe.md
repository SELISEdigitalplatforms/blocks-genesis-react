---
"@seliseblocks/genesis-os": patch
---

Stop the impersonation guards detaching a window over a stale tenant claim. The stored claim outlives the tab that wrote it -- a reload gives the same tab a new id, a closed tab never withdraws its claim, and a logout left it for the next user -- so a single tab that reloaded a project and then went back to the console, or a new user's first console visit, was told "Your session is in <project>". A stored claim now counts only for the tenant the impersonation status says the cookie is in, and only once a live tab still inside that project answers a BroadcastChannel probe; the guards hold off taking or releasing the cookie until then. Logging out clears the stored claim, and a stored console claim no longer starts a newly opened project on "Your session returned to the console".

A window now records where another tab's claim moved the shared cookie, instead of keeping its own cached status until the tab next becomes visible -- which never happens for two windows side by side. A console that had already stopped impersonation used to clear "Leave <project>" without calling stop, and then render under the project's token.

The detached state belongs to the tab, not the route, so it used to follow a navigation: a project page's "Go to console" landed on "Your session is in a project" and took a second click. The console now ignores a "returned to the console" left by a project page, and a project page ignores a console's notice naming the very project it opens.
