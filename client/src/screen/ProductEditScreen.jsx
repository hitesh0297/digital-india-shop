import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Form, Button, Row, Col, Card, ProgressBar } from 'react-bootstrap'
import axios from 'axios'

import Loader from '../Components/Loader'
import Message from '../Components/Message'

// actions (already in your app)
import { listProductDetails, updateProduct } from '../actions/productActions'
import { createProduct } from '../actions/productActions'

// constants
import { PRODUCT_CREATE_RESET, PRODUCT_UPDATE_RESET } from '../constants/productConstants'

// Fallback for API base (use REACT_APP_API_URL if defined; otherwise relative)
const API_URL = import.meta.env.VITE_API_URL

export default function ProductEditScreen() {
  const { id: productIdParam } = useParams() // "new" OR actual ObjectId
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const isCreateFlow = !productIdParam || productIdParam === 'new'

  // Local form state
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [image, setImage] = useState('') // will be final web path (after upload)
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [description, setDescription] = useState('')
  const fileInputRef = useRef(null)

  // Image selection (no upload here; upload is done inside the action after update succeeds)
  const [imageFile, setImageFile] = useState(null)
  const [localPreview, setLocalPreview] = useState('')
  const [savedBanner, setSavedBanner] = useState(false)

  // Redux slices
  const { userInfo } = useSelector((s) => s.userLogin || { userInfo: null })

  const productDetails = useSelector((s) => s.productDetails || {})
  const { loading, error, product } = productDetails

  const productCreate = useSelector((s) => s.productCreate || {})
  const {
    loading: creating,
    error: createError,
    success: createSuccess,
    product: createdProduct,
  } = productCreate

  const productUpdate = useSelector((s) => s.productUpdate || {})
  const {
    loading: updating,
    error: updateError,
    success: updateSuccess,
  } = productUpdate

  // Guard: admin via role
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login')
    }
  }, [navigate, userInfo])

  // Load existing product into form
  useEffect(() => {
    if (isCreateFlow) return
    if (!product || product._id !== productIdParam) {
      dispatch(listProductDetails(productIdParam))
    } else {
      setName(product.name || '')
      setPrice(product.price ?? 0)
      setImage(product.image || '')
      setBrand(product.brand || '')
      setCategory(product.category || '')
      setCountInStock(product.countInStock ?? 0)
      setDescription(product.description || '')
      setLocalPreview('') // reset preview when switching products
      setImageFile(null)
    }
  }, [dispatch, isCreateFlow, product, productIdParam])

  // After creating skeleton product, jump to its edit
  useEffect(() => {
    if (createSuccess && createdProduct?._id) {
      dispatch({ type: PRODUCT_CREATE_RESET })
      navigate(`/admin/product/${createdProduct._id}/edit`)
    }
  }, [createSuccess, createdProduct, dispatch, navigate])

  // Optional: auto-clear update success message
  useEffect(() => {
    if (updateSuccess) {
      const t = setTimeout(() => dispatch({ type: PRODUCT_UPDATE_RESET }), 1200)
      return () => clearTimeout(t)
    }
  }, [updateSuccess, dispatch])

  // Image selection (preview only)
  const onFileInput = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file.name)
    setImageFile(file)
    setLocalPreview(URL.createObjectURL(file))
  }
  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    setImage(file.name)
    setImageFile(file)
    setLocalPreview(URL.createObjectURL(file))
  }
  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Submit handlers
  const handleCreate = (e) => {
    e.preventDefault()
    const payload = {
      name,
      price: Number(price),
      image, // will be overwritten later if imageFile is provided & uploaded
      brand,
      category,
      countInStock: Number(countInStock),
      description,
    }
    dispatch(createProduct(payload, imageFile)) // server assigns user from token
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    const payload = {
      _id: productIdParam,
      name,
      price: Number(price),
      image, // will be overwritten later if imageFile is provided & uploaded
      brand,
      category,
      countInStock: Number(countInStock),
      description,
    }
    // Pass the File (or null) — the action will upload AFTER the update succeeds
    dispatch(updateProduct(payload, imageFile))
  }

  useEffect(() => {
    if (updateSuccess) {
      setSavedBanner(true)
      const t = setTimeout(() => setSavedBanner(false), 2000) // auto-hide after 2s
      return () => clearTimeout(t)
    }
  }, [updateSuccess])

  return (
    <div className="container py-4">
      <Row className="mb-3">
        <Col>
          <Link to="/admin/productlist" className="btn btn-light">
            Go Back
          </Link>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="p-3">
            <h2 className="mb-3">
              {isCreateFlow ? 'Create Product' : 'Edit Product'}
            </h2>

            {(loading || creating || updating) && <Loader />}
            {error && <Message variant="danger">{error}</Message>}
            {createError && <Message variant="danger">{createError}</Message>}
            {updateError && <Message variant="danger">{updateError}</Message>}
            {updateSuccess && <Message variant="success">Product updated</Message>}

            <Form onSubmit={isCreateFlow ? handleCreate : handleUpdate}>
              {!isCreateFlow && (
                <Form.Group className="mb-3" controlId="productId">
                  <Form.Label>Product ID</Form.Label>
                  <Form.Control value={productIdParam} disabled />
                </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="price">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={String(price)}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="countInStock">
                    <Form.Label>Count In Stock</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={String(countInStock)}
                      onChange={(e) => setCountInStock(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Image picker (no upload here) */}
              <Form.Group className="mb-3" controlId="imageUpload">
                <Form.Label>Product Image</Form.Label>

                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  className="border rounded p-3 text-center"
                  style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {localPreview || image ? (
                    <img
                      src={localPreview || API_URL + image}
                      alt="preview"
                      style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="text-muted">
                      Drag & drop an image here, or click to choose a file
                    </div>
                  )}
                </div>

                <Form.Control
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileInput}
                  className="mt-2"
                  style={{ display: 'none' }}
                />

                <div className="d-flex gap-2 mt-2">
                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    Choose Image
                  </Button>
                  {image && (
                    <Form.Control
                      value={image} hidden
                      readOnly
                      plaintext
                      className="ms-2"
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                    />
                  )}
                </div>

                <div className="form-text">
                  Image file is selected here and will be uploaded <em>after</em> a successful update.
                </div>
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="brand">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="category">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                {/* <Col md={4}>
                  <Form.Group className="mb-3" controlId="user">
                    <Form.Label>User (server assigns)</Form.Label>
                    <Form.Control value="req.user._id" disabled />
                  </Form.Group>
                </Col> */}
              </Row>

              <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                {isCreateFlow ? (
                  <Button type="submit" variant="primary">
                    Create & Continue Editing
                  </Button>
                ) : (
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                )}
                <Link to="/admin/productlist" className="btn btn-secondary">
                  Cancel
                </Link>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
