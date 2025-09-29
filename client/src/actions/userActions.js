import api from '../lib/axios.js'
import {
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT,
  USER_REGISTER_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_DETAILS_RESET,
  USER_LIST_REQUEST,
  USER_LIST_FAIL,
  USER_LIST_SUCCESS,
  USER_LIST_RESET,
  USER_DELETE_REQUEST,
  USER_DELETE_SUCCESS,
  USER_DELETE_FAIL,
  USER_UPDATE_REQUEST,
  USER_UPDATE_SUCCESS,
  USER_UPDATE_FAIL
} from '../constants/userConstants'

import { ORDER_LIST_MY_RESET } from '../constants/orderConstants'

const token = localStorage.getItem('token');


// LOGIN USER
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST }) // start login request

    const config = {
      headers: {
        "Content-Type": "application/json", // sending JSON data
      },
    }

    // Make API call to login
    const { data } = await api.post(`/api/auth/login`, { email, password }, config)

    dispatch({ type: USER_LOGIN_SUCCESS, payload: data.user }) // login success
    localStorage.setItem('userInfo', JSON.stringify(data.user)) // store user info in localStorage
    localStorage.setItem('token', data.token)

  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message,
    })
  }
}

// LOGOUT USER
export const logout = (navigate = null) => (dispatch) => {
  try {
    localStorage.clear() // clear localstorage
    dispatch({ type: USER_LOGOUT }) // logout user
    dispatch({ type: USER_DETAILS_RESET }) // reset user details
    dispatch({ type: ORDER_LIST_MY_RESET }) // reset user's orders
    dispatch({ type: USER_LIST_RESET }) // reset user list (admin)
    
    // Navigate if available, else fallback to reload
    if (typeof navigate === 'function') {
      navigate('/login'); // SPA navigation
    } else {
      window.location.href = '/login'; // Full page reload
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

// REGISTER USER
export const register = (name, email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST }) // start registration request

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    }

    // Make API call to register user
    const { data } = await api.post(`/api/auth/register`, { name, email, password }, config)

    dispatch({ type: USER_REGISTER_SUCCESS, payload: data }) // registration success
    dispatch({ type: USER_LOGIN_SUCCESS, payload: data }) // also log in the user after registration
    localStorage.setItem('userInfo', JSON.stringify(data))
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
      payload: error.response && error.response.data.error
        ? error.response.data.error
        : error.message,
    })
  }
}

// GET USER DETAILS
export const getUserDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST }) // start getting user details

    const { userLogin: { userInfo } } = getState() // get logged in user from state

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // send token for auth
      },
    }

    const { data } = await api.get(`/api/users/${id}`, config) // get user details

    dispatch({ type: USER_DETAILS_SUCCESS, payload: data }) // success
  } catch (error) {
    dispatch({
      type: USER_DETAILS_FAIL, 
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    })
  }
}

// UPDATE USER PROFILE
export const updateUserProfile = (user) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_UPDATE_PROFILE_REQUEST }) // start profile update

    const { userLogin: { userInfo } } = getState()

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }

    const { data } = await api.put(`/api/users/profile`, user, config) // update profile

    dispatch({ type: USER_UPDATE_PROFILE_SUCCESS, payload: data }) // success
    dispatch({ type: USER_LOGIN_SUCCESS, payload: data }) // update user login state
    localStorage.setItem('userInfo', JSON.stringify(data)) // update localStorage
  } catch (error) {
    dispatch({
      type: USER_UPDATE_PROFILE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    })
  }
}

// GET ALL USERS (ADMIN)
export const listUsers = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_LIST_REQUEST })

    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // admin auth token
      },
    }

    const { data } = await api.get(`/api/users`, config)

    dispatch({ type: USER_LIST_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: USER_LIST_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    })
  }
}

// DELETE USER (ADMIN)
export const deleteUser = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_DELETE_REQUEST })

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    await api.delete(`/api/users/${id}`, config)

    dispatch({ type: USER_DELETE_SUCCESS })
  } catch (error) {
    dispatch({
      type: USER_DELETE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    })
  }
}

// UPDATE USER (ADMIN)
export const updateUser = (user) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_UPDATE_REQUEST })


    const config = {
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }

    const { data } = await api.put(`/api/users/${user._id}`, user, config)

    dispatch({ type: USER_UPDATE_SUCCESS })
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data }) // update details after edit
  } catch (error) {
    dispatch({
      type: USER_UPDATE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    })
  }
}
