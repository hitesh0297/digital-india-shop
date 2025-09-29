import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import LoginScreen from '../LoginScreen'
import { MemoryRouter } from 'react-router-dom'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

const mockStore = configureStore([])
const initialState = { userLogin: { loading: false, error: null, userInfo: null } }


beforeAll(() => {
  const originalWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (msg.includes('React Router Future Flag Warning')) return;
    originalWarn(msg);
  });
});

test('renders login form', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><LoginScreen /></MemoryRouter></Provider>)
  expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
})

test('shows error on invalid login', () => {
  const store = mockStore({ userLogin: { loading: false, error: 'Invalid', userInfo: null } })
  render(<Provider store={store}><MemoryRouter><LoginScreen /></MemoryRouter></Provider>)
  expect(screen.getByText(/Invalid/i)).toBeInTheDocument()
})
