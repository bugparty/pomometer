# FormatJS extract configuration

## Problem

FormatJS extract needs explicit setup for TypeScript-heavy projects:

1. **Declaration files (`.d.ts`)** — usually contain no user-facing strings
2. **Tests** — rarely need extraction
3. **Setup/config files** — often out of scope

## Approaches

### Original (problematic)

```json
"extract": "formatjs extract 'src/**/*.ts' --out-file locales/en-US.json --format simple --id-interpolation-pattern [sha512:contenthash:base64:6]"
```

**Issues:**

- Only `.ts`, so `.tsx` / `.jsx` are missed
- Picks up `.d.ts` and can error

### Recommended

```json
"extract": "formatjs extract 'src/**/*.{js,tsx,jsx}' --ignore 'src/**/*.d.ts' --ignore 'src/**/*.test.*' --out-file locales/en-US.json --format simple --id-interpolation-pattern [sha512:contenthash:base64:6]"
```

**Why:**

- Includes `js`, `tsx`, `jsx`
- Ignores `*.d.ts` and test files
- Fewer irrelevant files, faster runs

## Parameters

### Glob

- `'src/**/*.{js,tsx,jsx}'` — app and React source

### Ignores

- `--ignore 'src/**/*.d.ts'` — declarations
- `--ignore 'src/**/*.test.*'` — tests

### Output

- `--out-file locales/en-US.json`
- `--format simple`
- `--id-interpolation-pattern [sha512:contenthash:base64:6]`

## Why not `*.ts` by default?

In typical React apps:

- **`.tsx`** holds JSX and most strings
- **`.ts`** is often logic-only

If some `.ts` files contain translatable strings, extend the glob and tighten ignores, for example:

```json
"extract": "formatjs extract 'src/**/*.{js,ts,tsx,jsx}' --ignore 'src/**/*.d.ts' --ignore 'src/**/*.test.*' --ignore 'src/types/**/*' --out-file locales/en-US.json --format simple --id-interpolation-pattern [sha512:contenthash:base64:6]"
```

## Verify

```bash
pnpm extract
```

Expect:

1. No errors
2. `locales/en-US.json` created or updated
3. Strings from components present

## Sample output

```json
{
  "app.tab.logs": "Logs",
  "app.tab.todolist": "Todo list",
  "clock.button.long": "Long Rst",
  "clock.button.reset": "Reset",
  "navi.settings": "Settings",
  "navi.title": "AA Pomodoro Clock"
}
```

## Troubleshooting

### `"Debug Failure. Output generation failed"`

- Often caused by parsing `.d.ts` or unsupported files
- Fix: add `--ignore 'src/**/*.d.ts'`

### `"No messages found"`

- Check glob matches your file extensions

### Permission errors

- Ensure `locales/` is writable

### Verbose mode

```bash
formatjs extract 'src/**/*.{js,tsx,jsx}' --ignore 'src/**/*.d.ts' --verbose --out-file locales/en-US.json
```

## Best practices

1. Run extract after adding new messages
2. Commit generated locale files (if that’s your policy)
3. Keep keys aligned across languages
4. Optionally run extract in CI

With the recommended config, extract should run reliably.
