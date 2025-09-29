// orderActions.js
import api from '../lib/axios.js';

// Order Constants
export const ORDER_CREATE_REQUEST = "ORDER_CREATE_REQUEST";
export const ORDER_CREATE_SUCCESS = "ORDER_CREATE_SUCCESS";
export const ORDER_CREATE_FAIL = "ORDER_CREATE_FAIL";

export const ORDER_DETAILS_REQUEST = "ORDER_DETAILS_REQUEST";
export const ORDER_DETAILS_SUCCESS = "ORDER_DETAILS_SUCCESS";
export const ORDER_DETAILS_FAIL = "ORDER_DETAILS_FAIL";

export const ORDER_PAY_REQUEST = "ORDER_PAY_REQUEST";
export const ORDER_PAY_SUCCESS = "ORDER_PAY_SUCCESS";
export const ORDER_PAY_FAIL = "ORDER_PAY_FAIL";

export const ORDER_DELIVER_REQUEST = "ORDER_DELIVER_REQUEST";
export const ORDER_DELIVER_SUCCESS = "ORDER_DELIVER_SUCCESS";
export const ORDER_DELIVER_FAIL = "ORDER_DELIVER_FAIL";

export const ORDER_LIST_MY_REQUEST = "ORDER_LIST_MY_REQUEST";
export const ORDER_LIST_MY_SUCCESS = "ORDER_LIST_MY_SUCCESS";
export const ORDER_LIST_MY_FAIL = "ORDER_LIST_MY_FAIL";

export const ORDER_LIST_REQUEST = "ORDER_LIST_REQUEST";
export const ORDER_LIST_SUCCESS = "ORDER_LIST_SUCCESS";
export const ORDER_LIST_FAIL = "ORDER_LIST_FAIL";

// ------------------- ACTION CREATORS -------------------


// Create Order
export const createOrder = (order) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_CREATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    };

    const { data } = await api.post(`/api/orders`, order, config);

    dispatch({ type: ORDER_CREATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get Order Details
export const getOrderDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_DETAILS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };

    const { data } = await api.get(`/api/orders/${id}`, config);

    dispatch({ type: ORDER_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Pay Order
export const payOrder = (orderId, paymentResult) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_PAY_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    };

    const { data } = await api.put(
      `/api/orders/${orderId}/pay`,
      paymentResult,
      config
    );

    dispatch({ type: ORDER_PAY_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_PAY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Deliver Order
export const deliverOrder = (order) => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_DELIVER_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };

    const { data } = await api.put(
      `/api/orders/${order._id}/deliver`,
      {},
      config
    );

    dispatch({ type: ORDER_DELIVER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_DELIVER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// List My Orders
export const listMyOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_LIST_MY_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };

    const { data } = await api.get(`/api/orders/myorders`, config);

    dispatch({ type: ORDER_LIST_MY_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_LIST_MY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// List All Orders (Admin)
export const listOrders = () => async (dispatch, getState) => {
  try {
    dispatch({ type: ORDER_LIST_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };

    const { data } = await api.get(`/api/orders`, config);

    dispatch({ type: ORDER_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
