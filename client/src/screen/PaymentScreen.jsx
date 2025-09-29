// src/screens/PaymentScreen.jsx
import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import api from "../lib/axios.js"

const token = localStorage.getItem('token');

const PaymentScreen = () => {
  const navigate = useNavigate()

  // Get values from Redux store
  const { cart, userLogin } = useSelector((state) => state)
  const { cartItems, shippingAddress, paymentDetails } = cart
  const { userInfo } = userLogin

  const totalPrice = parseFloat(cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2))

  useEffect(() => {
    const loadRazorpay = async () => {
      // 1) Save order + shipping before opening Razorpay
      let orderData
      try {
        const payload = {
          orderItems: cartItems,
          shippingAddress,
          itemsPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          totalPrice
        }
        const { data } = await api.post(
          `/api/orders`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        orderData = data // backend returns created order (with _id)
      } catch (err) {
        console.error("Error creating order:", err)
        return
      }

      // 2) Ensure Razorpay script is loaded
      if (typeof window.Razorpay === "undefined") {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        script.onload = () => openRazorpay(orderData)
        document.body.appendChild(script)
      } else {
        openRazorpay(orderData)
      }
    }

    const openRazorpay = (orderData) => {
      try {
        const options = {
          key: ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY) || // Vite
                process.env.VITE_RAZORPAY_KEY) || 'rzp_test_RMxU0rBxi0Dptx',
          amount: totalPrice * 100,
          currency: "INR",
          name: "Hitesh IGNOU Project",
          description: `Payment`,
          handler: async function (response) {
            try {
              // 3) Save payment result to backend
              await api.put(
                `/api/payment/${orderData._id}/pay`,
                {
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature,
                  status: 'Completed',
                  paymentDetails,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )

              // 4) Redirect to success page
              navigate("/order-success", {
                state: {
                  transactionId: response.razorpay_payment_id,
                  cartItems,
                  shippingAddress,
                  paymentDetails,
                },
              })
            } catch (err) {
              console.error("Error saving payment:", err)
            }
          },
          modal: {
              ondismiss: function () {
                // Fired if user closes checkout without completing payment
                console.warn("Payment cancelled by user")
                // Redirect to failure page
                navigate("/cart", {
                  state: { reason: "User closed the payment popup" },
                })
            }
          },
          prefill: {
            name: paymentDetails?.name || "Customer",
            email: paymentDetails?.email || "customer@example.com",
          },
          theme: { color: "#3399cc" },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (err) {
        console.error("Razorpay init error:", err)
      }
    }

    loadRazorpay()
  }, [cartItems, shippingAddress, paymentDetails, totalPrice, userInfo, navigate])

  return <div>Loading payment gateway...</div>
}

export default PaymentScreen
