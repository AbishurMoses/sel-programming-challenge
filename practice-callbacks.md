# Self-Check — Symbol Watch Panel (callbacks & lifting state)

Build a "watch list" feature into the **real app**. You decide the state shape, prop types, and wiring. The spec only describes behavior.

## What you're building

A sidebar panel that shows symbols the user has "starred" from the main table, with live status. Add a button to each table row that adds that symbol to the panel.

## Requirements

1. Each row in the main symbols table gets an **"+ Watch"** button.
2. Clicking it adds that symbol to a watch list shown in a new **`SymbolWatch`** panel in the `App` sidebar (near `<Stopwatch />`).
3. The panel shows each watched symbol's **name** and **live status** (`Active` / `Stale` / `Inactive` — reuse `statusGenerator`).
4. Each watched item has a **Remove** button.
5. Adding the same symbol twice must not duplicate it.
6. Clicking "+ Watch" must **not** also open the row's detail dialog.
7. Empty watch list shows a neutral empty state.

## Constraints

- The watch list (the starred names) is **new UI state** — it must live in the lowest common ancestor of the table and the panel. Don't put it in the polling hook/context.
- The live **values/status** are global data — read them from `useSymbolPollingContext`, don't drill them.
- Don't store anything you can compute from other state (status is derived).

## Questions to answer as you go

- Where exactly does the watch-list state live, and why there?
- Which things travel **down as data** vs **down as a callback**?
- Does `DataTableComponent` need any new props? (Think about where the row button's callback can live.)
- Array vs `Set` for the watch list — defend your choice.

## When ready

Tell me and I'll review as interviewer — wiring, prop types, and altitude. Ask me anything along the way.
