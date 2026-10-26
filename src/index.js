import {
  Ion,
  Viewer,
  Terrain,
  Cartesian3,
  CzmlDataSource,
  CallbackProperty,
  Color,
  IonResource,
  Cesium3DTileStyle,
  Cesium3DTileset,
  Cesium3DTileFeature,
  Entity,
  Transforms,
  TranslationRotationScale,
  ScreenSpaceEventType,
  Matrix3,
  Matrix4,
  PolygonHierarchy,
} from "cesium";
import "cesium/Widgets/widgets.css";
import "./css/main.css";

// Access token:
Ion.defaultAccessToken = process.env.WEBPACK_CESIUM_ION_TOKEN;

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
  shouldAnimate: true,
});

function degrees2radians(degree) {
  return degree * (Math.PI / 180)
}

// Initialize datasource
const ds = await CzmlDataSource.load("../czml/lemur-GEOS.czml");
viewer.dataSources.add(ds);

// Initialize groundstation class
class GroundStation {
  constructor(location, id, lat, lon) {
    this.location = location
    this.id = id
    this.lat_deg = lat // degrees
    this.lon_deg = lon // degrees
  }
}

// Global Variables
const LEMUR_ID = "sat-40044";
const GEOS_ID = "sat-35491";
const PROP_ID = "prop-35491"; // This is the id of the geos satellite's custom property
const GND_ID_1 = "gnd-90000";
const GND_ID_2 = "gnd-90001";
const GND_DOUALA = new GroundStation("Douala, Cameroon", GND_ID_1, 4.84, 10.1);
const GND_SINGAPORE = new GroundStation("Singapore, Singapore", GND_ID_2, 1.35, 103.82);
const lemurSatEntity = ds.entities.getById(LEMUR_ID);
const VIEW_HEIGHT_M = 1000.0;
const FAINTSTAR2_FOV_DEG = 5.5;
const geosSatEntity = ds.entities.getById(GEOS_ID);

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
      // ["${Id} === 'gnd-90000'", "color('#0e46be')"]
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

// When GEOS is in view turn it green
function getGEOSInView() {
  return new CallbackProperty(() => {
    const time = viewer.clock.currentTime;
    const isInView = ds.entities.getById(PROP_ID).properties.isVisible.getValue(time);
    if (isInView == true) {
      console.log("TRUE");
      return Color.GREEN;
    } else {
      console.log("FALSE");
      return null;
    }
  }, false);
}


function createPickedFeatureDescription(pickedFeature) {
  let description
  if (pickedFeature instanceof Cesium3DTileFeature) {
    console.log("pickedFeature.getPropertyIds == ", pickedFeature.getPropertyIds())
    description = `
    <div class="cesium-infoBox-defaultTable">
      <table>
        <tbody>
          <tr><th>Id</th><td>${pickedFeature.getProperty("elementId")}</td></tr>
          <tr>
            <th>Longitude</th>
            <td>${pickedFeature.getProperty("cesium#longitude")}</td>
          </tr>
          <tr>
            <th>Latitude</th>
            <td>${pickedFeature.getProperty("cesium#latitude")}</td>
          </tr>
        </tbody>
      </table>
    <div>
    `;
  } else {
    description = pickedFeature.primitive.description
  }
  return description;
}

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


async function loadLemurAsset() {
  try {
    const lemurIonResource = await IonResource.fromAssetId(
      process.env.WEBPACK_CUBE_SAT_ASSET_ID
    );
    ds.entities.getById(LEMUR_ID).model.uri = lemurIonResource;
    ds.entities.getById(LEMUR_ID).model.scale = 10.0;
    ds.entities.getById(LEMUR_ID).model.nodeTransformations = {
      Sketchfab_model: new TranslationRotationScale(new Cartesian3(0,0,-10))
      // Sketchfab_model: new NodeTransformationProperty({
      //   translation: new Cartesian3(0,0,-10),
      //   rotation: Quaternion.IDENTITY,
      //   scale: new Cartesian3(1,1,1)
      // })
    }
    console.log(
      "Node transformations: ",
      ds.entities.getById(LEMUR_ID).model.nodeTransformations.getValue(viewer.clock.currentTime)
    )
  } catch (error) {
    console.log("fn: loadLemurAsset: Failure loading in cubesat 3d asset: ", error);
  }
}
await loadLemurAsset();




async function loadGEOSAsset() {
  try {
    const geosIonResource = await IonResource.fromAssetId(
      process.env.WEBPACK_GEOS_SAT_ASSET_ID
    );
    ds.entities.getById(GEOS_ID).model.uri = geosIonResource;
    ds.entities.getById(GEOS_ID).model.scale = 10.0;
    ds.entities.getById(GEOS_ID).model.color = getGEOSInView();
  } catch (error) {
    console.log("fn: loadGEOSAsset: Failure loading in GEOS 3d asset.");
  }
}

loadGEOSAsset();

function create3DTilesetDescription(gnd) {
  if (!(gnd instanceof GroundStation)) {
    console.log("fn create3DTilesetDescription: gnd parameter needs to be GroundStation class");
    return;
  }
  const description = `
    <table class="cesium-infoBox-defaultTable">
      <tbody>
        <tr><th>Id</th><td>${gnd.id}</td></tr>
        <tr><th>Location</th><td>${gnd.location}</td></tr>
        <tr><th>Longitude</th><td>${gnd.lon_deg}</td></tr>
        <tr><th>Latitude</th><td>${gnd.lat_deg}</td></tr>
      </tbody>
    </table>
  `;
  return description
}

async function loadGNDAsset(AssetID, gnd) {
  try {
    const tileset = await Cesium3DTileset.fromIonAssetId(AssetID);
    tileset.description = create3DTilesetDescription(gnd);
    viewer.scene.primitives.add(tileset);
  } catch (error) {
    console.log(error);
  }
}

await loadGNDAsset(process.env.WEBPACK_DOUALA_GND_ASSET_ID, GND_DOUALA);
await loadGNDAsset(process.env.WEBPACK_SINGAPORE_GND_ASSET_ID, GND_SINGAPORE);

// allow user to switch between looking from satellite view and at ground station
function lemur2zenith() {
  const orientation = new Cartesian3(0,0,-1000)
  viewer.trackedEntity = lemurSatEntity;
  viewer.trackedEntity.viewFrom = orientation;
}
function viewGNDSingapore() {
  viewer.trackedEntity = null;
  viewer.camera.lookAt(
    Cartesian3.fromDegrees(103.82,1.35),
    new Cartesian3(0.0, -1500.0, 1200.0)
)
}
function viewGNDDouala() {
  viewer.trackedEntity = null;
  viewer.camera.lookAt(
    Cartesian3.fromDegrees(10.1, 4.84),
    new Cartesian3(0.0, -1500.0, 1200.0)
  )
}
function geosView() {
  viewer.trackedEntity = geosSatEntity;
}

function getCorners(ECIposn, time) {
  // Get the view width and height
  const FOVrad = degrees2radians(FAINTSTAR2_FOV_DEG);
  const distance = Math.tan(FOVrad * 0.5) * VIEW_HEIGHT_M; 

  // get conversion matrix from eci to ecef
  const eci2ecef = Transforms.computeIcrfToFixedMatrix(time);
  const ecef2eci = Transforms.computeFixedToIcrfMatrix(time);

  // Calculate satellite's ecef position
  const ECEFposn = Matrix3.multiplyByVector(
    eci2ecef, ECIposn, new Cartesian3()
  );

  // get conversion matrix from ecef to enu
  const enu2ecef = Transforms.eastNorthUpToFixedFrame(ECEFposn);
  const ecef2enu = Matrix4.inverse(enu2ecef, new Matrix4());

  // Calculate the satellite's position in enu
  const ENUposn = Matrix4.multiplyByPoint(
    ecef2enu, ECEFposn, new Cartesian3()
  );

  // calculate 4 corners positions using satellites enu position
  const cornerNE = new Cartesian3(
    ENUposn.x + distance, // E
    ENUposn.y + distance, // N
    ENUposn.z + VIEW_HEIGHT_M // U
  );
  const cornerSE = new Cartesian3(
    ENUposn.x + distance, // E
    ENUposn.y - distance, // N
    ENUposn.z + VIEW_HEIGHT_M // U
  );
  const cornerSW = new Cartesian3(
    ENUposn.x - distance, // E
    ENUposn.y - distance, // N
    ENUposn.z + VIEW_HEIGHT_M // U
  );
  const cornerNW = new Cartesian3(
    ENUposn.x - distance, // E
    ENUposn.y + distance, // N
    ENUposn.z + VIEW_HEIGHT_M // U
  );

  // convert 4 corners into ecef then eci
  const cornerNEecef = Matrix4.multiplyByPoint(
    enu2ecef, cornerNE, new Cartesian3()
  );
  const cornerSEecef = Matrix4.multiplyByPoint(
    enu2ecef, cornerSE, new Cartesian3()
  );
  const cornerSWecef = Matrix4.multiplyByPoint(
    enu2ecef, cornerSW, new Cartesian3()
  );
  const cornerNWecef = Matrix4.multiplyByPoint(
    enu2ecef, cornerNW, new Cartesian3()
  );

  const cornerNEeci = Matrix3.multiplyByVector(
    ecef2eci, cornerNEecef, new Cartesian3()
  );
  const cornerSEeci = Matrix3.multiplyByVector(
    ecef2eci, cornerSEecef, new Cartesian3()
  );
  const cornerSWeci = Matrix3.multiplyByVector(
    ecef2eci, cornerSWecef, new Cartesian3()
  );
  const cornerNWeci = Matrix3.multiplyByVector(
    ecef2eci, cornerNWecef, new Cartesian3()
  );

  return [
    new Cartesian3(cornerNEeci.x, cornerNEeci.y, cornerNEeci.z),
    new Cartesian3(cornerSEeci.x, cornerSEeci.y, cornerSEeci.z),
    new Cartesian3(cornerSWeci.x, cornerSWeci.y, cornerSWeci.z),
    new Cartesian3(cornerNWeci.x, cornerNWeci.y, cornerNWeci.z),
  ]
}

function createCameraGeomitry() {
  // Get the satellites position and calculate the view corners
  // Create the view square
  const viewObject = [];
  const viewPolygon = viewer.entities.add({
    polygon: {
      hierarchy:new CallbackProperty((time) => {
          const posn = lemurSatEntity.position.getValue(time);
          if (!posn) return undefined;
          const corners = getCorners(posn, time)
          return new PolygonHierarchy(corners)
        }, false),
      perPositionHeight: true,
      material: Color.GREEN.withAlpha(0.2),
      outline: true,
      outlineColor: Color.WHITE
    }
  });
  viewObject.push(viewPolygon);

  for (let i = 0; i < 4; i++){
    let polylineEntity = viewer.entities.add({
      name: "North East polyline edge",
      polyline: {
        positions: new CallbackProperty((time) => {
          const lemurposn = lemurSatEntity.position.getValue(time);
          const viewPolygonPosn = viewPolygon.polygon.hierarchy.getValue(
            time
          );
          return [
            lemurposn, // Cartesian3
            viewPolygonPosn.positions[i] // Cartesian3
          ];
        }, false),
        material: Color.GREEN
      }
    });
    viewObject.push(polylineEntity);
  }
  return viewObject;
}
const viewObject = createCameraGeomitry();
let viewObjIsVis = true;

function toggleCameraGeomitry() {
  for (let i = 0; i < viewObject.length; i ++) {
    viewObject[i].show = !viewObjIsVis;
  }
  viewObjIsVis = !viewObjIsVis;
}

const viewPoint = {
  "lemur-view": lemur2zenith,
  "geos-view": geosView,
  "douala-gnd": viewGNDDouala,
  "singapore-gnd": viewGNDSingapore
};
function setViewPoint(view) {
  viewPoint[view]();
}
document.getElementById("toggle-camera-view").addEventListener(
  "click",
  () => {
    toggleCameraGeomitry();
  }
)

const selectionElement = document.querySelector("#selectionView");
selectionElement.addEventListener("change", (event) => {
  toggleViews(event.target.value);
})

function toggleViews(event) {
  // const selectionView = document.getElementById("selectionView").value;
  if (event == "lemur") {
    setViewPoint("lemur-view"); 
  } else if (event == "geos") {
    setViewPoint("geos-view");
  } else if (event == "singapore") {
    setViewPoint("douala-gnd");
  } else if (event == "douala") {
    setViewPoint("singapore-gnd");
  }
}

