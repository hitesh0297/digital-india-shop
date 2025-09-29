import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { createOrder } from '../actions/orderActions'

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || // Vite
  process.env.VITE_API_URL ||                                              // Jest/Node
  'http://localhost:4000'

// Inline Message Component
const Message = ({ variant, children }) => {
  return (
    <div className={`alert alert-${variant}`} role="alert">
      {children}
    </div>
  )
}
Message.defaultProps = { variant: 'info' }

// Inline CheckoutSteps Component
const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <nav className="mb-4">
      <ul className="pagination">
        <li className={`page-item ${step1 ? '' : 'disabled'}`}>
          <span className="page-link">Sign In</span>
        </li>
        <li className={`page-item ${step2 ? '' : 'disabled'}`}>
          <span className="page-link">Shipping</span>
        </li>
        <li className={`page-item ${step3 ? '' : 'disabled'}`}>
          <span className="page-link">Payment</span>
        </li>
        <li className={`page-item ${step4 ? '' : 'disabled'}`}>
          <span className="page-link">Place Order</span>
        </li>
      </ul>
    </nav>
  )
}

function PlaceOrderScreen() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const cart = useSelector((state) => state.cart)
  const { cartItems, shippingAddress = {}, paymentMethod, paymentDetails } = cart

  // Calculate prices
  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2)

  cart.itemsPrice = addDecimals(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  )
  cart.shippingPrice = addDecimals(cart.itemsPrice > 100 ? 0 : 100)
  cart.taxPrice = addDecimals(Number((0.15 * cart.itemsPrice).toFixed(2)))
  cart.totalPrice = (
    Number(cart.itemsPrice) +
    Number(cart.shippingPrice) +
    Number(cart.taxPrice)
  ).toFixed(2)

  const orderCreate = useSelector((state) => state.orderCreate)
  const { order, success, error } = orderCreate

  useEffect(() => {
    if (success && order?._id) {
      navigate(`/order/${order._id}`)
    }
  }, [navigate, success, order])

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      })
    )

    navigate('/pay')
  }

  const renderPaymentDetails = () => {
    if (!paymentDetails) {
      return <div className="text-muted">No payment details provided.</div>
    }

    if (paymentMethod === 'card') {
      const { nameOnCard, last4, brandGuess, expMonth, expYear } = paymentDetails
      return (
        <div className="mt-2">
          <div><strong>Cardholder:</strong> {nameOnCard || '—'}</div>
          <div>
            <strong>Card:</strong> {(brandGuess || 'card').toUpperCase()} •••• {last4 || '****'}
          </div>
          <div>
            <strong>Expiry:</strong> {expMonth || '--'}/{expYear || '----'}
          </div>
        </div>
      )
    }

    if (paymentMethod === 'upi') {
      const { upiId, reference } = paymentDetails
      return (
        <div className="mt-2">
          <div><strong>UPI ID:</strong> {upiId || '—'}</div>
          <div><strong>Reference:</strong> {reference || '—'}</div>
        </div>
      )
    }

    if (paymentMethod === 'netbanking') {
      const { bankName, reference } = paymentDetails
      return (
        <div className="mt-2">
          <div><strong>Bank:</strong> {bankName || '—'}</div>
          <div><strong>Reference:</strong> {reference || '—'}</div>
        </div>
      )
    }

    return <div className="text-muted">Unsupported payment method.</div>
  }

  return (
    <>
      {/* <CheckoutSteps step1 step2 step3 step4 /> */}
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Address:</strong>{' '}
                {shippingAddress.address}, {shippingAddress.city}{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
            </ListGroup.Item>

            {/* <ListGroup.Item>
              <h2>Payment Method</h2>
              <div>
                <strong>Method: </strong>{paymentMethod || '—'}
              </div>
              {renderPaymentDetails()}
            </ListGroup.Item> */}

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={3}>
                          <Image
                            src={API_URL + item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} ={' '}
                          <strong>${(item.qty * item.price).toFixed(2)}</strong>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${cart.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${cart.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${cart.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${cart.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              {error && <ListGroup.Item>
                <Message variant="danger">{error}</Message>
              </ListGroup.Item>}

              <ListGroup.Item>
                <Button
                  type="button"
                  className="btn-block"
                  disabled={cartItems.length === 0}
                  onClick={placeOrderHandler}
                >
                  Place Order
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default PlaceOrderScreen
