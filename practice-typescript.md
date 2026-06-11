# Practice — TypeScript Essentials

*Exercises targeting the TypeScript patterns that come up most in React work: union types, type narrowing, generics, and typing component props correctly.*

---

## Concepts Covered
- String literal unions vs `string`
- Discriminated unions and type narrowing
- Generics — writing and reading them
- `interface` vs `type`
- Typing event handlers and `useState` correctly
- `null` vs `undefined` vs optional (`?`)

---

## Exercise 1 — String Literal Unions

**Without literals (bad):**
```ts
function sort(order: string) { ... }
sort('ascending') // no error, but wrong at runtime
```

**With literals (good):**
```ts
type SortOrder = 'asc' | 'desc'
function sort(order: SortOrder) { ... }
sort('ascending') // TS error: Argument of type '"ascending"' is not assignable
```

**Task:** Define a `Status` type that can only be `'idle' | 'loading' | 'success' | 'error'`. Then write a function `getStatusLabel(status: Status): string` that returns a human-readable label for each. TypeScript should tell you if you forget to handle a case.

**Hint:** Use a `switch` statement. To make TS enforce exhaustiveness, add a `default` case that does:
```ts
default:
  const _exhaustive: never = status  // TS errors if any case is unhandled
  return _exhaustive
```

---

## Exercise 2 — Discriminated Unions (API Response Pattern)

This is the pattern for typed API responses. Instead of `data: any`, you model every possible outcome as a union.

```ts
type ApiResult<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }
```

The `status` field is the *discriminant* — TypeScript uses it to narrow the type inside conditionals.

**Task:** Write a `renderResult<T>` function that accepts an `ApiResult<T>` and a render function `(data: T) => string`, and returns a string.

- If loading → return `'Loading...'`
- If error → return `'Error: <message>'`
- If success → call the render function with `data` and return the result

Inside the `status === 'success'` branch, TypeScript should know that `result.data` exists (type `T`) without any casting. If you need to write `result.data as T` or `(result as any).data`, your narrowing is wrong.

**Test it:**
```ts
const result: ApiResult<{ name: string }> = { status: 'success', data: { name: 'BusVoltage' } }
console.log(renderResult(result, d => d.name))  // 'BusVoltage'
```

---

## Exercise 3 — Generics

A generic function works on *any* type while still being type-safe. The type variable is inferred from usage — you usually don't need to specify it manually.

**Task 1:** Write a generic `first<T>(arr: T[]): T | null` function that returns the first element of an array, or `null` if empty.

TypeScript should infer:
```ts
first([1, 2, 3])          // number | null
first(['a', 'b'])         // string | null
first([])                 // unknown[] — you may need to annotate: first<string>([])
```

**Task 2:** Write a generic `groupBy<T>(items: T[], key: keyof T): Map<T[keyof T], T[]>`.

This is harder. `keyof T` means "any property name of T". `T[keyof T]` means "the value type at that key".

```ts
const symbols = [
  { name: 'BusVoltage', unit: 'V' },
  { name: 'GridFrequency', unit: 'Hz' },
  { name: 'PhaseVoltage', unit: 'V' },
]
groupBy(symbols, 'unit')
// Map { 'V' => [...], 'Hz' => [...] }
```

---

## Exercise 4 — Typing useState and Event Handlers

**Common mistakes:**

```ts
// Bad — TS infers `never[]`, can't push strings
const [items, setItems] = useState([])

// Good — explicit type parameter
const [items, setItems] = useState<string[]>([])
```

```ts
// Bad — `e` is typed as `any`
function handleChange(e) {
  setValue(e.target.value)
}

// Good
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value)
}
```

**Task:** Write a `useFormField` custom hook that manages a single text input. It should return:
- `value: string`
- `onChange: (e: React.ChangeEvent<HTMLInputElement>) => void`
- `reset: () => void`
- `isEmpty: boolean` (derived — not state)

All return types should be explicit (don't rely on inference for the returned object).

Usage:
```tsx
const field = useFormField('')
<input value={field.value} onChange={field.onChange} />
<button onClick={field.reset}>Clear</button>
```

---

## Exercise 5 — `interface` vs `type`, `null` vs optional

**`interface` vs `type`:** For object shapes, both work. Convention: use `interface` for component props and API shapes (extendable), use `type` for unions and computed types.

**`null` vs `undefined` vs `?`:**
```ts
interface A {
  x: number | null    // must be provided, but can be null
  y?: number          // can be omitted (undefined if not provided)
  z: number | undefined  // must be provided, value can be undefined — rarely useful
}
```

**Task:** Model this scenario with interfaces:

A `SymbolDetail` from the API always has:
- `name: string`
- `value: number`
- `unit: string`
- `quality: 'good' | 'bad' | 'uncertain'`
- `timestamp: string`

It *optionally* has:
- `description` — may not exist at all
- `highLimit` — exists but may be null (explicitly cleared)
- `lowLimit` — same as highLimit

Write the interface. Then write a function `formatLimit(limit: number | null): string` that returns the number as a string, or `'none'` if null.

Then write `describeSymbol(detail: SymbolDetail): string` that returns something like:
```
BusVoltage: 240V (good) — High: 245, Low: none
```

---

## Quick Reference — Patterns to Memorize

```ts
// Union type
type Direction = 'north' | 'south' | 'east' | 'west'

// Generic with constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

// Discriminated union narrowing
if (result.status === 'success') {
  result.data  // TS knows this exists here
}

// Typing useState with object
const [user, setUser] = useState<{ name: string; age: number } | null>(null)

// Functional setState (always use when next value depends on previous)
setCount(prev => prev + 1)  // safe in intervals and async
setCount(count + 1)          // stale closure risk in intervals

// Type assertion (use sparingly — bypasses type checking)
const input = document.getElementById('name') as HTMLInputElement
```
