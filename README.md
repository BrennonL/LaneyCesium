# Introduction

A simulated geocentric lemur satellite with a FaintStar2 camera (with a FOV angle 
of $5.5 \degree \times 5.5 \degree$) monitoring in the zenith direction. When 
the satellite GEOS 14 falls into view of the lemur satellite it is highlighted 
in green. The ground stations in Douala and Singapore added and view can switch
between the ground stations and the satellites.

## CZML and pyCote
The czml file located in the [czml](./czml/lemur-GEOS.czml) folder was generated
using [pyCote](https://github.com/starbelt/pyCote) (a python satellite simulator).
This simulation calculated when the GEOS satellite was in view and out of view
of the lemur's camera. It did this by converting the lemur eci coordinate into 
NED (North, East, Down) and the GEOS satellite into NED with respect to the 
lemur satellite. Then utilizing triginomitry, the GEOS's angle with respect to
lemur's zenith was calculated. It logged when this angle was smaller than the 
FaintStar2 camera FOV.

# Usage

## Initialization
1. Download the 4 3d model zip files from my repository 
[cesium assets](https://github.com/BrennonL/cesiumAssets) and follow the 
download instructions listed on the `README.md` file.


2. Ensure that you have Cesium's node_modules by running:

```bash
npm run build
```

Then start the program with:

```bash
npm start
```

## Interactions
In the top left corner of the screen there should be a selection list and a button called
`Toggle View`. The selection changes the view of the application between the
satellites and ground stations. The `Toggle View` button turns on and off the 
pyramid geomitry above the lemur satellite showing the FaintStar FOV.


# Sources
- [Webpack and Cesium Ion](https://cesium.com/blog/2024/02/13/configuring-vite-or-webpack-for-cesiumjs/)
- [Lemur Ground Station Locations](https://zenodo.org/records/5102738?preview_file=groundstation_locations_Spire.csv)