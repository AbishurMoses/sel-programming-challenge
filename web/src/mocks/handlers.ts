import { http, HttpResponse } from 'msw'

export const handlers = [
    http.get(`${import.meta.env.VITE_BASE_URL}/auth/token`, () => {
        return HttpResponse.json({
            AccessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            ExpiresIn: 3600,
            Scope: "api",
            TokenType: "Bearer"
        })
    }),
]