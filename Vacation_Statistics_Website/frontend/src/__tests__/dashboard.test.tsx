import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock AuthContext at module level (hoisted) so components read the mocked hook
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { email: 'admin@example.com', first_name: 'Admin', last_name: 'User' },
    token: 'token',
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: true,
    isLoading: false,
  })),
}));

import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../pages/Dashboard';

// Mock the stats API module to avoid real HTTP calls
jest.mock('../services/Api', () => ({
  statsAPI: {
    getSummaryStats: jest.fn().mockResolvedValue({
      vacationStats: { pastVacations: 1, ongoingVacations: 2, futureVacations: 3 },
      totalUsers: 5,
      totalLikes: 10,
      topDestinations: [
        { destination: 'Rome', likes: 4 },
        { destination: 'Paris', likes: 3 },
      ],
    }),
  },
}));

describe('Dashboard Page', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('positive: renders dashboard content for authenticated user', async () => {
    const { useAuth } = require('../context/AuthContext');
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: 'admin@example.com', first_name: 'Admin', last_name: 'User' },
      token: 'token',
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/statistics dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/total users/i)).toBeInTheDocument();
  });

  test('negative: redirects unauthenticated user to login', async () => {
    const { useAuth } = require('../context/AuthContext');
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });
});


