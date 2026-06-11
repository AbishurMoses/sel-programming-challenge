# Practice — useState, useRef, and Stale Closures

*"We need a stopwatch component with lap tracking. The timer should tick every second, record laps, and show a running list of lap times. Build it from scratch."*

---

## Concepts Covered
- When to use `useState` vs `useRef`
- Stale closure problem and how refs solve it
- Functional update form of `setState`
- Cleanup in `useEffect`

---

## Background — The Core Tension

`useState` drives re-renders. `useRef` does not. But refs are readable inside intervals and event handlers without going stale — state is not.

The stale closure problem: if you start an interval and it captures `count` from the render it was created in, it will always see that initial value — not the updated one. This is the same problem you solved in `useSymbolPolling.ts` with `symbolsRef`.

---

## Step 1 — Create the component file

File: `src/components/Stopwatch.tsx`

Set up the shell:

```tsx
import { useState, useRef, useEffect } from 'react'

export function Stopwatch() {
  // your state and refs go here

  return (
    <div>
      {/* your UI goes here */}
    </div>
  )
}
```

---

## Step 2 — Add the timer state

You need to track:
- How many seconds have elapsed → **`useState<number>`** (needs to display, so needs re-renders)
- Whether the timer is running → **`useState<boolean>`**
- Recorded lap times → **`useState<number[]>`**
- The interval ID so you can clear it → **`useRef<ReturnType<typeof setInterval> | null>`**

**Question to answer before coding:** Why does the interval ID go in a ref and not state?

---

## Step 3 — Start and stop

Add two functions: `start()` and `stop()`.

`start()` should:
1. Set `isRunning` to `true`
2. Start an interval that increments elapsed time every 1000ms

**The trap:** If you write `setElapsed(elapsed + 1)` inside the interval callback, it will always add 1 to the value of `elapsed` at the time the interval was created — never the current value. After a few seconds it will reset back.

**The fix:** Use the functional update form:
```ts
setElapsed(prev => prev + 1)
```
This always operates on the latest value, no ref needed.

`stop()` should:
1. Set `isRunning` to `false`
2. Clear the interval using the ref

---

## Step 4 — Lap recording

Add a `recordLap()` function. When called, it should push the current `elapsed` value into the laps array.

**Question:** Can you read `elapsed` directly here, or do you need a ref?

*Answer: Yes — `recordLap` is called from a button click, not from inside an interval or effect. At the time the user clicks, the function is recreated fresh with the latest closure, so `elapsed` is current. Refs are only needed when reading state inside a long-lived callback (interval/timeout/event listener registered once).*

---

## Step 5 — Cleanup

If the component unmounts while the timer is running, the interval keeps firing and will try to update state on an unmounted component.

Add a `useEffect` with a cleanup function:

```ts
useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }
}, [])
```

---

## Step 6 — Render

Display:
- The elapsed time formatted as `MM:SS` (write a small helper: `Math.floor(elapsed / 60)` and `elapsed % 60`, pad with `String.padStart(2, '0')`)
- Start / Stop buttons (disable Start when running, disable Stop when not running)
- A "Lap" button (only enabled when running)
- A list of recorded laps: `Lap 1: 0:08`, `Lap 2: 0:15`, etc.
- A "Reset" button that stops the timer, clears elapsed, and clears laps

---

## Verification

1. Start the timer — it should tick up every second.
2. Record a lap at 5s and another at 12s — the list should show both.
3. Stop at 15s, then start again — it should resume from 15, not reset.
4. Reset — everything clears.
5. Open React DevTools and watch renders — the component should only re-render once per second while running, not more.

---

## Extension (if time allows)

- Add a "best lap" indicator (the shortest lap time, highlighted).
- Make `recordLap` show the *split* (time since last lap) rather than the absolute elapsed time.
