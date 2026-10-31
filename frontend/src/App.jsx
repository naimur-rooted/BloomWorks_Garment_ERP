import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Buyers from './pages/Buyers'
import Suppliers from './pages/Suppliers'
import Styles from './pages/Styles'
import Materials from './pages/Materials'
import Colors from './pages/Colors'
import Sizes from './pages/Sizes'
import Orders from './pages/Orders'
import Boms from './pages/Boms'
import MaterialRequirements from './pages/MaterialRequirements'
import Inventory from './pages/Inventory'
import Requisitions from './pages/Requisitions'
import PurchaseOrders from './pages/PurchaseOrders'
import GoodsReceipts from './pages/GoodsReceipts'
import ProductionPlans from './pages/ProductionPlans'
import WorkOrders from './pages/WorkOrders'
import Cutting from './pages/Cutting'
import Sewing from './pages/Sewing'
import Finishing from './pages/Finishing'
import Quality from './pages/Quality'
import Packing from './pages/Packing'
import Shipments from './pages/Shipments'
import TNA from './pages/TNA'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'
import BundleTracking from './pages/BundleTracking'
import Payroll from './pages/Payroll'
import Deliveries from './pages/Deliveries'
import Commercial from './pages/Commercial'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'Admin') {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold text-red-600 mb-2">403 - Access Denied</h2>
        <p className="text-gray-600 text-sm">
          User Management is restricted to System Administrators only.
        </p>
      </div>
    )
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />
        <Route path="buyers" element={<Buyers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="styles" element={<Styles />} />
        <Route path="materials" element={<Materials />} />
        <Route path="colors" element={<Colors />} />
        <Route path="sizes" element={<Sizes />} />
        <Route path="orders" element={<Orders />} />
        <Route path="boms" element={<Boms />} />
        <Route path="material-requirements" element={<MaterialRequirements />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="requisitions" element={<Requisitions />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="goods-receipts" element={<GoodsReceipts />} />
        <Route path="production-plans" element={<ProductionPlans />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="cutting" element={<Cutting />} />
        <Route path="sewing" element={<Sewing />} />
        <Route path="finishing" element={<Finishing />} />
        <Route path="bundle-tracking" element={<BundleTracking />} />
        <Route path="quality" element={<Quality />} />
        <Route path="packing" element={<Packing />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="commercial" element={<Commercial />} />
        <Route path="tna" element={<TNA />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}

export default App
