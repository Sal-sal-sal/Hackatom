import { apiFetch } from "./client"
import type { ApiSupply, ApiSupplier, ApiSupplierMatch } from "./types"

export const fetchSupplies = (filters: {
  status?: string; priority?: string; complexity?: string
} = {}) => {
  const qs = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][],
  ).toString()
  return apiFetch<ApiSupply[]>(`/supplies${qs ? `?${qs}` : ""}`)
}

export const fetchSuppliers = () => apiFetch<ApiSupplier[]>("/supplies/suppliers")

export const findSupplier = (supplyId: number) =>
  apiFetch<ApiSupplierMatch[]>(`/supplies/${supplyId}/find-supplier`, { method: "POST" })

export const assignSupplier = (supplyId: number, supplierId: number) =>
  apiFetch<ApiSupply>(`/supplies/${supplyId}/assign-supplier/${supplierId}`, {
    method: "POST",
  })

export const createSupply = (data: {
  material_name: string; quantity: number; unit: string; priority: string
  complexity: string; deadline: string; nuclear_grade_required: boolean; note: string
}) => apiFetch<ApiSupply>("/supplies", { method: "POST", body: JSON.stringify(data) })
