# AGENTS.md

@mistwarp/types holds the TypeScript declarations for MistWarp's JavaScript engine packages (scratch-vm first) and the MistWarp API. scratch-gui type-checks against it. The engines themselves stay JavaScript.

## Rules

- Declare only what consumers actually use, and declare it exactly. Read the engine source before writing a signature, and prefer `unknown` to a guess. Never use `any`.
- Each package gets a folder (`scratch-vm/index.d.ts`) with an ambient `declare module '<name>'` that matches the package's real export shape (`export =` for CommonJS). `index.d.ts` references every folder.
- Event maps are interfaces without index signatures, so unknown event names and wrong payloads are type errors.
- Every declaration change comes with usage in `test/` that must compile, plus `// @ts-expect-error` lines for what must be rejected.
- When an engine changes something declared here, update this repo in the same piece of work.

## Checks

`npm run check` runs `tsc` over the declarations and tests. CI runs it on every pull request.

## Working here

- The default branch is `main`. Open PRs with `gh pr create -R MistWarp/types --base main`.
- No code comments apart from tool directives. No em dashes.
- Never add `Co-Authored-By` or any AI or tool attribution to commits or PRs.
- READMEs are overviews. Documentation goes in MistWarp/docs (https://mistwarp.org/docs/).
