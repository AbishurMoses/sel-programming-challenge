import { use, useCallback, useEffect, useRef, useState } from "react";
import { type ApiError, type ConnectionStatus, type PollingState, type SymbolAlert, type Symbol as SymbolData, type SymbolHistory, type SymbolHistoryPoint, type SymbolValue } from "@/types/api";
import { apiService } from "@/services/apiService";

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
    const [symbolAlerts, setSymbolAlerts] = useState<SymbolAlert[]>()
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const intervalRef = useRef<number | null>(null);
    const symbolsRef = useRef<SymbolData[]>([]);
    symbolsRef.current = symbols;

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

    // const setAlert = useCallback((symbolName: string, high: number | null, low: number | null) => {
    //     setSymbolAlerts(prev => {
    //         ...prev,
    //         {
    //             symbolName: symbolName,
    //             high: Number(high),
    //             low: Number(low)
    //         },
    //     })
    // }, [])

    // const removeAlert = useCallback(() => {
    //     setSymbolAlerts(prev => ({
    //         ...prev,
    //         // delete symbolAlert
    //     }))
    // }, [])
 
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
        // authenticate,
        pollOnce, // using for refresh button in connection status
        setSymbolAlerts,
        loadSymbols,
        startPolling,
        stopPolling,
        setPollingInterval,
        disconnect
    }
}