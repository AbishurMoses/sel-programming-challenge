import { http, HttpResponse } from 'msw';

const VALID_AUTH = `Basic ${btoa('testuser:testpass')}`;

export const handlers = [
    http.get('*/auth/token', ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth !== VALID_AUTH) {
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
];