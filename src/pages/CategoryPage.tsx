import { useEffect, useMemo, useState } from 'react'
import { categoryAPI } from '../services/api'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
const IMAGE_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

type Category = {
  id?: string
  _id?: string
  name: string
  slug?: string
  image?: string
  status?: boolean | string
  createdAt?: string
}

type CategoryForm = {
  name: string
  slug: string
  status: boolean
  imageFile: File | null
  preview: string
}

const initialForm: CategoryForm = {
  name: '',
  slug: '',
  status: true,
  imageFile: null,
  preview: '',
}

function getId(item: any) {
  return item?.id || item?._id
}

function normalizeList(res: any): Category[] {
  return res?.data?.data || res?.data?.categories || res?.data || []
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<CategoryForm>(initialForm)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await categoryAPI.getAll(page, 10, search)

      setCategories(res.data.data || [])
      setTotalPages(res.data.pagination?.pages || 1)

    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [page, search])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return categories.filter((item) =>
      [item.name, item.slug].some((v) => (v || '').toLowerCase().includes(q))
    )
  }, [categories, search])

  const autoSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const openEdit = (item: Category) => {
    setEditing(item)
    setForm({
      name: item.name || '',
      slug: item.slug || '',
      status: item.status === 'inactive' ? false : Boolean(item.status ?? true),
      imageFile: null,
      preview: item.image || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(initialForm)
  }

  const onChange = (key: keyof CategoryForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageChange = (file?: File | null) => {
    if (!file) {
      setForm((prev) => ({ ...prev, imageFile: null }))
      return
    }

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      preview: URL.createObjectURL(file),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      setSaving(true)

      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('slug', form.slug.trim() || autoSlug(form.name))
      fd.append('status', form.status ? 'ACTIVE' : 'INACTIVE')

      if (form.imageFile) {
        fd.append('image', form.imageFile)
      }

      if (editing) {
        await categoryAPI.update(String(getId(editing)), fd)
      } else {
        await categoryAPI.create(fd)
      }

      closeModal()
      fetchCategories()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: Category) => {
    const id = getId(item)
    if (!id) return

    const ok = window.confirm(`Delete category "${item.name}"?`)
    if (!ok) return

    try {
      await categoryAPI.delete(String(id))
      fetchCategories()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete category')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Category Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, update and delete categories
          </p>
        </div>

        <div className="flex gap-2">
          <input
            className="rounded-xl border px-4 py-2 outline-none w-64 bg-white dark:bg-[#1e1e1e]"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-[#1e1e1e] overflow-hidden">
        {loading ? (
          <div className="p-6">Loading categories...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No categories found.</div>
        ) : (
          <>
          <div className="overflow-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 dark:bg-[#252525]">
                <tr className="text-left text-sm">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={getId(item)} className="border-t">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">{item.slug || '-'}</td>
                    <td className="px-4 py-3">
                      {item.image ? (
                        <img
                          src={`${IMAGE_BASE_URL}${item.image}`}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover border"
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${item.status === false || item.status === 'inactive'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {item.status === false || item.status === 'inactive'
                          ? 'Inactive'
                          : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : '-'}
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
    disabled={loading || page === 1}
    onClick={() => setPage(page - 1)}
    className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Previous
  </button>

  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
    <button
      key={num}
      onClick={() => setPage(num)}
      className={`rounded-lg border px-4 py-2 ${
        page === num
          ? "bg-black text-white"
          : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
      }`}
    >
      {num}
    </button>
  ))}

  <button
    disabled={loading || page === totalPages}
    onClick={() => setPage(page + 1)}
    className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Next
  </button>
</div>
</>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1e1e1e]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={closeModal} className="rounded-lg border p-2">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Category Name</label>
                <input
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.name}
                  onChange={(e) => {
                    const value = e.target.value
                    setForm((prev) => ({
                      ...prev,
                      name: value,
                      slug: prev.slug ? prev.slug : autoSlug(value),
                    }))
                  }}
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <input
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.slug}
                  onChange={(e) => onChange('slug', e.target.value)}
                  placeholder="category-slug"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                />
              </div>

              {form.preview && (
                <div>
                  <img
                    src={
                      form.preview.startsWith('blob:')
                        ? form.preview
                        : `${IMAGE_BASE_URL}${form.preview}`
                    }
                    alt="Preview"
                    className="h-24 w-24 rounded-lg object-cover border"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  id="category-status"
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) => onChange('status', e.target.checked)}
                />
                <label htmlFor="category-status" className="text-sm">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-5 py-2 text-white disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editing ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}