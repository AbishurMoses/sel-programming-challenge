import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL

export const httpClient = axios.create({
    baseURL,
    timeout: 10_000,
    headers: {
        Accept: 'application/json',
    },
});