import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import PaymentScreen from '../PaymentScreen'
import { MemoryRouter } from 'react-router-dom'

const mockStore = configureStore([])
const initialState = {
  cart: { cartItems: [{ price: 100, qty: 2 }], shippingAddress: {}, paymentMethod: 'card', paymentDetails: {} },
  userLogin: { userInfo: { name: 'Test User' } }
}


beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(msg);
  });
});

test('renders PaymentScreen', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><PaymentScreen /></MemoryRouter></Provider>)
  expect(screen.getByText(/Payment/i)).toBeInTheDocument()
})
