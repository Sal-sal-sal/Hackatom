"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { AlertTriangle, Loader2, RefreshCw, RotateCcw, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

type NodeLink = {
  label: string
  href: string
}

type NodeMeta = {
  nodeId: string
  title?: string
  category?: string
  description?: string
  links?: NodeLink[]
  zoneId?: string
  zoneTitle?: string
}

type MappingDictionary = Record<string, NodeMeta>
type ViewStatus = "loading" | "ready" | "error"
type ModelFormat = "gltf" | "fbx" | "obj"
type ZoneStatus = "ok" | "warning" | "critical" | "blocked" | "unknown"

type ModelCandidate = {
  url: string
  format: ModelFormat
  name: string
  sizeBytes?: number
}

type LayerStat = {
  category: string
  count: number
}

type NormalizedBounds = {
  min: [number, number, number]
  max: [number, number, number]
}

type ZoneRule = {
  zoneId: string
  title: string
  color: string
  description?: string
  status: ZoneStatus
  progress?: number
  issues: string[]
  includes: string[]
  regex?: RegExp
  boundsNormalized?: NormalizedBounds
}

type ZoneInfo = {
  zoneId: string
  title: string
  color: string
  description?: string
  status: ZoneStatus
  progress?: number
  issues: string[]
  count: number
}

type ComputedZone = {
  zoneId: string
  title: string
  color: string
  description?: string
  status: ZoneStatus
  progress?: number
  issues: string[]
  meshes: THREE.Mesh[]
  box: THREE.Box3
}

type MeshSample = {
  mesh: THREE.Mesh
  box: THREE.Box3
  center: THREE.Vector3
}

type MaterialState = {
  color?: THREE.Color
  emissive?: THREE.Color
  emissiveIntensity?: number
}

type HitResult = {
  mesh: THREE.Mesh
  point: THREE.Vector3
}

type DefaultViewState = {
  position: THREE.Vector3
  target: THREE.Vector3
  minDistance: number
  maxDistance: number
}

const DEFAULT_MODEL_CANDIDATES: ModelCandidate[] = [
  { url: "/models/npp/npp-main.glb", format: "gltf", name: "npp-main.glb" },
  { url: "/models/npp/npp-main.fbx", format: "fbx", name: "npp-main.fbx" },
  { url: "/models/source/buildings_all.fbx", format: "fbx", name: "buildings_all.fbx" },
  { url: "/models/source/Nuclear%20Powerplant%20low-poly.fbx", format: "fbx", name: "Nuclear Powerplant low-poly.fbx" },
]

const ZONE_PALETTE = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#6366f1"]
const MODEL_API_URL = "/api/models"
const DEFAULT_MAPPING_URL = "/models/npp/npp-main.mapping.json"
const DEFAULT_ZONE_CONFIG_URL = "/models/npp/npp-main.zones.json"
const FALLBACK_TEXTURE_URL = "/models/npp/textures/buildings_scene_2.png"

function detectFormatFromUrl(url: string): ModelFormat {
  const lower = url.toLowerCase()
  if (lower.endsWith(".fbx")) {
    return "fbx"
  }
  if (lower.endsWith(".obj")) {
    return "obj"
  }
  return "gltf"
}

function modelNameFromUrl(url: string) {
  const part = url.split("/").at(-1) || url
  return decodeURIComponent(part)
}

function parseMapping(raw: unknown): MappingDictionary {
  if (!raw || typeof raw !== "object") {
    return {}
  }

  if (Array.isArray(raw)) {
    return raw.reduce<MappingDictionary>((acc, item) => {
      if (item && typeof item === "object" && "nodeId" in item && typeof item.nodeId === "string") {
        acc[item.nodeId] = item as NodeMeta
      }
      return acc
    }, {})
  }

  return raw as MappingDictionary
}

function parseZoneStatus(raw: unknown): ZoneStatus {
  if (typeof raw !== "string") {
    return "unknown"
  }
  const value = raw.toLowerCase()
  if (value === "ok" || value === "warning" || value === "critical" || value === "blocked" || value === "unknown") {
    return value
  }
  return "unknown"
}

function parseNormalizedBounds(raw: unknown): NormalizedBounds | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined
  }

  const minRaw = (raw as { min?: unknown }).min
  const maxRaw = (raw as { max?: unknown }).max

  if (!Array.isArray(minRaw) || !Array.isArray(maxRaw) || minRaw.length !== 3 || maxRaw.length !== 3) {
    return undefined
  }

  const minValues: number[] = []
  const maxValues: number[] = []

  for (let index = 0; index < 3; index += 1) {
    const minValue = typeof minRaw[index] === "number" ? minRaw[index] : Number(minRaw[index])
    const maxValue = typeof maxRaw[index] === "number" ? maxRaw[index] : Number(maxRaw[index])

    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      return undefined
    }

    minValues.push(THREE.MathUtils.clamp(minValue, 0, 1))
    maxValues.push(THREE.MathUtils.clamp(maxValue, 0, 1))
  }

  const min: [number, number, number] = [
    Math.min(minValues[0], maxValues[0]),
    Math.min(minValues[1], maxValues[1]),
    Math.min(minValues[2], maxValues[2]),
  ]
  const max: [number, number, number] = [
    Math.max(minValues[0], maxValues[0]),
    Math.max(minValues[1], maxValues[1]),
    Math.max(minValues[2], maxValues[2]),
  ]

  return { min, max }
}

function safeRegex(raw: string | undefined) {
  if (!raw) {
    return undefined
  }
  try {
    return new RegExp(raw, "i")
  } catch {
    return undefined
  }
}

function parseZoneRules(raw: unknown) {
  if (!Array.isArray(raw)) {
    return []
  }

  const rules: ZoneRule[] = []

  for (let index = 0; index < raw.length; index += 1) {
    const entry = raw[index]
    if (!entry || typeof entry !== "object") {
      continue
    }

    const zoneId =
      typeof (entry as { zoneId?: unknown }).zoneId === "string" && (entry as { zoneId: string }).zoneId.trim().length > 0
        ? (entry as { zoneId: string }).zoneId.trim()
        : `zone-${index + 1}`

    const title =
      typeof (entry as { title?: unknown }).title === "string" && (entry as { title: string }).title.trim().length > 0
        ? (entry as { title: string }).title.trim()
        : zoneId

    const colorRaw = (entry as { color?: unknown }).color
    const color =
      typeof colorRaw === "string" && /^#([0-9a-fA-F]{3,8})$/.test(colorRaw)
        ? colorRaw
        : ZONE_PALETTE[index % ZONE_PALETTE.length]

    const description =
      typeof (entry as { description?: unknown }).description === "string"
        ? (entry as { description: string }).description
        : undefined

    const status = parseZoneStatus((entry as { status?: unknown }).status)
    const progressRaw = (entry as { progress?: unknown }).progress
    const progress =
      typeof progressRaw === "number" && Number.isFinite(progressRaw)
        ? THREE.MathUtils.clamp(progressRaw, 0, 100)
        : undefined

    const issuesRaw = (entry as { issues?: unknown }).issues
    const issues = Array.isArray(issuesRaw)
      ? issuesRaw.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : []

    const boundsNormalized = parseNormalizedBounds((entry as { boundsNormalized?: unknown }).boundsNormalized)
    const match = (entry as { match?: unknown }).match
    const includes: string[] = []
    let regex: RegExp | undefined

    if (Array.isArray(match)) {
      for (const token of match) {
        if (typeof token === "string" && token.trim().length > 0) {
          includes.push(token.trim().toLowerCase())
        }
      }
    } else if (match && typeof match === "object") {
      const includeList = (match as { includes?: unknown }).includes
      if (Array.isArray(includeList)) {
        for (const token of includeList) {
          if (typeof token === "string" && token.trim().length > 0) {
            includes.push(token.trim().toLowerCase())
          }
        }
      }
      regex = safeRegex((match as { regex?: string }).regex)
    }

    if (!boundsNormalized && includes.length === 0 && !regex) {
      continue
    }

    rules.push({
      zoneId,
      title,
      color,
      description,
      status,
      progress,
      issues,
      includes,
      regex,
      boundsNormalized,
    })
  }

  return rules
}

function buildSidecarUrl(modelUrl: string, suffix: string) {
  const index = modelUrl.lastIndexOf(".")
  if (index === -1) {
    return `${modelUrl}${suffix}`
  }
  return `${modelUrl.slice(0, index)}${suffix}`
}

async function fetchFirstJson(urls: string[]) {
  for (const url of urls) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return await response.json()
      }
    } catch {
      continue
    }
  }
  return null
}

function loadFbx(loader: FBXLoader, url: string) {
  return new Promise<THREE.Group>((resolve, reject) => {
    loader.load(url, (group) => resolve(group), undefined, reject)
  })
}

function loadGltf(loader: GLTFLoader, url: string) {
  return new Promise<THREE.Object3D>((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject)
  })
}

function loadObj(loader: OBJLoader, url: string) {
  return new Promise<THREE.Object3D>((resolve, reject) => {
    loader.load(url, (group) => resolve(group), undefined, reject)
  })
}

function loadTexture(loader: THREE.TextureLoader, url: string) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(url, (texture) => resolve(texture), undefined, reject)
  })
}

function getMaterials(mesh: THREE.Mesh) {
  const raw = mesh.material
  return Array.isArray(raw) ? raw : [raw]
}

function snapshotMaterial(material: THREE.Material, states: WeakMap<THREE.Material, MaterialState>) {
  if (states.has(material)) {
    return
  }

  const state: MaterialState = {}
  if ("color" in material && (material as { color?: THREE.Color }).color instanceof THREE.Color) {
    state.color = (material as { color: THREE.Color }).color.clone()
  }
  if ("emissive" in material && (material as { emissive?: THREE.Color }).emissive instanceof THREE.Color) {
    state.emissive = (material as { emissive: THREE.Color }).emissive.clone()
  }
  if ("emissiveIntensity" in material && typeof (material as { emissiveIntensity?: number }).emissiveIntensity === "number") {
    state.emissiveIntensity = (material as { emissiveIntensity: number }).emissiveIntensity
  }

  states.set(material, state)
}

function setMeshVisualState(
  mesh: THREE.Mesh,
  mode: "normal" | "hover" | "selected",
  states: WeakMap<THREE.Material, MaterialState>
) {
  for (const material of getMaterials(mesh)) {
    snapshotMaterial(material, states)
    const base = states.get(material)

    if (!base) {
      continue
    }

    if ("emissive" in material && (material as { emissive?: THREE.Color }).emissive instanceof THREE.Color) {
      const emissive = (material as { emissive: THREE.Color }).emissive
      const intensity = material as { emissiveIntensity?: number }

      if (mode === "normal") {
        if (base.emissive) {
          emissive.copy(base.emissive)
        }
        if (typeof base.emissiveIntensity === "number" && typeof intensity.emissiveIntensity === "number") {
          intensity.emissiveIntensity = base.emissiveIntensity
        }
      }

      if (mode === "hover") {
        emissive.set("#3b82f6")
        if (typeof intensity.emissiveIntensity === "number") {
          intensity.emissiveIntensity = 0.6
        }
      }

      if (mode === "selected") {
        emissive.set("#22c55e")
        if (typeof intensity.emissiveIntensity === "number") {
          intensity.emissiveIntensity = 1
        }
      }
      continue
    }

    if ("color" in material && (material as { color?: THREE.Color }).color instanceof THREE.Color) {
      const color = (material as { color: THREE.Color }).color
      if (mode === "normal" && base.color) {
        color.copy(base.color)
      }
      if (mode === "hover") {
        color.lerp(new THREE.Color("#60a5fa"), 0.25)
      }
      if (mode === "selected") {
        color.lerp(new THREE.Color("#4ade80"), 0.35)
      }
    }
  }
}

function resolveNodeMeta(mesh: THREE.Mesh, mapping: MappingDictionary): NodeMeta {
  const candidates = [mesh.name, mesh.parent?.name, mesh.uuid].filter(Boolean) as string[]

  for (const key of candidates) {
    const direct = mapping[key]
    if (direct) {
      return direct
    }

    const lowered = mapping[key.toLowerCase()]
    if (lowered) {
      return lowered
    }
  }

  const fallbackId = candidates[0] || `mesh-${mesh.id}`
  return {
    nodeId: fallbackId,
    title: fallbackId,
    category: "unmapped",
    description: "No mapping metadata found for this mesh.",
  }
}

function getMeshNameCandidates(mesh: THREE.Mesh) {
  return [mesh.name, mesh.parent?.name]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .map((value) => value.toLowerCase())
}

function collectMeshSamples(root: THREE.Object3D) {
  root.updateMatrixWorld(true)
  const samples: MeshSample[] = []

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return
    }

    const geometry = object.geometry
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox()
    }

    if (!geometry.boundingBox) {
      return
    }

    const box = geometry.boundingBox.clone().applyMatrix4(object.matrixWorld)
    if (box.isEmpty()) {
      return
    }

    const center = box.getCenter(new THREE.Vector3())
    if (!Number.isFinite(center.x) || !Number.isFinite(center.y) || !Number.isFinite(center.z)) {
      return
    }

    samples.push({
      mesh: object,
      box,
      center,
    })
  })

  return samples
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

function computeRobustBounds(samples: MeshSample[]) {
  const fullBounds = new THREE.Box3()
  for (const sample of samples) {
    fullBounds.union(sample.box)
  }

  if (samples.length <= 6) {
    return fullBounds
  }

  const medianCenter = new THREE.Vector3(
    median(samples.map((sample) => sample.center.x)),
    median(samples.map((sample) => sample.center.y)),
    median(samples.map((sample) => sample.center.z))
  )

  const distances = samples
    .map((sample) => sample.center.distanceTo(medianCenter))
    .sort((a, b) => a - b)
  const thresholdIndex = Math.max(0, Math.floor((distances.length - 1) * 0.85))
  const threshold = distances[thresholdIndex]

  const robustBounds = new THREE.Box3()
  let includedCount = 0

  for (const sample of samples) {
    if (sample.center.distanceTo(medianCenter) <= threshold) {
      robustBounds.union(sample.box)
      includedCount += 1
    }
  }

  return includedCount > 0 ? robustBounds : fullBounds
}

function denormalizeBounds(modelBounds: THREE.Box3, normalized: NormalizedBounds) {
  const size = modelBounds.getSize(new THREE.Vector3())

  const min = new THREE.Vector3(
    modelBounds.min.x + size.x * normalized.min[0],
    modelBounds.min.y + size.y * normalized.min[1],
    modelBounds.min.z + size.z * normalized.min[2]
  )

  const max = new THREE.Vector3(
    modelBounds.min.x + size.x * normalized.max[0],
    modelBounds.min.y + size.y * normalized.max[1],
    modelBounds.min.z + size.z * normalized.max[2]
  )

  return new THREE.Box3(min, max)
}

function createConfiguredZones(samples: MeshSample[], rules: ZoneRule[], modelBounds: THREE.Box3) {
  if (rules.length === 0) {
    return []
  }

  const zones: ComputedZone[] = []
  const assignedMeshes = new Set<string>()

  for (const rule of rules) {
    let matched: MeshSample[] = []
    let box: THREE.Box3 | null = null

    if (rule.boundsNormalized) {
      box = denormalizeBounds(modelBounds, rule.boundsNormalized)
      matched = samples.filter((sample) => box?.containsPoint(sample.center))
    } else {
      matched = samples.filter((sample) => {
        const names = getMeshNameCandidates(sample.mesh)
        const matchesIncludes = rule.includes.some((token) => names.some((name) => name.includes(token)))
        const matchesRegex = rule.regex ? names.some((name) => rule.regex?.test(name)) : false
        return matchesIncludes || matchesRegex
      })
      if (matched.length > 0) {
        box = new THREE.Box3()
        for (const sample of matched) {
          box.union(sample.box)
        }
      }
    }

    if (!box) {
      continue
    }

    const meshes = matched.map((sample) => sample.mesh)
    for (const mesh of meshes) {
      assignedMeshes.add(mesh.uuid)
    }

    zones.push({
      zoneId: rule.zoneId,
      title: rule.title,
      color: rule.color,
      description: rule.description,
      status: rule.status,
      progress: rule.progress,
      issues: rule.issues,
      meshes,
      box,
    })
  }

  const unmatchedSamples = samples.filter((sample) => !assignedMeshes.has(sample.mesh.uuid))
  if (unmatchedSamples.length > 0) {
    const unmatchedBox = new THREE.Box3()
    for (const sample of unmatchedSamples) {
      unmatchedBox.union(sample.box)
    }

    zones.push({
      zoneId: "unassigned",
      title: "Unassigned",
      color: "#64748b",
      description: "Meshes that are not mapped to configured zones.",
      status: "unknown",
      issues: [],
      meshes: unmatchedSamples.map((sample) => sample.mesh),
      box: unmatchedBox,
    })
  }

  return zones
}

function createSpatialZones(samples: MeshSample[], bounds: THREE.Box3) {
  const size = bounds.getSize(new THREE.Vector3())
  const min = bounds.min
  const safeSizeX = Math.max(size.x, 1e-6)
  const safeSizeZ = Math.max(size.z, 1e-6)
  const columns = 3
  const rows = 2

  const bucketMap = new Map<string, { index: number; meshes: THREE.Mesh[]; box: THREE.Box3 }>()

  for (const sample of samples) {
    const nx = THREE.MathUtils.clamp((sample.center.x - min.x) / safeSizeX, 0, 0.999999)
    const nz = THREE.MathUtils.clamp((sample.center.z - min.z) / safeSizeZ, 0, 0.999999)
    const col = Math.floor(nx * columns)
    const row = Math.floor(nz * rows)
    const index = row * columns + col
    const zoneId = `section-${row + 1}-${col + 1}`

    const existing = bucketMap.get(zoneId)
    if (existing) {
      existing.meshes.push(sample.mesh)
      existing.box.union(sample.box)
      continue
    }

    bucketMap.set(zoneId, {
      index,
      meshes: [sample.mesh],
      box: sample.box.clone(),
    })
  }

  return Array.from(bucketMap.entries())
    .sort((a, b) => a[1].index - b[1].index)
    .map(([zoneId, bucket], zoneIndex) => ({
      zoneId,
      title: `Section ${zoneId.replace("section-", "").replace("-", ".")}`,
      color: ZONE_PALETTE[zoneIndex % ZONE_PALETTE.length],
      description: "Auto-generated by spatial position.",
      status: "unknown" as ZoneStatus,
      progress: undefined,
      issues: [] as string[],
      meshes: bucket.meshes,
      box: bucket.box,
    }))
}

function getZoneStatusLabel(status: ZoneStatus) {
  if (status === "ok") {
    return "OK"
  }
  if (status === "warning") {
    return "Warning"
  }
  if (status === "critical") {
    return "Critical"
  }
  if (status === "blocked") {
    return "Blocked"
  }
  return "Unknown"
}

function getZoneStatusVariant(status: ZoneStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ok") {
    return "default"
  }
  if (status === "warning") {
    return "secondary"
  }
  if (status === "critical" || status === "blocked") {
    return "destructive"
  }
  return "outline"
}

function formatSize(value: number | undefined) {
  if (!value || value <= 0) {
    return ""
  }
  if (value < 1024) {
    return `${value} B`
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function NppModelViewer() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const categoryMeshesRef = useRef<Map<string, THREE.Mesh[]>>(new Map())
  const zoneHelpersRef = useRef<Map<string, THREE.Box3Helper>>(new Map())
  const zoneHelperZoneRef = useRef<Map<string, string>>(new Map())
  const zoneMetaRef = useRef<Map<string, ComputedZone>>(new Map())
  const zoneInfoRef = useRef<Map<string, ZoneInfo>>(new Map())
  const meshZoneRef = useRef<Map<string, string>>(new Map())
  const zoneVisibilityRef = useRef<Record<string, boolean>>({})
  const selectedZoneIdRef = useRef<string | null>(null)
  const canMeshHighlightRef = useRef(false)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const defaultViewRef = useRef<DefaultViewState | null>(null)

  const [status, setStatus] = useState<ViewStatus>("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const [isCatalogLoading, setIsCatalogLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [modelCatalog, setModelCatalog] = useState<ModelCandidate[]>([])
  const [selectedModelPath, setSelectedModelPath] = useState("")
  const [activeModelPath, setActiveModelPath] = useState("")
  const [activeModelFormat, setActiveModelFormat] = useState<ModelFormat | null>(null)
  const [selectedNode, setSelectedNode] = useState<NodeMeta | null>(null)
  const [selectedZone, setSelectedZone] = useState<ZoneInfo | null>(null)
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({})
  const [layerStats, setLayerStats] = useState<LayerStat[]>([])
  const [zoneVisibility, setZoneVisibility] = useState<Record<string, boolean>>({})
  const [zoneStats, setZoneStats] = useState<ZoneInfo[]>([])
  const [reloadKey, setReloadKey] = useState(0)

  const selectedModel = useMemo(
    () => modelCatalog.find((item) => item.url === selectedModelPath) ?? null,
    [modelCatalog, selectedModelPath]
  )

  const applyLayerVisibility = useCallback((nextVisibility: Record<string, boolean>) => {
    for (const [category, meshes] of categoryMeshesRef.current.entries()) {
      const visible = nextVisibility[category] ?? true
      for (const mesh of meshes) {
        mesh.visible = visible
      }
    }
  }, [])

  const applyZoneSelection = useCallback((zoneId: string | null) => {
    selectedZoneIdRef.current = zoneId
    for (const [id, helper] of zoneHelpersRef.current.entries()) {
      const zoneMeta = zoneMetaRef.current.get(id)
      const material = helper.material as THREE.LineBasicMaterial
      const visible = zoneVisibilityRef.current[id] ?? true

      helper.visible = visible
      material.transparent = true
      material.color.set(zoneId === id ? "#ffffff" : zoneMeta?.color || "#94a3b8")
      material.opacity = zoneId && zoneId !== id ? 0.25 : 0.85
    }
  }, [])

  const selectZoneById = useCallback(
    (zoneId: string | null) => {
      applyZoneSelection(zoneId)
      setSelectedZone(zoneId ? zoneInfoRef.current.get(zoneId) ?? null : null)
    },
    [applyZoneSelection]
  )

  const applyZoneVisibility = useCallback(
    (nextVisibility: Record<string, boolean>) => {
      zoneVisibilityRef.current = nextVisibility
      for (const [zoneId, helper] of zoneHelpersRef.current.entries()) {
        helper.visible = nextVisibility[zoneId] ?? true
      }
      applyZoneSelection(selectedZoneIdRef.current)
    },
    [applyZoneSelection]
  )

  const updateLayerVisibility = useCallback(
    (category: string, visible: boolean) => {
      setLayerVisibility((prev) => {
        const next = { ...prev, [category]: visible }
        applyLayerVisibility(next)
        return next
      })
    },
    [applyLayerVisibility]
  )

  const setAllLayerVisibility = useCallback(
    (visible: boolean) => {
      setLayerVisibility((prev) => {
        const categories = Object.keys(prev).length > 0 ? Object.keys(prev) : Array.from(categoryMeshesRef.current.keys())
        const next = categories.reduce<Record<string, boolean>>((acc, category) => {
          acc[category] = visible
          return acc
        }, {})
        applyLayerVisibility(next)
        return next
      })
    },
    [applyLayerVisibility]
  )

  const updateZoneVisibility = useCallback(
    (zoneId: string, visible: boolean) => {
      setZoneVisibility((prev) => {
        const next = { ...prev, [zoneId]: visible }
        applyZoneVisibility(next)
        return next
      })

      if (!visible && selectedZoneIdRef.current === zoneId) {
        selectZoneById(null)
      }
    },
    [applyZoneVisibility, selectZoneById]
  )

  const setAllZoneVisibility = useCallback(
    (visible: boolean) => {
      setZoneVisibility((prev) => {
        const zoneIds = Object.keys(prev).length > 0 ? Object.keys(prev) : Array.from(zoneHelpersRef.current.keys())
        const next = zoneIds.reduce<Record<string, boolean>>((acc, zoneId) => {
          acc[zoneId] = visible
          return acc
        }, {})
        applyZoneVisibility(next)
        return next
      })

      if (!visible) {
        selectZoneById(null)
      }
    },
    [applyZoneVisibility, selectZoneById]
  )

  const handleResetView = useCallback(() => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    const defaults = defaultViewRef.current

    if (!camera || !controls || !defaults) {
      return
    }

    camera.position.copy(defaults.position)
    controls.target.copy(defaults.target)
    controls.minDistance = defaults.minDistance
    controls.maxDistance = defaults.maxDistance
    controls.update()
  }, [])

  const refreshCatalog = useCallback(async (preferredUrl?: string) => {
    setIsCatalogLoading(true)
    setUploadMessage("")

    try {
      const response = await fetch(MODEL_API_URL, { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to load model catalog")
      }

      const payload = (await response.json()) as {
        models?: Array<{
          url?: unknown
          name?: unknown
          format?: unknown
          sizeBytes?: unknown
        }>
      }

      const parsedModels: ModelCandidate[] = []
      if (Array.isArray(payload.models)) {
        for (const raw of payload.models) {
          if (!raw || typeof raw !== "object") {
            continue
          }
          if (typeof raw.url !== "string" || raw.url.trim().length === 0) {
            continue
          }

          const url = raw.url.trim()
          const formatRaw = typeof raw.format === "string" ? raw.format.toLowerCase() : ""
          const format: ModelFormat =
            formatRaw === "fbx" || formatRaw === "obj" || formatRaw === "gltf" ? formatRaw : detectFormatFromUrl(url)

          parsedModels.push({
            url,
            format,
            name: typeof raw.name === "string" && raw.name.trim().length > 0 ? raw.name : modelNameFromUrl(url),
            sizeBytes: typeof raw.sizeBytes === "number" ? raw.sizeBytes : undefined,
          })
        }
      }

      const uniqueMap = new Map<string, ModelCandidate>()
      for (const model of parsedModels) {
        uniqueMap.set(model.url, model)
      }
      const nextCatalog = Array.from(uniqueMap.values()).sort((a, b) => a.url.localeCompare(b.url))

      if (nextCatalog.length === 0) {
        const fallback = [...DEFAULT_MODEL_CANDIDATES].sort((a, b) => a.url.localeCompare(b.url))
        setModelCatalog(fallback)
        setSelectedModelPath((prev) => {
          if (preferredUrl && fallback.some((item) => item.url === preferredUrl)) {
            return preferredUrl
          }
          if (prev && fallback.some((item) => item.url === prev)) {
            return prev
          }
          return fallback[0]?.url || ""
        })
      } else {
        setModelCatalog(nextCatalog)
        setSelectedModelPath((prev) => {
          if (preferredUrl && nextCatalog.some((item) => item.url === preferredUrl)) {
            return preferredUrl
          }
          if (prev && nextCatalog.some((item) => item.url === prev)) {
            return prev
          }
          return nextCatalog[0]?.url || ""
        })
      }
    } catch {
      setModelCatalog([...DEFAULT_MODEL_CANDIDATES].sort((a, b) => a.url.localeCompare(b.url)))
      setSelectedModelPath((prev) => prev || DEFAULT_MODEL_CANDIDATES[0]?.url || "")
    } finally {
      setIsCatalogLoading(false)
    }
  }, [])

  const handleUploadFiles = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || files.length === 0) {
        return
      }

      setIsUploading(true)
      setUploadMessage("")

      let preferredModelUrl: string | undefined
      let uploadedCount = 0

      try {
        for (const file of Array.from(files)) {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch(MODEL_API_URL, {
            method: "POST",
            body: formData,
          })

          const payload = (await response.json()) as {
            error?: string
            uploaded?: { type?: string; url?: string; name?: string }
            model?: { url?: string }
          }

          if (!response.ok) {
            throw new Error(payload.error || `Upload failed for ${file.name}`)
          }

          uploadedCount += 1
          if (payload.model?.url && !preferredModelUrl) {
            preferredModelUrl = payload.model.url
          }
        }

        await refreshCatalog(preferredModelUrl)
        setReloadKey((value) => value + 1)
        setUploadMessage(uploadedCount > 1 ? `${uploadedCount} files uploaded.` : `${uploadedCount} file uploaded.`)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload files."
        setUploadMessage(message)
      } finally {
        setIsUploading(false)
        event.target.value = ""
      }
    },
    [refreshCatalog]
  )

  useEffect(() => {
    refreshCatalog()
  }, [refreshCatalog])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) {
      return
    }

    if (!selectedModel) {
      if (!isCatalogLoading) {
        setStatus("error")
        setErrorMessage("No 3D models found. Upload model files to start.")
      }
      return
    }

    setStatus("loading")
    setErrorMessage("")
    setSelectedNode(null)
    setSelectedZone(null)
    setActiveModelPath("")
    setActiveModelFormat(null)
    setLayerVisibility({})
    setLayerStats([])
    setZoneVisibility({})
    setZoneStats([])
    categoryMeshesRef.current = new Map()
    zoneHelpersRef.current = new Map()
    zoneHelperZoneRef.current = new Map()
    zoneMetaRef.current = new Map()
    zoneInfoRef.current = new Map()
    meshZoneRef.current = new Map()
    zoneVisibilityRef.current = {}
    selectedZoneIdRef.current = null
    canMeshHighlightRef.current = false
    defaultViewRef.current = null

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0b1320")

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 4000)
    camera.position.set(80, 60, 80)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.target.set(0, 8, 0)
    controlsRef.current = controls

    const hemiLight = new THREE.HemisphereLight("#ffffff", "#1f2937", 1.2)
    const keyLight = new THREE.DirectionalLight("#ffffff", 1.15)
    keyLight.position.set(80, 120, 40)
    scene.add(hemiLight, keyLight)

    const grid = new THREE.GridHelper(220, 32, "#334155", "#1f2937")
    scene.add(grid)

    const raycaster = new THREE.Raycaster()
    raycaster.params.Line.threshold = 2
    const pointer = new THREE.Vector2()
    const materialStates = new WeakMap<THREE.Material, MaterialState>()

    let disposed = false
    let modelRoot: THREE.Object3D | null = null
    let hoveredMesh: THREE.Mesh | null = null
    let selectedMesh: THREE.Mesh | null = null
    let mapping: MappingDictionary = {}

    const pickHit = () => {
      if (!modelRoot) {
        return null
      }

      raycaster.setFromCamera(pointer, camera)
      const intersections = raycaster.intersectObject(modelRoot, true)
      for (const hit of intersections) {
        if (hit.object instanceof THREE.Mesh) {
          return {
            mesh: hit.object,
            point: hit.point.clone(),
          } satisfies HitResult
        }
      }
      return null
    }

    const pickZoneByPoint = (point: THREE.Vector3) => {
      let selected: ComputedZone | null = null
      let selectedVolume = Number.POSITIVE_INFINITY
      const size = new THREE.Vector3()

      for (const zone of zoneMetaRef.current.values()) {
        const visible = zoneVisibilityRef.current[zone.zoneId] ?? true
        if (!visible) {
          continue
        }

        if (!zone.box.containsPoint(point)) {
          continue
        }

        zone.box.getSize(size)
        const volume = size.x * size.y * size.z
        if (volume < selectedVolume) {
          selected = zone
          selectedVolume = volume
        }
      }

      return selected
    }

    const pickZoneByHelper = () => {
      if (zoneHelpersRef.current.size === 0) {
        return null
      }

      const helperObjects: THREE.Object3D[] = []
      for (const [zoneId, helper] of zoneHelpersRef.current.entries()) {
        const visible = zoneVisibilityRef.current[zoneId] ?? true
        if (!visible) {
          continue
        }
        helperObjects.push(helper)
      }

      if (helperObjects.length === 0) {
        return null
      }

      raycaster.setFromCamera(pointer, camera)
      const intersections = raycaster.intersectObjects(helperObjects, true)
      for (const hit of intersections) {
        const direct = zoneHelperZoneRef.current.get(hit.object.uuid)
        if (direct) {
          return direct
        }

        if (hit.object.parent) {
          const parentZone = zoneHelperZoneRef.current.get(hit.object.parent.uuid)
          if (parentZone) {
            return parentZone
          }
        }
      }

      return null
    }

    const updatePointer = (event: MouseEvent | PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    const updateHover = (mesh: THREE.Mesh | null) => {
      if (!canMeshHighlightRef.current) {
        return
      }

      if (hoveredMesh && hoveredMesh !== selectedMesh) {
        setMeshVisualState(hoveredMesh, "normal", materialStates)
      }
      hoveredMesh = mesh
      if (hoveredMesh && hoveredMesh !== selectedMesh) {
        setMeshVisualState(hoveredMesh, "hover", materialStates)
      }
    }

    const clearMeshSelection = () => {
      if (selectedMesh && canMeshHighlightRef.current) {
        setMeshVisualState(selectedMesh, "normal", materialStates)
      }
      if (hoveredMesh && canMeshHighlightRef.current) {
        setMeshVisualState(hoveredMesh, "normal", materialStates)
      }
      selectedMesh = null
      hoveredMesh = null
    }

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event)
      const zoneByHelper = pickZoneByHelper()
      const hit = pickHit()
      updateHover(hit?.mesh ?? null)
      renderer.domElement.style.cursor = zoneByHelper || hit ? "pointer" : "default"
    }

    const handlePointerLeave = () => {
      updateHover(null)
      renderer.domElement.style.cursor = "default"
    }

    const handleClick = (event: MouseEvent) => {
      updatePointer(event)
      const zoneByHelper = pickZoneByHelper()
      const hit = pickHit()

      if (zoneByHelper) {
        clearMeshSelection()
        selectZoneById(zoneByHelper)

        if (hit) {
          const nodeMeta = resolveNodeMeta(hit.mesh, mapping)
          const zoneMeta = zoneInfoRef.current.get(zoneByHelper)
          setSelectedNode({
            ...nodeMeta,
            zoneId: zoneByHelper,
            zoneTitle: zoneMeta?.title,
          })
        } else {
          setSelectedNode(null)
        }
        return
      }

      if (!hit) {
        clearMeshSelection()
        selectZoneById(null)
        setSelectedNode(null)
        return
      }

      if (canMeshHighlightRef.current) {
        if (selectedMesh && selectedMesh !== hit.mesh) {
          setMeshVisualState(selectedMesh, "normal", materialStates)
        }
        selectedMesh = hit.mesh
        setMeshVisualState(selectedMesh, "selected", materialStates)
      } else {
        clearMeshSelection()
      }

      const zoneFromPoint = pickZoneByPoint(hit.point)
      const zoneId = zoneFromPoint?.zoneId || meshZoneRef.current.get(hit.mesh.uuid) || null
      selectZoneById(zoneId)

      const nodeMeta = resolveNodeMeta(hit.mesh, mapping)
      const zoneMeta = zoneId ? zoneInfoRef.current.get(zoneId) : undefined
      setSelectedNode({
        ...nodeMeta,
        zoneId: zoneId || undefined,
        zoneTitle: zoneMeta?.title,
      })
    }

    const handleResize = () => {
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }

    window.addEventListener("resize", handleResize)
    renderer.domElement.addEventListener("pointermove", handlePointerMove)
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave)
    renderer.domElement.addEventListener("click", handleClick)

    const run = async () => {
      try {
        const shouldUseNppFallback = selectedModel.url.includes("/models/npp/")

        const mappingCandidates = [buildSidecarUrl(selectedModel.url, ".mapping.json")]
        const zoneCandidates = [buildSidecarUrl(selectedModel.url, ".zones.json")]
        if (shouldUseNppFallback) {
          mappingCandidates.push(DEFAULT_MAPPING_URL)
          zoneCandidates.push(DEFAULT_ZONE_CONFIG_URL)
        }

        const [mappingResponse, zoneConfigResponse, fallbackTexture] = await Promise.all([
          fetchFirstJson(Array.from(new Set(mappingCandidates))),
          fetchFirstJson(Array.from(new Set(zoneCandidates))),
          loadTexture(new THREE.TextureLoader(), FALLBACK_TEXTURE_URL).catch(() => null),
        ])

        mapping = parseMapping(mappingResponse)
        const zoneRules = parseZoneRules(zoneConfigResponse)

        const gltfLoader = new GLTFLoader()
        const fbxLoader = new FBXLoader()
        const objLoader = new OBJLoader()

        let loadedModel: THREE.Object3D | null = null
        if (selectedModel.format === "gltf") {
          loadedModel = await loadGltf(gltfLoader, selectedModel.url)
        } else if (selectedModel.format === "fbx") {
          loadedModel = await loadFbx(fbxLoader, selectedModel.url)
        } else {
          loadedModel = await loadObj(objLoader, selectedModel.url)
        }

        if (!loadedModel) {
          throw new Error(`Unable to load ${selectedModel.name}.`)
        }

        if (fallbackTexture) {
          fallbackTexture.colorSpace = THREE.SRGBColorSpace
        }

        loadedModel.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) {
            return
          }

          object.castShadow = true
          object.receiveShadow = true

          for (const material of getMaterials(object)) {
            if (fallbackTexture && "map" in material && !(material as { map?: THREE.Texture | null }).map) {
              ;(material as { map?: THREE.Texture | null }).map = fallbackTexture
              material.needsUpdate = true
            }
          }
        })

        const initialSamples = collectMeshSamples(loadedModel)
        if (initialSamples.length === 0) {
          throw new Error(`Model ${selectedModel.name} has no visible meshes.`)
        }

        const initialBounds = computeRobustBounds(initialSamples)
        const initialCenter = initialBounds.getCenter(new THREE.Vector3())
        loadedModel.position.sub(initialCenter)

        const centeredSamples = collectMeshSamples(loadedModel)
        const centeredBounds = computeRobustBounds(centeredSamples)
        const centeredSize = centeredBounds.getSize(new THREE.Vector3())
        const maxAxis = Math.max(centeredSize.x, centeredSize.y, centeredSize.z) || 1
        const scale = 90 / maxAxis
        loadedModel.scale.setScalar(scale)

        const finalSamples = collectMeshSamples(loadedModel)
        const finalBounds = computeRobustBounds(finalSamples)
        const finalCenter = finalBounds.getCenter(new THREE.Vector3())
        const finalSize = finalBounds.getSize(new THREE.Vector3())
        const radius = Math.max(finalSize.x, finalSize.y, finalSize.z) / 2 || 1

        modelRoot = loadedModel
        scene.add(loadedModel)

        camera.position.copy(finalCenter).add(new THREE.Vector3(radius * 2.2, radius * 1.4, radius * 2.2))
        controls.target.copy(finalCenter)
        controls.minDistance = Math.max(6, radius * 0.25)
        controls.maxDistance = Math.max(60, radius * 10)
        controls.update()

        grid.position.set(finalCenter.x, finalCenter.y, finalCenter.z)
        canMeshHighlightRef.current = finalSamples.length > 1

        const layerGroups = new Map<string, THREE.Mesh[]>()
        for (const sample of finalSamples) {
          const nodeMeta = resolveNodeMeta(sample.mesh, mapping)
          const category = nodeMeta.category?.trim() || "unmapped"
          const group = layerGroups.get(category)
          if (group) {
            group.push(sample.mesh)
          } else {
            layerGroups.set(category, [sample.mesh])
          }
        }

        const configuredZones = createConfiguredZones(finalSamples, zoneRules, finalBounds)
        const zones = configuredZones.length > 0 ? configuredZones : createSpatialZones(finalSamples, finalBounds)

        const zoneHelpers = new Map<string, THREE.Box3Helper>()
        const zoneHelperZone = new Map<string, string>()
        const zoneMetaMap = new Map<string, ComputedZone>()
        const zoneInfoMap = new Map<string, ZoneInfo>()
        const meshZone = new Map<string, string>()

        for (const zone of zones) {
          zoneMetaMap.set(zone.zoneId, zone)
          zoneInfoMap.set(zone.zoneId, {
            zoneId: zone.zoneId,
            title: zone.title,
            color: zone.color,
            description: zone.description,
            status: zone.status,
            progress: zone.progress,
            issues: zone.issues,
            count: zone.meshes.length,
          })

          for (const mesh of zone.meshes) {
            if (!meshZone.has(mesh.uuid)) {
              meshZone.set(mesh.uuid, zone.zoneId)
            }
          }

          const helper = new THREE.Box3Helper(zone.box.clone(), new THREE.Color(zone.color))
          const material = helper.material as THREE.LineBasicMaterial
          material.transparent = true
          material.opacity = 0.85
          scene.add(helper)
          zoneHelpers.set(zone.zoneId, helper)
          zoneHelperZone.set(helper.uuid, zone.zoneId)
        }

        categoryMeshesRef.current = layerGroups
        zoneHelpersRef.current = zoneHelpers
        zoneHelperZoneRef.current = zoneHelperZone
        zoneMetaRef.current = zoneMetaMap
        zoneInfoRef.current = zoneInfoMap
        meshZoneRef.current = meshZone

        const nextLayerStats = Array.from(layerGroups.entries())
          .map(([category, meshes]) => ({ category, count: meshes.length }))
          .sort((a, b) => a.category.localeCompare(b.category))

        const nextLayerVisibility = nextLayerStats.reduce<Record<string, boolean>>((acc, layer) => {
          acc[layer.category] = true
          return acc
        }, {})

        const nextZoneStats = Array.from(zoneInfoMap.values()).sort((a, b) => a.title.localeCompare(b.title))
        const nextZoneVisibility = nextZoneStats.reduce<Record<string, boolean>>((acc, zone) => {
          acc[zone.zoneId] = true
          return acc
        }, {})

        defaultViewRef.current = {
          position: camera.position.clone(),
          target: controls.target.clone(),
          minDistance: controls.minDistance,
          maxDistance: controls.maxDistance,
        }

        if (disposed) {
          return
        }

        applyLayerVisibility(nextLayerVisibility)
        applyZoneVisibility(nextZoneVisibility)
        selectZoneById(null)

        setLayerStats(nextLayerStats)
        setLayerVisibility(nextLayerVisibility)
        setZoneStats(nextZoneStats)
        setZoneVisibility(nextZoneVisibility)
        setActiveModelPath(selectedModel.url)
        setActiveModelFormat(selectedModel.format)
        setStatus("ready")
      } catch (error) {
        if (disposed) {
          return
        }

        const message = error instanceof Error ? error.message : "Failed to initialize 3D scene."
        setActiveModelPath("")
        setActiveModelFormat(null)
        setErrorMessage(message)
        setStatus("error")
      }
    }

    run()

    renderer.setAnimationLoop(() => {
      if (disposed) {
        return
      }
      controls.update()
      renderer.render(scene, camera)
    })

    return () => {
      disposed = true

      renderer.setAnimationLoop(null)
      window.removeEventListener("resize", handleResize)
      renderer.domElement.removeEventListener("pointermove", handlePointerMove)
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave)
      renderer.domElement.removeEventListener("click", handleClick)

      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      const textures = new Set<THREE.Texture>()

      scene.traverse((object) => {
        const maybeGeometry = object as THREE.Object3D & { geometry?: THREE.BufferGeometry }
        if (maybeGeometry.geometry) {
          geometries.add(maybeGeometry.geometry)
        }

        const maybeMaterial = object as THREE.Object3D & { material?: THREE.Material | THREE.Material[] }
        if (maybeMaterial.material) {
          const list = Array.isArray(maybeMaterial.material) ? maybeMaterial.material : [maybeMaterial.material]
          for (const material of list) {
            if ("map" in material && (material as { map?: THREE.Texture | null }).map) {
              textures.add((material as { map: THREE.Texture }).map)
            }
            materials.add(material)
          }
        }
      })

      for (const material of materials) {
        material.dispose()
      }
      for (const texture of textures) {
        texture.dispose()
      }
      for (const geometry of geometries) {
        geometry.dispose()
      }

      controls.dispose()
      renderer.dispose()

      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement)
      }

      categoryMeshesRef.current = new Map()
      zoneHelpersRef.current = new Map()
      zoneHelperZoneRef.current = new Map()
      zoneMetaRef.current = new Map()
      zoneInfoRef.current = new Map()
      meshZoneRef.current = new Map()
      zoneVisibilityRef.current = {}
      selectedZoneIdRef.current = null
      canMeshHighlightRef.current = false
      defaultViewRef.current = null
      cameraRef.current = null
      controlsRef.current = null
    }
  }, [
    applyLayerVisibility,
    applyZoneVisibility,
    isCatalogLoading,
    reloadKey,
    selectZoneById,
    selectedModel,
  ])

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-4">
        <div className="relative h-[70vh] min-h-[460px] overflow-hidden rounded-xl border bg-background">
          <div ref={mountRef} className="h-full w-full" />

          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading 3D scene...
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-4">
              <div className="max-w-sm text-center">
                <AlertTriangle className="mx-auto h-7 w-7 text-destructive" />
                <p className="mt-3 text-sm text-foreground">{errorMessage}</p>
                <Button className="mt-4" variant="outline" onClick={() => setReloadKey((value) => value + 1)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Scene Load
                </Button>
              </div>
            </div>
          )}
        </div>

        <Card className="border bg-card">
          <CardHeader>
            <CardTitle>Zone State Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!selectedZone ? (
              <p className="text-foreground">Click zone overlay or model area to inspect zone status.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{selectedZone.title}</p>
                  <Badge variant={getZoneStatusVariant(selectedZone.status)}>{getZoneStatusLabel(selectedZone.status)}</Badge>
                </div>
                {typeof selectedZone.progress === "number" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{selectedZone.progress}%</span>
                    </div>
                    <Progress value={selectedZone.progress} />
                  </div>
                )}
                {selectedZone.description && <p className="text-sm text-muted-foreground">{selectedZone.description}</p>}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">Problems</p>
                  {selectedZone.issues.length > 0 ? (
                    selectedZone.issues.map((issue) => (
                      <p key={issue} className="text-xs text-muted-foreground">
                        • {issue}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No active problems reported.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border bg-card">
        <CardHeader>
          <CardTitle>Scene Inspector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground">Add your models</p>
            <div className="mt-2 space-y-2">
              <Input
                type="file"
                accept=".glb,.gltf,.fbx,.obj,.json"
                multiple
                onChange={handleUploadFiles}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Upload model files (.glb/.gltf/.fbx/.obj). Optional sidecars: model.mapping.json and model.zones.json.
              </p>
              {isUploading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </div>
              )}
              {uploadMessage && (
                <p className="text-xs text-foreground">
                  <Upload className="mr-1 inline h-3.5 w-3.5" />
                  {uploadMessage}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-muted-foreground">Available models</p>
            {isCatalogLoading ? (
              <p className="mt-2 text-foreground">Loading catalog...</p>
            ) : modelCatalog.length === 0 ? (
              <p className="mt-2 text-foreground">No models found in /public/models.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {modelCatalog.map((model) => (
                  <button
                    key={model.url}
                    type="button"
                    onClick={() => setSelectedModelPath(model.url)}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left transition-colors",
                      selectedModelPath === model.url
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-foreground">{model.name}</span>
                      <Badge variant={selectedModelPath === model.url ? "default" : "outline"}>{model.format.toUpperCase()}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {decodeURIComponent(model.url)}
                      {model.sizeBytes ? ` • ${formatSize(model.sizeBytes)}` : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-muted-foreground">Loaded model</p>
            <p className="font-medium text-foreground">{activeModelPath ? decodeURIComponent(activeModelPath) : "Not loaded"}</p>
            {activeModelFormat && (
              <Badge className="mt-2" variant="secondary">
                {activeModelFormat === "gltf" ? "GLB/GLTF" : activeModelFormat.toUpperCase()}
              </Badge>
            )}
          </div>

          <div>
            <p className="text-muted-foreground">Scene controls</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleResetView}>
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Reset view
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAllLayerVisibility(true)} disabled={layerStats.length === 0}>
                Show layers
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAllLayerVisibility(false)} disabled={layerStats.length === 0}>
                Hide layers
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAllZoneVisibility(true)} disabled={zoneStats.length === 0}>
                Show zones
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAllZoneVisibility(false)} disabled={zoneStats.length === 0}>
                Hide zones
              </Button>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground">Zone overlays</p>
            {zoneStats.length === 0 ? (
              <p className="mt-2 text-foreground">No zones available.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {zoneStats.map((zone) => (
                  <div
                    key={zone.zoneId}
                    className={cn(
                      "rounded-md border px-2 py-1.5",
                      selectedZone?.zoneId === zone.zoneId ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Checkbox
                          checked={zoneVisibility[zone.zoneId] !== false}
                          onCheckedChange={(checked) => updateZoneVisibility(zone.zoneId, checked === true)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (zoneVisibility[zone.zoneId] === false) {
                              updateZoneVisibility(zone.zoneId, true)
                            }
                            selectZoneById(zone.zoneId)
                          }}
                          className="flex min-w-0 items-center gap-2 text-left"
                        >
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                          <span className="truncate text-sm text-foreground">{zone.title}</span>
                        </button>
                      </div>
                      <Badge variant="outline">{zone.count}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={getZoneStatusVariant(zone.status)}>{getZoneStatusLabel(zone.status)}</Badge>
                      {typeof zone.progress === "number" && <span className="text-xs text-muted-foreground">{zone.progress}%</span>}
                    </div>
                    {zone.description && <p className="mt-1 text-xs text-muted-foreground">{zone.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-muted-foreground">Visibility layers</p>
            {layerStats.length === 0 ? (
              <p className="mt-2 text-foreground">No category layers detected. Add categories in mapping JSON.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {layerStats.map((layer) => (
                  <div key={layer.category} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <Checkbox
                        checked={layerVisibility[layer.category] !== false}
                        onCheckedChange={(checked) => updateLayerVisibility(layer.category, checked === true)}
                      />
                      <span className="truncate text-sm text-foreground">{layer.category}</span>
                    </div>
                    <Badge variant="outline">{layer.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-muted-foreground">Selected object</p>
            {!selectedNode ? (
              <p className="text-foreground">Click any model part to inspect metadata.</p>
            ) : (
              <div className="space-y-2">
                <p className="font-medium text-foreground">{selectedNode.title || selectedNode.nodeId}</p>
                <p className="text-muted-foreground">ID: {selectedNode.nodeId}</p>
                <p className="text-muted-foreground">Category: {selectedNode.category || "unmapped"}</p>
                <p className="text-muted-foreground">Zone: {selectedNode.zoneTitle || selectedNode.zoneId || "not assigned"}</p>
                <p className="text-foreground">{selectedNode.description || "No description"}</p>
                {selectedNode.links && selectedNode.links.length > 0 && (
                  <div className="space-y-1">
                    {selectedNode.links.map((link) => (
                      <a key={link.href + link.label} href={link.href} className="block text-primary hover:underline">
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              Zones support status, progress and problems. Keep sidecar names aligned with model name:
              <br />
              <code>model.mapping.json</code> and <code>model.zones.json</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
