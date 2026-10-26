import {
  Cartesian3
} from "cesium";


function lemur2zenith(viewer, geosSatEntity, lemurSatEntity) {
  const orientation = new Cartesian3(0,0,-1000)
  viewer.trackedEntity = lemurSatEntity;
  viewer.trackedEntity.viewFrom = orientation;
}
function viewGNDSingapore(viewer, geosSatEntity, lemurSatEntity) {
  viewer.trackedEntity = null;
  viewer.camera.lookAt(
    Cartesian3.fromDegrees(103.82,1.35),
    new Cartesian3(0.0, -1500.0, 1200.0)
)
}
function viewGNDDouala(viewer, geosSatEntity, lemurSatEntity) {
  viewer.trackedEntity = null;
  viewer.camera.lookAt(
    Cartesian3.fromDegrees(10.1, 4.84),
    new Cartesian3(0.0, -1500.0, 1200.0)
  )
}
function geosView(viewer, geosSatEntity, lemurSatEntity) {
  viewer.trackedEntity = geosSatEntity;
}

function setViewPoint(view, viewer, geosSatEntity, lemurSatEntity) {
  const viewPoint = {
  "lemur-view": lemur2zenith,
  "geos-view": geosView,
  "douala-gnd": viewGNDDouala,
  "singapore-gnd": viewGNDSingapore
  };

  viewPoint[view](viewer, geosSatEntity, lemurSatEntity);
}

export function toggleViews(event, viewer, geosSatEntity, lemurSatEntity) {
  // const selectionView = document.getElementById("selectionView").value;
  if (event == "lemur") {
    setViewPoint("lemur-view", viewer, geosSatEntity, lemurSatEntity); 
  } else if (event == "geos") {
    setViewPoint("geos-view", viewer, geosSatEntity, lemurSatEntity);
  } else if (event == "singapore") {
    setViewPoint("singapore-gnd", viewer, geosSatEntity, lemurSatEntity);
  } else if (event == "douala") {
    setViewPoint("douala-gnd", viewer, geosSatEntity, lemurSatEntity);
  }
}