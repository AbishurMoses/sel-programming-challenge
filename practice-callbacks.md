# Practice — Function Callbacks, Lifting State & Prop Drilling

*"Add a **Symbol Watch** panel. Each row in the main table gets a '+ Watch' button. Clicking it adds that symbol to a watch list shown in the sidebar. The panel shows each watched symbol's name and live status (Active / Stale / Inactive), with a button to remove it."*

This is grounded in the **real app** — you'll wire into `SymbolsDashboard`, the `DataTableComponent` columns, `useSymbolPollingContext`, and `statusGenerator`.

---

## Concepts Covered
- Passing functions as props (callbacks) — child calls, parent decides
- **Lifting state up** so two *siblings* can share it
- Prop drilling, and when a closure can carry a callback for you
- `onClick={fn}` vs `onClick={() => fn()}` — and `e.stopPropagation()`
- Functional `setState` with immutable array updates + de-duping
- **Derived** data: compute status, never store it

---

## Background — Who Owns The State?

The table (adds to the watch list) and the watch panel (displays it) are **siblings** under `App`. A sibling cannot read another sibling's `useState`. So the shared list must live in their **lowest common parent** and flow down as props:

```
App  ← owns watchedSymbols here
├── aside → <SymbolWatch watched={...} onRemove={...} />   (reads the list)
└── main  → <SymbolsDashboard onAddToWatch={...} />        (adds to the list)
```

**The rule:** when two components need the same state, move it up to the closest ancestor they share, and pass it down. Don't duplicate it in both — duplicated state drifts out of sync.

---

## Step 1 — Lift the watch state into `App.tsx`

In `App`, add:

```tsx
const [watchedSymbols, setWatchedSymbols] = useState<string[]>([])
```

Add two handlers (named, because they have real logic and get passed around):

```tsx
function addToWatch(name: string) {
  // de-dupe: don't add a symbol that's already watched
  setWatchedSymbols(prev => prev.includes(name) ? prev : [...prev, name])
}

function removeFromWatch(name: string) {
  setWatchedSymbols(prev => prev.filter(n => n !== name))
}
```

**Why functional `setState`?** Both updates derive from the previous list. `prev => ...` always sees the latest array — and it lets React batch correctly. Note both return a **new array** (`[...prev, name]`, `.filter(...)`), never mutating `prev`.

**Question before you code:** why not store the watch list inside `useSymbolPolling` / the context instead? *(It's a fair option — the data is global-ish. But the lesson here is lifting to the common parent with explicit props. We'll discuss the context alternative in the Extension.)*

---

## Step 2 — Build the `SymbolWatch` panel

File: `src/components/SymbolWatch.tsx`

Props:
```ts
interface SymbolWatchProps {
  watched: string[]
  onRemove: (name: string) => void
}
```

It should:
1. Read **live values** from context — the watch list is just *names*; the current value/status is global data:
   ```tsx
   const { symbolValues } = useSymbolPollingContext()
   ```
2. For each watched name, look up its value and **derive** the status:
   ```tsx
   const value = symbolValues.get(name)
   const status = value ? statusGenerator(value.lastUpdated) : "No data"
   ```
3. Render a row per symbol: the name, the status, and a **Remove** button that calls `onRemove(name)`.
4. Show an empty state when `watched.length === 0`.

**Trap — `onClick={fn}` vs `onClick={() => fn()}`:**
```tsx
<Button onClick={onRemove(name)}>      // ❌ calls onRemove during render, every render
<Button onClick={() => onRemove(name)}>// ✅ passes a function; runs only on click
```
You need the arrow here because you're **capturing a specific `name`**. (Compare: `onClick={start}` in your Stopwatch needed no arrow — it took no argument.)

**Derived, not stored:** notice `status` is recomputed every render from live `symbolValues`. Do **not** put status in `useState` — it would instantly go stale as values poll in.

Then drop `<SymbolWatch watched={watchedSymbols} onRemove={removeFromWatch} />` into the `aside` in `App.tsx`, near `<Stopwatch />`.

---

## Step 3 — Add the "+ Watch" button to a table row

The columns live in `SymbolsDashboard.tsx` as the module-level `export const columns`. To give a cell access to `onAddToWatch`, turn that constant into a **factory** that closes over the callback:

```tsx
export function createColumns(
  onAddToWatch: (name: string) => void
): ColumnDef<SymbolRow>[] {
  return [
    /* ...existing columns... */
    {
      id: "watch",
      header: () => <span>Watch</span>,
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()              // ← the trap, see below
            onAddToWatch(row.original.symbolName)
          }}
        >
          + Watch
        </Button>
      ),
    },
  ]
}
```

**Trap — `e.stopPropagation()`:** the whole `<TableRow>` already has `onClick={() => onRowClick?.(row.original)}` (it opens the detail dialog). Without `stopPropagation`, clicking your button **also** bubbles up and fires the row click — you'd add to watch *and* open the dialog. Stop the event at the button.

**Why a factory?** A module-level `const columns` can't see `onAddToWatch` — that value only exists at runtime inside a component. Wrapping it in a function lets the cell **close over** the callback (same closure idea as your interval callbacks).

---

## Step 4 — Thread the callback down

In `App.tsx`:
```tsx
<SymbolsDashboard
  onSymbolClick={(name) => setSelectedSymbol(name)}
  onAddToWatch={addToWatch}
/>
```

In `SymbolsDashboard.tsx`, accept the prop and build columns from it:
```tsx
interface SymbolsDashboardProps {
  onSymbolClick: (name: string) => void
  onAddToWatch: (name: string) => void
}
// ...inside the component:
const columns = createColumns(onAddToWatch)
```

**Key insight:** you pass `columns` to `<DataTableComponent>` exactly as before. The callback rides **inside the column closure**, so `DataTableComponent` needs **zero** changes — it never sees `onAddToWatch`. That's the difference between *prop drilling* (threading a prop through every layer) and letting a closure carry the dependency for you.

---

## Step 5 — De-dupe and immutability (you did this in Step 1, now verify it)

- Click "+ Watch" on the same symbol twice → it should appear **once**. That's the `prev.includes(name) ? prev : [...prev, name]` guard.
- Returning `prev` unchanged when it's a duplicate means React **skips the re-render** (same reference) — a nice efficiency freebie.
- Remove uses `.filter()` → new array, original untouched.

**Question:** would a `Set<string>` be a better data structure here than an array? *(It auto-dedupes and has O(1) lookup. Trade-off: you must copy it immutably — `new Set(prev)` — and Sets don't serialize/map as ergonomically in JSX. Either is defensible; be ready to justify.)*

---

## Verification

1. Click "+ Watch" on a symbol → it appears in the sidebar panel.
2. The panel's status updates as polling runs (Active → Stale → Inactive) — because status is **derived from live `symbolValues`**, not stored.
3. Click "+ Watch" on the same symbol twice → only one entry.
4. Click "+ Watch" → it must **not** also open the detail dialog (stopPropagation working).
5. Remove a symbol → it leaves the panel; the table is unaffected.
6. Clicking a row (not the button) still opens the detail view as before.

---

## Extension

- **Watch count / cap:** show "Watching 3 of 50" and disable "+ Watch" past a cap.
- **Persist:** mirror `watchedSymbols` to `localStorage` so it survives reload (where does the read/write go — render, effect, or handler?).
- **The context question:** refactor so the watch list lives in `useSymbolPolling`/context instead of `App`. What gets simpler (no prop drilling)? What gets worse (less explicit data flow, harder to test in isolation)? When is each the right call?
- **`table.meta`:** the tanstack-idiomatic alternative to a column factory — pass `onAddToWatch` via `useReactTable({ meta: { onAddToWatch } })` and read it in the cell with `table.options.meta`. Requires a TS module-augmentation of `TableMeta`. Compare to the factory approach.
