import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { termsAPI } from '../services/api'

type TermsForm = {
  id?: number
  title: string
  slug: string
  content: string
  version: string
  isActive: boolean
}

export default function TermsPage() {
  const [form, setForm] = useState<TermsForm>({
    title: 'Terms & Conditions',
    slug: 'terms-and-conditions',
    content: '',
    version: '1.0',
    isActive: true,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchTerms = async () => {
    try {
      setLoading(true)
      const res = await termsAPI.get()
      const data = res?.data?.data

      if (data) {
        setForm({
          id: data.id,
          title: data.title || 'Terms & Conditions',
          slug: data.slug || 'terms-and-conditions',
          content: data.content || '',
          version: data.version || '1.0',
          isActive: !!data.isActive,
        })
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch terms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTerms()
  }, [])

  const handleChange = (key: keyof TermsForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const payload = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        version: form.version,
        isActive: form.isActive,
      }

      if (form.id) {
        await termsAPI.update(form.id, payload)
        toast.success('Terms updated successfully')
      } else {
        const res = await termsAPI.create(payload)
        const created = res?.data?.data
        if (created?.id) {
          setForm((prev) => ({ ...prev, id: created.id }))
        }
        toast.success('Terms created successfully')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save terms')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Terms & Conditions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage terms and conditions content shown on the website
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4AF37]"
            placeholder="Terms & Conditions"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="terms-and-conditions"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Version</label>
            <input
              value={form.version}
              onChange={(e) => handleChange('version', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="1.0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="terms-active"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
          />
          <label htmlFor="terms-active" className="text-sm font-medium">
            Active
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Content</label>
          <textarea
            rows={18}
            value={form.content}
            onChange={(e) => handleChange('content', e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4AF37]"
            placeholder="Enter terms and conditions content..."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="rounded-xl bg-[#D4AF37] px-5 py-2.5 text-white font-medium hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Terms'}
          </button>
        </div>
      </div>
    </div>
  )
}