import { SELApiService } from '@/services/apiService';
import axios, { type AxiosInstance } from 'axios';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const BASE = 'http://test.local/api/v1';

const server = setupServer(
    http.get('*/auth/token', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth === `Basic ${btoa('testuser:testpass')}`) {
            return HttpResponse.json({
                AccessToken: 'token-val',
                ExpiresIn: 3600,
                Scope: 'api',
                TokenType: 'Bearer',
            });
        }
        return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
});
afterAll(() => server.close());

function makeService(): { service: SELApiService; client: AxiosInstance } {
    const client = axios.create({
        baseURL: BASE,
        timeout: 10_000,
        adapter: 'fetch',
        headers: { Accept: 'application/json' },
    });
    const service = new SELApiService(client);
    return { service, client };
}

beforeEach(() => {
    localStorage.clear();
})

describe('SELApiService', () => {
    it('authenticates with valid credentials', async () => {
        const { service } = makeService();
        const result = await service.authenticate({
            serverUrl: BASE,
            username: 'testuser',
            password: 'testpass',
        });

        expect(result).toBe(true);
        expect(service.isTokenValid()).toBe(true);
    });
    it('should store token after successful auth', async () => {
        const { service } = makeService();
        await service.authenticate({ serverUrl: BASE, username: 'testuser', password: 'testpass' });

        expect(localStorage.getItem('sel.token')).toBe('token-val');
        const expiry = Number(localStorage.getItem('sel.tokenExpiry'));
        expect(expiry).toBeGreaterThan(Date.now());

        const { service: rehydrated } = makeService();
        expect(rehydrated.isTokenValid()).toBe(true);
        expect(rehydrated.getToken()).toBe('token-val');
    });
    it('should inject Bearer token in requests', async () => {
        const seen: string[] = [];
        server.use(
            http.get('*/logic-engine/symbols', ({ request }) => {
                seen.push(request.headers.get('Authorization') ?? '');
                return HttpResponse.json([]);
            }),
        );

        const { service, client } = makeService();
        await service.authenticate({ serverUrl: BASE, username: 'testuser', password: 'testpass' });
        await client.get('/logic-engine/symbols');

        expect(seen).toEqual(['Bearer token-val']);
    });
    it('clears token and notifies on 401', async () => {
        server.use(
            http.get('*/logic-engine/symbols', () =>
                HttpResponse.json({ detail: 'Token expired' }, { status: 401 }),
            ),
        );

        const { service, client } = makeService();
        service.setToken('stale-token', 3600);

        const onUnauthorized = vi.fn();
        service.onUnauthorized = onUnauthorized;

        await expect(client.get('/logic-engine/symbols')).rejects.toThrow();

        expect(service.isTokenValid()).toBe(false);
        expect(localStorage.getItem('sel.token')).toBeNull();
        expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });
    it('normalizes invalid credentials into ApiError', async () => {
        const { service } = makeService();
        await expect(
            service.authenticate({ serverUrl: BASE, username: 'wrong', password: 'bad' }),
        ).rejects.toMatchObject({
            message: 'Invalid credentials',
            status: 401,
        });
    });
    it('normalizes network failure into ApiError', async () => {
        server.use(http.get('*/auth/token', () => HttpResponse.error()));
        const { service } = makeService();
        await expect(
            service.authenticate({ serverUrl: BASE, username: 'u', password: 'p' }),
        ).rejects.toMatchObject({ message: 'Network connection failed' });
    });

    it('normalizes timeout into ApiError', async () => {
        server.use(
            http.get('*/auth/token', async () => {
                await new Promise((r) => setTimeout(r, 50));
                return HttpResponse.json({});
            }),
        );

        const client = axios.create({ baseURL: BASE, timeout: 10, adapter: 'fetch' });
        const service = new SELApiService(client);

        await expect(
            service.authenticate({ serverUrl: BASE, username: 'u', password: 'p' }),
        ).rejects.toMatchObject({ message: 'Request timed out' });
    });

    it('getSymbols maps PascalCase to camelCase and filters to INS only', async () => {
        server.use(
            http.get('*/logic-engine/symbols', () =>
                HttpResponse.json([
                    { Name: 'TempA', Type: 'INS', Description: 'Temperature A' },
                    { Name: 'CounterB', Type: 'INT', Description: 'Counter B' },
                    { Name: 'PressureC', Type: 'INS' },
                ]),
            ),
        );

        const { service } = makeService();
        service.setToken('token-val', 3600);

        const symbols = await service.getSymbols();

        expect(symbols).toEqual([
            { name: 'TempA', type: 'INS', description: 'Temperature A' },
            { name: 'PressureC', type: 'INS', description: undefined },
        ]);
    });

    it('getSymbols normalizes errors into ApiError', async () => {
        server.use(
            http.get('*/logic-engine/symbols', () =>
                HttpResponse.json({ detail: 'Server exploded' }, { status: 500 }),
            ),
        );

        const { service } = makeService();
        service.setToken('token-val', 3600);

        await expect(service.getSymbols()).rejects.toMatchObject({
            message: 'Server exploded',
            status: 500,
        });
    });

    it('getSymbolValue maps response, formats time, and stamps lastUpdated', async () => {
        const isoTimestamp = '2026-05-27T14:58:12.237Z';
        server.use(
            http.get('*/logic-engine/symbols/:name', ({ params }) => {
                expect(params.name).toBe('AnalogDeadband');
                return HttpResponse.json({
                    stVal: 66,
                    t: { value: isoTimestamp },
                    range: 'normal',
                    units: 'mV',
                });
            }),
        );

        const { service } = makeService();
        service.setToken('token-val', 3600);

        const before = Date.now();
        const result = await service.getSymbolValue('AnalogDeadband');
        const after = Date.now();

        expect(result.symbolName).toBe('AnalogDeadband');
        expect(result.stVal).toBe(66);
        expect(result.t).toBe(new Date(isoTimestamp).toLocaleTimeString());
        expect(result.lastUpdated.getTime()).toBeGreaterThanOrEqual(before);
        expect(result.lastUpdated.getTime()).toBeLessThanOrEqual(after);
        expect(result.rawData).toMatchObject({ stVal: 66, range: 'normal', units: 'mV' });
    });

    it('getSymbolValue normalizes errors into ApiError', async () => {
        server.use(
            http.get('*/logic-engine/symbols/:name', () =>
                new HttpResponse(null, { status: 503 }),
            ),
        );

        const { service } = makeService();
        service.setToken('token-val', 3600);

        await expect(service.getSymbolValue('AnalogDeadband')).rejects.toMatchObject({
            message: 'Request failed (503)',
            status: 503,
        });
    });
});