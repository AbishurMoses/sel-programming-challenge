# Self-Check — Debounced Search

Build a component from scratch. You decide every hook, every piece of state, and how the logic is structured. The spec only describes **behavior**.

File: `src/components/DebouncedSearch.tsx`

Use this as your data source (hardcode it in the file):

```ts
const FRUITS = [
  "Apple", "Apricot", "Avocado", "Banana", "Blackberry", "Blueberry",
  "Cherry", "Coconut", "Cranberry", "Date", "Fig", "Grape",
  "Grapefruit", "Guava", "Kiwi", "Lemon", "Lime", "Mango",
  "Nectarine", "Orange", "Papaya", "Peach", "Pear", "Pineapple",
  "Plum", "Pomegranate", "Raspberry", "Strawberry", "Watermelon",
]
```

## Requirements

1. A text input the user types a query into.
2. Below it, a list of fruits whose name contains the query (case-insensitive).
3. **The filtering must be debounced by 400ms** — it should only run once the user has paused typing for 400ms, not on every keystroke.
4. While the user has typed something but the 400ms debounce has **not** yet settled, show a `Searching…` indicator.
5. Once settled, show the matching results and a count (e.g. `3 matches`).
6. An empty input shows all fruits and no `Searching…` indicator.
7. If no fruit matches the settled query, show `No matches`.

## Constraints

- No external libraries — only React.
- If the component unmounts while a debounce is pending, nothing should error or warn (clean up after yourself).
- Don't store anything in state that can be computed from other state.

## When you're done

Tell me it's ready and I'll review it as the interviewer — checking both that it meets the spec and that your hook choices are sound. Don't ask me which hooks to use; that's the point of the exercise.
