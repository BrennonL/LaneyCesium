import {
  Ion,
  Viewer,
  Terrain,
  CzmlDataSource,
  Cesium3DTileStyle,
  Cesium3DTileset,
  Entity,
  ScreenSpaceEventType,
} from "cesium";
import "cesium/Widgets/widgets.css";
import "./css/main.css";
import {
  loadGEOSAsset,
  loadLemurAsset,
  loadGNDAsset
} from "./cesiumIon/loaders.js";
import {
  GroundStation
} from "./utilities/utilities.js"
import {
  createCameraGeomitry,
  toggleCameraGeomitry,
  createPickedFeatureDescription,
} from "./scene/utilities.js"
import {
  toggleViews
} from "./scene/view.js"

// Access token:
Ion.defaultAccessToken = process.env.WEBPACK_CESIUM_ION_TOKEN;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
  shouldAnimate: true,
});


// Initialize datasource
const ds = await CzmlDataSource.load("../czml/lemur-GEOS.czml");
viewer.dataSources.add(ds);


// Global Variables
const LEMUR_ID = "sat-40044";
const GEOS_ID = "sat-35491";
const PROP_ID = "prop-35491"; // This is the id of the geos satellite's custom property
const GND_ID_1 = "gnd-90000";
const GND_ID_2 = "gnd-90001";
const GND_DOUALA = new GroundStation("Douala, Cameroon", GND_ID_1, 4.84, 10.1);
const GND_SINGAPORE = new GroundStation("Singapore, Singapore", GND_ID_2, 1.35, 103.82);

const lemurSatEntity = ds.entities.getById(LEMUR_ID);
const geosSatEntity = ds.entities.getById(GEOS_ID);
const inViewProperty = ds.entities.getById(PROP_ID);

// Load in tileset
const tileset = viewer.scene.primitives.add(
  await Cesium3DTileset.fromIonAssetId(
    process.env.WEBPACK_OSM_BUILDINGS_TILESET_ID
  ),
);


// Color the groundstations
tileset.style = new Cesium3DTileStyle({
  defines: {
    distanceFromComplex:
    "distance(vec2(${feature['cesium#longitude']}, ${feature['cesium#latitude']}), vec2(144.96007, -37.82249))",
  },
  color: {
    conditions: [
      ["${wikidata} === 'Q60046490'", "color('#d65c5c')"],
      ["${elementId} === 392375195", "color('#d65c5c')"],
    ],
  },
  show: "${feature['building']} !== 'residential' || ${feature['building']} !== 'apartments'",
});

// 
const selectedEntity = new Entity();

// Set up overlay
// Source = https://sandcastle.cesium.com/?id=3d-tiles-feature-picking 
const nameOverlay = document.createElement("div");
viewer.container.appendChild(nameOverlay);
nameOverlay.className = "backdrop";
nameOverlay.style.display = "none";
nameOverlay.style.position = "absolute";
nameOverlay.style.bottom = "0";
nameOverlay.style.left = "0";
nameOverlay.style["pointer-events"] = "none";
nameOverlay.style.padding = "4px";
nameOverlay.style.backgroundColor = "black";


viewer.screenSpaceEventHandler.setInputAction((movement) => {
  const pickedFeature = viewer.scene.pick(movement.position);
  if (pickedFeature == undefined) {
    selectedEntity.description = null;
    viewer.selectedEntity = null;
    return
  } else {
    selectedEntity.description = createPickedFeatureDescription(pickedFeature);
    viewer.selectedEntity = selectedEntity;
  }
}, ScreenSpaceEventType.LEFT_CLICK);

// Load in infrastructure 3d models and tilesets
loadLemurAsset(lemurSatEntity);
loadGEOSAsset(geosSatEntity, inViewProperty, viewer);
loadGNDAsset(process.env.WEBPACK_DOUALA_GND_ASSET_ID, GND_DOUALA, viewer);
loadGNDAsset(process.env.WEBPACK_SINGAPORE_GND_ASSET_ID, GND_SINGAPORE, viewer);

// Allow user to toggle visibility of view shape from lemur satellite
const viewObject = createCameraGeomitry(lemurSatEntity, viewer);
let viewObjIsVis = true;
document.getElementById("toggle-camera-view").addEventListener(
  "click",
  () => {
    viewObjIsVis = toggleCameraGeomitry(viewObjIsVis, viewObject);
  }
)

// allow user to switch between looking from satellite view and at ground station
const selectionElement = document.querySelector("#selectionView");
selectionElement.addEventListener("change", (event) => {
  toggleViews(event.target.value, viewer, geosSatEntity, lemurSatEntity);
})


