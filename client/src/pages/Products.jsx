import { useEffect, useState } from 'react'
import api from '../lib/api.js'
import { useAuth } from '../lib/useAuth.js'

export default function Products() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await api.get('/products')
        if (!cancelled) setItems(res.data)
      } catch (e) {
        if (!cancelled) setError('Failed to load products')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const [form, setForm] = useState({ title: '', price: 0 })
  const canCreate = !!token

  async function createProduct(e) {
    e.preventDefault()
    try {
      const res = await api.post('/products', form)
      setItems(prev => [res.data, ...prev])
      setForm({ title: '', price: 0 })
    } catch (e) {
      alert(e?.response?.data?.error || 'Create failed')
    }
  }

  return (
    <section>
      <h2>Products</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {canCreate && (
        <form className="row" onSubmit={createProduct}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
          <button>Add</button>
        </form>
      )}

      <ul className="grid">
        {items.map(p => (
          <li key={p._id} className="card">
            <h3>{p.title}</h3>
            <p>₹{p.price}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
