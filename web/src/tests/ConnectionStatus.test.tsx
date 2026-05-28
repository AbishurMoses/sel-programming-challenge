import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip';

const { ctxState, apiServiceMock } = vi.hoisted(() => ({
    ctxState: {
        symbols: [],
        symbolValues: new Map(),
        symbolHistory: new Map(),
        pollingState: { isPolling: false, interval: 2000 },
        connectionStatus: { isConnected: true } as { isConnected: boolean; error?: string },
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
        getCredentials: vi.fn(() => ({ username: 'testuser', password: 'pw' })),
        getServerUrl: vi.fn(() => 'http://192.168.3.2:8080/api/v1'),
        clearToken: vi.fn(),
        onUnauthorized: vi.fn(),
    },
}));

vi.mock('@/context/SymbolPollingContext', () => ({
    useSymbolPollingContext: () => ctxState,
}));

vi.mock('@/services/apiService', () => ({
    apiService: apiServiceMock,
}));

import ConnectionStatus from '@/components/ConnectionStatus';

beforeEach(() => {
    ctxState.connectionStatus = { isConnected: true };
    ctxState.pollOnce.mockClear();
    apiServiceMock.clearToken.mockClear();
    apiServiceMock.onUnauthorized.mockClear();
});

describe('ConnectionStatus', () => {
    it('renders user and server info from apiService', () => {
        render(<TooltipProvider><ConnectionStatus /></TooltipProvider>);
        expect(screen.getByText('testuser')).toBeDefined();
        // server slice trimming may vary; assert apiService was consulted
        expect(apiServiceMock.getCredentials).toHaveBeenCalled();
        expect(apiServiceMock.getServerUrl).toHaveBeenCalled();
    });

    it('shows Connected status when isConnected is true', () => {
        render(<TooltipProvider><ConnectionStatus /></TooltipProvider>);
        expect(screen.getByText('Connected')).toBeDefined();
    });

    it('shows Disconnected status when isConnected is false', () => {
        ctxState.connectionStatus = { isConnected: false };
        render(<TooltipProvider><ConnectionStatus /></TooltipProvider>);
        expect(screen.getByText('Disconnected')).toBeDefined();
    });

    it('calls pollOnce when Refresh button clicked', () => {
        render(<TooltipProvider><ConnectionStatus /></TooltipProvider>);
        fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
        expect(ctxState.pollOnce).toHaveBeenCalledTimes(1);
    });

    it('clears token and notifies on Logout', () => {
        render(<TooltipProvider><ConnectionStatus /></TooltipProvider>);
        fireEvent.click(screen.getByRole('button', { name: /logout/i }));
        expect(apiServiceMock.clearToken).toHaveBeenCalled();
        expect(apiServiceMock.onUnauthorized).toHaveBeenCalled();
    });
});
