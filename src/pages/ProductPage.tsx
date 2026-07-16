import { useEffect, useMemo, useState } from 'react'
import { productAPI, categoryAPI } from '../services/api'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
const IMAGE_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

type ProductImage = {
  id?: number | string
  url: string
}

type Product = {
  id?: string | number
  _id?: string | number
  name: string
  slug?: string
  sku?: string
  brand?: string
  description?: string
  mrp?: number
  sellingPrice?: number
  stock?: number
  status?: boolean | string
  categoryId?: string | number
  category?: {
    id?: string | number
    name: string
  }
  images?: ProductImage[]
  createdAt?: string
}

type Category = {
  id?: string | number
  _id?: string | number
  name: string
}

type ProductForm = {
  name: string
  slug: string
  sku: string
  brand: string
  description: string
  mrp: string
  sellingPrice: string
  stock: string
  categoryId: string
  status: boolean
  isFeatured: boolean
  isNewArrival: boolean
  isOffer: boolean
  discount: string
}

const initialForm: ProductForm = {
  name: '',
  slug: '',
  sku: '',
  brand: '',
  description: '',
  mrp: '',
  sellingPrice: '',
  stock: '',
  categoryId: '',
  status: true,
  isFeatured: false,
  isNewArrival: false,
  isOffer: false,
  discount: '',
}

function getId(item: any) {
  return item?.id || item?._id
}

function normalizeProducts(res: any): Product[] {
  return res?.data?.data || res?.data?.products || res?.data || []
}

function normalizeCategories(res: any): Category[] {
  return res?.data?.data || res?.data?.categories || res?.data || []
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductForm>(initialForm)

  // new image upload states
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [previewImages, setPreviewImages] = useState<string[]>([])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await productAPI.getAll(page, 12, search)

      setProducts(normalizeProducts(res))

      setTotalPages(
        res?.data?.pagination?.pages || 1
      )

    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll()
      setCategories(normalizeCategories(res))
    } catch (err) {
      console.error('Failed to load categories')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page, search])

  useEffect(() => {
    fetchCategories()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return products.filter((item) =>
      [
        item.name,
        item.slug,
        item.brand,
        item.sku,
        item.category?.name,
      ].some((v) => (v || '').toLowerCase().includes(q))
    )
  }, [products, search])

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
    setSelectedImages([])
    setExistingImages([])
    setPreviewImages([])
    setShowModal(true)
  }

  const openEdit = (item: Product) => {
    setEditing(item)
    setForm({
      name: item.name || '',
      slug: item.slug || '',
      sku: item.sku || '',
      brand: item.brand || '',
      description: item.description || '',
      mrp: item.mrp != null ? String(item.mrp) : '',
      sellingPrice: item.sellingPrice != null ? String(item.sellingPrice) : '',
      stock: item.stock != null ? String(item.stock) : '',
      categoryId: item.categoryId ? String(item.categoryId) : '',
      status: item.status === 'inactive' ? false : Boolean(item.status ?? true),
      isFeatured: (item as any).isFeatured ?? false,
      isNewArrival: (item as any).isNewArrival ?? false,
      isOffer: (item as any).isOffer ?? false,
      discount: (item as any).discount != null ? String((item as any).discount) : '',
    })

    const oldImages = item.images?.map((img) => img.url) || []
    setExistingImages(oldImages)
    setSelectedImages([])
    setPreviewImages([])
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(initialForm)
    setSelectedImages([])
    setExistingImages([])
    setPreviewImages([])
  }

  const onChange = (key: keyof ProductForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages(files)

    const previews = files.map((file) => URL.createObjectURL(file))
    setPreviewImages(previews)
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('Product name is required')
      return
    }

    if (!form.categoryId) {
      alert('Category is required')
      return
    }

    try {
      setSaving(true)

      const payload = new FormData()
      payload.append('name', form.name.trim())
      payload.append('slug', form.slug.trim() || autoSlug(form.name))
      payload.append('sku', form.sku.trim())
      payload.append('brand', form.brand.trim())
      payload.append('description', form.description.trim())
      payload.append('mrp', form.mrp || '0')
      payload.append('sellingPrice', form.sellingPrice || '0')
      payload.append('stock', form.stock || '0')
      payload.append('categoryId', form.categoryId)
      payload.append('status', form.status ? 'ACTIVE' : 'INACTIVE')
      payload.append('isFeatured', String(form.isFeatured))
      payload.append('isNewArrival', String(form.isNewArrival))
      payload.append('isOffer', String(form.isOffer))
      payload.append('discount', form.discount || '0')

      // if you want to keep old images during update
      existingImages.forEach((img) => {
        payload.append('existingImages[]', img)
      })

      selectedImages.forEach((file) => {
        payload.append('images', file)
      })

      if (editing) {
        await productAPI.update(String(getId(editing)), payload)
      } else {
        await productAPI.create(payload)
      }

      closeModal()
      // Agar last page par new product add hua hai to page 1 par le jao
      setPage(1)
      await fetchProducts()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: Product) => {
    const id = getId(item)
    if (!id) return

    const ok = window.confirm(`Delete product "${item.name}"?`)
    if (!ok) return

    try {
      await productAPI.delete(String(id))

      // Agar current page par last record delete hua hai
      if (products.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        await fetchProducts()
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete product')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Product Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, update and delete products
          </p>
        </div>

        <div className="flex gap-2">
          <input
            className="rounded-xl border px-4 py-2 outline-none w-64 bg-white dark:bg-[#1e1e1e]"
            placeholder="Search products..."
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
            Add Product
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-[#1e1e1e] overflow-hidden">
        {loading ? (
          <div className="p-6">Loading products...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No products found.</div>
        ) : (
        <>
          <div className="overflow-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50 dark:bg-[#252525]">
                <tr className="text-left text-sm">
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">MRP</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={String(getId(item))} className="border-t">
                    <td className="px-4 py-3">
                      {item.images?.[0]?.url ? (
                        <img
                          src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${item.images[0].url}`}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover border"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">{item.sku || '-'}</td>
                    <td className="px-4 py-3">{item.brand || '-'}</td>
                    <td className="px-4 py-3">{item.category?.name || '-'}</td>
                    <td className="px-4 py-3">{item.mrp ?? 0}</td>
                    <td className="px-4 py-3">{item.sellingPrice ?? 0}</td>
                    <td className="px-4 py-3">{item.stock ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${item.status === false || item.status === 'inactive' || item.status === 'INACTIVE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {item.status === false || item.status === 'inactive' || item.status === 'INACTIVE'
                          ? 'Inactive'
                          : 'Active'}
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


      {
        showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
            <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1e1e1e]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editing ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={closeModal} className="rounded-lg border p-2">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Product Name</label>
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
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Slug</label>
                  <input
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                    value={form.slug}
                    onChange={(e) => onChange('slug', e.target.value)}
                    placeholder="product-slug"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">SKU</label>
                  <input
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                    value={form.sku}
                    onChange={(e) => onChange('sku', e.target.value)}
                    placeholder="SKU001"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Brand</label>
                  <input
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                    value={form.brand}
                    onChange={(e) => onChange('brand', e.target.value)}
                    placeholder="Brand name"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Category</label>
                  <select
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                    value={form.categoryId}
                    onChange={(e) => onChange('categoryId', e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={String(getId(cat))} value={String(getId(cat))}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Stock</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                    value={form.stock}
                    onChange={(e) => onChange('stock', e.target.value)}
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">MRP</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                    value={form.mrp}
                    onChange={(e) => onChange('mrp', e.target.value)}
                    placeholder="999"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Selling Price</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                    value={form.sellingPrice}
                    onChange={(e) => onChange('sellingPrice', e.target.value)}
                    placeholder="799"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                    value={form.description}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Discount</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                    value={form.discount}
                    onChange={(e) => onChange('discount', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Product Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-xl border px-4 py-2 bg-white dark:bg-[#121212]"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You can upload multiple images
                  </p>
                </div>

                {existingImages.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">Existing Images</label>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${img}`}
                            alt={`existing-${index}`}
                            className="h-20 w-20 rounded-lg object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewImages.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium">New Selected Images</label>
                    <div className="flex flex-wrap gap-3">
                      {previewImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`preview-${index}`}
                            className="h-20 w-20 rounded-lg object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(index)}
                            className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.status}
                      onChange={(e) => onChange('status', e.target.checked)}
                    />
                    Active
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => onChange('isFeatured', e.target.checked)}
                    />
                    Featured
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isNewArrival}
                      onChange={(e) => onChange('isNewArrival', e.target.checked)}
                    />
                    New Arrival
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isOffer}
                      onChange={(e) => onChange('isOffer', e.target.checked)}
                    />
                    Offer Product
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
                    {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  )
}