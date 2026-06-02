import type { ApiError, AuthCredentials, AuthTokenResponse, Symbol, SymbolValue, Theme, rawApiSymbol } from '@/types/api';
import { httpClient } from './httpClient';
import type { AxiosInstance } from 'axios';
import axios from 'axios';
import { storageService, STORAGE_KEYS } from './storageService';

export class SELApiService {
    private token: string | null = null;
    private tokenExpiry: number | null = null;
    private http: AxiosInstance;
    public onUnauthorized?: () => void;

    constructor(http: AxiosInstance = httpClient) {
        this.http = http;
        this.hydrateFromStorage();
        this.installInterceptors();
    }

    getServerUrl(): string {
        return this.http.defaults.baseURL ?? "—";
    }

    setSettings(settings: { theme: Theme; pollingInterval: number; autoStartPolling: boolean }): void {
        storageService.set(STORAGE_KEYS.theme, settings.theme);
        storageService.setNumber(STORAGE_KEYS.pollingInterval, settings.pollingInterval);
        storageService.setBoolean(STORAGE_KEYS.autoStartPolling, settings.autoStartPolling);
    }

    getSettings(): { theme: Theme | null; pollingInterval: number | null; autoStartPolling: boolean } {
        const theme = storageService.get(STORAGE_KEYS.theme) as Theme | null;
        const pollingInterval = storageService.getNumber(STORAGE_KEYS.pollingInterval) ?? null;
        const autoStartPolling = storageService.getBoolean(STORAGE_KEYS.autoStartPolling);
        const parsed = {
            theme: theme ?? "auto",
            pollingInterval: pollingInterval ?? 2000,
            autoStartPolling: autoStartPolling ?? false,
        }
        return {
            theme: parsed.theme ?? "auto",
            pollingInterval: parsed.pollingInterval ?? 2000,
            autoStartPolling: parsed.autoStartPolling ?? false,
        };
    }

    setCredentials(username: string, password: string): void {
        storageService.set(STORAGE_KEYS.username, username);
        storageService.set(STORAGE_KEYS.password, password);
    }

    getCredentials(): { username: string; password: string } | null {
        const username = storageService.get(STORAGE_KEYS.username);
        const password = storageService.get(STORAGE_KEYS.password);
        if (username && password) {
            return { username, password };
        }
        return null;
    }

    setToken(token: string, expiresInSeconds: number): void {
        this.token = token;
        this.tokenExpiry = Date.now() + expiresInSeconds * 1000;
        storageService.set(STORAGE_KEYS.token, token);
        storageService.setNumber(STORAGE_KEYS.tokenExpiry, this.tokenExpiry);
    }

    clearToken(): void {
        this.token = null;
        this.tokenExpiry = null;
        storageService.remove(STORAGE_KEYS.token);
        storageService.remove(STORAGE_KEYS.tokenExpiry);
    }

    isTokenValid(): boolean {
        if (this.token !== null && this.tokenExpiry !== null && Date.now() < this.tokenExpiry) {
            return true
        }
        return false
    }

    getToken(): string | null {
        return this.isTokenValid() ? this.token : null;
    }

    private hydrateFromStorage(): void {
        const storedToken = storageService.get(STORAGE_KEYS.token);
        const storedExpiry = storageService.getNumber(STORAGE_KEYS.tokenExpiry);
        if (!storedToken || storedExpiry === null) return;

        if (Date.now() >= storedExpiry) {
            this.clearToken();
            return;
        }

        this.token = storedToken;
        this.tokenExpiry = storedExpiry;
    }

    private installInterceptors(): void {
        this.http.interceptors.request.use((config) => {
            // Doesn't overrite authentication. Protects basic auth (authentication)
            if (config.headers.Authorization) {
                return config;
            }
            const token = this.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        this.http.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    const wasAuthenticated = this.token !== null;
                    this.clearToken();
                    if (wasAuthenticated) this.onUnauthorized?.();
                }
                return Promise.reject(error);
            },
        );
    }

    private handleError(error: unknown): never {
        if (axios.isAxiosError(error)) {
            const isTimeout =
                error.code === 'ECONNABORTED' ||
                error.code === 'ETIMEDOUT' ||
                /timeout/i.test(error.message ?? '');
            if (isTimeout) {
                throw {
                    message: 'Request timed out',
                    timestamp: new Date(),
                } satisfies ApiError;
            }

            if (!error.response) {
                throw {
                    message: 'Network connection failed',
                    timestamp: new Date(),
                } satisfies ApiError;
            }

            const status = error.response.status;
            const detail =
                (error.response.data as { detail?: string } | undefined)?.detail;

            if (status === 401) {
                throw {
                    message: detail ?? 'Invalid credentials',
                    status,
                    timestamp: new Date(),
                } satisfies ApiError;
            }

            throw {
                message: detail ?? `Request failed (${status})`,
                status,
                timestamp: new Date(),
            } satisfies ApiError;
        }

        if (axios.isCancel(error)) {
            throw {
                message: 'Request cancelled',
                timestamp: new Date(),
                cancelled: true,
            } satisfies ApiError;
        }

        throw {
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
        } satisfies ApiError;
    }

    async authenticate(credentials: AuthCredentials): Promise<boolean> {
        try {
            const basic = btoa(`${credentials.username}:${credentials.password}`);
            const { data } = await this.http.get<AuthTokenResponse>('/auth/token', {
                headers: { Authorization: `Basic ${basic}` },
            });
            this.setToken(data.AccessToken, data.ExpiresIn);
            return true;
        } catch (error) {
            this.handleError(error);
        }
    }
    
    async getSymbols(): Promise<Symbol[]> {
        try {
            const { data } = await this.http.get<rawApiSymbol[]>('/logic-engine/symbols?sort=asc&limit=50');
            return data.map((s) => this.mapSymbol(s)).filter((s) => s.type === 'INS');
        } catch (error) {
            this.handleError(error);
        }
    }

    private mapSymbol(raw: rawApiSymbol): Symbol {
        return {
            name: raw.Name,
            type: raw.Type,
            description: raw.Description,
        };
    }

    async getSymbolValue(symbolName: string): Promise<SymbolValue> {
        try {
            const { data } = await this.http.get(`/logic-engine/symbols/${symbolName}`);
            return {
                symbolName,
                stVal: data.stVal,
                t: new Date(data.t.value).toLocaleTimeString(),
                lastUpdated: new Date(),
                rawData: data,
            };
        } catch (error) {
            this.handleError(error);
        }
    }
}

export const apiService = new SELApiService();     