import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Row, Col, Image, ListGroup, Card, Button, Form, Spinner } from 'react-bootstrap'
import Rating from '../Components/Rating'
import Message from '../Components/Message'
import { listProductDetails } from '../actions/productActions'
import { useDispatch, useSelector } from 'react-redux'

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || // Vite
  process.env.VITE_API_URL ||                                              // Jest/Node
  'http://localhost:4000'

const Loader = () => (
  <Spinner
    animation="border"
    role="status"
    style={{ width: "100px", height: "100px", margin: "auto", display: "block" }}
  >
    <span className="sr-only">Loading...</span>
  </Spinner>
);

function ProductScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { loading, error, product } = useSelector((state) => state.productDetails)

  const [qty, setQty] = useState(product.countInStock > 0 ? 1 : 0)

  useEffect(() => {
    if (!id) return
    dispatch(listProductDetails(id))
  }, [dispatch, id])

  useEffect(() => {
    // reset qty if product changes or goes out of stock
    if (product?.countInStock > 0) setQty(1)
    else setQty(0)
  }, [product?._id, product?.countInStock])

  const addToCartHandler = () => {
    if (!product || product.countInStock === 0) return
    navigate(`/cart/${product._id}?qty=${qty}`)
  }

  if (loading) return <Loader />
  if (error) return <Message variant="danger">{error}</Message>
  if (!product?._id) return <Message variant="warning">Product not found</Message>

  return (
    <div className="container py-4">
      <Row>
        <Col md={5} className="mb-3">
          <Image src={API_URL + product.image} alt={product.name} fluid rounded />
        </Col>

        <Col md={4} className="mb-3">
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h3 className="mb-1">{product.name}</h3>
              <div className="text-muted small">
                {product.brand} • {product.category}
              </div>
            </ListGroup.Item>

            <ListGroup.Item>
              <Rating value={product.rating} text={`${product.numReviews} reviews`} />
            </ListGroup.Item>

            <ListGroup.Item>
              <strong>Price:</strong> ${product.price}
            </ListGroup.Item>

            <ListGroup.Item>
              <strong>Description:</strong>
              <div className="mt-1">{product.description}</div>
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={3}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>Price:</Col>
                  <Col>
                    <strong>${product.price}</strong>
                  </Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Status:</Col>
                  <Col>{product.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}</Col>
                </Row>
              </ListGroup.Item>

              {product.countInStock > 0 && (
                    <ListGroup.Item>
                        <Row className="align-items-center">
                        <Col>Qty</Col>
                        <Col>
                            <Form.Select
                                value={qty ? String(qty) : '1'}
                                onChange={(e) => setQty(Number(e.target.value))}
                                >
                                {[...Array(product.countInStock).keys()].map((x) => (
                                    <option key={x + 1} value={String(x + 1)}>
                                    {x + 1}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        </Row>
                    </ListGroup.Item>
                    )}

              <ListGroup.Item>
                <Button
                  className="w-100"
                  type="button"
                  disabled={product.countInStock === 0}
                  onClick={addToCartHandler}
                >
                  Add To Cart
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  )
}


export default ProductScreen;