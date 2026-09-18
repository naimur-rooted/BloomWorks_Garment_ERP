import { useEffect, useState } from 'react'
import api from '../services/api'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'

export default function Boms() {
  const [data, setData] = useState([])
  const [styles, setStyles] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ style_id: '', bom_name: '', version: 1 })
  const [itemForm, setItemForm] = useState({ material_id: '', quantity_per_garment: '', wastage_percent: '0', is_mandatory: true })
  const [items, setItems] = useState([])

  const load = () => {
    setLoading(true)
    api.get('/boms').then((res) => setData(res.data)).catch(console.error).finally(() => setLoading(false))
    api.get('/styles').then((res) => setStyles(res.data)).catch(console.error)
    api.get('/materials').then((res) => setMaterials(res.data)).catch(console.error)
  }

  useEffect(load, [])

  const addItem = () => {
    if (!itemForm.material_id || !itemForm.quantity_per_garment) return
    const material = materials.find((m) => String(m.id) === String(itemForm.material_id))
    setItems([
      ...items,
      {
        material_id: Number(itemForm.material_id),
        quantity_per_garment: Number(itemForm.quantity_per_garment),
        uom: material?.uom || 'pcs',
        wastage_percent: Number(itemForm.wastage_percent),
        is_mandatory: itemForm.is_mandatory === true || itemForm.is_mandatory === 'true',
      },
    ])
    setItemForm({ material_id: '', quantity_per_garment: '', wastage_percent: '0', is_mandatory: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/boms', {
      style_id: Number(form.style_id),
      bom_name: form.bom_name,
      version: Number(form.version),
      items,
    })
    setIsOpen(false)
    setForm({ style_id: '', bom_name: '', version: 1 })
    setItems([])
    load()
  }

  const columns = [
    { key: 'bom_name', label: 'BOM Name' },
    { key: 'style_no', label: 'Style' },
    { key: 'version', label: 'Version' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {row.is_active ? 'Active' : row.status}
        </span>
      ),
    },
    { key: 'item_count', label: 'Items', render: (row) => row.items?.length || 0 },
  ]

  return (
    <div>
      <DataTable columns={columns} data={data} loading={loading} addLabel="Create BOM" onAdd={() => setIsOpen(true)} />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Garment BOM">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input" placeholder="BOM Name *" required value={form.bom_name} onChange={(e) => setForm({ ...form, bom_name: e.target.value })} />
            <select className="input" required value={form.style_id} onChange={(e) => setForm({ ...form, style_id: e.target.value })}>
              <option value="">Select Style...</option>
              {styles.map((s) => <option key={s.id} value={s.id}>{s.style_no}</option>)}
            </select>
            <input className="input" placeholder="Version" type="number" value={form.version} onChange={(e) => setForm({ ...form, version: Number(e.target.value) })} />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-2">BOM Items</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
              <select className="input sm:col-span-2" value={itemForm.material_id} onChange={(e) => setItemForm({ ...itemForm, material_id: e.target.value })}>
                <option value="">Select Material...</option>
                {materials.map((m) => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
              </select>
              <input className="input" placeholder="Qty/Garment" type="number" step="0.0001" value={itemForm.quantity_per_garment} onChange={(e) => setItemForm({ ...itemForm, quantity_per_garment: e.target.value })} />
              <input className="input" placeholder="Wastage %" type="number" step="0.01" value={itemForm.wastage_percent} onChange={(e) => setItemForm({ ...itemForm, wastage_percent: e.target.value })} />
              <select className="input" value={itemForm.is_mandatory} onChange={(e) => setItemForm({ ...itemForm, is_mandatory: e.target.value })}>
                <option value="true">Mandatory</option>
                <option value="false">Optional</option>
              </select>
            </div>
            <button type="button" onClick={addItem} className="btn-secondary text-sm w-full">+ Add BOM Item</button>
            {items.length > 0 && (
              <div className="mt-2 space-y-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2 text-sm">
                    <span>Material {item.material_id} — {item.quantity_per_garment} {item.uom} (Wastage {item.wastage_percent}%)</span>
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500 text-xs">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save BOM</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}