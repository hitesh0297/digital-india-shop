import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {productListReducer , productDetailsReducer, productDeleteReducer, productCreateReducer , productUpdateReducer ,productReviewCreateReducer,productTopRatedReducer } from './reducers/productReducers'
import { cartReducer } from './reducers/cartReducers'
import { userLoginReducer , userRegisterReducer , userDetailsReducer , userUpdateProfileReducer, userListReducer , userDeleteReducer,
userUpdateReducer} from './reducers/userReducers'
import { orderCreateReducer , orderDetailsReducer , orderPayReducer , orderListMyReducer , orderListReducer , orderDeliverReducer} from './reducers/orderReducers'

// 1. Combine all reducers
const appReducer = combineReducers({
  productList: productListReducer,
  productDetails: productDetailsReducer,
  productDelete: productDeleteReducer,
  productCreate: productCreateReducer,
  productUpdate: productUpdateReducer,
  productReviewCreate: productReviewCreateReducer,
  productTopRated:productTopRatedReducer,
  cart : cartReducer,
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdateProfile: userUpdateProfileReducer,
  userList: userListReducer,
  userDelete: userDeleteReducer,
  userUpdate: userUpdateReducer,
  orderCreate: orderCreateReducer,
  orderDetails: orderDetailsReducer,
  orderPay: orderPayReducer,
  orderDeliver: orderDeliverReducer,
  orderListMy: orderListMyReducer,
  orderList: orderListReducer,
});

// 2. Wrap with rootReducer for RESET action
const rootReducer = (state, action) => {
  if (action.type === 'RESET') {
    state = undefined // clears everything → goes back to slice initialState
  }
  return appReducer(state, action)
}

// cartItems
const cartItemsFromStorage= localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')):[]
// LoginInfo
const userInfoFromStorage= localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
// Shipping address
const shippingAddressFromStorage= localStorage.getItem('shippingAddress') ? JSON.parse(localStorage.getItem('shippingAddress')):{}
const initialState= {
  cart:{
    cartItems:cartItemsFromStorage,
    shippingAddress:shippingAddressFromStorage
  },
  userLogin: { userInfo:userInfoFromStorage }
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState, // your initial state
})


export default store;
