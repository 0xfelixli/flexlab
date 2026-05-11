import { access, cp, mkdir, readdir, rm, stat } from 'node:fs/promises'
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

async function clearGeneratedStatic(staticDir: string) {
  await mkdir(staticDir, { recursive: true })
  const entries = await readdir(staticDir)
  await Promise.all(
    entries
      .filter((entry) => entry !== 'favicon.ico')
      .map((entry) => rm(join(staticDir, entry), { recursive: true, force: true })),
  )
}

export async function syncMitmwebUi({ distDir, targetDir }: SyncMitmwebUiOptions) {
  await assertDistReady(distDir)

  const staticDir = join(targetDir, 'static')
  await mkdir(targetDir, { recursive: true })
  await clearGeneratedStatic(staticDir)

  await cp(join(distDir, 'index.html'), join(targetDir, 'index.html'))

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
