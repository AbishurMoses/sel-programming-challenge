*"We'd like you to add a threshold alert system. The user should be able to set a high and/or low threshold on any symbol. When polling detects that a symbol's value has crossed a threshold, a toast notification should appear. Here are the details — take a moment to read through them, then start wherever you think makes sense."*

### Task 1 Spec (Share with Candidate)

**Goal:** Add threshold alerts so users are notified when a symbol's value goes above or below a user-defined limit.

**Context — Mock data you'll be working with:**
Your MSW mock layer (`src/mocks/data.ts`) generates random values within defined ranges on every poll. The `METRIC_PROFILES` object maps symbol name substrings to ranges. For example:

| Symbol | Profile Match | Units | Range | Good Test Threshold |
|--------|--------------|-------|-------|---------------------|
| BusVoltagePhaseA | Voltage | V | 220–245 | High: 238 |
| GeneratorFrequency | Frequency | Hz | 49–51 | High: 50 |
| BearingVibrationA | Vibration | mm/s | 1–15 | High: 10 |
| CabinInternalTemp | Temp | °C | 45–110 | High: 90, Low: 55 |
| UpsBatteryCapacity | Capacity | % | 80–100 | Low: 88 |
| BinaryDebounce | *(default)* | mV | 10–150 | High: 120 |

Values are fully random within the range each poll (not jitter-based), so thresholds set within the range will trigger frequently.

---

**Step 1 — Add a `SymbolAlert` type**

File: `src/types/api.ts`

Add this interface alongside the other exports:

```typescript
export interface SymbolAlert {
  symbolName: string
  highThreshold: number | null   // null = no high alert set
  lowThreshold: number | null    // null = no low alert set
}
```

---

**Step 2 — Add alert state and methods to the polling hook**

File: `src/hooks/useSymbolPolling.ts`

Do the following:

1. Import the new `SymbolAlert` type from `@/types/api`.
2. Add a new piece of state for alerts. You'll need to decide between `useState` and `useRef` (or both) based on what needs to drive UI re-renders vs. what needs to be readable inside `pollOnce` without stale closures. Think about how you solved this same problem for `symbols` → `symbolsRef`.
3. Add two functions:
   - `setAlert(symbolName: string, high: number | null, low: number | null)` — creates or updates the alert entry for that symbol.
   - `removeAlert(symbolName: string)` — deletes the alert entry for that symbol.
4. Add `symbolAlerts`, `setAlert`, and `removeAlert` to the returned object so components can access them.

---

**Step 3 — Check thresholds when new values arrive**

File: `src/hooks/useSymbolPolling.ts`

After polling produces new values, check each symbol's value against its alert thresholds:

1. If `alert.highThreshold` is not null AND `stVal >= alert.highThreshold` → show a toast.
2. If `alert.lowThreshold` is not null AND `stVal <= alert.lowThreshold` → show a toast.
3. For the toast, use the `toast` function from `sonner` (already used throughout the app — see `UserMenu.tsx` and `ConfirmDialog.tsx` for examples). Use `toast.error()` for alert notifications. Example message:
   ```
   ⚠ BusVoltagePhaseA value (243) exceeded high threshold (238)
   ```

**Where to put this check** is up to you. Two common React approaches:

- **Option A:** Check inside `pollOnce` after the `results.forEach` loop — but remember that `pollOnce` has an empty dependency array, so you need a ref to read current alerts (same pattern as `symbolsRef`).
- **Option B:** Add a separate `useEffect` that watches `symbolValues` changes and checks thresholds there — this avoids the stale closure problem entirely.

Either approach is valid. Pick whichever feels more natural to you.

**Requirement — "fire once" behavior:**
If a symbol's value stays above the high threshold on consecutive polls, the toast must **not** repeat every 2 seconds. The toast should fire **once** when the value first crosses the threshold, then stay silent until the value drops back below the threshold and crosses it again on a subsequent poll. You need to implement a mechanism to track whether each threshold has already been triggered. A `useRef` with a `Map` or `Set` is a good fit for this tracking since it doesn't need to cause re-renders. How you implement this tracking is up to you.

---

**Step 4 — Add alert UI to the detail modal**

File: `src/components/SymbolDetailView.tsx`

The modal already calls `useSymbolPollingContext()` to access polling state. After you add `symbolAlerts`, `setAlert`, and `removeAlert` to the hook's return value and expose them through the context, they'll be available here too.

Add a new `<Card>` section below the existing "Quality Details" card. It should contain:

1. A `<CardTitle>` heading: **"Threshold Alerts"** (same pattern as other section headings like "Current State", "Symbol Info").
2. Two `<input type="number">` fields with visible labels:
   - **"High Threshold"**
   - **"Low Threshold"**
3. A **"Set Alert"** button that calls `setAlert(name, highValue, lowValue)` (the `name` prop is the symbol name already available in this component).
   - If an input field is empty, pass `null` for that threshold. An empty number input yields `NaN` from `Number()` — check for that and convert to `null`.
   - If the input has a valid number, pass that number.
4. A **"Clear Alert"** button that calls `removeAlert(name)`. Only render this button when an alert already exists for this symbol (i.e., `symbolAlerts.get(name)` returns a value).
5. When the modal opens, if an alert already exists for this symbol, pre-fill both inputs with the current `highThreshold` and `lowThreshold` values. If a threshold value is `null`, show the input as empty.

**Styling:** Use the same shadcn/ui components and Tailwind classes already in the modal (`Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button`, `Input`, `Label`). Pixel-perfect design is not required.

---

**How to verify it works:**
1. Start polling on the dashboard (2-second interval).
2. Click on `BusVoltagePhaseA` to open its detail modal.
3. Enter `238` in the High Threshold input. Leave Low Threshold empty. Click "Set Alert".
4. Close the modal.
5. Within a few poll cycles, you should see a red toast notification saying the value exceeded 238 (the mock generates values 220–245, so values ≥ 238 occur roughly 30% of the time).
6. Confirm the toast does NOT repeat every 2 seconds while the value remains above 238. It should only fire again after the value drops below 238 and then crosses above 238 again.

---
 