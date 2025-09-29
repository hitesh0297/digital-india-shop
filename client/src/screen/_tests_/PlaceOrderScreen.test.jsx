import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import PlaceOrderScreen from '../PlaceOrderScreen'
import { MemoryRouter } from 'react-router-dom'

const mockStore = configureStore([])
const initialState = {
  cart: { cartItems: [{ price: 100, qty: 2, image: '' }], shippingAddress: {}, paymentMethod: 'card', paymentDetails: {} },
  orderCreate: { order: { _id: '1' }, success: false, error: null }
}

beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(msg);
  });
});

test('renders PlaceOrderScreen', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><PlaceOrderScreen /></MemoryRouter></Provider>)
  expect(screen.getByText(/Place Order/i)).toBeInTheDocument()
})
