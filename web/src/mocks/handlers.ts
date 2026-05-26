import { http, HttpResponse } from 'msw';
import { symbols } from './data';

const VALID_BASIC_AUTH = `Basic ${btoa('testuser:testpass')}`;
const VALID_BEARER_AUTH = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token';

export const handlers = [
    // handler for authentication endpoint
    http.get('*/auth/token', ({ request }) => {
        const auth = request.headers.get('Authorization');
        console.log('auth header on /auth/token:', auth);

        if (auth !== VALID_BASIC_AUTH) {
            return HttpResponse.json(
                { title: 'Unauthorized', status: 401, detail: 'Invalid credentials' },
                { status: 401 },
            );
        }
        return HttpResponse.json({
            AccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token',
            ExpiresIn: 3600,
            Scope: 'api',
            TokenType: 'Bearer',
        });
    }),

    // handler for Get Symbols endpoint
    http.get('*/symbols', ({ request }) => {
        const url = new URL(request.url)
        const auth = request.headers.get('Authorization');
        // Checking if sort param exists and defaulting to asc. Then making it true/false by comparing to 'asc'
        const isAsc = (url.searchParams.get('sort') ?? 'asc') === 'asc'
        const limit = url.searchParams.get('limit') ?? '50'
        console.log('auth header on /symbols:', auth);

        if (auth !== VALID_BEARER_AUTH) {
            return HttpResponse.json(
                { title: 'Unauthorized', status: 401, detail: 'Invalid credentials' },
                { status: 401 },
            );
        }

        let result = [...symbols]
        if (isAsc) {
            result.sort((a, b) => a.Name.localeCompare(b.Name))
        } else {
            result.sort((a, b) => b.Name.localeCompare(a.Name))
        }
        result = result.slice(0, Number(limit));

        return HttpResponse.json(result);
    })
];

