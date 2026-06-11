# Practice — Function Callbacks vs Object Props

*"Add a filterable, sortable symbol list component. The parent owns the data and filter state; child components handle display and user input. Wire them together with callback props."*

---

## Concepts Covered
- Passing functions as props (callbacks) vs passing objects
- Inline arrow functions vs named handlers — when each is appropriate
- Functional `setState` with callbacks
- Why `onClick={handleClick}` and `onClick={() => handleClick()}` behave differently
- The `children` prop pattern

---

## Background — The Core Distinction

**Callback prop:** The parent passes a function down. The child calls it when something happens. The parent decides what to do. The child doesn't need to know.

```tsx
// Parent owns the logic
function Parent() {
  const [filter, setFilter] = useState('')
  return <SearchBox onSearch={setFilter} />  // passes a function
}

// Child just calls it
function SearchBox({ onSearch }: { onSearch: (value: string) => void }) {
  return <input onChange={e => onSearch(e.target.value)} />
}
```

**Object prop:** You pass data down. The child reads it. No behavior is delegated.

```tsx
<SymbolCard symbol={{ name: 'BusVoltage', value: 240 }} />
```

The question is always: *who should own the behavior?* If the parent needs to know about it, use a callback.

---

## Step 1 — Define your types

File: `src/types/filter.ts` (create it)

```ts
export type SortOrder = 'asc' | 'desc'

export interface FilterState {
  query: string
  sortOrder: SortOrder
}
```

**TypeScript note:** `SortOrder` is a union of string literals — not just `string`. This means TypeScript will error if you pass `'ascending'` by mistake. This is called a *string literal union* and is much safer than plain `string`.

---

## Step 2 — Build a FilterBar component

File: `src/components/FilterBar.tsx`

Props it should accept:
```ts
interface FilterBarProps {
  filter: FilterState           // current values (controlled — parent owns state)
  onFilterChange: (next: FilterState) => void   // callback to update parent
}
```

It should render:
- A text input for the search query
- A toggle button that switches between `asc` / `desc`

**The trap — inline vs named handler:**

This is fine:
```tsx
<input onChange={e => onFilterChange({ ...filter, query: e.target.value })} />
```

This is also fine:
```tsx
function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
  onFilterChange({ ...filter, query: e.target.value })
}
<input onChange={handleQueryChange} />
```

This is a bug:
```tsx
<button onClick={onFilterChange({ ...filter, sortOrder: 'desc' })}>
```
`onClick` expects a *function*, not the *result of calling a function*. `onFilterChange(...)` returns `void` and runs immediately on render, not on click. You need `onClick={() => onFilterChange(...)}`.

**When to use inline vs named:**
- Inline: short, single-expression, no reuse needed
- Named: multi-line logic, reused in multiple places, easier to read at a glance

---

## Step 3 — Build a SymbolList component

File: `src/components/SymbolList.tsx`

Props:
```ts
interface SymbolListProps {
  items: Array<{ name: string; value: number }>
  onSelect: (name: string) => void
}
```

Render each item as a row. Clicking a row calls `onSelect(item.name)`.

**Question:** Should `SymbolList` sort or filter the items itself?

*No — the parent passes already-filtered/sorted items. The component just renders what it receives. This keeps it dumb and reusable. Filtering logic belongs in the parent because it owns the filter state.*

---

## Step 4 — Wire it together in a parent

File: `src/components/SymbolExplorer.tsx`

This component:
1. Owns `FilterState` in `useState`
2. Has a hardcoded list of symbols (or import from your mock data)
3. Computes the filtered+sorted list from state (derived — no extra state needed)
4. Renders `<FilterBar>` and `<SymbolList>` with the right props

```tsx
const filtered = items
  .filter(s => s.name.toLowerCase().includes(filter.query.toLowerCase()))
  .sort((a, b) =>
    filter.sortOrder === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  )
```

**Key insight:** `filtered` is computed fresh every render from `items` and `filter`. No `useState` needed for it — that would be redundant state that can get out of sync.

---

## Step 5 — Selected symbol

Add a `selectedSymbol` state to `SymbolExplorer`. When `onSelect` fires, set it. Render the selected symbol name below the list.

**Question:** `onSelect` in `SymbolList` is typed as `(name: string) => void`. In the parent you write:

```tsx
<SymbolList onSelect={setSelectedSymbol} />
```

Why does this work without wrapping in an arrow function?

*`setSelectedSymbol` from `useState` already has the signature `(value: string) => void` — it matches exactly. You only need `() => setSelectedSymbol(name)` if you need to capture a specific value at definition time, or if the signatures don't match.*

---

## Verification

1. Type in the search box — the list narrows in real time.
2. Toggle sort — the list re-orders.
3. Click a symbol — it appears as "selected" below the list.
4. Clear the search — all symbols reappear.
5. Check: does the sort order persist when you type in the search box? (It should — both live in the same `FilterState` object.)

---

## Extension

- Add a "clear filters" button that resets `FilterState` to `{ query: '', sortOrder: 'asc' }` in a single `setFilter` call (not two separate calls).
- Add a `count` display: "Showing 3 of 10 symbols".
- Lift `selectedSymbol` up: what would you change if a *sibling* component (not a child) also needed to know which symbol is selected?
