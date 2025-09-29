import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import UserEditScreen from '../UserEditScreen'
import { MemoryRouter } from 'react-router-dom'

const mockStore = configureStore([])
const initialState = {
  userDetails: { loading: false, error: null, user: { _id: '1', name: 'Test User', email: 'test@example.com', role: 'user' } },
  userUpdate: { loading: false, error: null, success: false }
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

test('renders UserEditScreen with user info', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><UserEditScreen /></MemoryRouter></Provider>)
  expect(screen.getByLabelText(/^Name$/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/^Email Address$/i)).toBeInTheDocument()
})
