import { useEffect, useMemo, useState } from 'react'
import { offerAPI, productAPI } from '../services/api'
import { Plus, Pencil, Trash2, X, ChevronDown, Check } from 'lucide-react'

const IMAGE_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

type ProductRef = {
  id: number
  name: string
  slug?: string
}

type Offer = {
  id?: string | number
  _id?: string | number
  name: string
  description?: string
  discount?: number
  discountType?: string
  bannerImage?: string
  startDate?: string
  endDate?: string
  status?: boolean | string
  createdAt?: string
  products?: ProductRef[]
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
  productIds: number[]
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
  productIds: [],
}

function getId(item: any) {
  return item?.id || item?._id
}

function toInputDate(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function OfferPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [availableProducts, setAvailableProducts] = useState<ProductRef[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Offer | null>(null)
  const [form, setForm] = useState<OfferForm>(initialForm)

  const [productSearch, setProductSearch] = useState('')
  const [productDropdownOpen, setProductDropdownOpen] = useState(false)

  const fetchOffers = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await offerAPI.getAll(page, 10, search)

      setOffers(res.data.data || [])
      setTotalPages(res.data.pagination?.pages || 1)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableProducts = async () => {
    try {
      const res = await productAPI.getAll(1, 1000)
      const list = res?.data?.data || res?.data?.products || res?.data || []
      setAvailableProducts(
        list.map((p: any) => ({
          id: Number(p.id || p._id),
          name: p.name,
          slug: p.slug,
        }))
      )
    } catch (err) {
      console.error('Failed to load products for offer selector', err)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [page, search])

  useEffect(() => {
    fetchAvailableProducts()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return offers.filter((item) =>
      [item.name, item.description, item.discountType].some((v) =>
        (v || '').toLowerCase().includes(q)
      )
    )
  }, [offers, search])

  const filteredAvailableProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim()
    if (!q) return availableProducts
    return availableProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.slug && p.slug.toLowerCase().includes(q))
    )
  }, [availableProducts, productSearch])

  const handleSelectAllProducts = () => {
    const filteredIds = filteredAvailableProducts.map((p) => p.id)
    setForm((prev) => ({
      ...prev,
      productIds: Array.from(new Set([...prev.productIds, ...filteredIds])),
    }))
  }

  const handleUnselectAllProducts = () => {
    setForm((prev) => ({
      ...prev,
      productIds: [],
    }))
  }

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setProductSearch('')
    setProductDropdownOpen(false)
    setShowModal(true)
  }

  const openEdit = (item: Offer) => {
    const selectedIds = (item.products || []).map((p: any) => Number(p.id))
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
      productIds: selectedIds,
    })
    setProductSearch('')
    setProductDropdownOpen(false)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(initialForm)
    setProductSearch('')
    setProductDropdownOpen(false)
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
      fd.append('productIds', JSON.stringify(form.productIds))

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
            className="w-64 rounded-xl border bg-white px-4 py-2 outline-none dark:bg-[#1e1e1e]"
            placeholder="Search offers..."
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
            Add Offer
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white dark:bg-[#1e1e1e]">
        {loading ? (
          <div className="p-6">Loading offers...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No offers found.</div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 dark:bg-[#252525]">
                  <tr className="text-left text-sm">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Banner</th>
                    <th className="px-4 py-3">Discount Type</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Products</th>
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
                            className="h-10 w-16 rounded-lg border object-cover"
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3">{item.discountType || '-'}</td>
                      <td className="px-4 py-3">{item.discount ?? 0}</td>
                      <td className="px-4 py-3 text-xs">
                        {item.products && item.products.length > 0 ? (
                          <div className="group relative inline-block cursor-help">
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {item.products.length > 3
                                ? `${item.products.slice(0, 3).map((p) => p.name).join(', ')} (+${item.products.length - 3} more)`
                                : item.products.map((p) => p.name).join(', ')}
                            </span>

                            {/* Hover Tooltip */}
                            <div className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-64 rounded-xl border bg-black/90 p-3 text-white shadow-xl group-hover:block">
                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#C9A45B]">
                                Assigned Products ({item.products.length})
                              </p>
                              <ul className="max-h-36 space-y-1 overflow-y-auto text-xs">
                                {item.products.map((p) => (
                                  <li key={p.id} className="truncate">
                                    • {p.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <span className="italic text-gray-400">All Products (Generic)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            item.status === false || item.status === 'inactive'
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
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1e1e1e]">
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
                  className="w-full rounded-xl border bg-white px-4 py-2 dark:bg-[#121212]"
                  value={form.name}
                  onChange={(e) => onChange('name', e.target.value)}
                  placeholder="Festival Sale"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  className="w-full rounded-xl border bg-white px-4 py-2 dark:bg-[#121212]"
                  rows={3}
                  value={form.description}
                  onChange={(e) => onChange('description', e.target.value)}
                  placeholder="Offer description"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Discount Type</label>
                <select
                  className="w-full rounded-xl border bg-white px-4 py-2 dark:bg-[#121212]"
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
                  className="w-full rounded-xl border bg-white px-4 py-2 dark:bg-[#121212]"
                  value={form.discount}
                  onChange={(e) => onChange('discount', e.target.value)}
                  placeholder="10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border bg-white px-4 py-2 dark:bg-[#121212]"
                  value={form.startDate}
                  onChange={(e) => onChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">End Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border bg-white px-4 py-2 dark:bg-[#121212]"
                  value={form.endDate}
                  onChange={(e) => onChange('endDate', e.target.value)}
                />
              </div>

              {/* Applicable Products Section */}
              <div className="md:col-span-2">
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium">Applicable Products</label>
                  <span className="rounded-full bg-[#C9A45B]/10 px-2.5 py-0.5 text-xs font-semibold text-[#C9A45B]">
                    {form.productIds.length} Selected
                  </span>
                </div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty to make this offer generic (applies to all offer products).
                </p>

                <div className="relative">
                  <div
                    onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                    className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-xl border bg-white px-4 py-2 dark:bg-[#121212]"
                  >
                    <div className="flex flex-wrap gap-1.5 overflow-hidden text-sm">
                      {form.productIds.length === 0 ? (
                        <span className="text-gray-400">All Products (Generic Offer)</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {form.productIds.slice(0, 4).map((id) => {
                            const prod = availableProducts.find((p) => p.id === id)
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              >
                                {prod?.name || `Product #${id}`}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setForm((prev) => ({
                                      ...prev,
                                      productIds: prev.productIds.filter((pId) => pId !== id),
                                    }))
                                  }}
                                  className="hover:text-red-500"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            )
                          })}
                          {form.productIds.length > 4 && (
                            <span className="inline-flex items-center rounded-lg bg-[#C9A45B]/20 px-2 py-0.5 text-xs font-semibold text-[#C9A45B]">
                              +{form.productIds.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${productDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {productDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1.5 rounded-2xl border bg-white p-3 shadow-xl dark:bg-[#1e1e1e]">
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full rounded-lg border px-3 py-1.5 text-xs outline-none bg-white dark:bg-[#121212]"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllProducts}
                            className="whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={handleUnselectAllProducts}
                            className="whitespace-nowrap rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                          >
                            Unselect All
                          </button>
                        </div>
                      </div>

                      <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredAvailableProducts.length === 0 ? (
                          <div className="p-3 text-center text-xs text-gray-500">
                            No products found
                          </div>
                        ) : (
                          filteredAvailableProducts.map((p) => {
                            const isChecked = form.productIds.includes(p.id)
                            return (
                              <label
                                key={p.id}
                                className="flex cursor-pointer items-center justify-between p-2 text-xs hover:bg-gray-50 dark:hover:bg-[#252525]"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setForm((prev) => ({
                                          ...prev,
                                          productIds: [...prev.productIds, p.id],
                                        }))
                                      } else {
                                        setForm((prev) => ({
                                          ...prev,
                                          productIds: prev.productIds.filter((id) => id !== p.id),
                                        }))
                                      }
                                    }}
                                    className="rounded border-gray-300 text-black focus:ring-black"
                                  />
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {p.name}
                                  </span>
                                </div>
                                {p.slug && (
                                  <span className="text-[10px] text-gray-400">({p.slug})</span>
                                )}
                              </label>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border bg-white px-4 py-2 dark:bg-[#121212]"
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
                    className="h-24 w-40 rounded-lg border object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 md:col-span-2">
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

              <div className="flex justify-end gap-3 pt-2 md:col-span-2">
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