import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { ctxState, apiServiceMock } = vi.hoisted(() => ({
    ctxState: {
        symbols: [],
        symbolValues: new Map(),
        symbolHistory: new Map(),
        pollingState: { isPolling: false, interval: 5000 },
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
    apiServiceMock: {
        getSettings: vi.fn(() => ({ theme: 'light', pollingInterval: 5000, autoStartPolling: true })),
        setSettings: vi.fn(),
    },
}));

vi.mock('@/context/SymbolPollingContext', () => ({
    useSymbolPollingContext: () => ctxState,
}));

vi.mock('@/services/apiService', () => ({
    apiService: apiServiceMock,
}));

vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

vi.mock('sonner', () => ({ toast: vi.fn() }));

import UserMenu from '@/components/UserMenu';

beforeEach(() => {
    ctxState.startPolling.mockClear();
    ctxState.stopPolling.mockClear();
    ctxState.setPollingInterval.mockClear();
    apiServiceMock.setSettings.mockClear();
});

describe('UserMenu', () => {
    it('renders all three settings sections', () => {
        render(<UserMenu />);
        expect(screen.getByText('Theme')).toBeDefined();
        expect(screen.getByText('Polling Interval')).toBeDefined();
        expect(screen.getByText('Auto-start Polling')).toBeDefined();
    });

    it('reflects saved settings via radio selection', () => {
        const { container } = render(<UserMenu />);

        const lightRadio = container.querySelector('[role="radio"][value="light"]');
        expect(lightRadio?.getAttribute('data-state')).toBe('checked');

        const fiveSec = container.querySelector('[role="radio"][value="5"]');
        expect(fiveSec?.getAttribute('data-state')).toBe('checked');

        const autoStartOn = container.querySelector('[role="radio"][value="on"]');
        expect(autoStartOn?.getAttribute('data-state')).toBe('checked');
    });

    it('hydrates the polling hook on mount with saved settings', () => {
        render(<UserMenu />);
        expect(ctxState.setPollingInterval).toHaveBeenCalledWith(5000);
        expect(ctxState.startPolling).toHaveBeenCalled();
    });

    it('changes polling interval when a new radio is selected', () => {
        const { container } = render(<UserMenu />);
        const tenSec = container.querySelector('[role="radio"][value="10"]') as HTMLElement;
        fireEvent.click(tenSec);
        expect(ctxState.setPollingInterval).toHaveBeenCalledWith(10000);
    });

    it('toggles autostart off when Off is selected', () => {
        const { container } = render(<UserMenu />);
        const off = container.querySelector('[role="radio"][value="off"]') as HTMLElement;
        fireEvent.click(off);
        expect(ctxState.stopPolling).toHaveBeenCalled();
    });

    it('persists settings via apiService.setSettings on Remember Changes', () => {
        render(<UserMenu />);
        fireEvent.click(screen.getByRole('button', { name: /remember changes/i }));
        expect(apiServiceMock.setSettings).toHaveBeenCalled();
    });
});
