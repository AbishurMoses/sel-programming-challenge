import type { AuthCredentials, AuthTokenResponse } from '@/types/api';
import { httpClient } from './httpClient';
import type { AxiosInstance } from 'axios';

const TOKEN_KEY = 'sel.token';
const EXPIRY_KEY = 'sel.tokenExpiry';

export class SELApiService {
    private token: string | null = null;
    private tokenExpiry: number | null = null;
    private http: AxiosInstance;

    constructor(http: AxiosInstance = httpClient) {
        this.http = http;
        this.hydrateFromStorage();
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

    async authenticate(credentials: AuthCredentials): Promise<boolean> {
        const basic = btoa(`${credentials.username}:${credentials.password}`);

        const { data } = await this.http.get<AuthTokenResponse>('/auth/token', {
            headers: { Authorization: `Basic ${basic}` },
        });

        this.setToken(data.AccessToken, data.ExpiresIn);
        return true;
    }
}

export const apiService = new SELApiService();     