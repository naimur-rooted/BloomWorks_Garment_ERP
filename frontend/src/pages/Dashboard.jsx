import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../auth/AuthContext'

const StatCard = ({ label, value, icon, color, subtext }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
        <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg text-xl ${color}`}>{icon}</div>
    </div>
  </div>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setData(res.data)).catch(console.error)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading BloomWorks Garments ERP Dashboard...
      </div>
    )
  }

  const role = user?.role || 'Admin'

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white p-4 rounded-lg shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-xl font-bold">BloomWorks Garments Ltd. — Factory ERP</h2>
          <p className="text-xs text-blue-200 mt-0.5">
            Logged in as <span className="font-semibold text-white">{user?.full_name}</span> (
            {role === 'Admin' ? 'System Administrator' : role})
          </p>
        </div>
        <span className="bg-blue-700/60 px-3 py-1 rounded-full text-xs font-medium text-blue-100 border border-blue-500/30">
          Chittagong Export Unit 01
        </span>
      </div>

      {/* Role-tailored Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {role === 'Merchandiser' ? (
          <>
            <StatCard label="Buyer Orders" value={data.total_orders} color="bg-blue-100 text-blue-700" icon="📦" subtext="H&M Order PO-2026-001" />
            <StatCard label="TNA Milestones" value="10/10" color="bg-green-100 text-green-700" icon="⏰" subtext="9 Completed / 1 On Track" />
            <StatCard label="Order Quantity" value="10,000 Pcs" color="bg-purple-100 text-purple-700" icon="👕" subtext="NG-POLO-001 Polo Shirt" />
            <StatCard label="Target Delivery" value="15 Apr 2026" color="bg-orange-100 text-orange-700" icon="🚢" subtext="Chittagong -> Sweden" />
          </>
        ) : ['Production Manager', 'Cutting Supervisor', 'Sewing Supervisor', 'Finishing Supervisor'].includes(role) ? (
          <>
            <StatCard label="Cut Output" value="10,200 Pcs" color="bg-blue-100 text-blue-700" icon="✂️" subtext="Loss/Rejection: 200 Pcs" />
            <StatCard label="Sewing Output" value="9,850 Pcs" color="bg-yellow-100 text-yellow-700" icon="🧵" subtext="Sewing Line 01 & 02" />
            <StatCard label="Finished Output" value="9,700 Pcs" color="bg-green-100 text-green-700" icon="✨" subtext="Finishing Section Passed" />
            <StatCard label="Work Orders" value="4 Active" color="bg-indigo-100 text-indigo-700" icon="📋" subtext="Sizes S, M, L, XL" />
          </>
        ) : role === 'Quality Inspector' ? (
          <>
            <StatCard label="Inspected Qty" value="9,700 Pcs" color="bg-blue-100 text-blue-700" icon="🔍" subtext="Final Garment Inspection" />
            <StatCard label="QC Passed" value="9,450 Pcs" color="bg-green-100 text-green-700" icon="✅" subtext="97.4% Pass Rate" />
            <StatCard label="QC Failed" value="250 Pcs" color="bg-red-100 text-red-700" icon="❌" subtext="Reworked / Rejection" />
            <StatCard label="AQL Status" value="PASSED" color="bg-teal-100 text-teal-700" icon="🛡️" subtext="AQL 2.5 Standard" />
          </>
        ) : ['Store Officer', 'Inventory Manager', 'Purchase Manager', 'Procurement Officer'].includes(role) ? (
          <>
            <StatCard label="Cotton Pique Stock" value="2,700 Kg" color="bg-blue-100 text-blue-700" icon="📦" subtext="ABC Textile Mills" />
            <StatCard label="Buttons Stock" value="35,000 Pcs" color="bg-green-100 text-green-700" icon="🔘" subtext="18L Pearl Buttons" />
            <StatCard label="Woven Labels" value="12,000 Pcs" color="bg-purple-100 text-purple-700" icon="🏷️" subtext="H&M Brand Labels" />
            <StatCard label="Export Cartons" value="105 Pcs" color="bg-orange-100 text-orange-700" icon="📦" subtext="7-Ply Heavy Duty" />
          </>
        ) : (
          <>
            <StatCard label="Total Orders" value={data.total_orders} color="bg-blue-100 text-blue-600" icon="📦" subtext="10,000 Pcs Total" />
            <StatCard label="Active Styles" value={data.total_styles} color="bg-green-100 text-green-600" icon="👕" subtext="NG-POLO-001 Knitwear" />
            <StatCard label="Buyers & Suppliers" value={`${data.total_buyers} Buyers / ${data.total_suppliers} Vendors`} color="bg-purple-100 text-purple-600" icon="🏢" />
            <StatCard label="Shipment Status" value="Ready (9,450 Pcs)" color="bg-orange-100 text-orange-600" icon="🚢" subtext="Maersk Line Vessel" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Order & Production Tracker */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
            Active Order Execution Tracker
          </h2>
          <div className="border border-blue-100 rounded-lg p-3 bg-blue-50/40 mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-bold text-gray-900 text-base">PO-2026-001</span>
                <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-semibold">
                  H&M Demo Buyer
                </span>
              </div>
              <span className="text-xs text-gray-500 font-medium">Style: NG-POLO-001 (10,000 Pcs)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-center text-xs font-semibold mt-3">
              <div className="p-2 bg-white rounded border border-green-200 text-green-700">
                1. Order & BOM
                <p className="text-[10px] text-gray-500 font-normal">Confirmed</p>
              </div>
              <div className="p-2 bg-white rounded border border-green-200 text-green-700">
                2. Goods Received
                <p className="text-[10px] text-gray-500 font-normal">2,700 kg Fabric</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-200 text-blue-700">
                3. Cutting & Sewing
                <p className="text-[10px] text-gray-500 font-normal">9,850 Sewn</p>
              </div>
              <div className="p-2 bg-white rounded border border-blue-200 text-blue-700">
                4. Quality & Packing
                <p className="text-[10px] text-gray-500 font-normal">9,450 Passed</p>
              </div>
              <div className="p-2 bg-white rounded border border-orange-200 text-orange-700">
                5. Shipment
                <p className="text-[10px] text-gray-500 font-normal">Ready / Maersk Line</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Order Line Details</h3>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="py-2 px-2">PO Number</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Delivery Date</th>
                <th className="py-2 px-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders?.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2.5 px-2 font-medium">{order.po_number}</td>
                  <td className="py-2.5 px-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-[11px]">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-gray-600">{order.delivery_date}</td>
                  <td className="py-2.5 px-2 font-semibold text-gray-800">{order.total_quantity?.toLocaleString()} Pcs</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Inventory Stock & Production Pipeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            Raw Material Stock Status
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-600">Cotton Pique Fabric</span>
                <span className="font-bold text-gray-900">2,700 kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-600">3-Hole Buttons</span>
                <span className="font-bold text-gray-900">35,000 Pcs</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-600">H&M Brand Labels</span>
                <span className="font-bold text-gray-900">12,000 Pcs</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-600">Export Cartons</span>
                <span className="font-bold text-gray-900">105 Cartons</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Factory Quick Summary
            </h4>
            <div className="text-xs space-y-1.5 text-gray-600">
              <p>• <span className="font-semibold">Factory:</span> NextGen Garments Ltd. (Dhaka)</p>
              <p>• <span className="font-semibold">Active Buyer:</span> H&M Demo Buyer (Sweden)</p>
              <p>• <span className="font-semibold">Export Carrier:</span> Maersk Line Vessel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}