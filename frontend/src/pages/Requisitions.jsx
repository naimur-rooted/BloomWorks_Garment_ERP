import { useEffect, useState } from 'react'
import api from '../services/api'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'

export default function Requisitions() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ pr_number: '', order_id: '', requested_by: '', required_date: '', items: [] })
  const [itemForm, setItemForm] = useState({ material_id: '', quantity: '', requirement_id: '' })
  const [materials, setMaterials] = useState([])

  const load = () => {
    setLoading(true)
    api.get('/purchase-requisitions').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false))
    api.get('/materials').then((res) => setMaterials(res.data)).catch(console.error)
  }

  useEffect(load, [])

  const addItem = () => {
    if (!itemForm.material_id || !itemForm.quantity) return
    setForm({ ...form, items: [...form.items, { material_id: Number(itemForm.material_id), quantity: Number(itemForm.quantity), requirement_id: itemForm.requirement_id }] })
    setItemForm({ material_id: '', quantity: '', requirement_id: '' })
  }

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/purchase-requisitions', { ...form, items: form.items })
    setIsOpen(false)
    setForm({ pr_number: '', order_id: '', requested_by: '', required_date: '', items: [] })
    setItems([])
    load()
  }

  const columns = [
    { key: 'pr_number', label: 'PR Number' },
    { key: 'order_id', label: 'Order' },
    { key: 'requested_by', label: 'Requested By' },
    { key: 'required_date', label: 'Required Date' },
    { key: 'status', label: 'Status', render: (row) => (row.status ? row.status : 'Draft') },
    { key: 'items.length', label: 'Items' },
  ]

  return (
    <div>
      <DataTable columns={columns} data={data} loading={loading} addLabel="Create Requisition" onAdd={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Purchase Requisition">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input" placeholder="PR Number *" required value={form.pr_number} onChange={(e) => setForm({ ...form, pr_number: e.target.value })} />
            <select className="input" value={form.order_id} onChange={(e) => setForm({ ...form, order_id: e.target.value })}>
              <option value="">Select Order...</option>
              {form.order_id && form.order_id !== 'undefined' && form.order_id !== 'null' ? <option key={form.order_id} value={form.order_id}>Order {form.order_id}</option> : null}
            </select>
            <input className="input" placeholder="Requested By" value={form.requested_by} onChange={(e) => setForm({ ...form, requested_by: e.target.value })} />
            <input className="input" type="date" placeholder="Required Date" value={form.required_date} onChange={(e) => setForm({ ...form, required_date: e.target.value })} />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-2">Requisition Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
              <select className="input sm:col-span-2" value={itemForm.material_id} onChange={(e) => setItemForm({ ...itemForm, material_id: e.target.value })}>
                <option value="">Select Material...</option>
                {materials.map((m) => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
              </select>
              <input className="input" placeholder="Qty" type="number" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
              <input className="input" placeholder="Requirement ID" value={itemForm.requirement_id} onChange={(e) => setItemForm({ ...itemForm, requirement_id: e.target.value })} />
            </div>
            <button type="button" onClick={addItem} className="btn-secondary text-sm w-full">+ Add Item</button>
            {form.items.length > 0 && (
              <div className="mt-2 space-y-1">
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 text-sm">
                    <span>Material {item.material_id} — Qty: {item.quantity}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Requisition</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}