// src/screens/SellerProductListScreen.jsx
import React, { useEffect, useState } from "react"
import { Table, Button, Row, Col, Spinner, Alert } from "react-bootstrap"
import { LinkContainer } from "react-router-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"

import api from "../lib/axios.js" // axios instance (uses VITE_API_URL)

// keep existing actions for create/delete (they likely hit /api/products etc.)
import { deleteProduct, createProduct } from "../actions/productActions"
import { PRODUCT_CREATE_RESET } from "../constants/productConstants"

// Inline Loader
const Loader = () => (
  <Spinner
    animation="border"
    role="status"
    style={{ width: "100px", height: "100px", margin: "auto", display: "block" }}
  >
    <span className="sr-only">Loading...</span>
  </Spinner>
)

// Inline Message
const Message = ({ variant, children }) => <Alert variant={variant}>{children}</Alert>

// Simple paginate (seller route)
const Paginate = ({ page, pages }) => (
  <div className="my-3">
    {[...Array(pages).keys()].map((x) => (
      <Button
        key={x + 1}
        variant={x + 1 === page ? "primary" : "light"}
        className="mx-1"
        href={`/seller/productlist/${x + 1}`}
      >
        {x + 1}
      </Button>
    ))}
  </div>
)

function SellerProductListScreen() {
  const navigate = useNavigate()
  const { pageNumber } = useParams()
  const pageNum = Number(pageNumber) || 1

  const dispatch = useDispatch()

  // Auth
  const { userInfo } = useSelector((s) => s.userLogin || {})
  const role = userInfo?.role
  const token = localStorage.getItem('token')

  // Local state for products (NO redux list usage)
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Delete & Create slices (for feedback + refetch triggers)
  const { loading: loadingDelete, error: errorDelete, success: successDelete } =
    useSelector((s) => s.productDelete || {})
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = useSelector((s) => s.productCreate || {})

  // Fetch seller products from API (no redux list)
  const fetchSellerProducts = async (pageToLoad = 1) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get(`/api/products/seller?pageNumber=${pageToLoad}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // normalize both shapes: array or {products,page,pages}
      const list = Array.isArray(data) ? data : data.products || []
      setProducts(list)
      setPage(data.page || pageToLoad)
      setPages(data.pages || 1)
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load products"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // reset create slice so stale success doesn't redirect
    dispatch({ type: PRODUCT_CREATE_RESET })

    if (!userInfo || role !== "seller") {
      navigate("/login")
      return
    }

    fetchSellerProducts(pageNum)
    // refetch after successful delete/create
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo, role, pageNum, successDelete, successCreate])

  const deleteHandler = (id) => {
    if (window.confirm("Are you sure?")) {
      dispatch(deleteProduct(id))
    }
  }

  // Redirect to edit newly created
  useEffect(() => {
    if (successCreate && createdProduct?._id) {
      navigate(`/seller/product/${createdProduct._id}/edit`)
    }
  }, [successCreate, createdProduct, navigate])

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>My Products</h1>
        </Col>
        <Col className="text-end">
            <LinkContainer to={`/seller/product/create`}>
                <Button className="my-3">
                <i className="fas fa-plus"></i> Create Product
                </Button>
            </LinkContainer>
        </Col>
      </Row>

      {loadingDelete && <Loader />}
      {errorDelete && <Message variant="danger">{errorDelete}</Message>}

      {loadingCreate && <Loader />}
      {errorCreate && <Message variant="danger">{errorCreate}</Message>}

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">No products yet</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td style={{ wordBreak: "break-all" }}>{product._id}</td>
                    <td>{product.name}</td>
                    <td>₹{Number(product.price || 0).toFixed(2)}</td>
                    <td>{product.category || "—"}</td>
                    <td>{product.brand || "—"}</td>
                    <td>
                      <div className="d-flex">
                        <LinkContainer to={`/seller/product/${product._id}/edit`}>
                          <Button variant="light" className="btn-sm">
                            <i className="fas fa-edit"></i>
                          </Button>
                        </LinkContainer>
                        <Button
                          variant="danger"
                          className="btn-sm ms-2"
                          onClick={() => deleteHandler(product._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <Paginate page={page} pages={pages} />
        </>
      )}
    </>
  )
}

export default SellerProductListScreen
