# Migration Guide: React 19 + React Router 8

This guide covers upgrading a Blocks application to the React 19 release line of the
shared app-shell package. Every issue documented here was encountered during a real
migration of a downstream application; nothing in it is hypothetical.

Budget half a day for an application of moderate size. The bulk of the work is
mechanical, but three of the failure modes are silent — they compile, they build, and
some of them keep tests green while changing runtime behaviour. Those are called out
explicitly.

---

## 1. What changed in the package

The peer dependency contract changed. These are hard requirements — your application
must satisfy them or the install will fail.

| Peer               | Before                 | After     |
| ------------------ | ---------------------- | --------- |
| `react`            | `^18.3.1 \|\| ^19.0.0` | `^19.2.8` |
| `react-dom`        | `^18.3.1 \|\| ^19.0.0` | `^19.2.8` |
| `@types/react`     | `>=18.3.31`            | `^19.2.8` |
| `react-router-dom` | `^7.0.0`               | _removed_ |
| `react-router`     | —                      | `^8.0.0`  |
| `nuqs`             | `^2.0.0`               | `^2.9.0`  |

`@tanstack/react-query` (`^5`) and `zustand` (`^5`) are unchanged.

### Why the router changed

`react-router-dom` is frozen at 7.18.1 and never received a v8 — the ecosystem moved to
importing from `react-router` directly. More importantly, **every `react-router` release
in the 7.x line is affected by GHSA-qwww-vcr4-c8h2** (RSC-mode CSRF bypass, high
severity, runtime scope), which is patched only in `react-router@8.3.0`. There is no fix
available on the 7.x line.

If your repository has a Dependabot alert for `react-router`, this migration is what
clears it.

### Package name

During the validation phase the package publishes as `@seliseblocks/blocks-kit` under the
`next` dist-tag. It will be renamed to `@seliseblocks/genesis-os` for the stable release.
Install accordingly:

```bash
# validation phase
npm i @seliseblocks/blocks-kit@next

# after the stable release
npm i @seliseblocks/genesis-os
```

The exported API is identical across the rename — only the package specifier and import
paths change.

---

## 2. Before you start

Check these first; two of them will stop you cold.

```bash
node --version                    # react-router 8 requires >= 22.22.0
grep -rc 'react-router-dom' src   # scale of the import rewrite
grep -rc 'defaultProps' src       # silent React 19 breakage, see §5.1
```

**Node 22.22.0 or newer.** `react-router@8` declares `engines: { node: ">=22.22.0" }`.
npm warns rather than fails, and builds will succeed on older Node — but you are outside
the supported range. Update your CI images and `Dockerfile` at the same time, not later.

**Vite 7 is _not_ required** unless you use React Router framework mode
(`@react-router/dev`). Applications using library mode — `createBrowserRouter` with no
`@react-router/*` packages — work fine on Vite 6. Verify with
`ls node_modules/@react-router 2>/dev/null`.

Commit or stash your work first. Step 3 regenerates your lockfile.

---

## 3. Dependencies

### 3.1 Expect npm to deadlock

Running the obvious command will fail:

```
npm error ERESOLVE could not resolve
npm error Found: @seliseblocks/blocks-kit@0.0.69
npm error Conflicting peer dependency: react@19.2.8
```

The error is circular and unhelpful. The cause is that npm cannot reconcile a React major
version bump against the versions already pinned in `package-lock.json`. Incremental
`npm i` will not get you out of it.

**Do this instead.** Edit `package.json` directly, then regenerate:

```json
{
  "dependencies": {
    "@seliseblocks/blocks-kit": "0.0.71",
    "nuqs": "^2.9.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router": "^8.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0"
  }
}
```

`react-router` replaces `react-router-dom` — delete the old entry entirely. Substitute
`@seliseblocks/genesis-os` for `@seliseblocks/blocks-kit` once the stable release is out.
Then:

```bash
rm -rf node_modules package-lock.json
npm install
```

Your lockfile is in version control, so this is recoverable with
`git checkout package-lock.json` if you need to back out.

### 3.2 Do not write `^19.2.8` for the type packages

`@types/react-dom` has no 19.2.8 release — its latest is 19.2.3. Setting `^19.2.8` makes
the range unsatisfiable and the install fails outright.

DefinitelyTyped versions independently of React. At time of writing `@types/react` is at
19.2.17 (ahead of React) while `@types/react-dom` is at 19.2.3 (behind it). The shared
`19.2` prefix is coincidence, not correspondence.

Use `^19.2.0` for both and let them float.

### 3.3 Find packages that block React 19

Some dependencies declare React 18-only peers and will fail the install. Find them all at
once rather than discovering them one error at a time:

```bash
node -e "
const fs=require('fs'),path=require('path'),semver=require('semver');
const blockers=[];
(function scan(dir,prefix=''){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    if(!e.isDirectory())continue;
    if(e.name.startsWith('@')){scan(path.join(dir,e.name),e.name+'/');continue;}
    const pj=path.join(dir,e.name,'package.json');
    if(!fs.existsSync(pj))continue;
    try{
      const p=JSON.parse(fs.readFileSync(pj,'utf8'));
      const pr=p.peerDependencies&&p.peerDependencies.react;
      if(pr&&!semver.satisfies('19.2.8',pr))
        blockers.push(prefix+e.name+'@'+p.version+'  needs react '+pr);
    }catch{}
  }
})('node_modules');
console.log(blockers.sort().join('\n')||'none');
"
```

Two common offenders, both of which have patch-level escapes requiring **no API
migration**:

| Package            | Blocked at | Bump to  | Notes                          |
| ------------------ | ---------- | -------- | ------------------------------ |
| `cmdk`             | `1.0.0`    | `1.0.4`  | patch; adds `^19` to peers     |
| `react-day-picker` | `8.10.1`   | `8.10.2` | patch; adds `^19.0.0` to peers |

Do not jump `react-day-picker` to v9 or v10 — those carry a real API migration you do not
need. The 8.10.2 patch is sufficient.

### 3.4 Packages that declare no React peer

The scan above only finds packages that declare an _incompatible_ peer. Packages that
declare none are invisible to it and are unverified against React 19. Check for them:

```bash
node -e "
const fs=require('fs'),path=require('path');
const deps=Object.keys(require('./package.json').dependencies);
for(const d of deps){
  try{
    const p=JSON.parse(fs.readFileSync(path.join('node_modules',d,'package.json'),'utf8'));
    if(!(p.peerDependencies&&p.peerDependencies.react)&&!(p.dependencies&&p.dependencies.react))
      if(/react|ui|dropzone|otp|markdown|qr|sonner|vaul|motion|editor|captcha/i.test(d))
        console.log('  '+d+'@'+p.version);
  }catch{}
}"
```

These need manual testing in the browser. Deprecated or unmaintained packages that
manipulate the DOM directly are the highest risk.

---

## 4. Router migration

### 4.1 Rewrite the imports

Every symbol you import keeps its name — `Link`, `Navigate`, `Outlet`, `Route`, `Routes`,
`MemoryRouter`, `createBrowserRouter`, `useLocation`, `useNavigate`, `useParams`,
`useSearchParams`. Only the module specifier changes.

```bash
grep -rl 'react-router-dom' src | xargs sed -i 's|react-router-dom|react-router|g'
```

Use the bare string `react-router-dom`, not `from "react-router-dom"`. The latter misses
test mocks and type-position imports — see §4.3.

### 4.2 `RouterProvider` is the exception — and it fails silently

**This is the most dangerous step in the migration.**

`RouterProvider` must be imported from `react-router/dom`, not `react-router`. Both
modules export something called `RouterProvider`, but they are different functions:

```js
require("react-router").RouterProvider === require("react-router/dom").RouterProvider;
// false
```

The DOM variant carries browser-specific behaviour (View Transitions support,
`flushSync` handling around navigation). The signatures are identical, so **TypeScript,
your build, and your tests will all pass on the wrong one.** The only symptom is subtly
degraded navigation behaviour at runtime.

A blanket `sed` will get this wrong. Fix it afterwards:

```diff
- import { RouterProvider } from "react-router";
+ import { RouterProvider } from "react-router/dom";
```

The same applies to `HydratedRouter` if you use server rendering. Everything else stays on
`react-router`. Verify with:

```bash
grep -rn 'RouterProvider\|HydratedRouter' src
```

### 4.3 Test mocks must be rewritten too

Mocks reference the module by string. If the source imports `react-router` but the mock
targets `react-router-dom`, **the mock silently stops intercepting** — the test keeps
passing while exercising the real router instead of your fixture. Nothing fails; you just
lose the coverage.

Three patterns to catch, all handled by the bare-string `sed` in §4.1:

```ts
vi.mock("react-router-dom", ...)
await importOriginal<typeof import("react-router-dom")>()
await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
```

Confirm none survive:

```bash
grep -rn 'react-router-dom' src   # expect zero results
```

### 4.4 nuqs adapter

If you use nuqs for URL query state, the adapter import must move to the v8 entry point:

```diff
- import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
+ import { NuqsAdapter } from "nuqs/adapters/react-router/v8";
```

This is why the `nuqs` peer floor moved to `^2.9.0` — earlier 2.x releases declare no
`react-router@8` support and ship no `v8` adapter. Applications on nuqs 2.8.x will
resolve but are running an unsupported combination.

---

## 5. React 19 source changes

### 5.1 `defaultProps` — silent, no error anywhere

React 19 removed `defaultProps` for function components. It is **silently ignored** — no
warning, no type error, no test failure. The component simply renders with undefined props
where it previously had defaults.

```bash
grep -rn 'defaultProps' src
```

Move each one to destructuring defaults:

```diff
  const Stepper = React.forwardRef((props, ref) => {
    const {
-     orientation: orientationProp,
-     responsive,
-     size,
+     orientation: orientationProp = "horizontal",
+     responsive = true,
+     size = "md",
      ...rest
    } = props;

- Stepper.defaultProps = {
-   size: "md",
-   orientation: "horizontal",
-   responsive: true,
- };
```

Class components are unaffected and keep `defaultProps`.

### 5.2 `useRef()` now requires an argument

```diff
- const ref = useRef<T>();
+ const ref = useRef<T | undefined>(undefined);
```

The error is `TS2554: Expected 1 arguments, but got 0`.

### 5.3 `useRef<T>(null)` returns `RefObject<T | null>`

The returned type now includes `null`, which breaks explicit annotations that omit it:

```diff
  type UseCaptchaReturn = {
-   ref: React.RefObject<CaptchaRef>;
+   ref: React.RefObject<CaptchaRef | null>;
  };
```

The error is `Type 'RefObject<T | null>' is not assignable to type 'RefObject<T>'`.

### 5.4 `ReactElement` props default to `unknown`

Element introspection needs an explicit type argument:

```diff
- if (!React.isValidElement(node)) return null;
+ if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return null;
  return React.Children.map(node.props.children, (c) => c);
```

The error is `TS18046: 'node.props' is of type 'unknown'`.

### 5.5 Error handling changed behaviour

Errors thrown during render are **no longer re-thrown**. Uncaught errors go to
`window.reportError`; caught errors go to `console.error`. `createRoot` and `hydrateRoot`
accept `onUncaughtError` and `onCaughtError` callbacks.

Nothing in your code will error on this. But if you have error monitoring wired to
`window.onerror`, or an error boundary that depended on the re-throw, **it may stop
reporting**. Review your `createRoot` setup and confirm your monitoring still fires.

### 5.6 Full removal checklist

Sweep for the rest. All of these should return zero:

```bash
for p in propTypes findDOMNode 'ReactDOM\.render' 'ReactDOM\.hydrate' \
         unmountComponentAtNode contextTypes getChildContext createFactory \
         'react-dom/test-utils' react-test-renderer 'namespace JSX' \
         'useReducer<' unstable_flushControlled unstable_createEventHandle \
         unstable_renderSubtreeIntoContainer; do
  printf "%-38s %s\n" "$p" "$(grep -rnE "$p" src 2>/dev/null | wc -l)"
done
```

Also check for string refs (`ref="name"`, removed) and ref callbacks with implicit returns
(`ref={el => (x = el)}`, now a type error — wrap the body in braces).

---

## 6. Verification

### 6.1 `tsc --noEmit` is not sufficient

If your `build` script runs `tsc -b`, it uses your project references and their
`tsconfig.app.json` / `tsconfig.node.json` settings — which are stricter than the root
config `tsc --noEmit` reads. A migration can pass `type-check` and still fail `build`.

Every React 19 type error in §5.2–5.4 was invisible to `tsc --noEmit` and only appeared
under `tsc -b`. **Always run the real build.**

```bash
npm run type-check
npm run build      # the one that matters
```

### 6.2 Establish a lint baseline before blaming yourself

If your project uses `eslint-plugin-react-hooks` v6 or v7, you likely have pre-existing
errors from its React Compiler rules (`immutability`, `set-state-in-effect`, `refs`,
`preserve-manual-memoization`). These are unrelated to the migration but will appear in
your output and look alarming.

Prove what is yours by stashing only your source changes — `node_modules` stays identical,
so it is a clean comparison:

```bash
npm run lint 2>&1 | tail -3        # after
git stash push -- src/
npm run lint 2>&1 | tail -3        # before
git stash pop
```

Identical counts mean the migration introduced nothing.

Worth knowing: those Compiler rules flag exactly the patterns React 19's stricter
StrictMode double-invocation is most likely to surface at runtime. They were latent under
React 18. Fixing them is separate work, but they are not noise.

### 6.3 Confirm the advisory cleared

```bash
npm audit --json | node -e "
let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{
const v=Object.keys(JSON.parse(s).vulnerabilities||{});
console.log('react-router present?', v.includes('react-router')?'YES — not fixed':'NO — cleared');
});"
```

Remaining advisories are typically the `brace-expansion` / `minimatch` chain reached
through ESLint. Those are development-scope and unrelated to this migration; see §7.

### 6.4 Manual testing

Automated checks cannot catch §4.2 or §5.1. Click through, in priority order:

1. **Authentication and protected routes** — login, callback, guards, redirects
2. **Any rich editor or third-party DOM widget** — especially packages from §3.4
3. **Pages with URL query state** — the nuqs v8 adapter
4. **Multi-step forms / steppers** — component defaults changed hands in §5.1
5. **Navigation and back/forward** — the `RouterProvider` variant from §4.2

---

## 7. Known non-issues

Things that look like problems but are not:

- **`brace-expansion` / `minimatch` advisories.** Reached through ESLint, development
  scope only. ESLint 9 does _not_ fix them — it still depends on `minimatch@^3.1.5`. Only
  ESLint 10 does, and that is currently blocked on `eslint-plugin-react`, whose latest
  release (7.37.5) declares no ESLint 10 support. Nothing to do today.
- **Vite 6 with react-router 8.** The Vite 7 requirement applies to framework mode only.
- **`@types/react` ahead of `react`.** Expected; see §3.2.
- **Large bundle warnings.** Pre-existing, unrelated.

---

## 8. Quick reference

```bash
# 1. dependencies
#    edit package.json per §3.1, remove react-router-dom
rm -rf node_modules package-lock.json && npm install

# 2. router imports
grep -rl 'react-router-dom' src | xargs sed -i 's|react-router-dom|react-router|g'
grep -rn 'react-router-dom' src            # must be empty

# 3. fix the RouterProvider exception  (§4.2 — silent if missed)
#    import { RouterProvider } from "react-router/dom";

# 4. nuqs adapter  →  nuqs/adapters/react-router/v8

# 5. React 19 source fixes  (§5)
grep -rn 'defaultProps' src                # silent if missed

# 6. verify
npm run type-check && npm run build
npm run lint                               # compare against stashed baseline
npm test
npm audit
```
