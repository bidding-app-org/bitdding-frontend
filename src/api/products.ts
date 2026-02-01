import { apiFetch } from './client'
import type { ProductResponse } from '../types/api'

export function listProducts(): Promise<ProductResponse[]> {
  return apiFetch('/api/products')
}

export function getProduct(id: number): Promise<ProductResponse> {
  return apiFetch(`/api/products/${id}`)
}

export function listSellerProducts(sellerName: string): Promise<ProductResponse[]> {
  return apiFetch(`/api/sellers/${encodeURIComponent(sellerName)}/products`)
}

export async function createProduct(form: FormData): Promise<ProductResponse> {
  return apiFetch('/api/products', { method: 'POST', body: form })
}

export async function updateProduct(id: number, form: FormData): Promise<ProductResponse> {
  return apiFetch(`/api/products/${id}`, { method: 'PUT', body: form })
}

export async function deleteProduct(id: number, sellerName: string): Promise<void> {
  return apiFetch(`/api/products/${id}?sellerName=${encodeURIComponent(sellerName)}`, { method: 'DELETE' })
}
