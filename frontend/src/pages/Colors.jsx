import { useEffect, useState } from 'react'
import api from '../services/api'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'

export default function Colors() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', hex_code: '' })

  const load = () => {
    setLoading(true)
    api.get('/colors').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [])
  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/colors', form)
    setIsOpen(false)
    setForm({})
    load()
  }

  const columns = [
    {
      key: 'hex_code',
      label: 'Swatch',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: row.hex_code || '#ccc' }} />
          {row.hex_code}
        </div>
      ),
    },
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
  ]

  return (
    <div>
      <DataTable columns={columns} data={data} loading={loading} addLabel="Add Color" onAdd={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Color">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input" placeholder="Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="input sm:col-span-2" placeholder="Hex Code (e.g. #000000)" value={form.hex_code} onChange={(e) => setForm({ ...form, hex_code: e.target.value })} />
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}