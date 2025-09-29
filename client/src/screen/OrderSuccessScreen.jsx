// src/screens/OrderSuccess.jsx
import React from "react"
import { useLocation } from "react-router-dom"
import { Card, ListGroup } from "react-bootstrap"

const OrderSuccess = () => {
  const location = useLocation()
  const {
    transactionId,
    cartItems,
    shippingAddress,
    paymentMethod,
    paymentDetails,
  } = location.state || {}

  return (
    <Card className="p-3">
      <h2 style={{color: 'green'}}>Payment Successful!</h2>
      <p>
        Transaction ID: <strong>{transactionId}</strong>
      </p>

      <h4>Products:</h4>
      <ListGroup>
        {cartItems.map((item) => (
          <ListGroup.Item key={item._id}>
            {item.name} × {item.qty}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <h4 className="mt-3">Shipping Address:</h4>
      <p>
        {shippingAddress.address}, {shippingAddress.city},{" "}
        {shippingAddress.country}
      </p>

      <h4 className="mt-3">Payment Info:</h4>
      <p>Method: {paymentMethod}</p>
      {/* {paymentDetails && <pre>{JSON.stringify(paymentDetails, null, 2)}</pre>} */}
    </Card>
  )
}

export default OrderSuccess
