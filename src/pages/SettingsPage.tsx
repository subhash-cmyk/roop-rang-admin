import { useEffect, useState } from 'react'
import { settingsAPI } from '../services/api'

type SettingsForm = {
  supportEmail: string
  supportPhone: string
  address: string
  currency: string
  taxRate: string
  facebook: string
  instagram: string
  twitter: string
  logo: string
}

const initialForm: SettingsForm = {
  supportEmail: '',
  supportPhone: '',
  address: '',
  currency: 'INR',
  taxRate: '',
  facebook: '',
  instagram: '',
  twitter: '',
  logo: '',
}

function mapSettingsToForm(data: any): SettingsForm {
  return {
    supportEmail: data?.supportEmail || '',
    supportPhone: data?.supportPhone || '',
    address: data?.address || '',
    currency: data?.currency || 'INR',
    taxRate:
      data?.taxRate != null ? String(data.taxRate) : '',
    facebook: data?.facebook || '',
    instagram: data?.instagram || '',
    twitter: data?.twitter || '',
    logo: data?.logo || '',
  }
}

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(initialForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await settingsAPI.get()
      const data = res?.data?.data || res?.data?.settings || res?.data || {}
      setForm(mapSettingsToForm(data))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const onChange = (key: keyof SettingsForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      await settingsAPI.update({
        supportEmail: form.supportEmail.trim(),
        supportPhone: form.supportPhone.trim(),
        address: form.address.trim(),
        currency: form.currency.trim(),
        taxRate: Number(form.taxRate || 0),
        facebook: form.facebook.trim(),
        instagram: form.instagram.trim(),
        twitter: form.twitter.trim(),
        logo: form.logo.trim(),
      })

      alert('Settings updated successfully')
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">Website Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update website configuration and support information
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 dark:bg-[#1e1e1e]">
        {loading ? (
          <div>Loading settings...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div>
              <label className="mb-1 block text-sm font-medium">Support Email</label>
              <input
                className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                value={form.supportEmail}
                onChange={(e) => onChange('supportEmail', e.target.value)}
                placeholder="support@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Support Phone</label>
              <input
                className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                value={form.supportPhone}
                onChange={(e) => onChange('supportPhone', e.target.value)}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Currency</label>
              <input
                className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                value={form.currency}
                onChange={(e) => onChange('currency', e.target.value)}
                placeholder="INR"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Address</label>
              <textarea
                rows={3}
                className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                value={form.address}
                onChange={(e) => onChange('address', e.target.value)}
                placeholder="Enter business address"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Tax Rate</label>
              <input
                type="number"
                className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                value={form.taxRate}
                onChange={(e) => onChange('taxRate', e.target.value)}
                placeholder="18"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Logo URL</label>
              <input
                className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                value={form.logo}
                onChange={(e) => onChange('logo', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Facebook</label>
              <input
                className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                value={form.facebook}
                onChange={(e) => onChange('facebook', e.target.value)}
                placeholder="Facebook URL"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Instagram</label>
              <input
                className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                value={form.instagram}
                onChange={(e) => onChange('instagram', e.target.value)}
                placeholder="Instagram URL"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Twitter / X</label>
              <input
                className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                value={form.twitter}
                onChange={(e) => onChange('twitter', e.target.value)}
                placeholder="Twitter / X URL"
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-black px-5 py-2 text-white disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}