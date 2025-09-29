import React from 'react'
import { render, screen } from '@testing-library/react'
import ShippingScreen from '../ShippingScreen'
import { MemoryRouter } from 'react-router-dom'

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    console.warn(msg);
  });
});

test('renders ShippingScreen', () => {
  render(<MemoryRouter><ShippingScreen /></MemoryRouter>)
  expect(screen.getByText(/ShippingScreen/i)).toBeInTheDocument()
})
