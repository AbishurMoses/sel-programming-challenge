import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
});

const { apiServiceMock } = vi.hoisted(() => ({
    apiServiceMock: {
        getCredentials: vi.fn(() => null as { username: string; password: string } | null),
        setCredentials: vi.fn(),
        authenticate: vi.fn(),
    },
}));

vi.mock('@/services/apiService', () => ({ apiService: apiServiceMock }));

import AuthenticationForm from '@/components/AuthenticationForm';

beforeEach(() => {
    apiServiceMock.getCredentials.mockReturnValue(null);
    apiServiceMock.setCredentials.mockClear();
    apiServiceMock.authenticate.mockReset();
    apiServiceMock.authenticate.mockResolvedValue(true);
});

function fields(container: HTMLElement) {
    return {
        serverurl: container.querySelector('#serverurl') as HTMLInputElement,
        username: container.querySelector('#username') as HTMLInputElement,
        password: container.querySelector('#password') as HTMLInputElement,
    };
}

function fill(container: HTMLElement, server = 'https://192.168.3.2', user = 'testuser', pass = 'testpass') {
    const f = fields(container);
    fireEvent.change(f.serverurl, { target: { value: server } });
    fireEvent.change(f.username, { target: { value: user } });
    fireEvent.change(f.password, { target: { value: pass } });
}

describe('AuthenticationForm', () => {
    it('renders the server URL, username, and password fields', () => {
        const { container } = render(<AuthenticationForm onSuccess={() => {}} />);
        const f = fields(container);
        expect(f.serverurl).not.toBeNull();
        expect(f.username).not.toBeNull();
        expect(f.password).not.toBeNull();
    });

    it('shows required-field errors and does not authenticate when submitted empty', () => {
        render(<AuthenticationForm onSuccess={() => {}} />);
        fireEvent.click(screen.getByRole('button', { name: /connect to server/i }));

        expect(screen.getByText('Server URL is required.')).toBeDefined();
        expect(screen.getByText('Username is required.')).toBeDefined();
        expect(screen.getByText('Password is required.')).toBeDefined();
        expect(apiServiceMock.authenticate).not.toHaveBeenCalled();
    });

    it('authenticates and calls onSuccess on a valid submit', async () => {
        const onSuccess = vi.fn();
        const { container } = render(<AuthenticationForm onSuccess={onSuccess} />);
        fill(container);
        fireEvent.click(screen.getByRole('button', { name: /connect to server/i }));

        await waitFor(() => expect(onSuccess).toHaveBeenCalled());
        expect(apiServiceMock.authenticate).toHaveBeenCalledWith({
            serverUrl: 'https://192.168.3.2',
            username: 'testuser',
            password: 'testpass',
        });
    });

    it('displays an error message when authentication fails', async () => {
        apiServiceMock.authenticate.mockRejectedValue({ message: 'Invalid credentials' });
        const { container } = render(<AuthenticationForm onSuccess={() => {}} />);
        fill(container, 'https://x', 'bad', 'pass');
        fireEvent.click(screen.getByRole('button', { name: /connect to server/i }));

        const alert = await screen.findByRole('alert');
        expect(alert.textContent).toContain('Invalid credentials');
    });

    it('shows the loading skeleton while authenticating', async () => {
        let resolveAuth!: (v: boolean) => void;
        apiServiceMock.authenticate.mockReturnValue(
            new Promise<boolean>((res) => { resolveAuth = res; }),
        );
        const { container } = render(<AuthenticationForm onSuccess={() => {}} />);
        fill(container, 'https://x', 'bad', 'actor');
        fireEvent.click(screen.getByRole('button', { name: /connect to server/i }));

        // While the request is pending the form is replaced by the loading skeleton.
        expect(await screen.findByText(/authenticating/i)).toBeDefined();
        expect(screen.queryByRole('button', { name: /connect to server/i })).toBeNull();

        resolveAuth(true);
    });

    it('persists credentials when "Remember me" is checked', async () => {
        const onSuccess = vi.fn();
        const { container } = render(<AuthenticationForm onSuccess={onSuccess} />);
        fill(container);

        const checkbox = container.querySelector('[role="checkbox"]') as HTMLElement;
        fireEvent.click(checkbox);
        fireEvent.click(screen.getByRole('button', { name: /connect to server/i }));

        await waitFor(() => expect(onSuccess).toHaveBeenCalled());
        expect(apiServiceMock.setCredentials).toHaveBeenCalledWith('testuser', 'testpass');
    });

    it('pre-fills remembered credentials and hides the remember checkbox', () => {
        apiServiceMock.getCredentials.mockReturnValue({ username: 'saved', password: 'secret' });
        const { container } = render(<AuthenticationForm onSuccess={() => {}} />);

        expect(fields(container).username.value).toBe('saved');
        expect(container.querySelector('[role="checkbox"]')).toBeNull();
    });
});
