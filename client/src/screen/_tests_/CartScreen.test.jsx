import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import CartScreen from '../CartScreen'

const mockStore = configureStore([])

const cartItems = [
  {
    product: '1',
    name: 'Test Product',
    image: '/test.jpg',
    price: 100,
    qty: 2,
    countInStock: 5,
  },
  {
    product: '2',
    name: 'Another Product',
    image: '/test2.jpg',
    price: 50,
    qty: 1,
    countInStock: 3,
  },
]

const initialState = {
  cart: {
    cartItems,
    shippingAddress: {
      address: '123 Main St',
      city: 'Testville',
      postalCode: '12345',
      country: 'India',
    },
  },
  userLogin: {
    userInfo: { name: 'Test User' },
  },
}

function renderWithProviders(ui, state = initialState) {
  const store = mockStore(state)
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  )
}

describe('CartScreen', () => {
    beforeAll(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

  it('renders cart items and subtotal', () => {
    renderWithProviders(<CartScreen />)
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Another Product')).toBeInTheDocument()
    expect(screen.getByText('Subtotal (3) items')).toBeInTheDocument()
    expect(screen.getByText('$250.00')).toBeInTheDocument()
  })

  it('shows empty cart message when cart is empty', () => {
    renderWithProviders(<CartScreen />, {
      cart: { cartItems: [] },
      userLogin: {},
    })
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument()
    expect(screen.getByText(/Go Back/i)).toBeInTheDocument()
  })

  it('shows shipping address form with prefilled values', () => {
    renderWithProviders(<CartScreen />)
    expect(screen.getByLabelText(/Address/i)).toHaveValue('123 Main St')
    expect(screen.getByLabelText(/City/i)).toHaveValue('Testville')
    expect(screen.getByLabelText(/Postal Code/i)).toHaveValue('12345')
    expect(screen.getByLabelText(/Country/i)).toHaveValue('India')
  })

  it('shows warning if shipping address is incomplete', () => {
    renderWithProviders(<CartScreen />, {
      cart: {
        cartItems,
        shippingAddress: {
          address: '',
          city: '',
          postalCode: '',
          country: '',
        },
      },
      userLogin: { userInfo: { name: 'Test User' } },
    })
    fireEvent.click(screen.getByText(/Proceed To Checkout/i))
    expect(screen.getByText(/Enter correct address/i)).toBeInTheDocument()
  })

  it('disables checkout button when cart is empty', () => {
    renderWithProviders(<CartScreen />, {
      cart: { cartItems: [] },
      userLogin: {},
    })
    expect(screen.getByText(/Proceed To Checkout/i)).toBeDisabled()
  })
})