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
});