# Directory Contents

This folder contains the file [`loaders.js`](./loaders.js) which contains the
functions used to load in 3D assets from Cesium Ion. The functions from this
file that are exported and used in [`index.js`](../index.js) are:

```JavaScript
async function loadGNDAsset(AssetID, gnd, viewer) {...}
async function loadLemurAsset(lemurSatEntity) {...}
async function loadGEOSAsset(geosSatEntity, inViewProperty, viewer) {...}
```