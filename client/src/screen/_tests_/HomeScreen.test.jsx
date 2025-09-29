import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import HomeScreen from '../HomeScreen'
import { MemoryRouter } from 'react-router-dom'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

const mockStore = configureStore([])
const initialState = {
  productList: {
    loading: false,
    error: null,
  products: [{ _id: '1', name: 'Test Product', image: 'test.jpg' }],
    pages: 1
  }
}

beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(msg);
  });
});

test('renders product list', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><HomeScreen /></MemoryRouter></Provider>)
  expect(screen.getByText(/Latest Products/i)).toBeInTheDocument()
  const products = screen.getAllByText(/Test Product/i)
  expect(products.length).toBeGreaterThan(0)
})
