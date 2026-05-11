import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdtemp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { syncMitmwebUi } from './sync-mitmweb-ui'

let root: string

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'flexlab-sync-'))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

async function createDist() {
  const dist = join(root, 'dist')
  await mkdir(join(dist, 'assets'), { recursive: true })
  await writeFile(join(dist, 'index.html'), '<div id="flexlab"></div>')
  await writeFile(join(dist, 'assets', 'index.js'), 'console.log("flexlab")')
  await writeFile(join(dist, 'assets', 'index.css'), 'body{}')
  await writeFile(join(dist, 'favicon.svg'), '<svg></svg>')
  return dist
}

describe('syncMitmwebUi', () => {
  it('copies index.html and dist assets into target/static', async () => {
    const dist = await createDist()
    const target = join(root, 'web')

    await syncMitmwebUi({ distDir: dist, targetDir: target })

    await expect(readFile(join(target, 'index.html'), 'utf8')).resolves.toBe(
      '<div id="flexlab"></div>',
    )
    await expect(readFile(join(target, 'static', 'index.js'), 'utf8')).resolves.toBe(
      'console.log("flexlab")',
    )
    await expect(readFile(join(target, 'static', 'index.css'), 'utf8')).resolves.toBe('body{}')
    await expect(readFile(join(target, 'static', 'favicon.svg'), 'utf8')).resolves.toBe(
      '<svg></svg>',
    )
  })

  it('removes stale generated assets but preserves existing static/favicon.ico', async () => {
    const dist = await createDist()
    const target = join(root, 'web')
    await mkdir(join(target, 'static'), { recursive: true })
    await writeFile(join(target, 'static', 'old.js'), 'old')
    await writeFile(join(target, 'static', 'favicon.ico'), 'ico')

    await syncMitmwebUi({ distDir: dist, targetDir: target })

    expect((await readdir(join(target, 'static'))).sort()).toEqual([
      'favicon.ico',
      'favicon.svg',
      'index.css',
      'index.js',
    ])
    await expect(readFile(join(target, 'static', 'favicon.ico'), 'utf8')).resolves.toBe('ico')
  })

  it('rejects when dist/index.html is missing with a helpful message', async () => {
    const dist = join(root, 'missing-dist')
    const target = join(root, 'web')

    await expect(syncMitmwebUi({ distDir: dist, targetDir: target })).rejects.toThrow(
      'Missing React build output',
    )
  })
})
