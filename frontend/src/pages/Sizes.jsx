import { useEffect, useState } from 'react'
import api from '../services/api'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'

export default function Sizes() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', sort_order: 0 })

  const load = () => {
    setLoading(true)
    api.get('/sizes').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [])
  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/sizes', form)
    setIsOpen(false)
    setForm({})
    load()
  }

  const columns = [
    { key: 'name', label: 'Size Name' },
    { key: 'code', label: 'Code' },
    { key: 'sort_order', label: 'Sort Order' },
  ]

  return (
    <div>
      <DataTable columns={columns} data={data} loading={loading} addLabel="Add Size" onAdd={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Size">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input" placeholder="Size Name * (e.g. S)" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="input" placeholder="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}