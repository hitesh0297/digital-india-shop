import api from '../lib/axios.js'

// Inline constants (instead of importing from constants/cartConstants)
export const CART_ADD_ITEM = "CART_ADD_ITEM";
export const CART_REMOVE_ITEM = "CART_REMOVE_ITEM";
export const CART_SAVE_SHIPPING_ADDRESS = "CART_SAVE_SHIPPING_ADDRESS";
export const CART_SAVE_PAYMENT_DETAILS = 'CART_SAVE_PAYMENT_DETAILS';
export const CART_SAVE_PAYMENT_METHOD = "CART_SAVE_PAYMENT_METHOD";

// Add item to cart
export const addToCart = (id, qty) => async (dispatch, getState) => {

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };
  
  const { data } = await api.get(`/api/products/${id}`, config);

  dispatch({
    type: CART_ADD_ITEM,
    payload: {
      product: data._id,
      name: data.name,
      image: data.image,
      price: data.price,
      countInStock: data.countInStock,
      qty,
    },
  });

  // Save to localStorage
  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

// Remove item from cart
export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: id,
  });

  // Update localStorage
  localStorage.setItem("cartItems", JSON.stringify(getState().cart.cartItems));
};

/**
 * Persist shipping to Redux + localStorage, and also to backend.
 * Expects a protected endpoint on server:
 *   PUT /api/users/shipping-address
 *   Body: { address, city, postalCode, country }
 *   Returns 200 with saved object (optional)
 */
export const saveShippingAddress = (data) => async (dispatch, getState) => {
  // 1) Update client state immediately
  dispatch({ type: CART_SAVE_SHIPPING_ADDRESS, payload: data })
  localStorage.setItem('shippingAddress', JSON.stringify(data))

  // 2) Try to persist on server (if logged in)
/*   const {
    userLogin: { userInfo },
  } = getState() */

  //if (!userInfo?.token) return // not logged in; skip server sync

/*   try {
    await api.put(`/api/users/shipping-address`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    // Optional: you could reconcile the response here if server normalizes fields
  } catch (err) {
    // Don’t break UX if server save fails — we already saved locally.
    // You can surface a toast if you want.
    // console.error('Failed to save shipping on server:', err?.response?.data || err?.message)
  } */
}

// Save payment method
export const savePaymentMethod = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: data,
  });

  localStorage.setItem("paymentMethod", JSON.stringify(data));
};

export const savePaymentDetails = (details) => (dispatch) => {
  dispatch({ type: CART_SAVE_PAYMENT_DETAILS, payload: details })
  localStorage.setItem('paymentDetails', JSON.stringify(details))
}
