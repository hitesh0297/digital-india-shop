import React, { useEffect } from "react";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { listUsers, deleteUser } from "../actions/userActions";
import { useNavigate } from "react-router-dom"; 

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

function UserListScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state: user list
  const userList = useSelector((state) => state.userList);
  const { loading, error, users } = userList;

  // Redux state: login info
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  // Redux state: delete user
  const userDelete = useSelector((state) => state.userDelete);
  const { success: successDelete } = userDelete;

  // Fetch users on mount or after delete
  useEffect(() => {
    if (userInfo && userInfo.role == 'admin') {
      dispatch(listUsers());
    } else {
      navigate("/login");;
    }
  }, [dispatch, navigate, successDelete, userInfo]);

  // Delete handler
  const deleteHandler = (id) => {
    if (window.confirm("Are you sure?")) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <>
      <h1>Users</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ADMIN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </td>
                <td>
                  {user.role == 'admin' ? (
                    <i className="fas fa-check" style={{ color: "green" }}></i>
                  ) : (
                    <i className="fas fa-times" style={{ color: "red" }}></i>
                  )}
                </td>
                <td>
                  <LinkContainer to={`/admin/user/${user._id}/edit`}>
                    <Button variant="light" className="btn-sm">
                      <i className="fas fa-edit"></i>
                    </Button>
                  </LinkContainer>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => deleteHandler(user._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

export default UserListScreen;
