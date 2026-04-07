# Tailwind CSS browser compatibility

## Why Tailwind can look different across browsers

### 1. CSS reset / normalize

Browsers ship different defaults. Even with Tailwind’s Preflight (normalize), small differences can remain.

### 2. Flexbox

Older browsers may need prefixes:

```css
.flex {
  display: -webkit-box;      /* older Safari */
  display: -ms-flexbox;      /* IE 10 */
  display: flex;             /* modern browsers */
}
```

### 3. CSS Grid

- IE11: limited support, `-ms-` prefixes
- Safari before 10.1: `-webkit-` prefixes
- Firefox before 52: `-moz-` prefixes

### 4. `gap` support

```css
/* Safari before 14.1 had limited/no gap in some layouts */
@supports not (gap: 1rem) {
  .space-x-4 > :not([hidden]) ~ :not([hidden]) {
    margin-left: 1rem;
  }
}
```

## Concrete issues and mitigations

### 1. Container queries

This project uses `container-type: inline-size`:

```css
#clockContainer {
  container-type: inline-size;  /* Chrome 105+, Firefox 110+ */
}
```

**Mitigation:** add fallbacks:

```css
#clockContainer {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  container-type: inline-size;
}
```

### 2. `clamp()`

```css
font-size: clamp(50px, 20cqw, 300px); /* Safari 13.1+, Chrome 79+ */
```

**Mitigation:**

```css
font-size: 120px;
font-size: clamp(50px, 20cqw, 300px);
```

### 3. Custom properties (CSS variables)

Not supported in IE11; widely supported in current browsers.

## Project-specific recommendations

### 1. Clock typography

```css
#clock {
  font-size: 120px;
  font-size: clamp(50px, 20cqw, 300px);
  font-weight: 800;
  text-align: center;
  color: hsl(171, 100%, 41%);
}

@media (max-width: 480px) {
  #clock {
    font-size: 120px;
  }
}
```

### 2. Modals in Safari

`backdrop-filter` and `position: fixed` can behave oddly in Safari:

```css
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}
```

### 3. Grid with flex fallback

```css
.grid-container {
  display: flex;
  flex-wrap: wrap;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

## Testing

### Browser checklist

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Safari on iOS (mobile)
- Chrome on Android (mobile)

### Autoprefixer

Ensure PostCSS is configured:

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        "> 1%",
        "last 2 versions",
        "not dead",
        "not ie 11"
      ]
    },
  },
}
```

### Can I Use

Use [caniuse.com](https://caniuse.com) to verify support for specific features.

## Performance

### 1. Remove unused styles

Tailwind’s content scan limits generated CSS:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
}
```

### 2. PostCSS plugins

```bash
pnpm install -D cssnano postcss-preset-env
```

## Debugging

### DevTools

- Device mode for responsive layouts
- Computed styles for final values
- Performance panel for paint/layout cost

### Online services

- BrowserStack
- CrossBrowserTesting
- LambdaTest

## Best practices

1. **Progressive enhancement** — baseline works everywhere you support
2. **Feature detection** — `@supports` where it helps
3. **Polyfills** — when a feature is required on older targets
4. **Regular cross-browser checks**

This app targets modern browsers; most Tailwind features work as expected. For older browsers, add fallbacks and polyfills as needed.
