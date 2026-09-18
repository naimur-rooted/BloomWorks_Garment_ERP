import { useEffect, useState } from 'react'
import api from '../services/api'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'

const CATEGORIES = ['Fabric', 'Thread', 'Button', 'Zipper', 'Label', 'Accessory', 'Packaging']

export default function Materials() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ code: '', name: '', category: 'Fabric', uom: 'kg', unit_cost: 0, currency: 'USD' })

  const load = () => {
    setLoading(true)
    api.get('/materials').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [])
  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/materials', form)
    setIsOpen(false)
    load()
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    {
      key: 'category',
      label: 'Category',
      render: (row) => <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs">{row.category}</span>,
    },
    { key: 'uom', label: 'UOM' },
    { key: 'unit_cost', label: 'Unit Cost' },
    { key: 'currency', label: 'Currency' },
  ]

  return (
    <div>
      <DataTable columns={columns} data={data} loading={loading} addLabel="Add Material" onAdd={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Material">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input" placeholder="Code *" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="input" placeholder="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={form.uom} onChange={(e) => setForm({ ...form, uom: e.target.value })}>
            {['kg', 'meter', 'pcs', 'dozen', 'roll'].map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <input className="input" placeholder="Unit Cost" type="number" step="0.01" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} />
          <input className="input" placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}