import type { ApiError, AuthCredentials, AuthTokenResponse, Symbol, SymbolValue, rawApiSymbol } from '@/types/api';
import { httpClient } from './httpClient';
import type { AxiosInstance } from 'axios';
import axios from 'axios';

const TOKEN_KEY = 'sel.token';
const EXPIRY_KEY = 'sel.tokenExpiry';

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

    setToken(token: string, expiresInSeconds: number): void {
        this.token = token;
        this.tokenExpiry = Date.now() + expiresInSeconds * 1000;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(EXPIRY_KEY, String(this.tokenExpiry));
    }

    clearToken(): void {
        this.token = null;
        this.tokenExpiry = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EXPIRY_KEY);
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
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedExpiry = localStorage.getItem(EXPIRY_KEY);
        if (!storedToken || !storedExpiry) return;

        const expiry = Number(storedExpiry);
        if (Number.isNaN(expiry) || Date.now() >= expiry) {
            this.clearToken();
            return;
        }

        this.token = storedToken;
        this.tokenExpiry = expiry;
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


    // Need to map variable from rawApiSymbol to match Symbol
    async getSymbols(): Promise<Symbol[]> {
        try {
            const { data } = await this.http.get<rawApiSymbol[]>('/logic-engine/symbols');
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