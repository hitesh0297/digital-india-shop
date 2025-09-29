import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import api from '../lib/axios'

import { savePaymentMethod, savePaymentDetails } from '../actions/cartActions'
import Message from '../Components/Message'

const ChoosePaymentScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { cartItems } = useSelector((s) => s.cart || { cartItems: [] })
  const token = localStorage.getItem('token')

  // totals
  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty * item.price, 0),
    [cartItems]
  )
  const shippingPrice = useMemo(() => (subtotal > 100 ? 0 : 100), [subtotal])
  const taxPrice = useMemo(() => Math.round(subtotal * 0.15 * 100) / 100, [subtotal])
  const total = useMemo(
    () => Math.round((subtotal + shippingPrice + taxPrice) * 100) / 100,
    [subtotal, shippingPrice, taxPrice]
  )

  // method selection
  const [method, setMethod] = useState('card')

  // card
  const [nameOnCard, setNameOnCard] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvv, setCvv] = useState('') // never sent

  // upi
  const [upiId, setUpiId] = useState('')
  const [upiRef, setUpiRef] = useState('')

  // netbanking
  const [bankName, setBankName] = useState('')
  const [nbRef, setNbRef] = useState('')

  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [banner, setBanner] = useState('')

  const resetAlerts = () => {
    setError('')
    setBanner('')
  }

  const validate = () => {
    if (method === 'card') {
      const digits = cardNumber.replace(/\D/g, '')
      if (!nameOnCard.trim()) return 'Name on card is required'
      if (digits.length < 12 || digits.length > 19) return 'Enter a valid card number'
      if (!expiryMonth || !expiryYear) return 'Expiry month/year required'
      if (!/^\d{3,4}$/.test(cvv)) return 'Enter a valid CVV'
      return ''
    }
    if (method === 'upi') {
      if (!/^[\w.\-]+@[\w.\-]+$/i.test(upiId)) return 'Enter a valid UPI ID'
      if (!upiRef.trim()) return 'Enter a dummy UPI reference'
      return ''
    }
    if (method === 'netbanking') {
      if (!bankName.trim()) return 'Select/enter your bank'
      if (!nbRef.trim()) return 'Enter a dummy payment reference'
      return ''
    }
    return 'Invalid payment method'
  }

  const handlePay = async (e) => {
    e.preventDefault()
    resetAlerts()

    const v = validate()
    if (v) return setError(v)

    // 1) Persist method + details to Redux (privacy-safe)
    dispatch(savePaymentMethod(method))

    const details =
      method === 'card'
        ? {
            nameOnCard: nameOnCard.trim(),
            last4: cardNumber.replace(/\D/g, '').slice(-4),
            brandGuess: guessCardBrand(cardNumber),
            expMonth: expiryMonth,
            expYear: expiryYear,
          }
        : method === 'upi'
        ? {
            upiId: upiId.trim(),
            reference: upiRef.trim(),
          }
        : {
            bankName: bankName.trim(),
            reference: nbRef.trim(),
          }

    dispatch(savePaymentDetails(details))

    // 2) Record a dummy payment on server (no CVV/full PAN)
    const payload = {
      amount: total,
      currency: 'INR',
      method,
      details, // last4 / upiId / bank+reference only
      meta: {
        items: cartItems.map((i) => ({
          product: i.product,
          qty: i.qty,
          price: i.price,
        })),
        tax: taxPrice,
        shipping: shippingPrice,
      },
    }

    try {
      setPaying(true)
      //const headers = token ? { Authorization: `Bearer ${token}` } : {}
      //await api.post('/api/payments', payload, { headers })

      //setBanner('Payment recorded. Redirecting to place order...')
      navigate('/placeorder')
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to record payment'
      )
    } finally {
      setPaying(false)
    }
  }

  return (
    <Row className="justify-content-center">
      <Col md={7} lg={6}>
        <Card className="p-3">
          <h2 className="mb-3">Payment</h2>

          {error && <Message variant="danger">{error}</Message>}
          {banner && <Alert variant="success">{banner}</Alert>}

          <Form onSubmit={handlePay}>
            <Form.Group className="mb-3" controlId="method">
              <Form.Label>Payment Method</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  label="Card"
                  name="paymentMethod"
                  id="pm-card"
                  value="card"
                  checked={method === 'card'}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="UPI"
                  name="paymentMethod"
                  id="pm-upi"
                  value="upi"
                  checked={method === 'upi'}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="Netbanking"
                  name="paymentMethod"
                  id="pm-netbanking"
                  value="netbanking"
                  checked={method === 'netbanking'}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>
            </Form.Group>

            {method === 'card' && (
              <>
                <Form.Group className="mb-3" controlId="nameOnCard">
                  <Form.Label>Name on card</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. PANKAJ KUMAR"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="cardNumber">
                  <Form.Label>Card number</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="expiryMonth">
                      <Form.Label>Expiry month</Form.Label>
                      <Form.Select
                        value={expiryMonth}
                        onChange={(e) => setExpiryMonth(e.target.value)}
                      >
                        <option value="">MM</option>
                        {[...Array(12)].map((_, i) => {
                          const m = String(i + 1).padStart(2, '0')
                          return (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          )
                        })}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="expiryYear">
                      <Form.Label>Expiry year</Form.Label>
                      <Form.Select
                        value={expiryYear}
                        onChange={(e) => setExpiryYear(e.target.value)}
                      >
                        <option value="">YYYY</option>
                        {yearRange(0, 12).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="cvv">
                  <Form.Label>CVV</Form.Label>
                  <Form.Control
                    type="password"
                    inputMode="numeric"
                    placeholder="***"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    CVV is used only for this dummy payment and is not stored or sent.
                  </Form.Text>
                </Form.Group>
              </>
            )}

            {method === 'upi' && (
              <>
                <Form.Group className="mb-3" controlId="upiId">
                  <Form.Label>UPI ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="yourname@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="upiRef">
                  <Form.Label>Reference (dummy)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. UPI-TXN-123456"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                  />
                </Form.Group>
              </>
            )}

            {method === 'netbanking' && (
              <>
                <Form.Group className="mb-3" controlId="bankName">
                  <Form.Label>Bank</Form.Label>
                  <Form.Select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  >
                    <option value="">Select your bank</option>
                    {[
                      'HDFC Bank',
                      'ICICI Bank',
                      'SBI',
                      'Axis Bank',
                      'Kotak Mahindra Bank',
                      'Yes Bank',
                      'Punjab National Bank',
                      'Bank of Baroda',
                    ].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="nbRef">
                  <Form.Label>Reference (dummy)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. NB-TXN-987654"
                    value={nbRef}
                    onChange={(e) => setNbRef(e.target.value)}
                  />
                </Form.Group>
              </>
            )}

            <Card className="mt-3">
              <Card.Body>
                <Row>
                  <Col>Items</Col>
                  <Col className="text-end">${subtotal.toFixed(2)}</Col>
                </Row>
                <Row>
                  <Col>Shipping</Col>
                  <Col className="text-end">${shippingPrice.toFixed(2)}</Col>
                </Row>
                <Row>
                  <Col>Tax</Col>
                  <Col className="text-end">${taxPrice.toFixed(2)}</Col>
                </Row>
                <hr />
                <Row>
                  <Col>
                    <strong>Total</strong>
                  </Col>
                  <Col className="text-end">
                    <strong>${total.toFixed(2)}</strong>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <div className="d-flex gap-2 mt-3">
              <Button type="submit" variant="primary" disabled={paying}>
                {paying ? 'Processing…' : 'Pay & Continue'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/cart')}>
                Back to Cart
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}

export default ChoosePaymentScreen;

// Helpers
function yearRange(offset = 0, years = 10) {
  const start = new Date().getFullYear() + offset
  return Array.from({ length: years }, (_, i) => start + i)
}
function guessCardBrand(num) {
  const n = (num || '').replace(/\D/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^5[1-5]/.test(n) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  if (/^6(?:011|5)/.test(n)) return 'discover'
  return 'card'
}
