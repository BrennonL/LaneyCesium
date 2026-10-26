export const VIEW_HEIGHT_M = 1000.0;
export const FAINTSTAR2_FOV_DEG = 5.5;

export class GroundStation {
  constructor(location, id, lat, lon) {
    this.location = location
    this.id = id
    this.lat_deg = lat // degrees
    this.lon_deg = lon // degrees
  }
}

export function degrees2radians(degree) {
  return degree * (Math.PI / 180)
}
