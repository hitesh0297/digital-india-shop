// src/screens/OrderScreen.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Spinner,
  Alert,
  Table,
  Container,
  Badge,
  Button,
} from 'react-bootstrap'

import api from '../lib/axios.js'
import { createProductReview } from '../actions/productActions'
import {
  PRODUCT_CREATE_REVIEW_RESET,
} from '../constants/productConstants'

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  process.env.VITE_API_URL ||
  'http://localhost:4000'

const OrderScreen = () => {
  const { id: orderId } = useParams()
  const dispatch = useDispatch()

  // auth
  const { userInfo } = useSelector((state) => state.userLogin || {})
  const token = localStorage.getItem('token') || userInfo?.token

  // order state
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // review state (redux slice)
  const productReviewCreate = useSelector((s) => s.productReviewCreate || {})
  const { loading: loadingReview, error: errorReview, success: successReview } = productReviewCreate

  // local form state per productId
  const [reviewInputs, setReviewInputs] = useState({}) // { [productId]: { rating: '', comment: '' } }
  const [lastSubmittedProductId, setLastSubmittedProductId] = useState(null)

  const fmtMoney = (n) => (typeof n === 'number' ? n.toFixed(2) : '0.00')
  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—')

  // fetch order
  useEffect(() => {
    if (!orderId) return
    if (!token) { setError('Not authorized. Please login.'); return }

    const run = async () => {
      try {
        setLoading(true); setError(null)
        const { data } = await api.get(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setOrder(data)
      } catch (err) {
        const msg = err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message || 'Failed to load order'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [orderId, token])

  // after a successful review submission, clear that product's form and reset slice
  useEffect(() => {
    if (successReview && lastSubmittedProductId) {
      setReviewInputs((prev) => ({
        ...prev,
        [lastSubmittedProductId]: { rating: '', comment: '' },
      }))
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET })
      setLastSubmittedProductId(null)
    }
  }, [successReview, lastSubmittedProductId, dispatch])

  const items = Array.isArray(order?.orderItems) ? order.orderItems : []
  const itemsPrice = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 0), 0)
  const taxPrice = order?.taxPrice ?? 0
  const shippingPrice = order?.shippingPrice ?? 0
  const totalPrice = order?.totalPrice ?? (itemsPrice + taxPrice + shippingPrice)

  const onChangeField = (pid, field, value) => {
    setReviewInputs((prev) => ({
      ...prev,
      [pid]: { ...(prev[pid] || {}), [field]: value },
    }))
  }

  const submitReview = (pid) => {
    const { rating, comment } = reviewInputs[pid] || {}
    if (!rating || !comment) return
    setLastSubmittedProductId(pid)
    dispatch(createProductReview(pid, { rating: Number(rating), comment }))
  }

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
              <ListGroup variant="flush">
                {/* Shipping */}
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
                  {order.paymentResult?.status && (
                    <p className="mb-0">
                      <small>
                        <Badge bg="secondary">{order.paymentResult.status}</Badge>{' '}
                        {order.paymentResult.id ? `• Txn: ${order.paymentResult.id}` : ''}
                      </small>
                    </p>
                  )}
                </ListGroup.Item>

                {/* Items + Review forms */}
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
                          const form = reviewInputs[pid] || { rating: '', comment: '' }
                          const showSuccess = successReview && lastSubmittedProductId === null // success already reset

                          return (
                            <React.Fragment key={`${pid}-${it.name}`}>
                              <tr>
                                <td style={{ width: 64 }}>
                                  <Image src={API_URL + it.image} alt={it.name} fluid rounded />
                                </td>
                                <td>{pid ? <Link to={`/product/${pid}`}>{it.name}</Link> : it.name}</td>
                                <td>{it.qty}</td>
                                <td>{fmtMoney(it.price)}</td>
                                <td>{fmtMoney(subtotal)}</td>
                              </tr>

                              {/* Review form row */}
                              <tr>
                                <td colSpan={5}>
                                  <div className="p-2 border rounded bg-light">
                                    <strong>Write a review</strong>
                                    {loadingReview && (
                                      <Spinner animation="border" role="status" size="sm" className="ms-2" />
                                    )}
                                    {errorReview && (
                                      <Alert variant="danger" className="mt-2 mb-2">{errorReview}</Alert>
                                    )}
                                    {showSuccess && (
                                      <Alert variant="success" className="mt-2 mb-2">Review submitted</Alert>
                                    )}

                                    <div className="d-flex align-items-center gap-2 mt-2">
                                      <label className="me-2 mb-0">Rating:</label>
                                      <select
                                        className="form-select form-select-sm"
                                        style={{ width: 140 }}
                                        value={form.rating}
                                        onChange={(e) => onChangeField(pid, 'rating', e.target.value)}
                                      >
                                        <option value="">Select...</option>
                                        <option value="1">1 - Poor</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="3">3 - Good</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="5">5 - Excellent</option>
                                      </select>

                                      <input
                                        className="form-control form-control-sm"
                                        placeholder="Say something helpful..."
                                        value={form.comment}
                                        onChange={(e) => onChangeField(pid, 'comment', e.target.value)}
                                      />

                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => submitReview(pid)}
                                        disabled={!form.rating || !form.comment || loadingReview || !token}
                                      >
                                        Submit
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
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
