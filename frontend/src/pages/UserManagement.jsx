import { useEffect, useState } from 'react'
import api from '../services/api'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'

const ROLES = [
  { value: 'Admin', label: 'System Administrator' },
  { value: 'Management', label: 'Management' },
  { value: 'Merchandiser', label: 'Merchandiser' },
  { value: 'Planner', label: 'Planner' },
  { value: 'Production Manager', label: 'Production Manager' },
  { value: 'Purchase Manager', label: 'Purchase Manager' },
  { value: 'Inventory Manager', label: 'Inventory Manager' },
  { value: 'Warehouse Manager', label: 'Warehouse Manager' },
  { value: 'Quality Inspector', label: 'Quality Inspector' },
]

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState(null)

  // Forms state
  const [createForm, setCreateForm] = useState({
    username: '',
    full_name: '',
    email: '',
    role: 'Merchandiser',
    password: '',
  })

  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    role: 'Merchandiser',
    is_active: true,
  })

  const [resetPasswordText, setResetPasswordText] = useState('')

  const loadUsers = () => {
    setLoading(true)
    let url = '/auth/users?'
    if (roleFilter) url += `role=${encodeURIComponent(roleFilter)}&`
    if (statusFilter !== '') url += `is_active=${statusFilter === 'active'}&`
    if (search) url += `search=${encodeURIComponent(search)}&`

    api
      .get(url)
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(loadUsers, [roleFilter, statusFilter, search])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/users', createForm)
      setIsCreateOpen(false)
      setCreateForm({ username: '', full_name: '', email: '', role: 'Merchandiser', password: '' })
      loadUsers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create user')
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      await api.put(`/auth/users/${selectedUser.id}`, editForm)
      setIsEditOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      await api.post(`/auth/users/${selectedUser.id}/reset-password`, {
        new_password: resetPasswordText,
      })
      alert(`Temporary password set for ${selectedUser.username}. The user must change password upon next login.`)
      setIsResetOpen(false)
      setResetPasswordText('')
      setSelectedUser(null)
      loadUsers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reset password')
    }
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    })
    setIsEditOpen(true)
  }

  const openResetModal = (user) => {
    setSelectedUser(user)
    setResetPasswordText('')
    setIsResetOpen(true)
  }

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'ERP Role',
      render: (row) => {
        const found = ROLES.find((r) => r.value === row.role)
        return <span className="font-medium text-gray-700">{found ? found.label : row.role}</span>
      },
    },
    {
      key: 'is_active',
      label: 'Account Status',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
        >
          {row.is_active ? 'Active' : 'Inactive / Deactivated'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="px-2.5 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Edit
          </button>
          <button
            onClick={() => openResetModal(row)}
            className="px-2.5 py-1 text-xs rounded bg-blue-50 hover:bg-blue-100 text-blue-600"
          >
            Reset Password
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            className="input w-full sm:w-64 text-sm"
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All ERP Roles</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            className="input text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary text-sm flex items-center gap-2"
        >
          + Provision New Account
        </button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search users..."
      />

      {/* Provision User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Provision Employee ERP Account"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
              <input
                className="input"
                placeholder="e.g. Sarah Ahmed"
                required
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Username *</label>
              <input
                className="input"
                placeholder="e.g. sarah.ahmed"
                required
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Corporate Email *</label>
              <input
                className="input"
                type="email"
                placeholder="e.g. sarah@factory.com"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">ERP Role *</label>
              <select
                className="input"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Temporary Initial Password *</label>
              <input
                className="input"
                type="password"
                placeholder="Initial password for employee"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Note: Passwords are securely hashed. The employee will be prompted to update credentials upon login.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Provision Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Account: ${selectedUser?.username}`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <input
                className="input"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input
                className="input"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">ERP Role</label>
              <select
                className="input"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Account Status</label>
              <select
                className="input"
                value={editForm.is_active ? 'true' : 'false'}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive / Deactivated</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title={`Reset Password for ${selectedUser?.username}`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              New Temporary Password *
            </label>
            <input
              className="input"
              type="password"
              placeholder="Enter new temporary password"
              required
              value={resetPasswordText}
              onChange={(e) => setResetPasswordText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsResetOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Set Temporary Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
