import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL ?? 'https://192.168.3.2/api/v1';

export const httpClient = axios.create({
    baseURL,
    timeout: 3_000,
    headers: {
        Accept: 'application/json',
    },
});