// React imports
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";

// Custom components
import Product from "../Components/Product";
import Message from "../Components/Message";
import Loader from "../Components/Loader";
import Paginate from "../Components/Paginate";
import ProductCarousel from "../Components/ProductCarousel";

// Action to fetch products from backend
import { listProducts } from "../actions/productActions";

// Main HomeScreen Component
const HomeScreen = () => {
  // Get keyword & page number from URL params
  const { keyword, pageNumber } = useParams(); 
  const page = pageNumber || 1;

  // Redux hook to dispatch actions
  const dispatch = useDispatch();

  // Get product list state from Redux store
  const productList = useSelector((state) => state.productList);
  const { loading, error, products, pages } = productList;

  // Fetch products whenever keyword or page number changes
  useEffect(() => {
    dispatch(listProducts(keyword, page));
  }, [dispatch, keyword, page]);

  return (
    <>
      {/* Show carousel only if not searching */}
      {!keyword && <ProductCarousel />}

      <h1>Latest Products</h1>

      {loading ? (
        // Show spinner when loading
        <Loader />
      ) : error ? (
        // Show error message if API fails
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {/* Products Grid */}
          <Row>
            {products && products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>

          {/* Pagination component */}
          <Paginate pages={pages} page={page} keyword={keyword ? keyword : ""} />
        </>
      )}
    </>
  );
};

export default HomeScreen;
