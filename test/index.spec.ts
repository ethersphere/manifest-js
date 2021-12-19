import { Bee } from '@ethersphere/bee-js'
import Wallet from 'ethereumjs-wallet'
import { ManifestJs } from '../src'

jest.setTimeout(300_000)

const bee = new Bee('http://localhost:1633')
const manifestJs = new ManifestJs(bee)

describe('manifest detection', () => {
  it('should return true for website', async () => {
    const { reference } = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website')
    expect(await manifestJs.isManifest(reference)).toBe(true)
  })

  it('should return true for single file', async () => {
    const { reference } = await bee.uploadFile(process.env.BEE_POSTAGE, 'test/sample-website/reset.css')
    expect(await manifestJs.isManifest(reference)).toBe(true)
  })

  it('should return false for data', async () => {
    const { reference } = await bee.uploadData(process.env.BEE_POSTAGE, 'Hello Swarm!')
    expect(await manifestJs.isManifest(reference)).toBe(false)
  })
})

describe('index-document retrieval', () => {
  it('should return index.html for website', async () => {
    const { reference } = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website', {
      indexDocument: 'index.html',
    })
    expect(await manifestJs.getIndexDocumentPath(reference)).toBe('index.html')
  })

  it('should return null when not set', async () => {
    const { reference } = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website')
    expect(await manifestJs.getIndexDocumentPath(reference)).toBe(null)
  })
})

describe('manifest listing', () => {
  it('should list paths with hashes', async () => {
    const { reference } = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website', {
      indexDocument: 'index.html',
    })
    expect(await manifestJs.getHashes(reference)).toStrictEqual({
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

describe('feed hash conversion', () => {
  it('should convert feed hash', async () => {
    const { reference } = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website', {
      indexDocument: 'index.html',
    })
    const wallet = Wallet.fromPrivateKey(
      Buffer.from('9cdec96ff3837f758b4f077b018d09cad3ecb222d47ef101f8f7c0bea6f27d04', 'hex'),
    )
    const topic = '00'.repeat(32)
    const writer = bee.makeFeedWriter('sequence', topic, wallet.getPrivateKeyString())
    await writer.upload(process.env.BEE_POSTAGE, reference)
    const feedManifest = await bee.createFeedManifest(
      process.env.BEE_POSTAGE,
      'sequence',
      topic,
      wallet.getAddressString(),
    )
    expect(await manifestJs.resolveFeedManifest(feedManifest)).toBe(reference)
  })

  it('should convert to the most recent index', async () => {
    const { reference } = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website', {
      indexDocument: 'index.html',
    })
    const wallet = Wallet.fromPrivateKey(
      Buffer.from('9cdec96ff3837f758b4f077b018d09cad3ecb222d47ef101f8f7c0bea6f27d06', 'hex'),
    )
    const topic = '00'.repeat(32)
    const writer = bee.makeFeedWriter('sequence', topic, wallet.getPrivateKeyString())
    const result = await writer.upload(process.env.BEE_POSTAGE, reference)
    const { reference: mostRecentReference } = await bee.uploadFilesFromDirectory(
      process.env.BEE_POSTAGE,
      'test/sample-website/assets',
    )
    const mostRecentResult = await writer.upload(process.env.BEE_POSTAGE, mostRecentReference)
    expect(reference).not.toBe(mostRecentReference)
    expect(result).not.toBe(mostRecentResult)
    const feedManifest = await bee.createFeedManifest(
      process.env.BEE_POSTAGE,
      'sequence',
      topic,
      wallet.getAddressString(),
    )
    expect(await manifestJs.resolveFeedManifest(feedManifest)).toBe(mostRecentReference)
  })

  it('should return null for bzz manifest hash', async () => {
    const { reference } = await bee.uploadFilesFromDirectory(process.env.BEE_POSTAGE, 'test/sample-website', {
      indexDocument: 'index.html',
    })
    expect(await manifestJs.resolveFeedManifest(reference)).toBe(null)
  })
})
