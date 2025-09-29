// src/screens/SellerOrderListScreen.jsx
import React, { useEffect, useState } from 'react'                 // hooks
import { Table, Button, Spinner, Alert, Container } from 'react-bootstrap' // UI
import { Link } from 'react-router-dom'                            // details link
import { useSelector } from 'react-redux'                          // auth state
import api from '../lib/axios.js'                                           // axios instance

const SellerOrderListScreen = () => {
  const { userInfo } = useSelector((s) => s.userLogin || {})       // read logged-in user
  const token = localStorage.getItem('token')                                    // JWT token

  const [orders, setOrders] = useState([])                         // orders list
  const [loading, setLoading] = useState(false)                    // spinner flag
  const [error, setError] = useState(null)                         // error text

  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—')  // readable date
  const fmtMoney = (n) => (typeof n === 'number' ? n.toFixed(2) : '0.00') // ₹ format

  useEffect(() => {
    // bail if not authenticated
    if (!token) { setError('Not authorized. Please login.'); return }

    const fetchSellerOrders = async () => {
      try {
        setLoading(true)                                           // start loading
        setError(null)                                             // clear old error
        // Backend should return only orders that include this seller's products
        const { data } = await api.get('/api/orders?scope=seller', {
          headers: { Authorization: `Bearer ${token}` },           // auth header
        })
        setOrders(Array.isArray(data) ? data : data?.orders || []) // normalize array
      } catch (err) {
        const msg = err?.response?.data?.error || err?.message || 'Failed to load orders'
        setError(msg)                                              // set error
      } finally {
        setLoading(false)                                          // stop loading
      }
    }

    fetchSellerOrders()                                            // run on mount / token change
  }, [token])

  return (
    <Container className="mt-3">                                   {/* page container */}
      <h1>My Sales</h1>                                            {/* title */}

      {loading && <Spinner animation="border" role="status" className="my-2" />}  {/* spinner */}
      {error && <Alert variant="danger" className="my-2">{error}</Alert>}         {/* error */}

      {!loading && !error && (
        <Table striped bordered hover responsive className="table-sm mt-2">       {/* table */}
          <thead>
            <tr>
              <th>ID</th>                                          {/* order id */}
              <th>Date</th>                                        {/* createdAt */}
              <th>Buyer</th>                                       {/* user name/email */}
              <th>Items</th>                                       {/* item count */}
              <th>Total (₹)</th>                                   {/* total */}
              <th>Paid</th>                                        {/* paid status/date */}
              <th>Delivered</th>                                   {/* delivered status/date */}
              <th></th>                                            {/* actions */}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (                               // empty state row
              <tr>
                <td colSpan={8} className="text-center">No sales yet</td>
              </tr>
            ) : (
              orders.map((o) => {                                   // map orders
                const id = o._id || o.id                            // normalize id
                const buyer = o.user?.name || o.user?.email || '—'  // buyer label
                const itemsCount = Array.isArray(o.orderItems) ? o.orderItems.length : 0 // count
                return (
                  <tr key={id}>
                    <td style={{ wordBreak: 'break-all' }}>{id}</td>               {/* id */}
                    <td>{o.createdAt ? o.createdAt.substring(0,10) : '—'}</td>     {/* date */}
                    <td>{buyer}</td>                                               {/* buyer */}
                    <td>{itemsCount}</td>                                          {/* items */}
                    <td>{fmtMoney(o.totalPrice)}</td>                               {/* total */}
                    <td>{o.isPaid ? o.paidAt?.substring(0,10) : '❌'}</td>          {/* paid */}
                    <td>{o.isDelivered ? o.deliveredAt?.substring(0,10) : '❌'}</td>{/* delivered */}
                    <td>
                      <Link to={`/order/${id}`}>
                        <Button size="sm" variant="light">Details</Button>          {/* details */}
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Table>
      )}
    </Container>
  )
}

export default SellerOrderListScreen
