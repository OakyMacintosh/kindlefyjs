# KindlefyJS

Ever tried to get your website working on a Kindle? Yeah, it's a nightmare. Kindle browsers are stuck in like 2010 and break on basically everything modern.

This tool scans your code and tells you what's gonna break before you waste hours testing on actual devices.

## What does it catch?

**JavaScript stuff:**
- `async/await` - Kindle goes "nope"
- Arrow functions `() => {}` - Parser just dies
- `fetch()` - Doesn't exist, use good old XMLHttpRequest

**CSS nightmares:**
- Flexbox/Grid - LOL no, back to floats and tables
- CSS variables - Static values only
- Most modern CSS - If it's newer than 2012, probably broken

**HTML weirdness:**
- `<video>` and `<audio>` tags - Just don't
- Viewport meta tags - Expect weird zoom behavior

## Kindle versions (they're all bad)

| Device | How broken is it? |
|--------|------------------|
| Old Kindles (4/5) | Extremely - like IE6 bad |
| Paperwhite 1-3 | Still pretty broken |
| Paperwhite 4 | Less broken but still bad |
| Oasis | Getting better but buggy |
| Scribe | Best of the bad bunch |
| ColorSoft | Actually somewhat decent |

## How to use

Install stuff:
```bash
bun install
```

Check a file:
```bash
bun run index.ts yourfile.js
```

Check everything:
```bash
bun run index.ts your-project/
```

## Example output

```
Kindlefy — scanning for Kindle WebBrowser quirks...

File: app.js
• Arrow functions detected → Older WebKit on Kindle may choke; rewrite as function(){}
• fetch() used → Kindle may not support fetch; consider XHR fallback.

File: style.css
• Modern layout (flex/grid) → Kindle's browser barely supports them; consider floats or table layouts.

Scan complete.
```

## Why this exists

Because testing on actual Kindles is slow and painful. Better to catch the obvious stuff early and save yourself some headaches.

Built with Bun because it's fast and TypeScript because I like types. Uses chalk for pretty colors in the terminal.

That's it. Hope it helps you avoid some Kindle-induced rage.