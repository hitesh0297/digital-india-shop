import React from 'react'
import { render, screen } from '@testing-library/react'
import OrderListScreen from '../OrderListScreen'
import { MemoryRouter } from 'react-router-dom'

beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(msg);
  });
});

test('renders OrderListScreen', () => {
  render(<MemoryRouter><OrderListScreen /></MemoryRouter>)
  expect(screen.getByText(/OrderListScreen/i)).toBeInTheDocument()
})
