import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import UserListScreen from '../UserListScreen'
import { MemoryRouter } from 'react-router-dom'

const mockStore = configureStore([])
const initialState = {
  userList: { loading: false, error: null, users: [{ _id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' }] },
  userLogin: { userInfo: { role: 'admin' } },
  userDelete: { success: false }
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

test('renders UserListScreen with users', () => {
  const store = mockStore(initialState)
  render(<Provider store={store}><MemoryRouter><UserListScreen /></MemoryRouter></Provider>)
  expect(screen.getByText(/Users/i)).toBeInTheDocument()
  expect(screen.getByText(/Test User/i)).toBeInTheDocument()
  expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
})
