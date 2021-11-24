import { Bee } from '@ethersphere/bee-js'
import { loadAllNodes, MantarayNode } from 'mantaray-js'

/**
 * The ASCII code of the character `/`.
 *
 * This prefix of the root node holds metadata such as the index document.
 */
const INDEX_DOCUMENT_FORK_PREFIX = '47'

export class ManifestJs {
  private bee: Bee

  constructor(bee: Bee) {
    this.bee = bee
  }

  public async isManifest(hash: string): Promise<boolean> {
    try {
      const data = await this.bee.downloadData(hash)
      const node = new MantarayNode()
      node.deserialize(data)

      return true
    } catch {
      return false
    }
  }

  public async getIndexDocument(hash: string): Promise<string | null> {
    const data = await this.bee.downloadData(hash)
    const node = new MantarayNode()
    node.deserialize(data)

    if (!node.forks) {
      return null
    }
    const fork = node.forks[INDEX_DOCUMENT_FORK_PREFIX]

    if (!fork) {
      return null
    }
    const metadataNode = fork.node

    if (!metadataNode.IsWithMetadataType()) {
      return null
    }
    const metadata = metadataNode.getMetadata

    if (!metadata) {
      return null
    }

    return metadata['website-index-document'] || null
  }

  public async getHashes(hash: string): Promise<Record<string, string>> {
    const data = await this.bee.downloadData(hash)
    const node = new MantarayNode()
    node.deserialize(data)
    await loadAllNodes(this.load.bind(this), node)
    const result = {}
    this.extractHashes(result, node)

    return result
  }

  private extractHashes(result: Record<string, string>, node: MantarayNode, prefix = ''): void {
    if (!node.forks) {
      return
    }
    for (const fork of Object.values(node.forks)) {
      const path = prefix + this.bytesToUtf8(fork.prefix)
      const childNode = fork.node

      if (childNode.isValueType() && path !== '/' && childNode.getEntry) {
        result[path] = this.bytesToHex(childNode.getEntry)
      }

      if (childNode.isEdgeType()) {
        this.extractHashes(result, childNode, path)
      }
    }
  }

  private async load(reference: Uint8Array) {
    return this.bee.downloadData(this.bytesToHex(reference))
  }

  private bytesToHex(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('hex')
  }

  private bytesToUtf8(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('utf-8')
  }
}
