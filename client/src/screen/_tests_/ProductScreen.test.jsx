import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import ProductScreen from '../ProductScreen'
import { MemoryRouter } from 'react-router-dom'

const mockStore = configureStore([])
const initialState = {
  productDetails: { loading: false, error: null, product: { _id: '1', name: 'Test Product', countInStock: 5, image: '/test.jpg', } }
}


jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(msg);
  });
});

test('renders ProductScreen with product details', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><ProductScreen /></MemoryRouter></Provider>)
  expect(screen.getAllByText(/Test Product/i).length).toBeGreaterThan(0)
})
