import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, ListGroup, Image, Form, Button, Card, Alert } from 'react-bootstrap'

import Message from '../Components/Message'
import { addToCart, removeFromCart, saveShippingAddress } from '../actions/cartActions'
import { COUNTRIES } from '../utils/countries'

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || // Vite
  process.env.VITE_API_URL ||                                              // Jest/Node
  'http://localhost:4000' || ''

const CartScreen = () => {
  const { id: productId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const qty = location.search ? Number(location.search.split('=')[1]) : 1

  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cart)
  const { cartItems, shippingAddress = {} } = cart

  const { userInfo } = useSelector((s) => s.userLogin || { userInfo: null })

  // Shipping form local state (prefill from Redux if available)
  const [address, setAddress] = useState(shippingAddress.address || '')
  const [city, setCity] = useState(shippingAddress.city || '')
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '')
  const [country, setCountry] = useState(shippingAddress.country || '')
  const [invalidAddressBanner, setInvalidAddressBanner] = useState(false)

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty))
    }
  }, [dispatch, productId, qty])

  // Keep form in sync if redux shipping changes elsewhere
  useEffect(() => {
    setAddress(shippingAddress.address || '')
    setCity(shippingAddress.city || '')
    setPostalCode(shippingAddress.postalCode || '')
    setCountry(shippingAddress.country || '')
  }, [shippingAddress.address, shippingAddress.city, shippingAddress.postalCode, shippingAddress.country])

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id))
  }

  const checkoutHandler = async () => {
    await handleSaveShipping()

    if (!canSave) return;

    navigate('/placeorder')
  }

  const canSave = useMemo(() => {
    return address.trim() && city.trim() && postalCode.trim() && country.trim()
  }, [address, city, postalCode, country])

  const handleSaveShipping = async () => {
    //e.preventDefault()
    if (!canSave) {
      setInvalidAddressBanner(true);
      return
    }
    await dispatch(saveShippingAddress({ address, city, postalCode, country }))
    //setSavedBanner(true)
    //setTimeout(() => setSavedBanner(false), 2000)
  }

  return (
    <Row>
      {/* Left: Cart Items + Shipping block */}
      <Col md={8}>
        <h1>Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <Message>
            Your cart is empty <Link to="/">Go Back</Link>
          </Message>
        ) : (
          <>
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item.product}>
                  <Row>
                    <Col md={2}>
                      <Image src={API_URL + item.image} alt={item.name} fluid rounded />
                    </Col>

                    <Col md={3}>
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </Col>

                    <Col md={2}>${item.price}</Col>

                    <Col md={2}>
                      <Form.Control
                        as="select"
                        value={item.qty}
                        onChange={(e) =>
                          dispatch(addToCart(item.product, Number(e.target.value)))
                        }
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>

                    <Col md={2}>
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => removeFromCartHandler(item.product)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>

            {/* Shipping Address Block */}
            <Card className="mt-4">
              <Card.Body>
                <Card.Title>Shipping Address</Card.Title>
                {invalidAddressBanner && (
                  <Alert variant="warning" className="mb-3">
                    Enter correct address.
                  </Alert>
                )}
                {!userInfo && (
                  <Alert variant="warning" className="mb-3">
                    Login to sync your shipping address across devices.
                  </Alert>
                )}
                <Form onSubmit={handleSaveShipping}>
                  <Form.Group className="mb-3" controlId="address">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="House / Street / Area"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="city">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="postalCode">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="PIN / ZIP"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="country">
                    <Form.Label>Country</Form.Label>
                    <Form.Select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    {/* <Button type="submit" variant="primary" disabled={!canSave}>
                      Save Shipping
                    </Button> */}
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => {
                        setAddress('')
                        setCity('')
                        setPostalCode('')
                        setCountry('')
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </>
        )}
      </Col>

      {/* Right: Summary */}
      <Col md={4}>
        <Card>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>
                Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items
              </h2>
              $
              {cartItems
                .reduce((acc, item) => acc + item.qty * item.price, 0)
                .toFixed(2)}
            </ListGroup.Item>

            <ListGroup.Item>
              <Button
                type="button"
                className="btn-block"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  )
}

export default CartScreen
