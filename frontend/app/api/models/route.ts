import { promises as fs } from "node:fs"
import path from "node:path"
import { NextRequest, NextResponse } from "next/server"

type ModelFormat = "gltf" | "fbx" | "obj"

type ModelEntry = {
  url: string
  name: string
  relativePath: string
  format: ModelFormat
  sizeBytes: number
}

const MODEL_EXTENSIONS = new Set([".glb", ".gltf", ".fbx", ".obj"])
const SIDECAR_SUFFIXES = [".mapping.json", ".zones.json"]
const CUSTOM_MODELS_DIR = "custom"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function detectFormatFromExtension(extension: string): ModelFormat {
  if (extension === ".fbx") {
    return "fbx"
  }
  if (extension === ".obj") {
    return "obj"
  }
  return "gltf"
}

async function collectModelFiles(rootDir: string, currentDir: string, result: ModelEntry[]) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name)

    if (entry.isDirectory()) {
      await collectModelFiles(rootDir, fullPath, result)
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    const extension = path.extname(entry.name).toLowerCase()
    if (!MODEL_EXTENSIONS.has(extension)) {
      continue
    }

    const stat = await fs.stat(fullPath)
    const relativePath = path.relative(rootDir, fullPath).split(path.sep).join("/")

    result.push({
      url: `/models/${relativePath}`,
      name: entry.name,
      relativePath,
      format: detectFormatFromExtension(extension),
      sizeBytes: stat.size,
    })
  }
}

export async function GET() {
  const modelsRoot = path.join(process.cwd(), "public", "models")
  const models: ModelEntry[] = []

  try {
    await collectModelFiles(modelsRoot, modelsRoot, models)
  } catch {
    return NextResponse.json({ models: [] })
  }

  models.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
  return NextResponse.json({ models })
}

function sanitizeFileName(raw: string) {
  const normalized = raw.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
  return normalized.length > 0 ? normalized : "uploaded-model"
}

function isSidecarFile(name: string) {
  const lower = name.toLowerCase()
  return SIDECAR_SUFFIXES.some((suffix) => lower.endsWith(suffix))
}

async function ensureUniqueFilePath(directory: string, fileName: string) {
  const extension = path.extname(fileName)
  const base = fileName.slice(0, fileName.length - extension.length)

  let attempt = 0
  while (attempt < 1000) {
    const suffix = attempt === 0 ? "" : `-${attempt}`
    const candidateName = `${base}${suffix}${extension}`
    const candidatePath = path.join(directory, candidateName)
    try {
      await fs.access(candidatePath)
      attempt += 1
      continue
    } catch {
      return { fileName: candidateName, filePath: candidatePath }
    }
  }

  throw new Error("Unable to reserve unique file name")
}

export async function POST(request: NextRequest) {
  const modelsRoot = path.join(process.cwd(), "public", "models")
  const customDir = path.join(modelsRoot, CUSTOM_MODELS_DIR)

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid multipart payload." }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Field 'file' is required." }, { status: 400 })
  }

  const safeName = sanitizeFileName(file.name)
  const lowerName = safeName.toLowerCase()
  const extension = path.extname(lowerName)
  const isModel = MODEL_EXTENSIONS.has(extension)
  const isSidecar = isSidecarFile(lowerName)

  if (!isModel && !isSidecar) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: .glb, .gltf, .fbx, .obj and sidecars *.mapping.json / *.zones.json." },
      { status: 400 }
    )
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 })
  }

  await fs.mkdir(customDir, { recursive: true })

  const reserved = isModel
    ? await ensureUniqueFilePath(customDir, safeName)
    : { fileName: safeName, filePath: path.join(customDir, safeName) }

  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(reserved.filePath, buffer)

  const relativePath = `${CUSTOM_MODELS_DIR}/${reserved.fileName}`.split(path.sep).join("/")
  const url = `/models/${relativePath}`

  if (isModel) {
    const model: ModelEntry = {
      url,
      name: reserved.fileName,
      relativePath,
      format: detectFormatFromExtension(extension),
      sizeBytes: buffer.byteLength,
    }

    return NextResponse.json({
      uploaded: {
        type: "model",
        url,
        name: reserved.fileName,
      },
      model,
    })
  }

  return NextResponse.json({
    uploaded: {
      type: "sidecar",
      url,
      name: reserved.fileName,
    },
  })
}
