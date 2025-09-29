// src/screens/OrderListScreen.jsx
import React, { useEffect, useState } from 'react'                    // react core
import { Link } from 'react-router-dom'                               // for Details link
import { Table, Button, Spinner, Alert, Container } from 'react-bootstrap' // UI components
import { useSelector } from 'react-redux'                             // to read auth state
import api from '../lib/axios.js'                                             // http client

const OrderListScreen = () => {
  // ---------- local state ----------
  const [orders, setOrders] = useState([])                            // list of orders
  const [loading, setLoading] = useState(false)                       // loading flag
  const [error, setError] = useState(null)                            // error message

  // ---------- auth info (expects userLogin slice) ----------
  const { userInfo } = useSelector((state) => state.userLogin || {})  // read logged in user
  const role = userInfo?.role                                         // role: admin/seller/customer
  const token = localStorage.getItem('token')                                       // JWT for Authorization header

  // ---------- helpers ----------
  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—')     // readable date or em dash
  const fmtMoney = (n) => (typeof n === 'number' ? n.toFixed(2) : '0.00') // 2-dec money safe

  // ---------- fetch orders ----------
  useEffect(() => {
    // guard: must be logged in
    if (!token) {
      setError('Not authorized. Please login.')
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)                                              // start spinner
        setError(null)                                                // clear old errors

        // hint scope for non-admins (backend may ignore or enforce)
        const scope = role === 'admin' ? '' : '?scope=mine'           // sellers/customers see their own
        const { data } = await api.get(`/api/orders${scope}`, {     // GET orders from API
          headers: { Authorization: `Bearer ${token}` },              // auth header
        })

        setOrders(Array.isArray(data) ? data : data?.orders || [])    // normalize array shape
      } catch (err) {
        // best-effort error message extraction
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to load orders'
        setError(msg)                                                 // set error text
      } finally {
        setLoading(false)                                             // stop spinner
      }
    }

    fetchOrders()                                                     // run once on mount / token change
  }, [token, role])                                                   // re-fetch if auth/role changes

  return (
    <Container className="mt-3">                                      {/* page container */}
      <h1>Orders</h1>                                                 {/* title */}

      {loading && <Spinner animation="border" role="status" className="my-2" />}
      {error && <Alert variant="danger" className="my-2">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover responsive className="table-sm mt-3">
            <thead>
                <tr>
                <th>ID</th>
                <th>User</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total (₹)</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th>Created</th>
                <th></th>
                </tr>
            </thead>

            <tbody>
                {orders.length === 0 ? (
                <tr>
                    <td colSpan={9} className="text-center">No orders found</td>
                </tr>
                ) : (
                    orders.map((o) => {
                        const id = o._id || o.id
                        return (
                        <tr key={id}>
                            <td style={{ wordBreak: 'break-all' }}>{id}</td>
                            <td>{o.user?.name || o.user?.email || '—'}</td>
                            <td>{Array.isArray(o.orderItems) ? o.orderItems.length : 0}</td>
                            <td>{o.paymentMethod || o.paymentResult?.merchant || '—'}</td>
                            <td>{typeof o.totalPrice === 'number' ? o.totalPrice.toFixed(2) : '0.00'}</td>
                            <td>{o.isPaid ? `✅ ${new Date(o.paidAt).toLocaleString()}` : '❌'}</td>
                            <td>{o.isDelivered ? `✅ ${new Date(o.deliveredAt).toLocaleString()}` : '❌'}</td>
                            <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}</td>
                            <td><Link to={`/order/${id}`}><Button variant="light" size="sm">Details</Button></Link></td>
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

export default OrderListScreen
