import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createProduct } from '../api/products'
import Toast from '../components/Toast'
import { toIsoLocalDateTime } from '../utils/date'

const LS_SELLER = 'bidpulse.sellerName'

export default function AddProductPage() {
  const navigate = useNavigate()

  const [sellerName, setSellerName] = useState(() => localStorage.getItem(LS_SELLER) ?? 'seller')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startingPrice, setStartingPrice] = useState('')
  const [endTime, setEndTime] = useState('')
  const [image, setImage] = useState<File | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' | 'info' } | null>(null)

  const previewUrl = useMemo(() => {
    if (!image) return null
    return URL.createObjectURL(image)
  }, [image])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sellerName.trim()) return setToast({ msg: 'Seller name is required', kind: 'error' })
    if (!name.trim()) return setToast({ msg: 'Product name is required', kind: 'error' })
    if (!description.trim()) return setToast({ msg: 'Description is required', kind: 'error' })
    if (!startingPrice || Number(startingPrice) <= 0) return setToast({ msg: 'Starting price must be > 0', kind: 'error' })
    if (!endTime) return setToast({ msg: 'End time is required', kind: 'error' })
    if (!image) return setToast({ msg: 'Image is required (JPG/PNG)', kind: 'error' })

    localStorage.setItem(LS_SELLER, sellerName.trim())

    const fd = new FormData()
    fd.append('sellerName', sellerName.trim())
    fd.append('name', name.trim())
    fd.append('description', description.trim())
    fd.append('startingPrice', startingPrice)
    fd.append('endTime', toIsoLocalDateTime(endTime))
    fd.append('image', image)

    setSubmitting(true)
    try {
      const created = await createProduct(fd)
      setToast({ msg: 'Product created!', kind: 'success' })
      navigate(`/products/${created.id}`)
    } catch (e: any) {
      setToast({ msg: e?.message ?? 'Create failed', kind: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="panel">
      <Toast message={toast?.msg ?? null} kind={toast?.kind ?? 'info'} onClose={() => setToast(null)} />

      <div className="detailsHeader">
        <h2 style={{ margin: 0 }}>Add Product</h2>
        <Link to="/seller" className="btn btnGhost">
          ← Dashboard
        </Link>
      </div>

      <form onSubmit={onSubmit} className="form" style={{ marginTop: 14 }}>
        <div className="row">
          <label className="field" style={{ flex: 1 }}>
            <span className="label">Seller name</span>
            <input value={sellerName} onChange={(e) => setSellerName(e.target.value)} />
          </label>
          <label className="field" style={{ flex: 1 }}>
            <span className="label">End date & time</span>
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
        </div>

        <div className="row">
          <label className="field" style={{ flex: 1 }}>
            <span className="label">Product name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Laptop" />
          </label>
          <label className="field" style={{ flex: 1 }}>
            <span className="label">Starting price</span>
            <input
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              inputMode="decimal"
              placeholder="e.g. 1000"
            />
          </label>
        </div>

        <label className="field">
          <span className="label">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
        </label>

        <div className="row">
          <label className="field" style={{ flex: 1 }}>
            <span className="label">Upload image (jpg/png)</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="imagePreview">
            {previewUrl ? <img src={previewUrl} alt="Preview" /> : <div className="thumbPlaceholder">Preview</div>}
          </div>
        </div>

        <div className="row rowEnd">
          <button className="btn btnPrimary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
