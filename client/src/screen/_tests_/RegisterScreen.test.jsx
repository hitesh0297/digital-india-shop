import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import RegisterScreen from '../RegisterScreen'
import { MemoryRouter } from 'react-router-dom'

const mockStore = configureStore([])
const initialState = { userRegister: { loading: false, error: null, userInfo: null } }


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

test('renders registration form', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><RegisterScreen /></MemoryRouter></Provider>)
  expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/^Email Address$/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/^Confirm Password$/i)).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: '123' } })
  fireEvent.change(screen.getByLabelText(/^Confirm Password$/i), { target: { value: '456' } })
  fireEvent.click(screen.getByText(/^Sign Up$/i))
})
