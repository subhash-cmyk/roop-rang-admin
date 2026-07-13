import { useEffect, useMemo, useState } from 'react'
import { offerAPI } from '../services/api'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
const IMAGE_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

type Offer = {
  id?: string
  _id?: string
  name: string
  description?: string
  discount?: number
  discountType?: string
  bannerImage?: string
  startDate?: string
  endDate?: string
  status?: boolean | string
  createdAt?: string
}

type OfferForm = {
  name: string
  description: string
  discountType: string
  discount: string
  startDate: string
  endDate: string
  status: boolean
  bannerFile: File | null
  preview: string
}

const initialForm: OfferForm = {
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discount: '',
  startDate: '',
  endDate: '',
  status: true,
  bannerFile: null,
  preview: '',
}

function getId(item: any) {
  return item?.id || item?._id
}

function normalizeList(res: any) {
  return res?.data?.data || res?.data?.offers || res?.data || []
}

function toInputDate(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function OfferPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Offer | null>(null)
  const [form, setForm] = useState<OfferForm>(initialForm)

  const fetchOffers = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await offerAPI.getAll()
      setOffers(normalizeList(res))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return offers.filter((item) =>
      [item.name, item.description, item.discountType].some((v) =>
        (v || '').toLowerCase().includes(q)
      )
    )
  }, [offers, search])

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const openEdit = (item: Offer) => {
    setEditing(item)
    setForm({
      name: item.name || '',
      description: item.description || '',
      discountType: item.discountType || 'PERCENTAGE',
      discount: item.discount != null ? String(item.discount) : '',
      startDate: toInputDate(item.startDate),
      endDate: toInputDate(item.endDate),
      status: item.status === 'inactive' ? false : Boolean(item.status ?? true),
      bannerFile: null,
      preview: item.bannerImage || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(initialForm)
  }

  const onChange = (key: keyof OfferForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleBannerChange = (file?: File | null) => {
    if (!file) {
      setForm((prev) => ({ ...prev, bannerFile: null }))
      return
    }

    setForm((prev) => ({
      ...prev,
      bannerFile: file,
      preview: URL.createObjectURL(file),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('Offer name is required')
      return
    }

    if (!form.discount) {
      alert('Discount is required')
      return
    }

    try {
      setSaving(true)

      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('description', form.description.trim())
      fd.append('discountType', form.discountType)
      fd.append('discount', form.discount)
      fd.append('startDate', form.startDate)
      fd.append('endDate', form.endDate)
      fd.append('status', form.status ? 'ACTIVE' : 'INACTIVE')

      if (form.bannerFile) {
        fd.append('image', form.bannerFile)
      }

      if (editing) {
        await offerAPI.update(String(getId(editing)), fd)
      } else {
        await offerAPI.create(fd)
      }

      closeModal()
      fetchOffers()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save offer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: Offer) => {
    const id = getId(item)
    if (!id) return

    const ok = window.confirm(`Delete offer "${item.name}"?`)
    if (!ok) return

    try {
      await offerAPI.delete(String(id))
      fetchOffers()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete offer')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Offer Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, update and delete discount offers
          </p>
        </div>

        <div className="flex gap-2">
          <input
            className="rounded-xl border px-4 py-2 outline-none w-64 bg-white dark:bg-[#1e1e1e]"
            placeholder="Search offers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white"
          >
            <Plus size={16} />
            Add Offer
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-[#1e1e1e] overflow-hidden">
        {loading ? (
          <div className="p-6">Loading offers...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No offers found.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-[#252525]">
                <tr className="text-left text-sm">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Banner</th>
                  <th className="px-4 py-3">Discount Type</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={getId(item)} className="border-t">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">
                      {item.bannerImage ? (
                        <img
                          src={`${IMAGE_BASE_URL}${item.bannerImage}`}
                          alt={item.name}
                          className="h-10 w-16 rounded-lg object-cover border"
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3">{item.discountType || '-'}</td>
                    <td className="px-4 py-3">{item.discount ?? 0}</td>
                    <td className="px-4 py-3">
                      {item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}
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
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1e1e1e]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? 'Edit Offer' : 'Add Offer'}
              </h2>
              <button onClick={closeModal} className="rounded-lg border p-2">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Offer Name</label>
                <input
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  placeholder="Festival Sale"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  rows={3}
                  value={form.description}
                  onChange={(e) => onChange('description', e.target.value)}
                  placeholder="Offer description"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Discount Type</label>
                <select
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.discountType}
                  onChange={(e) => onChange('discountType', e.target.value)}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Discount</label>
                <input
                  type="number"
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.discount}
                  onChange={(e) => onChange('discount', e.target.value)}
                  placeholder="10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.startDate}
                  onChange={(e) => onChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">End Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={form.endDate}
                  onChange={(e) => onChange('endDate', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  onChange={(e) => handleBannerChange(e.target.files?.[0] || null)}
                />
              </div>

              {form.preview && (
                <div className="md:col-span-2">
                  <img
                    src={
                      form.preview.startsWith('blob:')
                        ? form.preview
                        : `${IMAGE_BASE_URL}${form.preview}`
                    }
                    alt="Banner Preview"
                    className="h-24 w-40 rounded-lg object-cover border"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="offer-status"
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) => onChange('status', e.target.checked)}
                />
                <label htmlFor="offer-status" className="text-sm">
                  Active
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
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
                  {saving ? 'Saving...' : editing ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}