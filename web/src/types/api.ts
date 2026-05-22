export interface SymbolValue {
    symbolName: string;
    stVal: number;
    t: string; // Parsed timestamp string (from API's nested `t.value` field, formatted for display)
    lastUpdated: Date;
    rawData?: Record<string, unknown>; // Full API response — use this to access additional fields like `range`, `units`, `multiplier`, `d`, and the quality object `q`
}