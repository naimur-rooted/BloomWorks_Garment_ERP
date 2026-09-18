import { useEffect, useState } from 'react'
import api from '../services/api'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'

export default function Orders() {
  const [data, setData] = useState([])
  const [buyers, setBuyers] = useState([])
  const [styles, setStyles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({
    po_number: '',
    buyer_id: '',
    style_id: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    currency: 'USD',
    items: [],
  })
  const [itemForm, setItemForm] = useState({ style_variant_id: '', quantity: '', unit_price: '0' })

  const load = () => {
    setLoading(true)
    api.get('/orders').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false))
    api.get('/buyers').then((res) => setBuyers(res.data)).catch(console.error)
    api.get('/styles').then((res) => setStyles(res.data)).catch(console.error)
  }

  useEffect(load, [])

  const variants = styles.find((s) => String(s.id) === String(form.style_id))?.variants || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/orders', {
      ...form,
      buyer_id: Number(form.buyer_id),
      style_id: Number(form.style_id),
      items: form.items,
    })
    setIsOpen(false)
    setForm({ po_number: '', buyer_id: '', style_id: '', order_date: new Date().toISOString().split('T')[0], delivery_date: '', currency: 'USD', items: [] })
    load()
  }

  const addItem = () => {
    if (!itemForm.style_variant_id || !itemForm.quantity) return
    setForm({
      ...form,
      items: [...form.items, { ...itemForm, style_variant_id: Number(itemForm.style_variant_id), quantity: Number(itemForm.quantity), unit_price: Number(itemForm.unit_price) }],
    })
    setItemForm({ style_variant_id: '', quantity: '', unit_price: '0' })
  }

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  const columns = [
    { key: 'po_number', label: 'PO Number' },
    { key: 'buyer_name', label: 'Buyer' },
    { key: 'style_no', label: 'Style' },
    { key: 'order_date', label: 'Order Date' },
    { key: 'delivery_date', label: 'Delivery' },
    { key: 'total_quantity', label: 'Qty' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'Completed' ? 'bg-green-100 text-green-700'
          : row.status === 'Shipped' ? 'bg-blue-100 text-blue-700'
          : row.status === 'Cancelled' ? 'bg-red-100 text-red-700'
          : 'bg-yellow-100 text-yellow-700'
        }`}>{row.status}</span>
      ),
    },
  ]

  return (
    <div>
      <DataTable columns={columns} data={data} loading={loading} addLabel="Create Order" onAdd={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Buyer Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input" placeholder="PO Number *" required value={form.po_number} onChange={(e) => setForm({ ...form, po_number: e.target.value })} />
            <select className="input" required value={form.buyer_id} onChange={(e) => setForm({ ...form, buyer_id: e.target.value })}>
              <option value="">Select Buyer...</option>
              {buyers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="input" required value={form.style_id} onChange={(e) => setForm({ ...form, style_id: e.target.value })}>
              <option value="">Select Style...</option>
              {styles.map((s) => <option key={s.id} value={s.id}>{s.style_no}</option>)}
            </select>
            <input className="input" type="date" required value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} />
            <input className="input" type="date" required value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} />
            <input className="input" placeholder="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-2">Order Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
              <select className="input sm:col-span-2" value={itemForm.style_variant_id} onChange={(e) => setItemForm({ ...itemForm, style_variant_id: e.target.value })}>
                <option value="">Select Variant...</option>
                {variants.map((v) => <option key={v.id} value={v.id}>{v.variant_code}</option>)}
              </select>
              <input className="input" placeholder="Qty" type="number" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} />
              <input className="input" placeholder="Price" type="number" step="0.01" value={itemForm.unit_price} onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })} />
            </div>
            <button type="button" onClick={addItem} className="btn-secondary text-sm w-full">+ Add Item</button>
            {form.items.length > 0 && (
              <div className="mt-2 space-y-1">
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 text-sm">
                    <span>Variant {item.style_variant_id} — Qty: {item.quantity} @ ${item.unit_price}</span>
                    <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Order</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}