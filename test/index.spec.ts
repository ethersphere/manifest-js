import { Bee } from '@ethersphere/bee-js'
import { ManifestJs } from '../src'

const bee = new Bee('http://localhost:1633')

const manifestJs = new ManifestJs(bee)

describe('manifest detection', () => {
  it('should return true for website', async () => {
    const hash = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website')
    expect(await manifestJs.isManifest(hash)).toBe(true)
  })

  it('should return true for single file', async () => {
    const hash = await bee.uploadFile(process.env.BEE_POSTAGE, 'test/sample-website/reset.css')
    expect(await manifestJs.isManifest(hash)).toBe(true)
  })

  it('should return false for data', async () => {
    const hash = await bee.uploadData(process.env.BEE_POSTAGE, 'Hello Swarm!')
    expect(await manifestJs.isManifest(hash)).toBe(false)
  })
})

describe('index-document retrieval', () => {
  it('should return index.html for website', async () => {
    const hash = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website', {
      indexDocument: 'index.html',
    })
    expect(await manifestJs.getIndexDocument(hash)).toBe('index.html')
  })

  it('should return null when not set', async () => {
    const hash = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website')
    expect(await manifestJs.getIndexDocument(hash)).toBe(null)
  })
})

describe('manifest listing', () => {
  it('should list paths with hashes', async () => {
    const hash = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website', {
      indexDocument: 'index.html',
    })
    expect(await manifestJs.getHashes(hash)).toStrictEqual({
      'assets/photo1.jpg': 'dd30cc1166042f6cf51502a895ec7acce6c0f24e60e395fa1d88bdca4088e11d',
      'assets/photo2.jpg': '1f9e0f141ffa95d3691f44a2839b9466c304608294c1d811f81624845e4a1569',
      'assets/photo3.jpg': 'f4db540a4dfd2510af841cf8a7430be3a4886bbf96c6b5fa1e5b0b7192ea732e',
      'assets/photo4.jpg': '284b6145149080b28379cdbdb24638ac0a36d38770c779cf0cbdf904ca02d072',
      'index.html': '24f5a17a06408b66d280a2d7a7df73bae7f8074aadcec9a0313ac4b4203f7ffa',
      'reset.css': '713aa0e503e736fc78b43be20a6e4995bf2dcfb8b782db1870c926baaaeb66fc',
      'style.css': '8cdd2ea48759480a81dbb3c1219d190dea9d37f533c450cfe4ab69faac4c401c',
    })
  })
})