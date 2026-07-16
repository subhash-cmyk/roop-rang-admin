import { useEffect, useMemo, useState } from 'react'
import { inquiryAPI } from '../services/api'
import { Eye, Reply, Trash2, X } from 'lucide-react'

type Inquiry = {
  id?: string | number
  _id?: string | number
  name?: string
  email?: string
  mobile?: string
  product?: string
  message?: string
  status?: string | boolean
  createdAt?: string
  reply?: string
  replied?: boolean
}

type ReplyForm = {
  reply: string
}

function getId(item: any) {
  return item?.id || item?._id
}

function normalizeList(res: any): Inquiry[] {
  return res?.data?.data || res?.data?.inquiries || res?.data || []
}

export default function InquiryPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Inquiry | null>(null)
  const [showView, setShowView] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [replyForm, setReplyForm] = useState<ReplyForm>({ reply: '' })

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await inquiryAPI.getAll(page, limit)

      setInquiries(normalizeList(res))

      setTotalPages(
        res?.data?.pagination?.pages || 1
      )

     } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [page])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return inquiries.filter((item) =>
      [item.name, item.email, item.mobile, item.product, item.message].some((v) =>
        String(v || '').toLowerCase().includes(q)
      )
    )
  }, [inquiries, search])

  const openView = (item: Inquiry) => {
    setSelected(item)
    setShowView(true)
  }

  const openReply = (item: Inquiry) => {
    setSelected(item)
    setReplyForm({ reply: item.reply || '' })
    setShowReply(true)
  }

  const closeView = () => {
    setSelected(null)
    setShowView(false)
  }

  const closeReply = () => {
    setSelected(null)
    setReplyForm({ reply: '' })
    setShowReply(false)
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    if (!replyForm.reply.trim()) {
      alert('Reply message is required')
      return
    }

    try {
      setSaving(true)
      await inquiryAPI.reply(String(getId(selected)), {
        status: 'replied',
        replied: true,
        reply: replyForm.reply.trim(),
      })
      closeReply()
      fetchInquiries()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to send reply')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: Inquiry) => {
    const id = getId(item)
    if (!id) return

    const ok = window.confirm(`Delete inquiry from "${item.name || item.email || 'user'}"?`)
    if (!ok) return

    try {
      await inquiryAPI.delete(String(id))
      fetchInquiries()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete inquiry')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inquiry Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, reply and delete customer inquiries
          </p>
        </div>

        <input
          className="rounded-xl border px-4 py-2 outline-none w-full md:w-72 bg-white dark:bg-[#1e1e1e]"
          placeholder="Search inquiries..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="rounded-2xl border bg-white dark:bg-[#1e1e1e] overflow-hidden">
        {loading ? (
          <div className="p-6">Loading inquiries...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No inquiries found.</div>
        ) : (
          <>
          <div className="overflow-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-[#252525]">
                <tr className="text-left text-sm">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Product Interest</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={String(getId(item))} className="border-t">
                    <td className="px-4 py-3 font-medium">{item.name || '-'}</td>
                    <td className="px-4 py-3">{item.email || '-'}</td>
                    <td className="px-4 py-3">{item.mobile || '-'}</td>
                    <td className="px-4 py-3">{item.product || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-[260px] truncate">{item.message || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openView(item)}
                          className="rounded-lg border p-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openReply(item)}
                          className="rounded-lg border p-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
                          title="Reply"
                        >
                          <Reply size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                          title="Delete"
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
          {/* Pagination */}
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
              className={`rounded-lg border px-4 py-2 transition-all ${page === num
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

      {showView && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1e1e1e]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Inquiry Details</h2>
              <button onClick={closeView} className="rounded-lg border p-2">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{selected.name || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{selected.email || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium">{selected.mobile || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Product Interest</div>
                <div className="font-medium">{selected.product || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500">Message</div>
                <div className="mt-1 rounded-xl border p-4 whitespace-pre-wrap">
                  {selected.message || '-'}
                </div>
              </div>
              {selected.reply && (
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Reply</div>
                  <div className="mt-1 rounded-xl border p-4 whitespace-pre-wrap">
                    {selected.reply}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReply && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1e1e1e]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reply to Inquiry</h2>
              <button onClick={closeReply} className="rounded-lg border p-2">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReply} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Reply Message</label>
                <textarea
                  rows={6}
                  className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  value={replyForm.reply}
                  onChange={(e) => setReplyForm({ reply: e.target.value })}
                  placeholder="Write your reply here..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeReply} className="rounded-xl border px-4 py-2">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-5 py-2 text-white disabled:opacity-60"
                >
                  {saving ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}