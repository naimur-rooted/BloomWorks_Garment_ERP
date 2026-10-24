import { useEffect, useState } from 'react'
import api from '../services/api'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { Plus, UserCheck } from 'lucide-react'

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
    {
      key: 'username',
      label: 'Username',
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-100">{row.username}</span>,
    },
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'ERP Role',
      render: (row) => {
        const found = ROLES.find((r) => r.value === row.role)
        return <span className="font-medium text-slate-700 dark:text-slate-300">{found ? found.label : row.role}</span>
      },
    },
    {
      key: 'is_active',
      label: 'Account Status',
      render: (row) => (
        <span className={row.is_active ? 'badge-emerald' : 'badge-rose'}>
          {row.is_active ? 'Active' : 'Inactive'}
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
            className="btn-secondary text-xs py-1 px-2.5"
          >
            Edit
          </button>
          <button
            onClick={() => openResetModal(row)}
            className="px-2.5 py-1 text-xs rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition"
          >
            Reset Password
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            className="input w-full sm:w-64 text-xs"
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input text-xs w-auto"
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
            className="input text-xs w-auto"
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
          className="btn-primary text-xs"
        >
          <Plus size={15} />
          <span>Provision New Account</span>
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
              <input
                className="input"
                required
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                placeholder="e.g. Tariqul Islam"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username *</label>
              <input
                className="input"
                required
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                placeholder="e.g. tislam"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                className="input"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="e.g. tislam@bloomworks.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ERP Access Role *</label>
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
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Temporary Password *</label>
              <input
                type="password"
                className="input"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit User: ${selectedUser?.username}`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                className="input"
                required
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                className="input"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ERP Role</label>
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Active Status</label>
              <select
                className="input"
                value={editForm.is_active ? 'true' : 'false'}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
              >
                <option value="true">Active (Access Granted)</option>
                <option value="false">Suspended / Deactivated</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="btn-secondary"
            >
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
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Enter a temporary password for <strong>{selectedUser?.full_name}</strong> ({selectedUser?.email}). The user will be required to change this upon login.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Temporary Password</label>
            <input
              type="password"
              className="input"
              required
              placeholder="Minimum 6 characters"
              value={resetPasswordText}
              onChange={(e) => setResetPasswordText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsResetOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm Reset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
