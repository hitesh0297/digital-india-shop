// Admin page
import React, { useEffect } from "react";
import { Table, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { listProducts, deleteProduct, createProduct } from "../actions/productActions";
import { PRODUCT_CREATE_RESET } from "../constants/productConstants";
import { useNavigate, useParams } from "react-router-dom";

// Inline Loader Component
const Loader = () => (
  <Spinner
    animation="border"
    role="status"
    style={{ width: "100px", height: "100px", margin: "auto", display: "block" }}
  >
    <span className="sr-only">Loading...</span>
  </Spinner>
);

// Inline Message Component
const Message = ({ variant, children }) => (
  <Alert variant={variant}>{children}</Alert>
);

// Inline Paginate Component (basic placeholder, replace logic as needed)
const Paginate = ({ page, pages, role = 'user' }) => (
  <div className="my-3">
    {[...Array(pages).keys()].map((x) => (
      <Button
        key={x + 1}
        variant={x + 1 === page ? "primary" : "light"}
        className="mx-1"
        href={role == 'admin' ? `/admin/productlist/${x + 1}` : `/page/${x + 1}`}
      >
        {x + 1}
      </Button>
    ))}
  </div>
);

function ProductListScreen({ history, match }) {
  const navigate = useNavigate();
  const { pageNumber } = useParams(0); 
  const pageNum = pageNumber || 1; 

  const dispatch = useDispatch();

  // Redux state: product list
  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;

  // Redux state: product delete
  const productDelete = useSelector((state) => state.productDelete);
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = productDelete;

  // Redux state: product create
  const productCreate = useSelector((state) => state.productCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = productCreate;

  // Redux state: user login
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // useEffect: load products, handle create/delete
  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET });

     if (!userInfo || userInfo.role != 'admin') { 
      navigate("/login");
    }

    if (successCreate) {
      navigate(`/admin/product/${createdProduct._id}/edit`);
    } else {
      dispatch(listProducts("", pageNumber));
    }
  }, [dispatch, navigate, userInfo, successDelete, successCreate, createdProduct, pageNum]);

  // delete product handler
  const deleteHandler = (id) => {
    if (window.confirm("Are you sure?")) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className="text-right">
          <LinkContainer to={`/admin/product/create`}>
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
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <div className="d-flex">
                      <LinkContainer to={`/admin/product/${product._id}/edit`}>
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
              ))}
            </tbody>
          </Table>

          <Paginate page={page} pages={pages} role={'admin'} />
        </>
      )}
    </>
  );
}

export default ProductListScreen;
