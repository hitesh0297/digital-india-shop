import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import ProfileScreen from '../ProfileScreen'
import { MemoryRouter } from 'react-router-dom'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

const mockStore = configureStore([])
const initialState = {
  userDetails: { loading: false, error: null, user: { name: 'Test User', email: 'test@example.com' } },
  userLogin: { userInfo: { name: 'Test User' } },
  userUpdateProfile: {},
  orderListMy: { loading: false, error: null, orders: [] }
}

beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(msg);
  });
});

test('renders ProfileScreen with user info', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><ProfileScreen /></MemoryRouter></Provider>)
  expect(screen.getByText(/User Profile/i)).toBeInTheDocument()
  expect(screen.getByDisplayValue(/Test User/i)).toBeInTheDocument()
  expect(screen.getByDisplayValue(/test@example.com/i)).toBeInTheDocument()
})
