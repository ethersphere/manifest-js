# Description

Manifest-JS provides high-level Swarm manifest functionalities built on top of Mantaray-JS.

# Usage

> To use this library, you will need to provide a `Bee` instance from the `@ethersphere/bee-js` library.

## Create an instance of the `ManifestJs` class:

```js
const bee = new Bee('http://localhost:1633')
const manifestJs = new ManifestJs(bee)
```

## Check if a Swarm hash is a manifest:

```js
const swarmHash = '0d6378cb3ba46363e4369f1a0bd82803e3c17ec037c19f65565346a7e875aa66'
const isManifest = await manifestJs.isManifest(swarmHash)
// true | false
```

## List paths and hashes in a manifest:

```js
const swarmHash = '0d6378cb3ba46363e4369f1a0bd82803e3c17ec037c19f65565346a7e875aa66'
const paths = await manifestJs.getHashes(swarmHash)
/*
    {
        'index.html': '24f5a17a06408b66d280a2d7a7df73bae7f8074aadcec9a0313ac4b4203f7ffa',
        'style.css': '8cdd2ea48759480a81dbb3c1219d190dea9d37f533c450cfe4ab69faac4c401c'
    }
*/
```

## Get index document path from a manifest:

```js
const swarmHash = '0d6378cb3ba46363e4369f1a0bd82803e3c17ec037c19f65565346a7e875aa66'
const indexDocumentPath = await manifestJs.getIndexDocumentPath(swarmHash)
// 'index.html' (string | null)
```

# Maintainers

- [nugaon](https://github.com/nugaon)
- [Cafe137](https://github.com/Cafe137)

See what "Maintainer" means [here](https://github.com/ethersphere/repo-maintainer).
