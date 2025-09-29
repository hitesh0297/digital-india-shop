// src/screens/OrderScreen.jsx
import React, { useEffect, useState } from 'react'                     // react hooks
import { useParams, Link } from 'react-router-dom'                    // read :id, link to product
import { useSelector } from 'react-redux'                             // grab token from store
import { Row, Col, ListGroup, Image, Card, Spinner, Alert, Table, Container, Badge } from 'react-bootstrap' // UI
import api from '../lib/axios.js'                                              // your axios instance (uses VITE_API_URL)

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || // Vite
  process.env.VITE_API_URL ||                                              // Jest/Node
  'http://localhost:4000'
  
const OrderScreen = () => {
  // --- routing ---
  const { id: orderId } = useParams()                                 // read /order/:id

  // --- auth (expects state.userLogin.userInfo.token) ---
  const { userInfo } = useSelector((state) => state.userLogin || {})  // current user
  const token = localStorage.getItem('token')                                       // JWT

  // --- local state ---
  const [order, setOrder] = useState(null)                            // order doc
  const [loading, setLoading] = useState(false)                       // spinner
  const [error, setError] = useState(null)                            // error text

  // --- helpers ---
  const fmtMoney = (n) => (typeof n === 'number' ? n.toFixed(2) : '0.00')   // ₹ formatting
  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—')           // readable date

  // --- fetch order ---
  useEffect(() => {
    if (!orderId) return                                              // no id, no fetch
    if (!token) { setError('Not authorized. Please login.'); return } // need auth

    const run = async () => {
      try {
        setLoading(true); setError(null)                              // reset states
        const { data } = await api.get(`/api/orders/${orderId}`, {    // GET /api/orders/:id
          headers: { Authorization: `Bearer ${token}` },              // auth header
        })
        setOrder(data)                                                // store order
      } catch (err) {
        const msg = err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message || 'Failed to load order'
        setError(msg)                                                 // show error
      } finally {
        setLoading(false)                                             // stop spinner
      }
    }

    run()
  }, [orderId, token])

  // --- derived values (null-safe) ---
  const items = Array.isArray(order?.orderItems) ? order.orderItems : []
  const itemsPrice = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 0), 0)
  const taxPrice = order?.taxPrice ?? 0
  const shippingPrice = order?.shippingPrice ?? 0
  const totalPrice = order?.totalPrice ?? (itemsPrice + taxPrice + shippingPrice)

  return (
    <Container className="mt-3">
      <h1>Order {orderId}</h1>

      {loading && <Spinner animation="border" role="status" className="my-3" />}
      {error && <Alert variant="danger" className="my-3">{error}</Alert>}

      {!loading && !error && order && (
        <>
          <Row>
            {/* LEFT: details */}
            <Col md={8}>
              {/* Shipping */}
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h2>Shipping</h2>
                  <p><strong>Name: </strong>{order.user?.name || '—'}</p>
                  <p>
                    <strong>Address: </strong>
                    {order.shippingAddress
                      ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
                      : '—'}
                  </p>
                  {order.isDelivered ? (
                    <Alert variant="success" className="py-2 my-2">
                      Delivered at {fmtDate(order.deliveredAt)}
                    </Alert>
                  ) : (
                    <Alert variant="warning" className="py-2 my-2">
                      Not Delivered
                    </Alert>
                  )}
                </ListGroup.Item>

                {/* Payment */}
                <ListGroup.Item>
                  <h2>Payment</h2>
                  <p><strong>Method: </strong>{order.paymentMethod || order.paymentResult?.merchant || '—'}</p>
                  {order.isPaid ? (
                    <Alert variant="success" className="py-2 my-2">
                      Paid at {fmtDate(order.paidAt)}
                    </Alert>
                  ) : (
                    <Alert variant="warning" className="py-2 my-2">
                      Not Paid
                    </Alert>
                  )}
                  {/* optional gateway meta */}
                  {order.paymentResult?.status && (
                    <p className="mb-0">
                      <small>
                        <Badge bg="secondary">{order.paymentResult.status}</Badge>{' '}
                        {order.paymentResult.id ? `• Txn: ${order.paymentResult.id}` : ''}
                      </small>
                    </p>
                  )}
                </ListGroup.Item>

                {/* Items */}
                <ListGroup.Item>
                  <h2>Order Items</h2>
                  {items.length === 0 ? (
                    <Alert variant="info" className="py-2 my-2">Order is empty</Alert>
                  ) : (
                    <Table responsive bordered hover className="table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price (₹)</th>
                          <th>Subtotal (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it) => {
                          const pid = it.product?._id || it.product || it._id || it.name
                          const subtotal = (it.qty || 0) * (it.price || 0)
                          return (
                            <tr key={`${pid}-${it.name}`}>
                              <td style={{ width: 64 }}>
                                <Image src={API_URL + it.image} alt={it.name} fluid rounded />
                              </td>
                              <td>
                                {pid
                                  ? <Link to={`/product/${pid}`}>{it.name}</Link>
                                  : it.name}
                              </td>
                              <td>{it.qty}</td>
                              <td>{fmtMoney(it.price)}</td>
                              <td>{fmtMoney(subtotal)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>

            {/* RIGHT: summary */}
            <Col md={4}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <h2>Order Summary</h2>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Items</span>
                    <strong>₹ {fmtMoney(itemsPrice)}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Shipping</span>
                    <strong>₹ {fmtMoney(shippingPrice)}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Tax</span>
                    <strong>₹ {fmtMoney(taxPrice)}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Total</span>
                    <strong>₹ {fmtMoney(totalPrice)}</strong>
                  </ListGroup.Item>
                  {/* Place for actions (pay/cancel) if you add them later */}
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default OrderScreen
