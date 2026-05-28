import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import SymbolsDashboard from '@/components/SymbolsDashboard';
import type { Symbol as SymbolData, SymbolValue } from '@/types/api';

const ctxState = {
    symbols: [] as SymbolData[],
    symbolValues: new Map<string, SymbolValue>(),
    symbolHistory: new Map(),
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
};

vi.mock('@/context/SymbolPollingContext', () => ({
    useSymbolPollingContext: () => ctxState,
}));

function makeSymbol(name: string, description = name): SymbolData {
    return { name, type: 'INS', description };
}

function makeValue(name: string, stVal: number, lastUpdated = new Date()): SymbolValue {
    return {
        symbolName: name,
        stVal,
        t: '10:00:00',
        lastUpdated,
    };
}

beforeEach(() => {
    ctxState.symbols = [];
    ctxState.symbolValues = new Map();
    ctxState.pollingState = { isPolling: false, interval: 2000 };
    ctxState.connectionStatus = { isConnected: true };
    ctxState.loading = false;
    ctxState.error = null;
    Object.values(ctxState).forEach((v) => typeof v === 'function' && (v as ReturnType<typeof vi.fn>).mockClear?.());
});

describe('SymbolsDashboard', () => {
    it('should render symbols table', () => {
        ctxState.symbols = [makeSymbol('TempA'), makeSymbol('TempB')];
        ctxState.symbolValues = new Map([
            ['TempA', makeValue('TempA', 42)],
            ['TempB', makeValue('TempB', 99)],
        ]);
        render(<SymbolsDashboard onSymbolClick={() => {}} />);

        expect(screen.getByText('TempA')).toBeDefined();
        expect(screen.getByText('TempB')).toBeDefined();
        expect(screen.getByText('42')).toBeDefined();
        expect(screen.getByText('99')).toBeDefined();
    });

    it('should filter symbols by search term', () => {
        ctxState.symbols = [makeSymbol('TempA'), makeSymbol('Pressure')];
        ctxState.symbolValues = new Map([
            ['TempA', makeValue('TempA', 42)],
            ['Pressure', makeValue('Pressure', 7)],
        ]);
        render(<SymbolsDashboard onSymbolClick={() => {}} />);

        const search = screen.getByPlaceholderText(/search symbols/i);
        fireEvent.change(search, { target: { value: 'Temp' } });

        expect(screen.getByText('TempA')).toBeDefined();
        expect(screen.queryByText('Pressure')).toBeNull();
    });

    it('should sort by column click', () => {
        ctxState.symbols = [makeSymbol('Zeta'), makeSymbol('Alpha')];
        ctxState.symbolValues = new Map([
            ['Zeta', makeValue('Zeta', 1)],
            ['Alpha', makeValue('Alpha', 2)],
        ]);
        render(<SymbolsDashboard onSymbolClick={() => {}} />);

        // Pre-sort: Zeta then Alpha (input order)
        const rowsBefore = screen.getAllByRole('row').slice(1); // skip header
        expect(within(rowsBefore[0]).getByText('Zeta')).toBeDefined();

        fireEvent.click(screen.getByRole('button', { name: /symbol name/i }));

        const rowsAfter = screen.getAllByRole('row').slice(1);
        expect(within(rowsAfter[0]).getByText('Alpha')).toBeDefined();
        expect(within(rowsAfter[1]).getByText('Zeta')).toBeDefined();
    });

    it('should paginate results', () => {
        ctxState.symbols = Array.from({ length: 15 }, (_, i) => makeSymbol(`Sym${i.toString().padStart(2, '0')}`));
        ctxState.symbolValues = new Map(ctxState.symbols.map((s, i) => [s.name, makeValue(s.name, i)]));
        render(<SymbolsDashboard onSymbolClick={() => {}} />);

        // Page size default is 10
        expect(screen.getByText('Sym00')).toBeDefined();
        expect(screen.queryByText('Sym10')).toBeNull();

        // Click next page (the right chevron button)
        const buttons = screen.getAllByRole('button');
        const nextBtn = buttons.find((b) => b.querySelector('.lucide-chevron-right') !== null);
        if (nextBtn) fireEvent.click(nextBtn);

        expect(screen.getByText('Sym10')).toBeDefined();
    });

    it('should open detail modal on row click', () => {
        ctxState.symbols = [makeSymbol('TempA')];
        ctxState.symbolValues = new Map([['TempA', makeValue('TempA', 42)]]);
        const onSymbolClick = vi.fn();

        render(<SymbolsDashboard onSymbolClick={onSymbolClick} />);

        const row = screen.getByText('TempA').closest('tr')!;
        fireEvent.click(row);

        expect(onSymbolClick).toHaveBeenCalledWith('TempA');
    });

    it('should show skeleton while loading with no rows', () => {
        ctxState.loading = true;
        ctxState.symbols = [];
        render(<SymbolsDashboard onSymbolClick={() => {}} />);
        // Skeleton renders something — assert search input is NOT present (which it would be in normal table)
        expect(screen.queryByPlaceholderText(/search symbols/i)).toBeNull();
    });

    it('should render CSV export button', () => {
        ctxState.symbols = [makeSymbol('TempA')];
        ctxState.symbolValues = new Map([['TempA', makeValue('TempA', 42)]]);
        render(<SymbolsDashboard onSymbolClick={() => {}} />);

        // ExportCSV renders some download trigger — assert the button or link exists
        const exportTrigger = screen.queryByText(/csv|export|download/i);
        expect(exportTrigger).not.toBeNull();
    });
});
