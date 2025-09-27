import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Products from './pages/Products.jsx'
import { useAuth, AuthProvider } from './lib/useAuth.js'

function NavBar() {
  const { user, logout } = useAuth()
  return (
    <nav className="nav">
      <Link to="/" className="brand">Digital India Shop</Link>
      <div className="grow" />
      <Link to="/products">Products</Link>
      {user ? (
        <>
          <span className="user">Hi, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  )
}

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="*" element={<p>Not found</p>} />
        </Routes>
      </main>
    </AuthProvider>
  )
}
