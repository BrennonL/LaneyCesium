import {
  CallbackProperty,
  Cartesian3,
  Cesium3DTileFeature,
  Color,
  Matrix3,
  Matrix4,
  Transforms,
  PolygonHierarchy,
} from "cesium";
import {
  degrees2radians,
  VIEW_HEIGHT_M, FAINTSTAR2_FOV_DEG
} from "../utilities/utilities.js"


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


export function createCameraGeomitry(satEntity, viewer) {
  // Get the satellites position and calculate the view corners
  // Create the view square
  const viewObject = [];
  const viewPolygon = viewer.entities.add({
    polygon: {
      hierarchy:new CallbackProperty((time) => {
          const posn = satEntity.position.getValue(time);
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
          const lemurposn = satEntity.position.getValue(time);
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


export function toggleCameraGeomitry(viewObjIsVis, viewObject) {
  for (let i = 0; i < viewObject.length; i ++) {
    viewObject[i].show = !viewObjIsVis;
  }
  viewObjIsVis = !viewObjIsVis;
}


export function createPickedFeatureDescription(pickedFeature) {
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