import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import ProductEditScreen from '../ProductEditScreen'
import { MemoryRouter } from 'react-router-dom'

const mockStore = configureStore([])
const initialState = {
  userLogin: { userInfo: { role: 'admin' } },
  productDetails: { loading: false, error: null, product: { _id: '1', name: 'Test Product' } },
  productCreate: {},
  productUpdate: {}
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

test('renders ProductEditScreen', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><ProductEditScreen /></MemoryRouter></Provider>)
  expect(screen.getByRole('heading', { name: /Create Product/i })).toBeInTheDocument()
})
