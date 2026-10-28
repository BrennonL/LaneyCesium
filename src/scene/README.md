# Directory Contents

The two files here are [`utilities.js`](./utilities.js) and
[`view.js`](./view.js). 

## [`./utilities.js`](./utilities.js) 
Contains functions used for creating
entities and description boxes on the Cesium scene. The functions in this
file that are exported are:

```JavaScript
function createCameraGeomitry(satEntity, viewer) {...}
function createPickedFeatureDescription(pickedFeature) {...}
function toggleCameraGeomitry(viewObjIsVis, viewObject) {...}
```

## [`./view.js`](./view.js)
Contains functiosn used for modifying the scene perspective. Exported
functions are:

```JavaScript
function toggleViews(event, viewer, geosSatEntity, lemurSatEntity) {...}
```
