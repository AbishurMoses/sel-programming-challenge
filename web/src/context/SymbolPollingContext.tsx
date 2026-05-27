import useSymbolPolling from '@/hooks/useSymbolPolling';
import { createContext, useContext } from 'react';

type PollingValue = ReturnType<typeof useSymbolPolling>;
const Ctx = createContext<PollingValue | null>(null);

export function SymbolPollingProvider({ children }: { children: React.ReactNode }) {
    const value = useSymbolPolling();
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSymbolPollingContext() {
    const v = useContext(Ctx);
    if (!v) throw new Error('useSymbolPollingContext must be used inside SymbolPollingProvider');
    return v;
}