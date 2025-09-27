import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Alert, Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails, updateUser } from "../actions/userActions";
import { USER_UPDATE_RESET } from "../constants/userConstants";

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

// Inline FormContainer Component
const FormContainer = ({ children }) => (
  <Container>
    <Row className="justify-content-md-center">
      <Col xs={12} md={6}>
        {children}
      </Col>
    </Row>
  </Container>
);

const UserEditScreen = () => {
  const { id: userId } = useParams(); 
  const navigate = useNavigate();

  // Local state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState('user');

  const dispatch = useDispatch();

  // Redux: get user details
  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  // Redux: update user
  const userUpdate = useSelector((state) => state.userUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = userUpdate;

  // Effect
  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: USER_UPDATE_RESET });
      navigate("/admin/userlist");
    } else {
      if (!user.name || user._id !== userId) {
        dispatch(getUserDetails(userId));
      } else {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
      }
    }
  }, [dispatch, navigate, userId, user, successUpdate]);

  // Submit handler
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updateUser({ _id: userId, name, email, role }));
  };

  return (
    <>
      <Link to="/admin/userlist" className="btn btn-light my-3">
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit User</h1>
        {loadingUpdate && <Loader />}
        {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            {/* Name Field */}
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="name"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></Form.Control>
            </Form.Group>

            {/* Email Field */}
            <Form.Group controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>

            {/* Is Admin Field */}
            <Form.Group controlId="role">
              <Form.Check
                type="checkbox"
                label="Is Admin"
                checked={role == 'admin'}
                onChange={(e) => setRole(e.target.checked)}
              ></Form.Check>
            </Form.Group>

            <Button type="submit" variant="primary">
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default UserEditScreen;
