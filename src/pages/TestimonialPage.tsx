import { useEffect, useMemo, useState } from 'react'
import { testimonialAPI, getImageUrl } from '../services/api'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'

const IMAGE_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');


type Testimonial = {
  id?: number
  review: string
  rating: number
  isActive?: boolean
  createdAt?: string
}

type TestimonialForm = {
  review: string
  rating: number
  preview: string
  isActive: boolean
}

const initialForm: TestimonialForm = {
  review: '',
  rating: 5,
  preview: '',
  isActive: true,
}

function getId(item: any) {
  return item?.id
}

export default function TestimonialPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [form, setForm] = useState<TestimonialForm>(initialForm)

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      setError("")

      const res = await testimonialAPI.getAll(page, 10, search)

      setTestimonials(res.data.data || [])
      setTotalPages(res.data.pagination?.pages || 1)

    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load testimonials")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [page, search])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return testimonials.filter((item) =>
      [item.review].some((v) =>
        (v || '').toLowerCase().includes(q)
      )
    )
  }, [testimonials, search])

  const openCreate = () => {
    setEditing(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const openEdit = (item: Testimonial) => {
    setEditing(item)
    type TestimonialForm = {
      review: string
      rating: number
      imageFile: File | null
      preview: string
      isActive: boolean
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(initialForm)
  }

  const onChange = (key: keyof TestimonialForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.review.trim()) {
      alert('Review is required')
      return
    }

    try {
      setSaving(true)

      const fd = new FormData()
      fd.append('review', form.review.trim())
      fd.append('rating', String(form.rating))
      fd.append('isActive', String(form.isActive))

      if (editing) {
        await testimonialAPI.update(String(getId(editing)), fd)
      } else {
        await testimonialAPI.create(fd)
      }

      closeModal()
      fetchTestimonials()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save testimonial')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: Testimonial) => {
    const id = getId(item)
    if (!id) return

    const ok = window.confirm('Delete this testimonial?')
    if (!ok) return

    try {
      await testimonialAPI.delete(String(id))
      fetchTestimonials()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete testimonial')
    }
  }



  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Testimonial Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, update and delete customer testimonials
          </p>
        </div>

        <div className="flex gap-2">
          <input
            className="rounded-xl border px-4 py-2 outline-none w-64 bg-white dark:bg-[#1e1e1e]"
            placeholder="Search testimonials..."
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
            Add Testimonial
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-[#1e1e1e] overflow-hidden">
        {loading ? (
          <div className="p-6">Loading testimonials...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No testimonials found.</div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-[#252525]">
                  <tr className="text-left text-sm">
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Review</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={getId(item)} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {renderStars(item.rating)}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {item.review}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${item.isActive === false
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                            }`}
                        >
                          {item.isActive === false ? 'Inactive' : 'Active'}
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
                  className={`rounded-lg border px-4 py-2 ${page === num
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
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1e1e1e] max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={closeModal} className="rounded-lg border p-2">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="mb-1 block text-sm font-medium">Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onChange('rating', star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={star <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({form.rating} stars)</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Review *</label>
                <textarea
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212] min-h-[120px]"
                  value={form.review}
                  onChange={(e) => onChange('review', e.target.value)}
                  placeholder="Enter customer review..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="testimonial-status"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => onChange('isActive', e.target.checked)}
                />
                <label htmlFor="testimonial-status" className="text-sm">
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
                  {saving ? 'Saving...' : editing ? 'Update Testimonial' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
