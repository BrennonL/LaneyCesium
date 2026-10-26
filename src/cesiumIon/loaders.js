import {
  IonResource,
  CallbackProperty,
  Color,
  Cesium3DTileset,
} from "cesium";
import {
  GroundStation
} from "../utilities/utilities.js";

function getGEOSInView(inViewProperty, viewer) {
  return new CallbackProperty(() => {
    const time = viewer.clock.currentTime;
    const isInView = inViewProperty.properties.isVisible.getValue(time);
    if (isInView == true) {
      return Color.GREEN;
    } else {
      return null;
    }
  }, false);
}

export async function loadGEOSAsset(geosSatEntity, inViewProperty, viewer) {
  try {
    const geosIonResource = await IonResource.fromAssetId(
      process.env.WEBPACK_GEOS_SAT_ASSET_ID
    );
    geosSatEntity.model.uri = geosIonResource;
    geosSatEntity.model.scale = 10.0;
    geosSatEntity.model.color = getGEOSInView(inViewProperty, viewer);
  } catch (error) {
    console.log("fn: loadGEOSAsset: Failure loading in GEOS 3d asset.");
  }
}

export async function loadLemurAsset(lemurSatEntity) {
  try {
    const lemurIonResource = await IonResource.fromAssetId(
      process.env.WEBPACK_CUBE_SAT_ASSET_ID
    );
    lemurSatEntity.model.uri = lemurIonResource;
    lemurSatEntity.model.scale = 10.0;
  } catch (error) {
    console.log("fn: loadLemurAsset: Failure loading in cubesat 3d asset: ", error);
  }
}


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

export async function loadGNDAsset(AssetID, gnd, viewer) {
  try {
    const tileset = await Cesium3DTileset.fromIonAssetId(AssetID);
    tileset.description = create3DTilesetDescription(gnd);
    viewer.scene.primitives.add(tileset);
  } catch (error) {
    console.log(error);
  }
}