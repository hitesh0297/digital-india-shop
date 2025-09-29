import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OrderSuccessScreen from '../OrderSuccessScreen'

beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(msg);
  });
});

test('renders payment success message', () => {
  render(
    <MemoryRouter initialEntries={[{ state: { transactionId: '123', cartItems: [], shippingAddress: {}, paymentMethod: 'card' } }]}>
      <OrderSuccessScreen />
    </MemoryRouter>
  )
  expect(screen.getByText(/Payment Successful/i)).toBeInTheDocument()
  expect(screen.getByText(/Transaction ID/i)).toBeInTheDocument()
})
