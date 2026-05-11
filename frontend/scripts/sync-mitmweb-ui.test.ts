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

  it('preserves existing static files while copying generated assets', async () => {
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
      'old.js',
    ])
    await expect(readFile(join(target, 'static', 'old.js'), 'utf8')).resolves.toBe('old')
    await expect(readFile(join(target, 'static', 'favicon.ico'), 'utf8')).resolves.toBe('ico')
  })

  it('rewrites Vite asset references in index.html to mitmweb static URLs', async () => {
    const dist = join(root, 'dist')
    await mkdir(join(dist, 'assets'), { recursive: true })
    await writeFile(
      join(dist, 'index.html'),
      [
        '<div id="flexlab"></div>',
        '<script type="module" src="./assets/index-abc.js"></script>',
        '<link rel="stylesheet" href="/assets/index-def.css">',
      ].join(''),
    )
    await writeFile(join(dist, 'assets', 'index-abc.js'), 'console.log("flexlab")')
    await writeFile(join(dist, 'assets', 'index-def.css'), 'body{}')
    const target = join(root, 'web')

    await syncMitmwebUi({ distDir: dist, targetDir: target })

    const html = await readFile(join(target, 'index.html'), 'utf8')
    expect(html).toContain('src="./static/index-abc.js"')
    expect(html).toContain('href="./static/index-def.css"')
  })

  it('rewrites root dist file references without changing external, anchor, data, or API paths', async () => {
    const dist = join(root, 'dist')
    await mkdir(join(dist, 'assets'), { recursive: true })
    await writeFile(
      join(dist, 'index.html'),
      [
        '<link rel="icon" href="/favicon.svg">',
        '<link rel="manifest" href="./manifest.webmanifest">',
        '<a href="/flows">flows</a>',
        '<a href="#traffic">traffic</a>',
        '<img src="data:image/svg+xml;base64,abc">',
        '<script src="https://cdn.example.test/tool.js"></script>',
      ].join(''),
    )
    await writeFile(join(dist, 'favicon.svg'), '<svg></svg>')
    await writeFile(join(dist, 'manifest.webmanifest'), '{}')
    const target = join(root, 'web')

    await syncMitmwebUi({ distDir: dist, targetDir: target })

    const html = await readFile(join(target, 'index.html'), 'utf8')
    expect(html).toContain('href="./static/favicon.svg"')
    expect(html).toContain('href="./static/manifest.webmanifest"')
    expect(html).toContain('href="/flows"')
    expect(html).toContain('href="#traffic"')
    expect(html).toContain('src="data:image/svg+xml;base64,abc"')
    expect(html).toContain('src="https://cdn.example.test/tool.js"')
  })

  it('rejects missing referenced assets before changing target/static', async () => {
    const dist = join(root, 'dist')
    await mkdir(join(dist, 'assets'), { recursive: true })
    await writeFile(
      join(dist, 'index.html'),
      '<script type="module" src="./assets/missing.js"></script>',
    )
    const target = join(root, 'web')
    await mkdir(join(target, 'static'), { recursive: true })
    await writeFile(join(target, 'static', 'old.js'), 'old')
    await writeFile(join(target, 'static', 'favicon.ico'), 'ico')

    await expect(syncMitmwebUi({ distDir: dist, targetDir: target })).rejects.toThrow(
      'Missing React build asset',
    )

    expect((await readdir(join(target, 'static'))).sort()).toEqual(['favicon.ico', 'old.js'])
    await expect(readFile(join(target, 'static', 'old.js'), 'utf8')).resolves.toBe('old')
    await expect(readFile(join(target, 'static', 'favicon.ico'), 'utf8')).resolves.toBe('ico')
  })

  it('rejects missing referenced root files before changing target/static', async () => {
    const dist = join(root, 'dist')
    await mkdir(dist, { recursive: true })
    await writeFile(join(dist, 'index.html'), '<link rel="icon" href="/missing.svg">')
    const target = join(root, 'web')
    await mkdir(join(target, 'static'), { recursive: true })
    await writeFile(join(target, 'static', 'old.js'), 'old')
    await writeFile(join(target, 'static', 'favicon.ico'), 'ico')

    await expect(syncMitmwebUi({ distDir: dist, targetDir: target })).rejects.toThrow(
      'Missing React build asset',
    )

    expect((await readdir(join(target, 'static'))).sort()).toEqual(['favicon.ico', 'old.js'])
    await expect(readFile(join(target, 'static', 'old.js'), 'utf8')).resolves.toBe('old')
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
