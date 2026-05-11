import { constants } from 'node:fs'
import { access, cp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export type SyncMitmwebUiOptions = {
  distDir: string
  targetDir: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const frontendDir = resolve(scriptDir, '..')
const repoDir = resolve(frontendDir, '..')

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function assertDistReady(distDir: string) {
  if (!(await pathExists(join(distDir, 'index.html')))) {
    throw new Error(`Missing React build output: ${join(distDir, 'index.html')}`)
  }
}

async function assertReadable(path: string, message: string) {
  try {
    await access(path, constants.R_OK)
  } catch {
    throw new Error(`${message}: ${path}`)
  }
}

async function validateDistEntries(distDir: string) {
  const entries = await readdir(distDir)
  await Promise.all(entries.map((entry) => stat(join(distDir, entry))))

  const assetsDir = join(distDir, 'assets')
  if (await pathExists(assetsDir)) {
    const assets = await readdir(assetsDir)
    await Promise.all(assets.map((asset) => stat(join(assetsDir, asset))))
  }
}

function isRootStaticReference(value: string): boolean {
  if (!value.startsWith('/') && !value.startsWith('./')) return false
  if (value.startsWith('/assets/') || value.startsWith('./assets/')) return false

  const withoutPrefix = value.replace(/^\.?\//, '')
  return !withoutPrefix.includes('/') && withoutPrefix.includes('.')
}

function rewriteAssetReferences(indexHtml: string) {
  return indexHtml.replace(
    /((?:src|href)=["'])([^"']+)(["'])/g,
    (match: string, prefix: string, value: string, suffix: string) => {
      if (value.startsWith('/assets/') || value.startsWith('./assets/')) {
        return `${prefix}./static/${value.replace(/^\.?\/assets\//, '')}${suffix}`
      }

      if (isRootStaticReference(value)) {
        return `${prefix}./static/${value.replace(/^\.?\//, '')}${suffix}`
      }

      return match
    },
  )
}

async function readAndValidateIndex(distDir: string) {
  await assertDistReady(distDir)
  await validateDistEntries(distDir)

  const indexHtml = await readFile(join(distDir, 'index.html'), 'utf8')
  const assetReferences = indexHtml.matchAll(/(?:src|href)=["'](?:\.\/|\/)assets\/([^"']+)["']/g)

  for (const reference of assetReferences) {
    await assertReadable(join(distDir, 'assets', reference[1]), 'Missing React build asset')
  }

  const rootReferences = indexHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)
  for (const reference of rootReferences) {
    const value = reference[1]
    if (!isRootStaticReference(value)) continue
    await assertReadable(join(distDir, value.replace(/^\.?\//, '')), 'Missing React build asset')
  }

  return rewriteAssetReferences(indexHtml)
}

async function ensureStaticDir(staticDir: string) {
  await mkdir(staticDir, { recursive: true })
}

export async function syncMitmwebUi({ distDir, targetDir }: SyncMitmwebUiOptions) {
  const indexHtml = await readAndValidateIndex(distDir)

  const staticDir = join(targetDir, 'static')
  await mkdir(targetDir, { recursive: true })
  await ensureStaticDir(staticDir)

  await writeFile(join(targetDir, 'index.html'), indexHtml)

  const entries = await readdir(distDir)
  for (const entry of entries) {
    if (entry === 'index.html') continue

    const source = join(distDir, entry)
    const destination = entry === 'assets' ? staticDir : join(staticDir, entry)
    const sourceStat = await stat(source)
    await cp(source, destination, {
      recursive: sourceStat.isDirectory(),
      force: true,
    })
  }
}

if (import.meta.main) {
  const distDir = resolve(frontendDir, 'dist')
  const targetDir = resolve(repoDir, 'mitmproxy/mitmproxy/tools/web')

  await syncMitmwebUi({ distDir, targetDir })
  console.log(`Synced ${distDir} to ${targetDir}`)
}
