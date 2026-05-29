import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import SymbolDetailView from '@/components/SymbolDetailView';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Symbol as SymbolData, SymbolValue, SymbolHistory } from '@/types/api';

const { ctxState } = vi.hoisted(() => ({
    ctxState: {
        symbols: [] as SymbolData[],
        symbolValues: new Map<string, SymbolValue>(),
        symbolHistory: new Map<string, SymbolHistory>(),
        pollingState: { isPolling: false, interval: 2000 },
        connectionStatus: { isConnected: true },
        loading: false,
        error: null,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        setPollingInterval: vi.fn(),
        pollOnce: vi.fn(),
        loadSymbols: vi.fn(),
        disconnect: vi.fn(),
    },
}));

vi.mock('@/context/SymbolPollingContext', () => ({
    useSymbolPollingContext: () => ctxState,
}));

function renderInDialog(name: string) {
    return render(
        <Dialog open>
            <DialogContent>
                <SymbolDetailView name={name} />
            </DialogContent>
        </Dialog>,
    );
}

beforeEach(() => {
    ctxState.symbols = [{ name: 'TempA', type: 'INS', description: 'Temp sensor A' }];
    ctxState.symbolValues = new Map();
    ctxState.symbolHistory = new Map();
    ctxState.pollingState = { isPolling: false, interval: 2000 };
    ctxState.connectionStatus = { isConnected: true };
    ctxState.loading = false;
    ctxState.error = null;
    ctxState.startPolling.mockClear();
});

describe('SymbolDetailView', () => {
    it('renders empty state with Start Polling button when no data and polling off', () => {
        renderInDialog('TempA');

        expect(screen.getByText('TempA')).toBeDefined();
        expect(screen.getByText(/no live data yet/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /start polling/i })).toBeDefined();
    });

    it('renders waiting message when no data but polling is on', () => {
        ctxState.pollingState = { isPolling: true, interval: 2000 };
        renderInDialog('TempA');

        expect(screen.getByText(/waiting for the first poll/i)).toBeDefined();
        expect(screen.queryByRole('button', { name: /start polling/i })).toBeNull();
    });

    it('calls startPolling when Start Polling button is clicked from empty state', () => {
        renderInDialog('TempA');
        fireEvent.click(screen.getByRole('button', { name: /start polling/i }));
        expect(ctxState.startPolling).toHaveBeenCalledTimes(1);
    });

    it('renders full detail cards when value is present', () => {
        const now = new Date();
        ctxState.symbolValues = new Map([
            [
                'TempA',
                {
                    symbolName: 'TempA',
                    stVal: 42,
                    t: '10:00:00',
                    lastUpdated: now,
                    rawData: {
                        stVal: 42,
                        range: 'normal',
                        units: 'mV',
                        multiplier: 1,
                        q: {
                            validity: 'good',
                            detailQual: { overflow: false, outOfRange: false },
                        },
                    },
                } as SymbolValue,
            ],
        ]);
        ctxState.symbolHistory = new Map([
            ['TempA', { symbolName: 'TempA', dataPoints: [{ value: 42, timestamp: now, formattedTime: '10:00:00' }], maxPoints: 50 }],
        ]);

        renderInDialog('TempA');

        expect(screen.getByText('Current State')).toBeDefined();
        expect(screen.getByText('Symbol Info')).toBeDefined();
        expect(screen.getByText('Value History')).toBeDefined();
        expect(screen.getByText('Quality Details')).toBeDefined();
    });

    it('renders symbol metadata in the header', () => {
        renderInDialog('TempA');
        expect(screen.getByText('TempA')).toBeDefined();
        expect(screen.getByText('Temp sensor A')).toBeDefined();
    });

    it('renders value-present cards with minimal rawData and no history', () => {
        ctxState.symbolValues = new Map([
            [
                'TempA',
                {
                    symbolName: 'TempA',
                    stVal: 7,
                    t: '10:00:00',
                    lastUpdated: new Date(),
                    rawData: {},
                } as SymbolValue,
            ],
        ]);

        renderInDialog('TempA');

        expect(screen.getByText('Current State')).toBeDefined();
        expect(screen.getByText('Value History')).toBeDefined();
        expect(screen.getByText('Quality Details')).toBeDefined();
    });
});
