import { useEffect, useState } from 'react'
import api from '../services/api'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'

export default function Styles() {
  const [data, setData] = useState([])
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ style_no: '', description: '', buyer_id: '', category: '' })

  const load = () => {
    setLoading(true)
    api.get('/styles').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false))
    api.get('/buyers').then((res) => setBuyers(res.data)).catch(console.error)
  }

  useEffect(load, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/styles', { ...form, buyer_id: form.buyer_id || null })
    setIsOpen(false)
    setForm({})
    load()
  }

  const columns = [
    { key: 'style_no', label: 'Style No' },
    { key: 'description', label: 'Description' },
    { key: 'buyer_name', label: 'Buyer' },
    { key: 'category', label: 'Category' },
    {
      key: 'variants',
      label: 'Variants',
      render: (row) => (
        <span className="text-xs bg-gray-100 rounded-md px-2 py-1">{row.variants?.length || 0} variants</span>
      ),
    },
  ]

  return (
    <div>
      <DataTable columns={columns} data={data} loading={loading} addLabel="Add Style" onAdd={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Style">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input" placeholder="Style No * (e.g. TSHIRT-001)" required value={form.style_no} onChange={(e) => setForm({ ...form, style_no: e.target.value })} />
          <select className="input" value={form.buyer_id} onChange={(e) => setForm({ ...form, buyer_id: e.target.value })}>
            <option value="">Select Buyer...</option>
            {buyers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input className="input sm:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" placeholder="Category (e.g. T-Shirt, Polo)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}