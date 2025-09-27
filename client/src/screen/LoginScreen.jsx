import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

// Custom Components
import Message from '../Components/Message';
import FormContainer from '../Components/formContainer';
import Loader from '../Components/Loader';

// Action to log in user
import { login } from '../actions/userActions';

function LoginScreen() {
  // Local state for input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redux dispatch function
  const dispatch = useDispatch();

  // Access Redux state → userLogin reducer
  const userLogin = useSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

   // React Router v6 hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect logic → if user already logged in, move to homepage or custom redirect
  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      // If login successful, redirect
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  // Form submit handler
  const submitHandler = (e) => {
    e.preventDefault();
    // Dispatch login action with email + password
    dispatch(login(email, password));
  };

  return (
    <FormContainer>
      <h1>Sign In</h1>

      {/* Show error message */}
      {error && <Message variant="danger">{error}</Message>}

      {/* Show loader while login is in progress */}
      {loading && <Loader />}

      {/* Login form */}
      <Form onSubmit={submitHandler}>
        {/* Email Field */}
        <Form.Group controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        {/* Password Field */}
        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter Correct Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        {/* Submit Button */}
        <Button type="submit" variant="primary" className="mt-3">
          Sign In
        </Button>
      </Form>

      {/* Link to Register Page */}
      <Row className="py-3">
        <Col>
          New Customer?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
            Register
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
}

export default LoginScreen;
