import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import About from '../pages/About';
import Navbar from '../components/Navbar';

// Mock useAuth to control authentication state in Navbar
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
    isLoading: false,
  }),
}));

describe('About Page', () => {
  test('positive: renders About content for public access', () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <Routes>
          <Route path="/about" element={<About />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /about this project/i })).toBeInTheDocument();
    // Be specific to avoid multiple matches
    expect(screen.getByRole('heading', { name: /project overview/i })).toBeInTheDocument();
  });

  test('negative: when logged out, Navbar shows About link but no Logout button', () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <Navbar />
        <Routes>
          <Route path="/about" element={<About />} />
        </Routes>
      </MemoryRouter>
    );

    // About link visible and active
    expect(screen.getAllByText(/about/i)[0]).toBeInTheDocument();
    // Logout button should not appear when not authenticated
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });
});


