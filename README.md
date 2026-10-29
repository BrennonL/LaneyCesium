# Introduction

Many Satellites utilized AI models for filtering out repetative data, allowing scientists and engineers to focus on mission critical information. There are two options for these models; they could either be trained on Earth on synthetic data or in space. My goal is to utilize synthetic data of satellites obvserving the Earth and other satellites, to train these models. For the purpose of the Cesium certificate I produced a simulation of two satellites showcasing field of view and downlink connections.

A simulated geocentric lemur satellite with a FaintStar2 camera (FOV angle 
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

2. Create a `.env` file in the [current directory](./). Copy and paste the
following contents into that file:

```.env
WEBPACK_CESIUM_ION_TOKEN="..."

# 3D assets
WEBPACK_CUBE_SAT_ASSET_ID=<3u_cubesat asset id>
WEBPACK_GEOS_SAT_ASSET_ID=<GOES-R asset id>

# Tilesets
WEBPACK_DOUALA_GND_ASSET_ID=<douala_cameroon_lemur_gnd asset id>
WEBPACK_SINGAPORE_GND_ASSET_ID=<singapore_singapore_lemur_gnd>
WEBPACK_OSM_BUILDINGS_TILESET_ID=<Cesium OSM Buildings asset id>

```

Then fill in the place holders with your specified Cesium Ion
information. The asset ids come from the 3d models you dowloaded in the
previous step. OSM buildings are included in all Cesium Ion accounts.
If it isn't, search it in Asset Depot and download it.

3. Ensure that you have Cesium's node_modules by running:

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

# Project Architecture

In the [current directory](./) there is the [czml](./czml/) which contains the
czml file generated for this project. The project's src contents are divided 
into 3 parts: 
[`cesiumIon`](./src/cesiumIon/), [`scene`](./src/scene/), and 
[`utilities`](./src/utilities/). Within each folder there is a README.md 
providing more detail about the folder's contents. These all feed into the [`index.js`](./src/index.js) and [`index.html`](./src/index.html) files.

```bash
src
├── cesiumIon
│   └── loaders.js
├── css
│   └── main.css
├── index.html
├── index.js
├── scene
│   ├── utilities.js
│   └── view.js
└── utilities
    └── utilities.js
```

# Sources
- [Webpack and Cesium Ion](https://cesium.com/blog/2024/02/13/configuring-vite-or-webpack-for-cesiumjs/)
- [Lemur Ground Station Locations](https://zenodo.org/records/5102738?preview_file=groundstation_locations_Spire.csv)