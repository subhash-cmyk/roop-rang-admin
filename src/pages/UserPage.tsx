import { useEffect, useMemo, useState } from 'react'
import { userAPI } from '../services/api'
import { Pencil, Trash2, X } from 'lucide-react'

type User = {
  id?: string
  _id?: string
  name?: string
  fullName?: string
  email?: string
  phone?: string
  role?: string
  status?: boolean | string
  createdAt?: string
}

type UserForm = {
  name: string
  email: string
  phone: string
  role: string
  status: boolean
}

const initialForm: UserForm = {
  name: '',
  email: '',
  phone: '',
  role: 'user',
  status: true,
}

function getId(item: any) {
  return item?.id || item?._id
}

function normalizeList(res: any): User[] {
  return res?.data?.data || res?.data?.users || res?.data || []
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<UserForm>(initialForm)

const fetchUsers = async () => {
  try {
    setLoading(true);

    const res = await userAPI.getAll(page, 10, search);

    setUsers(res.data.data);
    setTotalPages(res.data.pagination.pages);
  } catch (err: any) {
    setError(err?.response?.data?.message || "Failed to load users");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter((item) =>
      [item.name, item.fullName, item.email, item.phone, item.role].some((v) =>
        (v || '').toLowerCase().includes(q)
      )
    )
  }, [users, search])

  const openEdit = (item: User) => {
    setEditing(item)
    setForm({
      name: item.name || item.fullName || '',
      email: item.email || '',
      phone: item.phone || '',
      role: item.role || 'user',
      status: item.status === 'inactive' ? false : Boolean(item.status ?? true),
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(initialForm)
  }

  const onChange = (key: keyof UserForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return

    if (!form.name.trim()) {
      alert('User name is required')
      return
    }

    try {
      setSaving(true)
      await userAPI.update(String(getId(editing)), {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        status: form.status,
      })
      closeModal()
      fetchUsers()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: User) => {
    const id = getId(item)
    if (!id) return

    const ok = window.confirm(`Delete user "${item.name || item.fullName || item.email}"?`)
    if (!ok) return

    try {
      await userAPI.delete(String(id))
      fetchUsers()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete user')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage registered users
          </p>
        </div>

        <input
          className="rounded-xl border px-4 py-2 outline-none w-full md:w-72 bg-white dark:bg-[#1e1e1e]"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="rounded-2xl border bg-white dark:bg-[#1e1e1e] overflow-hidden">
        {loading ? (
          <div className="p-6">Loading users...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No users found.</div>
        ) : (
          <>
          <div className="overflow-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 dark:bg-[#252525]">
                <tr className="text-left text-sm">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={getId(item)} className="border-t">
                    <td className="px-4 py-3 font-medium">
                      {item.name || item.fullName || '-'}
                    </td>
                    <td className="px-4 py-3">{item.email || '-'}</td>
                    <td className="px-4 py-3">{item.phone || '-'}</td>
                    <td className="px-4 py-3 capitalize">{item.role || 'user'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${item.status === false || item.status === 'inactive'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {item.status === false || item.status === 'inactive' ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-lg border p-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
<div className="flex items-center justify-center gap-2 border-t bg-white py-4 dark:bg-[#1e1e1e]">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="rounded-lg border px-4 py-2 disabled:opacity-50"
  >
    Previous
  </button>

  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
    <button
      key={num}
      onClick={() => setPage(num)}
      className={`rounded-lg border px-4 py-2 ${
        page === num
          ? 'bg-black text-white'
          : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
      }`}
    >
      {num}
    </button>
  ))}

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    className="rounded-lg border px-4 py-2 disabled:opacity-50"
  >
    Next
  </button>
</div>
</>
        )}
      </div>

      {showModal && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1e1e1e]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit User</h2>
              <button onClick={closeModal} className="rounded-lg border p-2">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  placeholder="Enter user name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.phone}
                  onChange={(e) => onChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.role}
                  onChange={(e) => onChange('role', e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="user-status"
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) => onChange('status', e.target.checked)}
                />
                <label htmlFor="user-status" className="text-sm">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="rounded-xl border px-4 py-2">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-5 py-2 text-white disabled:opacity-60"
                >
                  {saving ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}