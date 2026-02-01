import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct } from '../api/products'
import { listBids, placeBid } from '../api/bids'
import { uploadsUrl } from '../api/client'
import type { Bid, ProductResponse } from '../types/api'
import { formatCountdown, formatMoney, parseLocalDateTime } from '../utils/date'
import Toast from '../components/Toast'

function useNow(tickMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), tickMs)
    return () => window.clearInterval(t)
  }, [tickMs])
  return now
}

export default function ProductDetailsPage() {
  const { id } = useParams()
  const productId = Number(id)

  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [bids, setBids] = useState<Bid[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' | 'info' } | null>(null)

  const [bidderName, setBidderName] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const now = useNow(1000)

  const endMs = useMemo(() => {
    if (!product) return 0
    return parseLocalDateTime(product.endTime).getTime()
  }, [product])

  const remaining = endMs - now
  const biddingClosed = !product || remaining <= 0 || product.status === 'SOLD'

  const refresh = async () => {
    const p = await getProduct(productId)
    setProduct(p)
    const b = await listBids(productId)
    setBids(b)
  }

  useEffect(() => {
    if (!Number.isFinite(productId) || productId <= 0) {
      setError('Invalid product id')
      return
    }
    let alive = true
    ;(async () => {
      try {
        await refresh()
        if (!alive) return
        setError(null)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message ?? 'Failed to load product')
      }
    })()

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const img = uploadsUrl(product?.imageFilename)

  const onBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setToast({ msg: 'Enter a valid bid amount', kind: 'error' })
      return
    }

    setSubmitting(true)
    try {
      await placeBid(productId, {
        amount: parsed,
        bidderName: bidderName.trim() ? bidderName.trim() : undefined,
      })
      setAmount('')
      setToast({ msg: 'Bid placed!', kind: 'success' })
      await refresh()
    } catch (e: any) {
      setToast({ msg: e?.message ?? 'Failed to place bid', kind: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="panel">
        <div className="alert alert-error">{error}</div>
        <Link to="/" className="btn btnGhost">
          ← Back
        </Link>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="panel">
        <div className="skeleton" style={{ height: 260 }} />
      </div>
    )
  }

  return (
    <div className="details">
      <Toast
        message={toast?.msg ?? null}
        kind={toast?.kind ?? 'info'}
        onClose={() => setToast(null)}
      />

      <div className="detailsTop">
        <div className="imagePanel">
          {img ? <img className="heroImg" src={img} alt={product.name} /> : <div className="heroImgPlaceholder" />}
        </div>

        <div className="panel">
          <div className="detailsHeader">
            <h2 style={{ margin: 0 }}>{product.name}</h2>
            <div className={`pill ${product.status === 'SOLD' ? 'pillSold' : 'pillActive'}`}>{product.status}</div>
          </div>

          <p className="muted" style={{ marginTop: 6 }}>
            Seller: <b>{product.sellerName}</b>
          </p>

          <div className="kv">
            <div>
              <div className="muted">Starting price</div>
              <div className="kvVal">{formatMoney(product.startingPrice)}</div>
            </div>
            <div>
              <div className="muted">Current price</div>
              <div className="kvVal">{formatMoney(product.currentPrice)}</div>
            </div>
            <div>
              <div className="muted">Ends in</div>
              <div className="kvVal">{formatCountdown(remaining)}</div>
            </div>
          </div>

          <div className="divider" />

          <h3 style={{ margin: '0 0 8px 0' }}>Place a bid</h3>
          <form onSubmit={onBid} className="form">
            <div className="row">
              <label className="field">
                <span className="label">Bidder name (optional)</span>
                <input
                  value={bidderName}
                  onChange={(e) => setBidderName(e.target.value)}
                  placeholder="e.g. Rahul"
                  disabled={biddingClosed || submitting}
                />
              </label>
              <label className="field">
                <span className="label">Your bid amount</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  inputMode="decimal"
                  disabled={biddingClosed || submitting}
                />
              </label>
            </div>

            <div className="row rowEnd">
              {biddingClosed ? (
                <div className="muted">Bidding is closed for this product.</div>
              ) : (
                <div className="muted">Bid must be greater than current price.</div>
              )}
              <button className="btn btnPrimary" disabled={biddingClosed || submitting}>
                {submitting ? 'Placing…' : 'Place Bid'}
              </button>
            </div>
          </form>

          <div className="divider" />

          <h3 style={{ margin: '0 0 8px 0' }}>Description</h3>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{product.description}</p>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="detailsHeader">
          <h3 style={{ margin: 0 }}>Top bids</h3>
          <Link to="/" className="btn btnGhost">
            ← Back
          </Link>
        </div>

        {!bids ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : bids.length === 0 ? (
          <div className="muted">No bids yet.</div>
        ) : (
          <div className="bidList">
            {bids.slice(0, 10).map((b) => (
              <div key={b.id} className="bidRow">
                <div>
                  <div className="bidAmt">{formatMoney(b.amount)}</div>
                  <div className="muted">{b.bidderName || 'Anonymous'}</div>
                </div>
                <div className="muted">{b.createdAt?.replace('T', ' ')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
