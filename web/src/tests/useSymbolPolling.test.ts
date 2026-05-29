import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import useSymbolPolling from '@/hooks/useSymbolPolling';
import { apiService } from '@/services/apiService';

const BASE_SYMBOLS = [
    { Name: 'TempA', Type: 'INS', Description: 'Temp sensor A' },
    { Name: 'TempB', Type: 'INS', Description: 'Temp sensor B' },
    { Name: 'CounterC', Type: 'INT', Description: 'Counter (filtered out)' },
];

function makeValuePayload(stVal: number, isoTimestamp = new Date().toISOString()) {
    return {
        stVal,
        t: { value: isoTimestamp },
        range: 'normal',
        units: 'mV',
        q: { validity: 'good' },
    };
}

const server = setupServer(
    http.get('*/logic-engine/symbols', () => HttpResponse.json(BASE_SYMBOLS)),
    http.get('*/logic-engine/symbols/:name', () =>
        HttpResponse.json(makeValuePayload(42, `2026-05-27T14:58:12.000Z`)),
    ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
    apiService.setToken('test-token', 3600);
    vi.useRealTimers();
});

describe('useSymbolPolling', () => {
    it('should load symbols on mount', async () => {
        const { result } = renderHook(() => useSymbolPolling());

        await waitFor(() => expect(result.current.symbols.length).toBeGreaterThan(0));

        expect(result.current.symbols.map((s) => s.name)).toEqual(['TempA', 'TempB']);
        expect(result.current.connectionStatus.isConnected).toBe(true);
        expect(result.current.loading).toBe(false);
    });

    it('should start polling when startPolling called', async () => {
        const { result } = renderHook(() => useSymbolPolling());

        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        act(() => result.current.startPolling());
        expect(result.current.pollingState.isPolling).toBe(true);
    });

    it('should stop polling when stopPolling called', async () => {
        const { result } = renderHook(() => useSymbolPolling());

        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        act(() => result.current.startPolling());
        expect(result.current.pollingState.isPolling).toBe(true);

        act(() => result.current.stopPolling());
        expect(result.current.pollingState.isPolling).toBe(false);
    });

    it('should update values at configured interval', async () => {
        const fetchCounts = new Map<string, number>();
        server.use(
            http.get('*/logic-engine/symbols/:name', ({ params }) => {
                const name = params.name as string;
                fetchCounts.set(name, (fetchCounts.get(name) ?? 0) + 1);
                return HttpResponse.json(makeValuePayload(fetchCounts.get(name)!));
            }),
        );

        const { result } = renderHook(() => useSymbolPolling());
        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        act(() => result.current.setPollingInterval(1));
        act(() => result.current.startPolling());

        await waitFor(() => {
            expect(fetchCounts.get('TempA')).toBeGreaterThanOrEqual(2);
            expect(fetchCounts.get('TempB')).toBeGreaterThanOrEqual(2);
        });

        act(() => result.current.stopPolling());

        expect(result.current.symbolValues.get('TempA')?.stVal).toBeDefined();
        expect(result.current.symbolValues.get('TempB')?.stVal).toBeDefined();
    });

    it('should handle individual symbol fetch failures', async () => {
        server.use(
            http.get('*/logic-engine/symbols/:name', ({ params }) => {
                if (params.name === 'TempA') {
                    return new HttpResponse(null, { status: 503 });
                }
                return HttpResponse.json(makeValuePayload(99));
            }),
        );

        const { result } = renderHook(() => useSymbolPolling());
        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        await act(async () => {
            await result.current.pollOnce();
        });

        // TempA failed but TempB succeeded so loop should not abort
        expect(result.current.symbolValues.get('TempA')).toBeUndefined();
        expect(result.current.symbolValues.get('TempB')?.stVal).toBe(99);
        expect(result.current.error).toBeNull();
    });

    it('should maintain 5-minute rolling window in history', async () => {
        const { result } = renderHook(() => useSymbolPolling());
        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        await act(async () => {
            await result.current.pollOnce();
        });

        const hist = result.current.symbolHistory.get('TempA');
        expect(hist).toBeDefined();
        expect(hist!.dataPoints.length).toBeGreaterThan(0);

        // is 1 min over stale threshold
        const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000);
        hist!.dataPoints.unshift({
            value: 0,
            timestamp: sixMinAgo,
            formattedTime: sixMinAgo.toLocaleTimeString(),
        });

        await act(async () => {
            await result.current.pollOnce();
        });

        const updated = result.current.symbolHistory.get('TempA')!;
        const oldest = updated.dataPoints[0].timestamp.getTime();
        const newest = updated.dataPoints[updated.dataPoints.length - 1].timestamp.getTime();
        expect(newest - oldest).toBeLessThanOrEqual(5 * 60 * 1000);
    });

    it('should expose lastUpdated for downstream stale detection', async () => {
        const { result } = renderHook(() => useSymbolPolling());
        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        await act(async () => {
            await result.current.pollOnce();
        });

        const value = result.current.symbolValues.get('TempA');
        expect(value?.lastUpdated).toBeInstanceOf(Date);
        const ageMs = Date.now() - value!.lastUpdated.getTime();
        expect(ageMs).toBeLessThan(1000);
    });

    it('setPollingInterval updates the configured interval', async () => {
        const { result } = renderHook(() => useSymbolPolling());
        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        act(() => result.current.setPollingInterval(5000));
        expect(result.current.pollingState.interval).toBe(5000);
    });

    it('pollOnce can be invoked manually via refresh button', async () => {
        const { result } = renderHook(() => useSymbolPolling());
        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        await act(async () => {
            await result.current.pollOnce();
        });

        expect(result.current.symbolValues.size).toBe(2);
    });

    it('disconnect clears state and stops polling', async () => {
        const { result } = renderHook(() => useSymbolPolling());
        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        await act(async () => {
            await result.current.pollOnce();
        });

        act(() => result.current.startPolling());

        act(() => result.current.disconnect());

        expect(result.current.symbols).toEqual([]);
        expect(result.current.symbolValues.size).toBe(0);
        expect(result.current.symbolHistory.size).toBe(0);
        expect(result.current.pollingState.isPolling).toBe(false);
        expect(result.current.connectionStatus.isConnected).toBe(false);
    });

    it('records all-polls-failed error when every request rejects', async () => {
        server.use(
            http.get('*/logic-engine/symbols/:name', () => new HttpResponse(null, { status: 500 })),
        );

        const { result } = renderHook(() => useSymbolPolling());
        await waitFor(() => expect(result.current.symbols.length).toBe(2));

        await act(async () => {
            await result.current.pollOnce();
        });

        expect(result.current.error?.message).toBe('All polls failed');
    });
});
