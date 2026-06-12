# Self-Check #2 — Async Fetch with Stale-Response Handling

Build a component from scratch. You choose every hook, every piece of state, and the structure. The spec only describes **behavior**.

File: `src/components/SymbolLoader.tsx`

Paste this mock fetcher into the file and use it as your data source. It mimics a real API: random latency, and it sometimes fails.

```ts
const NAMES = ["BusVoltage", "LineCurrent", "Frequency", "PowerFactor", "BreakerStatus"]

// Resolves after 200–1200ms with a fake reading; ~15% of the time it rejects.
function fetchSymbolDetail(name: string): Promise<{ name: string; value: number }> {
  const delay = 200 + Math.random() * 1000
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.15) reject(new Error(`Failed to load ${name}`))
      else resolve({ name, value: Math.round(Math.random() * 1000) })
    }, delay)
  })
}
```

## Requirements

1. Render a button (or similar) for each name in `NAMES`. Clicking one selects it.
2. When a symbol is selected, fetch its detail with `fetchSymbolDetail(name)`.
3. While the fetch is in flight, show a `Loading…` state.
4. On success, show the symbol's name and value.
5. On failure, show an error message (and not a stale value).
6. Before any selection, show a neutral empty state (e.g. `Select a symbol`).

## Constraints

- No external libraries — only React.
- **The displayed detail must always match the currently-selected symbol.** If you click `BusVoltage` and then quickly click `Frequency`, a slow `BusVoltage` response that arrives *after* you switched must **not** overwrite the `Frequency` view. Switching selection should never show the wrong symbol's data, even briefly.
- If the component unmounts while a fetch is pending, nothing should error or warn.
- Don't store anything in state that can be computed from other state.

## When you're done

Tell me it's ready and I'll review it as the interviewer — spec compliance *and* whether your hook choices are sound. The hard requirement is the one about stale responses; think about what your cleanup function can do besides clearing a timer.
