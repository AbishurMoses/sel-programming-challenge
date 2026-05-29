import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      // Only report coverage for the source files that have tests.
      include: [
        'src/components/AuthenticationForm.tsx',
        'src/components/ConnectionStatus.tsx',
        'src/components/SymbolDetailView.tsx',
        'src/components/SymbolsDashboard.tsx',
        'src/components/UserMenu.tsx',
        'src/hooks/useSymbolPolling.ts',
        'src/lib/utils.ts',
        'src/services/apiService.ts',
        'src/services/storageService.ts',
      ],
    },
  },
});
