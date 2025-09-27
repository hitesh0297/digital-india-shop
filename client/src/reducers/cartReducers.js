import { 
  CART_ADD_ITEM, 
  CART_REMOVE_ITEM, 
  CART_SAVE_PAYMENT_METHOD, 
  CART_SAVE_SHIPPING_ADDRESS 
} from '../constants/cartConstants'

// Initial state: cart is empty, no shipping address yet
export const cartReducer = (
  state = { cartItems: [], shippingAddress: {} }, 
  action
) => {
  switch (action.type) {
    
    //  Case 1: Add item to cart
    case CART_ADD_ITEM:
      const item = action.payload   // new item sent from action
      // check if item already exists in cart
      const existItem = state.cartItems.find(x => x.product === item.product)

      if (existItem) {
        // if item exists, replace it with new version (like updating quantity)
        return {
          ...state,
          cartItems: state.cartItems.map(x =>
            x.product === existItem.product ? item : x
          ),
        }
      } else {
        // if item doesn’t exist, just add it to cart
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        }
      }

    //  Case 2: Remove item from cart
    case CART_REMOVE_ITEM:
      return {
        ...state,
        // filter out the item whose product id matches payload
        cartItems: state.cartItems.filter(x => x.product !== action.payload),
      }

    //  Case 3: Save shipping address
    case CART_SAVE_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload,
      }

    //  Case 4: Save payment method
    case CART_SAVE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload,
      }

    //  Default: return unchanged state
    default:
      return state
  }
}
