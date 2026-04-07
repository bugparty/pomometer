# FormatJS compile scripts — setup summary

## What was done

The `compile` workflow was updated to support a full i18n pipeline end to end.

## Updated workflow

### 1. Extract

```bash
pnpm run extract
# or
pnpm run i18n:extract
```

- Extracts i18n strings from code
- Writes `locales/en-US.json`

### 2. Compile

```bash
pnpm run compile        # en-US.js only
pnpm run compile:all    # all locale JS files
# or
pnpm run i18n:compile
```

- Converts JSON to the JS modules the app imports
- Keeps polyfill and export structure
- Syncs into `src/locales/*.js`

### 3. Full pipeline

```bash
pnpm run i18n:full
```

- Runs extract, then compile

## Layout

```
pomometer/
├── locales/
│   └── en-US.json
├── src/locales/
│   ├── en-US.js
│   ├── zh-CN.js
│   └── de-DE.js
└── scripts/
    ├── sync-locales.js
    └── sync-all-locales.js
```

## Example `package.json` scripts

```json
{
  "scripts": {
    "extract": "formatjs extract 'src/**/*.{js,tsx,jsx}' --ignore 'src/**/*.d.ts' --ignore 'src/**/*.test.*' --out-file locales/en-US.json --format simple --id-interpolation-pattern [sha512:contenthash:base64:6]",
    "compile": "node scripts/sync-locales.js",
    "compile:all": "node scripts/sync-all-locales.js",
    "i18n:extract": "pnpm run extract",
    "i18n:compile": "pnpm run compile:all",
    "i18n:full": "pnpm run i18n:extract && pnpm run i18n:compile"
  }
}
```

## Improvements

### 1. Automated sync

- Less hand-editing of `src/locales/*.js`
- Preserves polyfills and export shape
- Handles missing locale files sensibly

### 2. Compatibility

- Keeps existing import paths and structure
- Preserves polyfill configuration
- No change to runtime behavior by default

### 3. Error handling

- Graceful handling of missing locale files
- English as fallback where needed
- Clear status output

## Example run output (illustrative)

- English: N messages
- Chinese: N messages (fallback to English where missing)
- German: N messages (existing translations preserved)

## Suggested dev flow

### Day to day

1. Add `<FormattedMessage>` (or equivalent) in code
2. `pnpm run i18n:extract`
3. `pnpm run i18n:compile` to refresh JS bundles

### Updating translations

1. Edit or add `locales/zh-CN.json`, `locales/de-DE.json`, etc.
2. `pnpm run compile:all`

### Full refresh

```bash
pnpm run i18n:full
```

## Next steps (optional)

1. Maintain locale JSON files for each language
2. Add i18n checks to CI/CD
3. Add tests or scripts to ensure key parity across locales

The i18n pipeline is automated end to end.
