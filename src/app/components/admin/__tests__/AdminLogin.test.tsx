import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminLogin } from '../AdminLogin';
import * as auth from '../../../../lib/supabase/auth';

// Mock the auth module
vi.mock('../../../../lib/supabase/auth', () => ({
  signInAdmin: vi.fn(),
  getCurrentAdmin: vi.fn(),
  updateAdminLastLogin: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show loading state when submitting', async () => {
    vi.mocked(auth.signInAdmin).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });

  it('should navigate to dashboard on successful login', async () => {
    const mockUser = { id: '1', email: 'admin@test.com' };
    const mockSession = { access_token: 'token' };

    vi.mocked(auth.signInAdmin).mockResolvedValue({
      user: mockUser as any,
      session: mockSession as any,
      error: null,
    });
    vi.mocked(auth.getCurrentAdmin).mockResolvedValue({
      id: '1',
      email: 'admin@test.com',
      full_name: 'Admin',
      role: 'admin',
      permissions: {},
      is_active: true,
    } as any);
    vi.mocked(auth.updateAdminLastLogin).mockResolvedValue({ error: null });

    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('should show error on failed login', async () => {
    vi.mocked(auth.signInAdmin).mockResolvedValue({
      user: null,
      session: null,
      error: new Error('Invalid credentials'),
    });

    const { toast } = await import('sonner');

    render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});

