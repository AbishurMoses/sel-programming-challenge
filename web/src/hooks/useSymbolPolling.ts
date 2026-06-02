import { useCallback, useEffect, useRef, useState } from "react";
import { type ApiError, type ConnectionStatus, type PollingState, type SymbolAlert, type Symbol as SymbolData, type SymbolHistory, type SymbolHistoryPoint, type SymbolValue } from "@/types/api";
import { apiService } from "@/services/apiService";
import { toast } from "sonner";

const MAX_HISTORY_POINTS = 50
const MAX_SYMBOLS = 50
const HISTORY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function useSymbolPolling() {
    const [symbols, setSymbols] = useState<SymbolData[]>([]);
    const [symbolValues, setSymbolValues] = useState<Map<string, SymbolValue>>(new Map());
    const [symbolHistory, setSymbolHistory] = useState<Map<string, SymbolHistory>>(new Map());
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ isConnected: false });
    const [pollingState, setPollingState] = useState<PollingState>({
        isPolling: false,
        interval: 2000,
    });
    // Map lets me treat the alerts like a dictionary
    // Making it a map also makes it much easier to handle
    const [symbolAlerts, setSymbolAlerts] = useState<Map<string, SymbolAlert>>(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const intervalRef = useRef<number | null>(null);
    const symbolsRef = useRef<SymbolData[]>([]);
    symbolsRef.current = symbols;

    // Mirroring alerts into a ref so pollOnce dependenciis read the latest 
    const symbolAlertsRef = useRef<Map<string, SymbolAlert>>(symbolAlerts);
    symbolAlertsRef.current = symbolAlerts;

    // Using a ref so that I don't cause re-renders.
    const triggeredRef = useRef<Map<string, { high: boolean; low: boolean }>>(new Map());

    // apiService.ts handles authentication
    // const authenticate = async () => {}

    const pollOnce = useCallback(async () => {
        const names = symbolsRef.current.map((s) => s.name);
        // Using Promise.allSettled even though doc says use Promise.all
        // .all would fail the entire batch if any request fails.
        // I'm assuming the docs wasn't asking me to use the exact method .all but to 
        // handle the batch as a single unit
        const results = await Promise.allSettled(
            names.map((name) => apiService.getSymbolValue(name)),
        );

        setSymbolValues((prev) => {
            const receivedSymbols = new Map(prev);
            results.forEach((r, i) => {
                if (r.status === 'fulfilled') receivedSymbols.set(names[i], r.value);
            });
            const failures = results.filter(r => r.status === 'rejected');

            if (failures.length === results.length && results.length > 0) {
                setError({ message: 'All polls failed', timestamp: new Date() });
            } else if (failures.length === 0 && error) {
                setError(null);
            }
            return receivedSymbols;
        });

        setSymbolHistory((prev) => {
            const receivedHistory = new Map(prev);
            results.forEach((r, i) => {
                if (r.status !== 'fulfilled') return;

                const name = names[i];
                const point: SymbolHistoryPoint = {
                    value: r.value.stVal,
                    timestamp: new Date(),
                    formattedTime: new Date().toLocaleTimeString(),
                };
                const existing = receivedHistory.get(name) ?? { symbolName: name, dataPoints: [], maxPoints: MAX_HISTORY_POINTS };
                const dataPoints = [...existing.dataPoints, point].slice(-MAX_HISTORY_POINTS); // extract the last 50
                while (
                    dataPoints.length > 1 &&
                    dataPoints[dataPoints.length - 1].timestamp.getTime() - dataPoints[0].timestamp.getTime() > HISTORY_WINDOW_MS
                ) {
                    dataPoints.shift();
                }
                receivedHistory.set(name, { ...existing, dataPoints });
            });
            return receivedHistory;
        });

        // Threshold checks
        const alerts = symbolAlertsRef.current;
        results.forEach((r, i) => {
            if (r.status !== 'fulfilled') {
                return;
            }

            const alert = alerts.get(names[i]);
            if (!alert) {
                return
            };

            const stVal = r.value.stVal;
            const triggered = triggeredRef.current.get(names[i]) ?? { high: false, low: false };

            // Need to check both high and low since they both send different toasts
            // could check both in the same if statement but this makes it easier to read
            if (alert.highThreshold != null) {
                // Has to be inclusive
                if (stVal >= alert.highThreshold) {
                    if (!triggered.high) {
                        toast.error(`⚠ ${names[i]} value (${stVal}) exceeded high threshold (${alert.highThreshold})`);
                        triggered.high = true;
                    }
                } else {
                    triggered.high = false;
                }
            }

            if (alert.lowThreshold != null) {
                // Has to be inclusive
                if (stVal <= alert.lowThreshold) {
                    if (!triggered.low) {
                        toast.error(`⚠ ${names[i]} value (${stVal}) dropped below low threshold (${alert.lowThreshold})`);
                        triggered.low = true;
                    }
                } else {
                    triggered.low = false;
                }
            }

            triggeredRef.current.set(names[i], triggered);
        });
    }, []);

    const loadSymbols = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.getSymbols();
            setSymbols(data.slice(0, MAX_SYMBOLS));  // Handled on the mock server but doing it here as well
            setConnectionStatus({ isConnected: true, lastConnection: new Date() });
        } catch (e) {
            setError(e as ApiError);
            setConnectionStatus({ isConnected: false, lastConnection: new Date(), error: (e as ApiError).message });
        } finally {
            setLoading(false);
        }
    }, [])


    const startPolling = useCallback(() => {
        setPollingState(prev => prev.isPolling ? prev : { ...prev, isPolling: true, lastPoll: new Date() });
    }, []);

    const stopPolling = useCallback(() => {
        setPollingState(prev => !prev.isPolling ? prev : { ...prev, isPolling: false, lastPoll: new Date() });
    }, []);

    const setPollingInterval = useCallback((interval: number) => {
        setPollingState(prev => ({
            ...prev,
            interval
        }))
    }, [])

    const setAlert = useCallback((symbolName: string, high: number | null, low: number | null) => {
        setSymbolAlerts(prev => {
            const next = new Map(prev);
            next.set(symbolName, { symbolName, highThreshold: high, lowThreshold: low });
            return next;
        });
    }, []);

    const removeAlert = useCallback((symbolName: string) => {
        setSymbolAlerts(prev => {
            const next = new Map(prev);
            next.delete(symbolName);
            return next;
        });
        triggeredRef.current.delete(symbolName);
    }, []);

    useEffect(() => {
        if (!pollingState.isPolling) return;

        pollOnce();
        intervalRef.current = window.setInterval(pollOnce, pollingState.interval);
        return () => {
            if (intervalRef.current !== null) clearInterval(intervalRef.current);
        };
    }, [pollingState.isPolling, pollingState.interval, pollOnce]);

    useEffect(() => { loadSymbols(); }, [loadSymbols]);

    const disconnect = useCallback(() => {
        stopPolling();
        setSymbols([]);
        setSymbolValues(new Map());
        setSymbolHistory(new Map());
        setConnectionStatus({ isConnected: false, lastConnection: new Date() });
    }, [stopPolling]);

    return {
        symbols,
        symbolValues,
        symbolHistory,
        connectionStatus,
        pollingState,
        loading,
        error,
        symbolAlerts,
        setAlert,
        removeAlert,
        // authenticate,
        pollOnce, 
        loadSymbols,
        startPolling,
        stopPolling,
        setPollingInterval,
        disconnect
    }
}