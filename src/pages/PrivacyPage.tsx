import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { privacyAPI } from '../services/api'

type PrivacyForm = {
  id?: number
  title: string
  content: string
  version: string
  isActive: boolean
}

export default function PrivacyPage() {
  const [form, setForm] = useState<PrivacyForm>({
    title: 'Privacy Policy',
    content: '',
    version: '1.0',
    isActive: true,
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchPrivacy = async () => {
    try {
      setLoading(true)
      const res = await privacyAPI.get()
      const data = res?.data?.data

      if (data) {
        setForm({
          id: data.id,
          title: data.title || 'Privacy Policy',
          content: data.content || '',
          version: data.version || '1.0',
          isActive: !!data.isActive,
        })
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch privacy policy')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrivacy()
  }, [])

  const handleChange = (key: keyof PrivacyForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const payload = {
        title: form.title,
        content: form.content,
        version: form.version,
        isActive: form.isActive,
      }

      if (form.id) {
        await privacyAPI.update(form.id, payload)
        toast.success('Privacy policy updated successfully')
      } else {
        const res = await privacyAPI.create(payload)
        const created = res?.data?.data
        if (created?.id) {
          setForm((prev) => ({ ...prev, id: created.id }))
        }
        toast.success('Privacy policy created successfully')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save privacy policy')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage privacy policy content shown on the website
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4AF37]"
            placeholder="Privacy Policy"
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

        <div className="flex items-center gap-2">
          <input
            id="privacy-active"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => handleChange('isActive', e.target.checked)}
          />
          <label htmlFor="privacy-active" className="text-sm font-medium">
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
            placeholder="Enter privacy policy content..."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="rounded-xl bg-[#D4AF37] px-5 py-2.5 text-white font-medium hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Privacy Policy'}
          </button>
        </div>
      </div>
    </div>
  )
}