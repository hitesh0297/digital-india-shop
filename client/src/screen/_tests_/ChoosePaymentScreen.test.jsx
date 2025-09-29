import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import ChoosePaymentScreen from '../ChoosePaymentScreen'
import { MemoryRouter } from 'react-router-dom'

const mockStore = configureStore([])
const initialState = { cart: { cartItems: [{ price: 100, qty: 2 }] } }

function renderWithProviders(ui, state = initialState) {
  const store = mockStore(state)
  return render(<Provider store={store}>{ui}</Provider>)
}

beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(msg);
  });
});

test('renders payment method options', () => {
  renderWithProviders(<MemoryRouter>
    <ChoosePaymentScreen />
  </MemoryRouter>)
  expect(screen.getAllByText(/Card/i).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/UPI/i).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Netbanking/i).length).toBeGreaterThan(0)
})

test('shows error for invalid card details', () => {
  renderWithProviders(<MemoryRouter>
    <ChoosePaymentScreen />
  </MemoryRouter>)
  fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: '123' } })
  fireEvent.click(screen.getByRole('button', { name: /Pay/i }))
  expect(screen.getByText(/Name on card is required/i)).toBeInTheDocument()
})
