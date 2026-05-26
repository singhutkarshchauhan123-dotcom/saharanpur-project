
const BASE_URL_DSS = `${BASE_URL_All}:8060/Lucknow_analysis`;


//---------------------- header section start --------------------------//

var map, geojson, featureOverlay, overlays, style;
var selected, features, layer_name, layerControl;
var content;
var selectedFeature;
// const london = fromLonLat([-0.12755, 51.507222]);

var view = new ol.View({
    projection: "EPSG:4326",
    center: [81.00046, 26.8269],
    zoom: 11.5,
});

var view_ov = new ol.View({
    projection: "EPSG:4326",
    center: [28.55, 77.65],
    zoom: 9,
});

var base_maps = new ol.layer.Group({
    title: "Base maps",
    layers: [
        new ol.layer.Tile({
            title: "OSM",
            type: "base",
            visible: true,
            source: new ol.source.OSM(),
        }),
        new ol.layer.Tile({
            title: "CartoDB Positron",
            type: "base",
            visible: false,
            source: new ol.source.XYZ({
                url: "https://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                attributions:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            }),
        }),
        new ol.layer.Tile({
            source: new ol.source.TileJSON({
                attributions: "@MapTiler",
                url: "https://api.maptiler.com/maps/toner-v2/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
            }),
            title: "Toner",
            type: "base",
            visible: false,
        }),

        new ol.layer.Tile({
            source: new ol.source.TileJSON({
                attributions: "@MapTiler",
                url: "https://api.maptiler.com/maps/topo-v2/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
            }),
            title: "Topo",
            type: "base",
            visible: true,
            maxZoom: 23,
        }),

        new ol.layer.Tile({
            source: new ol.source.TileJSON({
                attributions: "@MapTiler",
                url: "https://api.maptiler.com/maps/backdrop/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
            }),
            title: "Backdrop",
            type: "base",
            visible: false,
        }),

        new ol.layer.Tile({
            source: new ol.source.TileJSON({
                attributions: "@MapTiler",
                url: "https://api.maptiler.com/maps/outdoor-v2/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
            }),
            title: "Outdoor",
            type: "base",
            visible: false,
        }),
        new ol.layer.Tile({
            title: "Satellite",
            type: "base",
            visible: false,
            source: new ol.source.XYZ({
                //  attributions: ['Powered by Esri',
                //      'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
                //  ],
                attributionsCollapsible: false,
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                maxZoom: 23,
            }),
        }),
    ],
});

var OSM = new ol.layer.Tile({
    source: new ol.source.OSM(),
    type: "base",
    title: "OSM",
});

var overlays = new ol.layer.Group({
    title: "Overlays",
    layers: [],
});

map = new ol.Map({
    target: "map",
    view: view,
    // overlays: [overlay]
});

map.addLayer(base_maps);
map.addLayer(overlays);

layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: "click",
    startActive: false,
    tipLabel: "Layers", // Optional label for button
    groupSelectStyle: "children", // Can be 'children' [default], 'group' or 'none'
    collapseTipLabel: "Collapse layers",
});
map.addControl(layerSwitcher);

layerSwitcher.renderPanel();
var mouse_position = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:4326'
});
map.addControl(mouse_position);
var scale_line = new ol.control.ScaleLine({
    units: 'metric',
    bar: true,
    steps: 6,
    text: true,
    minWidth: 240,
    target: 'scale_bar'
});
map.addControl(scale_line);

//--------- Bounadries code-----//
var zone_boundary = new ol.layer.Image({
    title: "Lucknow Zone Boundary",
    //  extent: [-180, -90, -180, 90],
    source: new ol.source.ImageWMS({
        url: "http://103.15.81.74:8080/geoserver/Lko_Summary/wms?",
        params: {
            LAYERS: "Lko_Summary:lucknow_zone_boundary",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
//overlays.getLayers().push(LNN_Boundary);
map.addLayer(zone_boundary);

var ward_boundary = new ol.layer.Image({
    title: "Lucknow Ward Boundary",
    //  extent: [-180, -90, -180, 90],
    source: new ol.source.ImageWMS({
        url: "http://103.15.81.74:8080/geoserver/Lko_Summary/wms?",
        params: {
            LAYERS: "Lko_Summary:lucknow_ward_boundary",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
//overlays.getLayers().push(LNN_Boundary);
map.addLayer(ward_boundary);

//-----------------table Cancel btn----------------------------//
document.querySelectorAll('.table-cancel-btn').forEach(function (element) {
    element.addEventListener('click', function () {
        document.getElementById('undevelopedTablecontainer').style.display = 'none';
        document.getElementById('streetLightTableContainer').style.display = 'none';
        document.getElementById('EncroachmentTableContainer').style.display = 'none';
        document.getElementById('RoadMaintenanceTableContainer').style.display = 'none';
        document.getElementById("summary-table").style.display = "block";

        document.getElementById("legendContainer").style.display = "none";
        zoomToIndia();  


        //  removeCurrentLayer();
        map.getLayers().getArray().slice().forEach(layer => {
            if (layer instanceof ol.layer.Vector) {
                map.removeLayer(layer);
            }
        });
        map.getOverlays().clear();



    });
});


// ------------------------------for clear any layers------------------------------------------
document.getElementById('clear-icon').onclick = clearAllVectorLayers;

function clearAllVectorLayers() {
    // Iterate through all layers on the map
    map.getLayers().getArray().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            layer.getSource().clear(); // Clear all features from this vector layer
        }
    });

    zoomToIndia();  


    document.getElementById("undevelopedTablecontainer").style.display = "none";
    document.getElementById("EncroachmentTableContainer").style.display = "none";
    document.getElementById("RoadMaintenanceTableContainer").style.display = "none";
    document.getElementById("streetLightTableContainer").style.display = "none";
    document.getElementById("summary-table").style.display = "none";
	
    const legendBtn = document.getElementById('legendBtn');
    legendBtn.style.bottom = '3%';

    map.getLayers().getArray().slice().forEach(layer => {
        if ((layer instanceof ol.layer.Tile || layer instanceof ol.layer.Image) &&
            (layer.getSource() instanceof ol.source.TileWMS || layer.getSource() instanceof ol.source.ImageWMS)) {

            // Check if the layer is not the zone_boundary layer
            if (layer.get('title') !== 'Lucknow Zone Boundary' && layer.get('title') !== 'Lucknow Ward Boundary') {
                map.removeLayer(layer);  // Remove GeoServer WMS layers
            }
        }
    });

    location.reload(); // Refresh the page

}

function zoomToIndia() {
    const view = map.getView();

    // Define the approximate bounding box for India
    const extent = ol.proj.transformExtent(
        [80.80571758368082, 26.694260564415533 , 81.07309745111439, 26.960066642711546], // Bounding box [minX, minY, maxX, maxY] for India
        'EPSG:4326', // Projection for the coordinates
        view.getProjection() // Current map projection (usually EPSG:3857)
    );

    // Set the map's center and zoom level explicitly
    view.setCenter([ 81.00046, 26.8269]); // Set the center to the geographic center of India
    view.setZoom(11.5); // Zoom level appropriate for India view (adjust as needed)
    // Ensure the map is aligned to North with no rotation
    view.setRotation(0);

}



//------------------------------------------------------ clear vector layer ------------------------------------------------------------//
function clearVectorLayers() {
    // Create an array to hold layers that you want to preserve
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector && layer !== ReligiousVectorLayer && layer != bankVectorLayer && layer != GraveyardVectorLayer
            && layer != CarVectorLayer && layer != HospitalVectorLayer && layer != EducationVectorLayer && layer != PetrolVectorLayer
            && layer != HotelsVectorLayer && layer != StadiumVectorLayer && layer != busVectorLayer && layer != ElectricsubVectorLayer
            && layer != PostVectorLayer) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    // Clear overlays
}

//------------------------------------------------------ summary table ------------------------------------------------------------//document.addEventListener('DOMContentLoaded', function () {
let currentCardsData = [];
// // Function to dynamically add cards
function addCards(cardsData, customClass = "") {
    const cardContainer = document.getElementById('content'); // Reference to the container
    if (!cardContainer) {
        console.error('Card container not found!');
        return;
    }
    // Clear existing cards before adding new ones
    cardContainer.innerHTML = '';
    cardsData.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('card');
        if (customClass) {
            cardDiv.classList.add(customClass); // Add specific class if provided
        }
        cardDiv.setAttribute('id', `card-${index + 1}`);
        // Split description into rows
        const descriptionRows = card.description.split('<br>').map(line => {
            const parts = line.split(' - ');
            const label = parts[0] ? parts[0].trim() : ''; // Default to empty string if undefined
            const value = parts[1] ? parts[1].trim() : ''; // Default to empty string if undefined
            return `
                <div class="card-row">
                    <span class="card-label">${label}</span>
                    <span class="card-value">${value}</span>
                </div>
            `;
        }).join('');
        cardDiv.innerHTML = `
            <h3 class="card-title">${card.title}</h3>
            <div class="card-description">
                ${descriptionRows}
            </div>
        `;
        cardContainer.appendChild(cardDiv);
    });
}

// Use the modified function for "Street Light" cards:
function street_light() {
    const streetViewCards = [
        { title: "Illuminated Roads", description: `<a href="javascript:void(0)" onclick="illuminate_roads()" style="color:yellow;font-size: 23px;text-decoration:none;">5374</a>` },
        { title: "Non-Illuminated Roads", description: `<a href="javascript:void(0)" onclick="Non_illuminate_roads()" style="color:red;font-size: 23px;text-decoration:none;">1644</a>` },
        { title: "Other Roads", description: `<a href="javascript:void(0)" onclick="Other_roads()" style="color:purple;font-size: 23px;text-decoration:none;">351</a>` },
    ];
    currentCardsData = streetViewCards;
    addCards(currentCardsData, 'street-light'); // Add a unique class
    document.getElementById('summary-table').style.display = 'block'; // Show the summary table
    document.getElementById('dataTable_Encroached').style.display = 'none';
    document.getElementById('UNderdevloped_dataTable').style.display = 'none';
}


function undeveloped_zones() {
    const dataAnalysisCards = [
        {
            title: `<a href="javascript:void(0)" onclick="console.log('Clicked UnderDevelpoment Zone 1'); showZoneLayer_Developed(1);" style="color:yellow">Zone 1</a>`,
            description: ""
        },
    //     { title: " Zone 2", description: "Total Roads - 18257<br>Developed Roads - 35302<br>Developed % - 222<br> NonDeveloped Roads - 35302" },
    //     { title: " Zone 3", description: "Total Roads - 18257<br>Developed Roads - 35302<br>Developed % - 28786<br> NonDeveloped Roads - 35302" },
    //     { title: "Zone 4", description: "Total Roads - 18257<br>Developed Roads -2424<br>Developed % - 28786<br> NonDeveloped Roads - 35302" },
    //     { title: " Zone 5", description: "Total Roads - 18257<br>Developed Roads - 35302<br>Developed % - 28786<br> NonDeveloped Roads - 35302" },
    //     { title: " Zone 6", description: "Total Roads - 18257<br>Developed Roads -3442<br>Developed % - 28786<br> NonDeveloped Roads - 35302" },
    //     { title: " Zone 7", description: "Total Roads - 18257<br>Developed Roads - 35302<br>Developed % - 28786<br> NonDeveloped Roads - 35302" },
    //     { title: " Zone 8", description: "Total Roads - 18257<br>Developed Roads - 35302<br>Developed % - 222 <br> NonDeveloped Roads - 35302" },

    ];

    currentCardsData = dataAnalysisCards;
    addCards(currentCardsData); // Update cards on the page
    document.getElementById('summary-table').style.display = 'block'; // Show the summary table
    // document.getElementById('EncroachmentTableContainer').style.display = 'none';
    document.getElementById('dataTable_Encroached').style.display = 'none';
    //    document.getElementById('undevelopedTablecontainer').style.display = 'none';
    document.getElementById('UNderdevloped_dataTable').style.display = 'none';

}

//----------------------------------------------------- Road Maintenance Function -----------------------------------------------------------------------
function road_maintenance() {
    const roadFilterCards = [
        {
            title: `<a href="javascript:void(0)" onclick="console.log('Clicked Zone 1'); showZoneLayerMain(1);" style="color:white">Zone 1</a>`,
             description: ""
              },
                      
    ];
    currentCardsData = roadFilterCards;
    addCards(currentCardsData); // Update cards on the page
    document.getElementById('summary-table').style.display = 'block'; // Show the summary table
    document.getElementById('dataTable_Encroached').style.display = 'none';
    document.getElementById('UNderdevloped_dataTable').style.display = 'none';
}


function encroachment() {
    const roadFilterCards = [
        {
            title: `<a href="javascript:void(0)" onclick="console.log('Clicked Zone 1'); showZoneLayer(1);" style="color:yellow">Zone 1</a>`,
            description: ""
        },

    ];
    currentCardsData = roadFilterCards;
    addCards(currentCardsData); // Update cards on the page
    document.getElementById('summary-table').style.display = 'block'; // Show the summary table
    document.getElementById('dataTable_Encroached').style.display = 'none';
    document.getElementById('UNderdevloped_dataTable').style.display = 'none';
}

//----------------------------------road maintenance data -----------------------
function Show_AllLayer_Devloped() {
    console.log("aaaa");
    removeCurrentLayer();
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    currentLayer = new ol.layer.Image({
        //   title: 'Ward Boundary',
        //     extent: [-180, -90, -180, 90],
        source: new ol.source.ImageWMS({
            url: 'http://103.15.81.74:8080/geoserver/Lko_Summary/wms',
            params: {
                'LAYERS': 'Lko_Summary:lko_data_dss_DEV',

            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });
    // updateNavBarWithFunctionName("Road Count - 82354");
    //overlays.getLayers().push(LNN_Ward_Boundary);
    map.addLayer(currentLayer);
}
//---------------------------------- Function is for showing the Layer of Road Maintenance ---------------------------------------------------------------
function Show_AllLayer_Maintenance() {
    console.log("aaaa");
    removeCurrentLayer();
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    currentLayer = new ol.layer.Image({
        //   title: 'Ward Boundary',
        //     extent: [-180, -90, -180, 90],
        source: new ol.source.ImageWMS({
            url: 'http://103.15.81.74:8080/geoserver/Lko_Summary/wms',
            params: {
                'LAYERS': 'Lko_Summary:lko_data_dss_Maintainance',

            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });
    // updateNavBarWithFunctionName("Road Count - 82354");
    //overlays.getLayers().push(LNN_Ward_Boundary);
    map.addLayer(currentLayer);
}

function showZoneLayerMain(zoneNo) {

    removeCurrentLayer();
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    // Fetch data for the specific zone
    fetch(`${BASE_URL_DSS}/getLkoDataDssMaintenance?zone_no=${zoneNo}`) // Replace with your API URL
        .then(response => response.json())
        .then(data => {
            if (data.status && data.data) {
                // Create a WKT parser
                const wktParser = new ol.format.WKT();

                 // // Parse the WKT geometries into OpenLayers features
                 const features = data.data.map(item => {
                    return wktParser.readFeature(item.geom_wkt, {
                        dataProjection: 'EPSG:4326', // Input projection of the WKT
                        featureProjection: 'EPSG:4326', // Map projection
                    });

                    // feature.set('developed', item.developed);
                    // return feature;
                });

                // Create a vector source and layer for the zone
                const vectorSource = new ol.source.Vector({
                    features: features,
                });


                // Zoom to the layer extent
                const extent = vectorSource.getExtent();
                map.getView().fit(extent, { duration: 1000, maxZoom: 16 });
                populateTable_Main(data.data);
            } else {
                console.error('Error fetching layer data: ', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching zone layer: ', error);
        });
}



function populateTable_Main(data) {
    if (!dataTableBody_RoadMaintenance) {
        console.error('Table body not found!');
        return;
    }

    // Clear the existing table content
    dataTableBody_RoadMaintenance.innerHTML = '';
    featureToRowMap.clear();  // Clear feature-row mapping


    // Check if 'data' is an array before iterating
    if (Array.isArray(data)) {
        data.forEach(item => {
            console.log('Adding row:', item);
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${item.road_id || 'N/A'}</td>
                        <td>${item.zone_no || 'N/A'}</td>
                        <td>${item.ward_no || 'N/A'}</td>
                        <td>${item.ward_name || 'N/A'}</td>
                        <td>${item.road_name || 'N/A'}</td>
                        <td>${item.type || 'N/A'}</td>
                        <td>${item.condition || 'N/A'}</td>
                        <td>${item.carriage_m || 'N/A'}</td>
                        <td>${item.ownership || 'N/A'}</td>
                        <td>${item.row_meter || 'N/A'}</td>
                        <td>${item.row_as_per || 'N/A'}</td>
                        <td>${item.length_km || 'N/A'}</td>
                        <td>${item.yoc || 'N/A'}</td>
                        <td>${item.amenities || 'N/A'}</td>
                         <td>${item.maintainance || 'N/A'}</td>
                      
          `;
            dataTableBody_RoadMaintenance.appendChild(row);
            //        // Assign a unique ID to the feature



            row.addEventListener('click', function () {
                if (item.geom_wkt) {
                    zoomToRoadFeature(item.geom_wkt);  // Zoom to the road and highlight it
                    highlightAndScrollToRow(row);      // Highlight the clicked row
                }
            });

            // Add feature to the map and associate it with the row
            if (item.geom_wkt) {
                const feature = addMultilinestringFeatureFromWKT_Maintenance(item.geom_wkt, item.maintainance);

                const featureId = feature.getId();
                featureToRowMap.set(featureId, row);
            }
        });
    } else {
        console.error('Expected an array but received:', data);
    }
    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('EncroachmentTableContainer').style.display = 'none';
    document.getElementById('dataTable_Encroached').style.display = 'none';
    document.getElementById('undevelopedTablecontainer').style.display = 'none';
    document.getElementById('RoadMaintenanceTableContainer').style.display = 'block';
    document.getElementById('dataTable_RoadMaintenance').style.display = 'block';
    document.getElementById('dataTable_StreetLight').style.display = 'none';
    updateLegend("Road Maintenance");

}




//---------------------------------------------------- encroachment --------------------------------------------------------
let zoneLayer = null; // Variable to hold the current zone layer

//-------------------------- Encroachment -----------------------------------

function showZoneLayer(zoneNo) {

    removeCurrentLayer();
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    // Fetch data for the specific zone
    fetch(`${BASE_URL_DSS}/getLkoEncroachmentGeom?zone_no=${zoneNo}`) // Replace with your API URL
        .then(response => response.json())
        .then(data => {
            if (data.status && data.data) {
                // Create a WKT parser
                const wktParser = new ol.format.WKT();

                // Parse the WKT geometries into OpenLayers features
                const features = data.data.map(item => {
                    return wktParser.readFeature(item.geom_wkt, {
                        dataProjection: 'EPSG:4326', // Input projection of the WKT
                        featureProjection: 'EPSG:4326', // Map projection
                    });
                });

                // Create a vector source and layer for the zone
                const vectorSource = new ol.source.Vector({
                    features: features,
                });

                zoneLayer = new ol.layer.Vector({
                    source: vectorSource,
                    style: new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'blue',
                            width: 4,
                        }),
                    }),
                });

                // Add the layer to the map
                map.addLayer(zoneLayer);

                // Zoom to the layer extent
                const extent = vectorSource.getExtent();
                map.getView().fit(extent, { duration: 1000, maxZoom: 16 });
                populateTable_En(data.data);
            } else {
                console.error('Error fetching layer data: ', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching zone layer: ', error);
        });
}

// const featureToRowMap = new Map(); // Map to link features to table rows
// const rowToFeatureMap = new Map(); // Map to link rows to features

function populateTable_En(data) {
    //  const dataTableBody_UnderDeveloped = document.getElementById('dataBody_UnderDevelopment');
    if (!dataTableBody_Encroached) {
        console.error('Table body not found!');
        return;
    }

    // Clear the existing table content
    dataTableBody_Encroached.innerHTML = '';
    featureToRowMap.clear();  // Clear feature-row mapping


    // Check if 'data' is an array before iterating
    if (Array.isArray(data)) {
        data.forEach(item => {
            console.log('Adding row:', item);
            const row = document.createElement('tr');
            row.innerHTML = `
                      <td>${item.road_id || 'N/A'}</td>
                      <td>${item.zone_no || 'N/A'}</td>
                      <td>${item.ward_no || 'N/A'}</td>
                      <td>${item.ward_name || 'N/A'}</td>
                      <td>${item.ownership || 'N/A'}</td>
                      <td>${item.type || 'N/A'}</td>
                      <td>${item.road_name || 'N/A'}</td>
                      <td>${item.row_meter || 'N/A'}</td>
                      <td>${item.row_as_per || 'N/A'}</td>
                      <td>${item.carriage_m || 'N/A'}</td>
                      <td>${item.length_km || 'N/A'}</td>
                      <td>${item.condition || 'N/A'}</td>
                      <td>${item.yoc || 'N/A'}</td>
                      <td>${item.encroachme || 'N/A'}</td>
                     
                  `;
            dataTableBody_Encroached.appendChild(row);
            //        // Assign a unique ID to the feature



            row.addEventListener('click', function () {
                if (item.geom_wkt) {
                    zoomToRoadFeature(item.geom_wkt);  // Zoom to the road and highlight it
                    highlightAndScrollToRow(row);      // Highlight the clicked row
                }
            });

            if (item.geom_wkt) {
                const feature = addMultilinestringFeatureFromWKT_StreetLight(item.geom_wkt, item.encroachme);

                const featureId = feature.getId();
                featureToRowMap.set(featureId, row);
            }
        });
    } else {
        console.error('Expected an array but received:', data);
    }
    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('EncroachmentTableContainer').style.display = 'block';
    document.getElementById('dataTable_Encroached').style.display = 'block';
    document.getElementById('undevelopedTablecontainer').style.display = 'none';
    document.getElementById('dataTable_RoadMaintenance').style.display = 'none';
    document.getElementById('dataTable_StreetLight').style.display = 'none';
    updateLegend("Encroachment");


}



//--------------------------------------------------- showing the layer of underdevelopement -----------------------------

//-------------------------------------- Developed Data ------------------------------
function showZoneLayer_Developed(zoneNo) {
    removeCurrentLayer();
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    // Fetch data for the specific zone
    fetch(`${BASE_URL_DSS}/getLkoUnderDevelopmentGeom?zone_no=${zoneNo}`) // Replace with your API URL
        .then(response => response.json())
        .then(data => {
            if (data.status && data.data) {
                // Create a WKT parser
                const wktParser = new ol.format.WKT();

                // // Parse the WKT geometries into OpenLayers features
                const features = data.data.map(item => {
                    const feature = wktParser.readFeature(item.geom_wkt, {
                        dataProjection: 'EPSG:4326', // Input projection of the WKT
                        featureProjection: 'EPSG:4326', // Map projection
                    });

                    feature.set('developed', item.developed);
                    return feature;
                });

                // Create a vector source and layer for the zone
                const vectorSource = new ol.source.Vector({
                    features: features,
                });

                const extent = vectorSource.getExtent();
                map.getView().fit(extent, { duration: 1000, maxZoom: 16 });

                populateTable(data.data);

            } else {
                console.error('Error fetching layer data: ', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching zone layer: ', error);
        });
}

function populateTable(data) {
    //  const dataTableBody_UnderDeveloped = document.getElementById('dataBody_UnderDevelopment');
    if (!dataTableBody_UnderDeveloped) {
        console.error('Table body not found!');
        return;
    }

    // Clear the existing table content
    dataTableBody_UnderDeveloped.innerHTML = '';
    featureToRowMap.clear();  // Clear feature-row mapping


    // Check if 'data' is an array before iterating
    if (Array.isArray(data)) {
        data.forEach(item => {
            console.log('Adding row:', item);
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${item.road_id || 'N/A'}</td>
                    <td>${item.zone_no || 'N/A'}</td>
                    <td>${item.ward_no || 'N/A'}</td>
                    <td>${item.ward_name || 'N/A'}</td>
                    <td>${item.type || 'N/A'}</td>
                    <td>${item.road_name || 'N/A'}</td>
                    <td>${item.row_meter || 'N/A'}</td>
                    <td>${item.row_as_per || 'N/A'}</td>
                    <td>${item.carriage_m || 'N/A'}</td>
                    <td>${item.length_km || 'N/A'}</td>
                    <td>${item.condition || 'N/A'}</td>
                    <td>${item.yoc || 'N/A'}</td>
                    <td>${item.developed || 'N/A'}</td>
                `;
            dataTableBody_UnderDeveloped.appendChild(row);
            row.addEventListener('click', function () {
                if (item.geom_wkt) {
                    zoomToRoadFeature(item.geom_wkt);  // Zoom to the road and highlight it
                    highlightAndScrollToRow(row);      // Highlight the clicked row
                }
            });

            // Add feature to the map and associate it with the row
            if (item.geom_wkt) {
                const feature = addMultilinestringFeatureFromWKT_Devloped(item.geom_wkt, item.developed);

                const featureId = feature.getId();
                featureToRowMap.set(featureId, row);
            }
        });
    } else {
        console.error('Expected an array but received:', data);
    }



    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('undevelopedTablecontainer').style.display = 'block';
    document.getElementById('UNderdevloped_dataTable').style.display = 'block';
    document.getElementById('EncroachmentTableContainer').style.display = 'none';
    document.getElementById('dataTable_RoadMaintenance').style.display = 'none';
    document.getElementById('dataTable_StreetLight').style.display = 'none';
    updateLegend("Underdeveloped Zones");

}

//----------------------------------------------------------------------------------------------------------------------------------    


// Function to toggle the visibility of the summary table
function toggleSummaryTable() {
    const summaryTable = document.getElementById('summary-table');
    summaryTable.style.display = (summaryTable.style.display === 'none' || summaryTable.style.display === '') ? 'flex' : 'none';

    document.getElementById('undevelopedTablecontainer').style.display = 'none';
  //  document.getElementById('UNderdevloped_dataTable').style.display = 'none';
    document.getElementById('EncroachmentTableContainer').style.display = 'none';
    document.getElementById('RoadMaintenanceTableContainer').style.display = 'none';
    document.getElementById('streetLightTableContainer').style.display = 'none';

    document.getElementById('legendContainer').style.display = 'none';

}

// Placeholder functions for minimize, maximize, and close

function closeNav() {
    const summaryTable = document.getElementById('summary-table');
    summaryTable.style.display = 'none';

    document.getElementById('legendContainer').style.display = 'none';

    // document.getElementById('legendContainer').style.bottom = '1%';
}






function addMultilinestringFeatureFromWKT_Maintenance(wktString, maintainance) {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wktString, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326'
    });

    // Determine color based on priority  
    let color;
   
    switch (maintainance) {
        case 7:
            color = 'purple'; // Critical maintenance levels
            break;
        case 6:
            color = '#dc143c'; // Critical maintenance levels
            break;
        case 5:
            color = '#ff8c00'; // Critical maintenance levels
            break;
        case 4:
            color = '#ff0700'; // Critical maintenance levels
            break;
        case 3:
            color = '#228822'; // Moderate maintenance levels
            break;
        case 2:
            color = '#1e90ff'; // Critical maintenance levels
            break;
        case 1:
            color = '#808080'; // Critical maintenance levels
            break;
        case 0:
            color = '#808080'; // Low maintenance levels
            break;
        default:
            color = 'pink'; // Default/fallback color in case of unexpected values
    }

    const vectorSource = new ol.source.Vector({
        features: [feature]
    });

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: 1.5
            })
        })
    });

    // Assign a unique ID to the feature using its GIS ID
    const featureId = `feature-${Math.random().toString(36).substr(2, 9)}`;
    feature.setId(featureId);

    map.addLayer(vectorLayer);

    return feature;
}

// Function to add a multiline string feature with priority styling
function addMultilinestringFeatureFromWKT_StreetLight(wktString, Street) {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wktString, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326'
    });

    // Determine color based on priority  
    let color;
    switch (Street) {
        case 'Illuminated':
            color = 'yellow';
            break;
        case 'Non Illuminated':
            color = 'red';
            break;
        case 'Others':
            color = 'purple';
            break;

        default:
            color = 'grey'; // Default color
    }

    const vectorSource = new ol.source.Vector({
        features: [feature]
    });

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: 2
            })
        })
    });

    // Assign a unique ID to the feature using its GIS ID
    const featureId = `feature-${Math.random().toString(36).substr(2, 9)}`;
    feature.setId(featureId);

    map.addLayer(vectorLayer);

    return feature;
}

// Function to add a multiline string feature with priority styling
function addMultilinestringFeatureFromWKT_Devloped(wktString, developed) {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wktString, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326'
    });

    // Determine color based on priority  
    let color;
    switch (developed) {
        case 'Developed':
            color = 'green';
            break;
        case 'Under Developed':
            color = 'orange';
            break;
        case 'Non Developed':
            color = 'red';
            break;

        default:
            color = 'grey'; // Default color
    }

    const vectorSource = new ol.source.Vector({
        features: [feature]
    });

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: 2
            })
        })
    });

    // Assign a unique ID to the feature using its GIS ID
    const featureId = `feature-${Math.random().toString(36).substr(2, 9)}`;
    feature.setId(featureId);

    map.addLayer(vectorLayer);

    return feature;
}



// function addMultilinestringFeatureFromWKT_Encroachment(wktString,) {
//     //  function addMultilinestringFeatureFromWKT_bear(wktString) {
//     const format = new ol.format.WKT();
//     const feature = format.readFeature(wktString, {
//         dataProjection: 'EPSG:4326',
//         featureProjection: 'EPSG:4326'
//     });

//     // Set a dark color and thick width
//     const vectorSource = new ol.source.Vector({
//         features: [feature]
//     });

//     const vectorLayer = new ol.layer.Vector({
//         source: vectorSource,
//         style: new ol.style.Style({
//             stroke: new ol.style.Stroke({
//                 color: 'Yellow', // Dark color (almost black)
//                 width: 10 // Thick stroke width
//             })
//         })
//     });


//     // Assign a unique ID to the feature using its GIS ID
//     const featureId = `feature-${Math.random().toString(36).substr(2, 9)}`;
//     feature.setId(featureId);

//     map.addLayer(vectorLayer);

//     return feature;
// }

// Define the style for the highlighted road feature
const highlightedStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: 'blue',  // Highlight color
        width: 7        // Stroke width for visibility
    })
});

let previouslyHighlightedFeature = null;
let previouslyHighlightedLayer = null;

// Function to zoom and highlight the road feature
function zoomToRoadFeature(wkt) {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wkt, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.getView().getProjection()
    });

    // Get the feature's extent and fit the map view to it
    const extent = feature.getGeometry().getExtent();
    map.getView().fit(extent, {
        duration: 1000, // Animation duration
        maxZoom: 18     // Maximum zoom level
    });

    // Remove the highlight from the previous feature if it exists
    if (previouslyHighlightedFeature && previouslyHighlightedLayer) {
        previouslyHighlightedFeature.setStyle(null);  // Reset style
        previouslyHighlightedLayer.getSource().removeFeature(previouslyHighlightedFeature); // Remove old feature from layer
        map.removeLayer(previouslyHighlightedLayer);  // Remove the previous layer from the map
    }

    // Apply the highlighted style to the new feature
    feature.setStyle(highlightedStyle);

    // Create a new vector source and layer to add the feature
    const vectorSource = new ol.source.Vector({
        features: [feature]
    });

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });

    // Add the vector layer to the map
    map.addLayer(vectorLayer);

    // Store the current feature and layer for future reference
    previouslyHighlightedFeature = feature;
    previouslyHighlightedLayer = vectorLayer;
}

// Function to highlight and scroll to the clicked table row
function highlightAndScrollToRow(row) {
    console.log("Highlighting and scrolling to row: ", row);

    // Remove highlight class from all rows
    Array.from(dataTableBody_StreetLight.querySelectorAll('tr')).forEach(tr => {
        tr.classList.remove('highlighted');
    });
    Array.from(dataTableBody_UnderDeveloped.querySelectorAll('tr')).forEach(tr => {
        tr.classList.remove('highlighted');
    });

    Array.from(dataTableBody_RoadMaintenance.querySelectorAll('tr')).forEach(tr => {
        tr.classList.remove('highlighted');
    });

    Array.from(dataTableBody_Encroached.querySelectorAll('tr')).forEach(tr => {
        tr.classList.remove('highlighted');
    });




    // Add highlight class to the clicked row
    row.classList.add('highlighted');

    // Scroll the row into view with smooth scrolling behavior
    row.scrollIntoView({
        behavior: 'smooth',  // Smooth scrolling
        block: 'center',     // Center the row in the view
        inline: 'nearest'    // Nearest inline
    });

    console.log("Row scrolled into view.");
}

// Add CSS to highlight the row
const styleElement = document.createElement('style');
styleElement.innerHTML = `
    tr.highlighted {
        background-color: yellow !important;
        color: red !important;
        z-index: 2001;
    }
`;
document.head.appendChild(styleElement);

// Create a map to associate features with table rows
const featureToRowMap = new Map();

// Add interaction for clicking on road features
const selectInteraction = new ol.interaction.Select({
    condition: ol.events.condition.click,
    layers: layer => layer instanceof ol.layer.Vector,
    // style: null

});

map.addInteraction(selectInteraction);
selectInteraction.on('select', function (e) {
    if (e.selected.length > 0) {
        const selectedFeature = e.selected[0];
        const featureId = selectedFeature.getId();  // Ensure feature has a valid ID
        console.log("Selected feature ID:", featureId);

        const associatedRow = featureToRowMap.get(featureId);
        console.log("Associated row:", associatedRow);

        if (associatedRow) {
            highlightAndScrollToRow(associatedRow); // Highlight the row
        } else {
            console.warn("No associated row found for the selected feature.");
        }
    } else {
        console.log("No feature selected.");
    }
});

const dataTableBody_StreetLight = document.getElementById('dataBody_StreetLight');
const dataTableBody_UnderDeveloped = document.getElementById('dataBody_UnderDevelopment');
const dataTableBody_Encroached = document.getElementById('dataBody_Encroached');
const dataTableBody_RoadMaintenance = document.getElementById('dataBody_RoadMaintenance');


//----------------------------- show layers of table summary on map -------------------------//

var currentLayer = null;

function removeCurrentLayer() {
    if (currentLayer) {  // Check if there's a current layer on the map
        map.removeLayer(currentLayer);  // Remove the current layer from the map
        currentLayer = null;  // Reset the currentLayer variable
    }
}


// function Maintenance_roads(){
// //.addEventListener('click', function () {
//     removeCurrentLayer();
//     map.getLayers().getArray().slice().forEach(layer => {
//         if (layer instanceof ol.layer.Vector) {
//             map.removeLayer(layer);
//         }
//     });
//     map.getOverlays().clear();
//     // currentLayer = new ol.layer.Image({
//     //     //   title: 'Ward Boundary',
//     //     //     extent: [-180, -90, -180, 90],
//     //     source: new ol.source.ImageWMS({
//     //         url: 'http://103.15.81.74:8080/geoserver/LNN_Summary/wms',
//     //         params: {
//     //             'LAYERS': 'LNN_Summary:roadmaintain',

//     //         },
//     //         ratio: 1,
//     //         serverType: 'geoserver'
//     //     })
//     // });
//     // updateNavBarWithFunctionName("Road Count - 82354");
//     //overlays.getLayers().push(LNN_Ward_Boundary);
//   //  map.addLayer(currentLayer);
//    // console.log(`${BASE_URL_DSS}/getLkoDataDssMaintenance`);

//     fetch(`${BASE_URL_DSS}/getLkoDataDssMaintenance`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(responseData => {
//             console.log('Received data:', responseData);

//             if (responseData.status) {
//                 // Clear existing table rows
//                 dataTableBody_RoadMaintenance.innerHTML = '';

//                 // Populate table
//                 responseData.data.forEach(item => {
//                     const row = document.createElement('tr');
//                     row.innerHTML = `
//                         <td>${item.road_id || 'N/A'}</td>
//                         <td>${item.zone_no || 'N/A'}</td>
//                         <td>${item.ward_no || 'N/A'}</td>
//                         <td>${item.ward_name || 'N/A'}</td>
//                         <td>${item.road_name || 'N/A'}</td>
//                         <td>${item.type || 'N/A'}</td>
//                         <td>${item.condition || 'N/A'}</td>
//                         <td>${item.carriage_m || 'N/A'}</td>
//                         <td>${item.ownership || 'N/A'}</td>
//                         <td>${item.row_meter || 'N/A'}</td>
//                         <td>${item.row_as_per || 'N/A'}</td>
//                         <td>${item.length_km || 'N/A'}</td>
//                         <td>${item.yoc || 'N/A'}</td>
//                         <td>${item.school_poi || 'N/A'}</td>
//                         <td>${item.hospital_p || 'N/A'}</td>
//                         <td>${item.bank_point || 'N/A'}</td>
//                     `;
//                     dataTableBody_RoadMaintenance.appendChild(row);

//                 // Add click event to zoom to the road when the row is clicked
//                 row.addEventListener('click', function () {
//                     if (item.geom_wkt) {
//                         zoomToRoadFeature(item.geom_wkt);  // Zoom to the road and highlight it
//                         highlightAndScrollToRow(row);      // Highlight the clicked row
//                     }
//                 });

//                 // Add feature to the map and associate it with the row
//                 if (item.geom_wkt) {
//                     const feature = addMultilinestringFeatureFromWKT_StreetLight(item.geom_wkt, item.street_sol);

//                     const featureId = feature.getId();
//                     featureToRowMap.set(featureId, row);
//                 }
//             });
//         } else {
//             console.error('Expected array but received:', responseData.data);
//         }
//     })
//     .catch(error => {
//         console.error('Error fetching data:', error);
//     })

//         document.getElementById('summary-table').style.display = 'none';
//         document.getElementById('RoadMaintenanceTableContainer').style.display = 'block';
//         document.getElementById('dataTable_RoadMaintenance').style.display = 'block';
//         document.getElementById('undevelopedTablecontainer').style.display = 'none';
//         document.getElementById('UNderdevloped_dataTable').style.display = 'none';
//         document.getElementById('EncroachmentTableContainer').style.display = 'none';
//         document.getElementById('dataTable_StreetLight').style.display = 'none';


//          // Show the Road Maintenance iframe
//     // document.getElementById('roadMaintenanceIframeContainer').style.display = 'block';

// };



//  Event Listener for fetching and displaying Priority 1 data
function illuminate_roads() {
    removeCurrentLayer();
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    // Fetch priority data
    fetch(`${BASE_URL_DSS}/getLkoStreetLight?street_sol=Illuminated`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(responseData => {
            console.log('Received data:', responseData);

            dataTableBody_StreetLight.innerHTML = '';  // Clear table
            featureToRowMap.clear();  // Clear feature-row mapping

            if (Array.isArray(responseData.data)) {
                responseData.data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${item.road_id}</td>
                    <td>${item.zone_no}</td>
                    <td>${item.zone_name}</td> 
                     <td>${item.ward_no}</td>
                    <td>${item.ward_name}</td>                          
                    <td>${item.road_name}</td>
                    <td>${item.row_meter}</td>
                     <td>${item.row_as_per}</td>
                    <td>${item.length_km}</td>
                    <td>${item.condition}</td>
                    <td>${item.street_sol}</td>
                `;

                    dataTableBody_StreetLight.appendChild(row);

                    // Add click event to zoom to the road when the row is clicked
                    row.addEventListener('click', function () {
                        if (item.geom_wkt) {
                            zoomToRoadFeature(item.geom_wkt);  // Zoom to the road and highlight it
                            highlightAndScrollToRow(row);      // Highlight the clicked row
                        }
                    });

                    // Add feature to the map and associate it with the row
                    if (item.geom_wkt) {
                        const feature = addMultilinestringFeatureFromWKT_StreetLight(item.geom_wkt, item.street_sol);

                        const featureId = feature.getId();
                        featureToRowMap.set(featureId, row);
                    }
                });
            } else {
                console.error('Expected array but received:', responseData.data);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        })

    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('streetLightTableContainer').style.display = 'block';
    document.getElementById('dataTable_StreetLight').style.display = 'block';
    document.getElementById('dataTable_RoadMaintenance').style.display = 'none';
    // document.getElementById('undevelopedTablecontainer').style.display = 'none';
    document.getElementById('UNderdevloped_dataTable').style.display = 'none';
    document.getElementById('EncroachmentTableContainer').style.display = 'none';
};
//  Event Listener for fetching and displaying Priority 1 data
function Non_illuminate_roads() {
    removeCurrentLayer();
    // Clear overlays
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();
    // Fetch priority data
    fetch(`${BASE_URL_DSS}/getLkoStreetLight?street_sol=Non Illuminated`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(responseData => {
            console.log('Received data:', responseData);

            dataTableBody_StreetLight.innerHTML = '';  // Clear table
            featureToRowMap.clear();  // Clear feature-row mapping

            if (Array.isArray(responseData.data)) {
                responseData.data.forEach(item => {

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.road_id}</td>
                        <td>${item.zone_no}</td>
                        <td>${item.zone_name}</td> 
                         <td>${item.ward_no}</td>
                        <td>${item.ward_name}</td>                          
                        <td>${item.road_name}</td>
                        <td>${item.row_meter}</td>
                         <td>${item.row_as_per}</td>
                        <td>${item.length_km}</td>
                        <td>${item.condition}</td>
                        <td>${item.street_sol}</td>
                    `;

                    dataTableBody_StreetLight.appendChild(row);

                    // Add click event to zoom to the road when the row is clicked
                    row.addEventListener('click', function () {
                        if (item.geom_wkt) {
                            zoomToRoadFeature(item.geom_wkt);  // Zoom to the road and highlight it
                            highlightAndScrollToRow(row);      // Highlight the clicked row
                        }
                    });

                    // Add feature to the map and associate it with the row
                    if (item.geom_wkt) {
                        const feature = addMultilinestringFeatureFromWKT_StreetLight(item.geom_wkt, item.street_sol);

                        const featureId = feature.getId();
                        featureToRowMap.set(featureId, row);
                    }
                });
            } else {
                console.error('Expected array but received:', responseData.data);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        })
    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('streetLightTableContainer').style.display = 'block';
    document.getElementById('dataTable_StreetLight').style.display = 'block';
    document.getElementById('dataTable_RoadMaintenance').style.display = 'none';
    // document.getElementById('undevelopedTablecontainer').style.display = 'none';
    document.getElementById('UNderdevloped_dataTable').style.display = 'none';
    document.getElementById('EncroachmentTableContainer').style.display = 'none';
};

//  Event Listener for fetching and displaying Priority 1 data
function Other_roads() {
    removeCurrentLayer();
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    // Fetch priority data
    fetch(`${BASE_URL_DSS}/getLkoStreetLight?street_sol=Others`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(responseData => {
            console.log('Received data:', responseData);

            dataTableBody_StreetLight.innerHTML = '';  // Clear table
            featureToRowMap.clear();  // Clear feature-row mapping

            if (Array.isArray(responseData.data)) {
                responseData.data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${item.road_id}</td>
                    <td>${item.zone_no}</td>
                    <td>${item.zone_name}</td> 
                     <td>${item.ward_no}</td>
                    <td>${item.ward_name}</td>                          
                    <td>${item.road_name}</td>
                    <td>${item.row_meter}</td>
                     <td>${item.row_as_per}</td>
                    <td>${item.length_km}</td>
                    <td>${item.condition}</td>
                    <td>${item.street_sol}</td>
                `;

                    dataTableBody_StreetLight.appendChild(row);

                    // Add click event to zoom to the road when the row is clicked
                    row.addEventListener('click', function () {
                        if (item.geom_wkt) {
                            zoomToRoadFeature(item.geom_wkt);  // Zoom to the road and highlight it
                            highlightAndScrollToRow(row);      // Highlight the clicked row
                        }
                    });

                    // Add feature to the map and associate it with the row
                    if (item.geom_wkt) {
                        const feature = addMultilinestringFeatureFromWKT_StreetLight(item.geom_wkt, item.street_sol);

                        const featureId = feature.getId();
                        featureToRowMap.set(featureId, row);
                    }
                });
            } else {
                console.error('Expected array but received:', responseData.data);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        })
    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('streetLightTableContainer').style.display = 'block';
    document.getElementById('dataTable_StreetLight').style.display = 'block';
    document.getElementById('dataTable_RoadMaintenance').style.display = 'none';
    // document.getElementById('undevelopedTablecontainer').style.display = 'none';
    document.getElementById('UNderdevloped_dataTable').style.display = 'none';
    document.getElementById('EncroachmentTableContainer').style.display = 'none';
};



StreetLight_Roads.addEventListener('click', function () {
    removeCurrentLayer();
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    fetch(`${BASE_URL_DSS}/getALLLkoStreetLight`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // Add any request body if required
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(responseData => {
            console.log('Received data:', responseData);
            console.log('getting all data');

            // Clear existing table rows
            dataTableBody_StreetLight.innerHTML = '';

            // Check if 'data' is an array before iterating
            if (Array.isArray(responseData.data)) {
                responseData.data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                <td>${item.road_id}</td>
                        <td>${item.zone_no}</td>
                        <td>${item.zone_name}</td> 
                         <td>${item.ward_no}</td>
                        <td>${item.ward_name}</td>                          
                        <td>${item.road_name}</td>
                        <td>${item.row_meter}</td>
                         <td>${item.row_as_per}</td>
                        <td>${item.length_km}</td>
                        <td>${item.condition}</td>
                        <td>${item.street_sol}</td>
              
    
                <!-- Add more table data cells as needed -->
            `;
                    dataTableBody_StreetLight.appendChild(row);

                    // Check if the item has a geom_wkt property
                    if (item.geom_wkt) {
                        addMultilinestringFeatureFromWKT_StreetLight(item.geom_wkt, item.street_sol);
                    }
                });
            } else {
                console.error('Expected array but received:', responseData.data);
                // Handle non-array data if needed
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Handle error condition if needed
        })

});

/*function DSS_Road() {
    removeCurrentLayer();
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    currentLayer = new ol.layer.Image({
        //   title: 'Ward Boundary',
        //     extent: [-180, -90, -180, 90],
        source: new ol.source.ImageWMS({
            url: 'http://103.15.81.74:8080/geoserver/LNN_Summary/wms',
            params: {
                'LAYERS': '	LNN_Summary:lnn_roads',

            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });
    // updateNavBarWithFunctionName("Road Count - 82354");
    //overlays.getLayers().push(LNN_Ward_Boundary);
    map.addLayer(currentLayer);
}
*/

function EncroachmentRoads() {
    fetch(`${BASE_URL_DSS}/getLkoEncroachmentCount`) // Replace with your actual API URL
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                // Sort the API response data by zone_no in ascending order
                const sortedData = data.data.sort((a, b) => parseInt(a.zone_no) - parseInt(b.zone_no));

                // Map sorted data to the card format
                const roadFilterCards = sortedData.map(zone => {
                    return {
                        title: `<a href="javascript:void(0)" onclick="showZoneLayer(${zone.zone_no})" style="color:white">Zone ${zone.zone_no}</a>`,
                        description: `Total Roads - ${zone.total_no_roads}<br>` +
                            `Encroached Roads - ${zone.total_no_encroached_road}<br>` +
                            `Encroached % - ${zone.total_percentage_en.toFixed(2)}`
                    };
                }
                );

                // Update currentCardsData and render cards
                currentCardsData = roadFilterCards;
                addCards(currentCardsData); // Update cards on the page
            } else {
                console.error('Error: ', data.message); // Handle API error response
            }
        })
        .catch(error => {
            console.error('API Fetch Error: ', error); // Handle network or other errors
        });
}

// ------------------------------------------- underdevelopement ----------------------------------------------------------------
function undeveloped_zones1() {
    fetch(`${BASE_URL_DSS}/getLkoUnderdevelopmentCount`) // Replace with your actual API URL
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                // Sort the API response data by zone_no in ascending order
                const sortedData = data.data.sort((a, b) => parseInt(a.zone_no) - parseInt(b.zone_no));

                // Map sorted data to the card format
                const dataAnalysisCards = sortedData.map(zone => {
                    return {
                        title: `<a href="javascript:void(0)" onclick="showZoneLayer_Developed(${zone.zone_no})" style="color:white">Zone ${zone.zone_no}</a>`,
                        description:
                            // `Total Roads - ${zone.total_roads}<br>` +
                            `<a style="color:darkgreen"> Developed Roads</a> - ${zone.developed_roads}<br>` +
                            `<a style="color:orange"> UnderDeveloped Roads</a> - ${zone.underdeveloped_roads}<br>` +
                            `<a style="color:Red"> UnDeveloped Roads</a> - ${zone.non_developed_roads}<br>`

                    }

                }
                );

                // Update currentCardsData and render cards
                currentCardsData = dataAnalysisCards;
                addCards(currentCardsData); // Update cards on the page
            } else {
                console.error('Error: ', data.message); // Handle API error response
            }
        })
        .catch(error => {
            console.error('API Fetch Error: ', error); // Handle network or other errors
        });
}

//--------------------------------Road Maintenanace card value-----------------//
function Maintenance_zones1(zoneNo) {
    fetch(`${BASE_URL_DSS}/getLkoRoadMaintenanceCount?zone_no=${zoneNo}`)
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data); // Debugging step

            // Ensure `data.data` exists and is an array
            if (data.status && Array.isArray(data.data)) {
                // Sort the API response data by zone_no in ascending order
                const sortedData = data.data.sort((a, b) => parseInt(a.zone_no) - parseInt(b.zone_no));

                // Extract Maintenance mappings from API response
                const underMaintenanceMap = data.underMaintenance || {};
                const criticalMaintenanceMap = data.criticalMaintenance || {};
                const moderateMaintenanceMap = data.moderateMaintenance || {};
                const lowMaintenanceMap = data.lowMaintenance || {};

                // Map sorted data to the card format
                const dataAnalysisCards = sortedData.map(zone => {
                    const zoneNo = zone.zone_no; // Ensure zone_no is used correctly
                    const totalRoads = zone.road_count || 0;
                    const underMaintenanceCount = underMaintenanceMap[zoneNo] || 0;
                    const criticalCount = criticalMaintenanceMap[zoneNo] || 0;
                    const moderateCount = moderateMaintenanceMap[zoneNo] || 0;
                    const lowCount = lowMaintenanceMap[zoneNo] || 0;

                    return {
                        title: `<a href="javascript:void(0)" onclick="showZoneLayerMain(${zoneNo})" style="color:white">Zone ${zoneNo}</a>`,
                        description:
                            // `🛣️ Total Roads - ${totalRoads}<br>` +
                            ` Under Maintenance Roads - ${underMaintenanceCount}<br>` +
                            ` <a style="color:red">Critical Roads </a> - ${criticalCount}<br>` +
                            ` <a style="color:orange">Moderate Roads </a> - ${moderateCount}<br>` +
                            ` <a style="color:yellowgreen">Low Maintenance Roads </a> - ${lowCount}<br>`
                    };
                });

                // Update currentCardsData and render cards
                currentCardsData = dataAnalysisCards;
                addCards(currentCardsData); // Update cards on the page
            } else {
                console.error('Error: Invalid API response format', data);
            }
        })
        .catch(error => {
            console.error('API Fetch Error:', error); // Handle network or other errors
        });
}

// =========================================================================================================================================
// Reference to the Info button
const infoButton = document.getElementById('Info');
const simpleButton = document.getElementById('simple');
const simpletitle = document.getElementById('aa');
//const infotitle = document.getElementById('infotitle');

// Hide the Info button and info image container initially
infoButton.style.display = 'none';
simpleButton.style.display = 'none';
//infotitle.style.display = 'none';

document.getElementById('infoImageContainer').style.display = 'none';

// Track the currently selected category
let currentCategory = null;

// Function to handle analysis button clicks
function onAnalysisButtonClick(category) {
    // If the same category is selected, do nothing
    if (currentCategory === category) return;

    // Update the current category
    currentCategory = category;

    // Show the Info button
    infoButton.style.display = 'block';
   // infotitle.style.display = 'block';

    // Set the action for the Info button to show the relevant info
    infoButton.onclick = () => showCategoryInfo(category);

    // Show the Info button only if 'Underdeveloped' is clicked
    if (category === 'Development Zones') {
        simpleButton.style.display = 'block';
        simpletitle.style.display = 'block';

        // Open Looker Studio link in a new tab
        simpleButton.onclick = () => {
            window.open("https://lookerstudio.google.com/s/mUT1xJxOMH4", "_blank");
        };
    } else {
        simpleButton.style.display = 'none'; // Hide the button for other categories
        simpletitle.style.display = 'none';
    }
}


// Function to display information for a category
function showCategoryInfo(category) {
    const categoryToImage = {
        'Street Light': '../assets/images/Street_light.JPG',
        'Development Zones': '../assets/images/Underdeveloped_zones.JPG',
        'Encroachment': '../assets/images/Encroachment.JPG',
        'Road Maintenance': '../assets/images/road.png',
    };

    // Validate the category and display the corresponding info
    if (category in categoryToImage) {
        const imageSrc = categoryToImage[category];
        const imageElement = document.getElementById('infoImage');
        imageElement.src = imageSrc;
        imageElement.alt = `${category} image`;

        // Show the image container
        const container = document.getElementById('infoImageContainer');
        container.style.display = 'block';

    } else {
        alert('Invalid category selected!');
    }
}

// Function to close the image container
function closeInfoImage() {
    const container = document.getElementById('infoImageContainer');
    container.style.display = 'none';
    const imageElement = document.getElementById('infoImage');
    imageElement.src = '';
    imageElement.alt = '';
}

// =====================================================================================================

// Define legend data for all features
const legends = {
    "Street Lights": [
        { color: "yellow", label: "Illuminated Roads" },
        { color: "red", label: "Non-Illuminated Roads" },
        { color: "purple", label: "Other Roads" }
    ],
    "Underdeveloped Zones": [
        { color: "green", label: "Developed Zones" },
        { color: "orange", label: "Underdeveloped Zones" },
        { color: "red", label: "UnDeveloped Zones" }
    ],
    "Encroachment": [
        { color: "blue", label: "Encroached Roads" }
    ],
    "Road Maintenance": [
        { color: "#808080", label: "Null Values" },
        { color: "#1e90ff", label: "Low Priority" },
        { color: "#228822", label: " Moderate Priority" },
        { color: "#ff0700", label: "Medium Priority" },
        { color: "#ff8c00", label: "High Priority" },
        { color: "#dc143c", label: "Very High Priority" },
        { color: "purple", label: "Critical Priority" },

 
    ]
};

// Function to update the legend dynamically
function updateLegend(featureName) {
    const legendContainer = document.getElementById('legendContainer');
    const legendContent = document.getElementById('legendContent');

    // Clear existing legend content
    legendContent.innerHTML = "";

    // Populate the legend if the feature exists
    if (legends[featureName]) {
        legends[featureName].forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="legend-color" style="background-color: ${item.color};"></span> ${item.label}`;
            legendContent.appendChild(li);
        });
        legendContainer.style.display = "block"; // Show the legend
    } else {
        legendContainer.style.display = "none"; // Hide the legend if no content
    }
}

// Attach event listeners to the respective buttons
document.getElementById('StreetLight_Roads').addEventListener('click', () => {
    console.log("Street Lights button clicked");
    updateLegend("Street Lights");
});

// Hide legend on "Clear" button click
document.getElementById('clear-icon').addEventListener('click', () => {
    console.log("Clear button clicked");
    document.getElementById('legendContainer').style.display = "none";
});





// =======================================================================================================================
function minimize1() {
    const topnav = document.getElementById('tableContainer_summary');
    const Street= document.getElementById('streetLightTableContainer');
    const Encroachment = document.getElementById('EncroachmentTableContainer');
    const Undeveloped = document.getElementById('undevelopedTablecontainer');
    const RoadMaintenance = document.getElementById('RoadMaintenanceTableContainer');

    // Adjust nav element positions
    document.querySelectorAll('.feature_nav').forEach(nav => {
        nav.style.bottom = '3%'; // Reduced height when minimized
    });

    // Collapse the height of tables
    topnav.style.height = '0%'; 
    Street.style.height = '0%';
    Encroachment.style.height = '0%';
    Undeveloped.style.height = '0%';
    RoadMaintenance.style.height = '0%';

    // Hide legends
    const legendIds = [
        
    ];

    legendIds.forEach(id => {
        const lg = document.getElementById(id);
        if (lg) {
            lg.classList.remove('legend-visible');
            lg.classList.add('legend-hidden');
            lg.scrollTop = 0; // Reset scroll position
        }
    });
}

function maximize1() {
    const topnav = document.getElementById('tableContainer_summary');
    const Encroachment = document.getElementById('EncroachmentTableContainer');
    const Undeveloped = document.getElementById('undevelopedTablecontainer');
    const RoadMaintenance = document.getElementById('RoadMaintenanceTableContainer');

    // Adjust nav element positions
    document.querySelectorAll('.feature_nav').forEach(nav => {
        nav.style.bottom = '26%'; // Expanded height when maximized
    });

    // Expand the height of tables
    topnav.style.height = '22%';
    Street.style.height = '22%';
    Encroachment.style.height = '22%';
    Undeveloped.style.height = '22%';
    RoadMaintenance.style.height = '22%';

    // Show legends
    const legendIds = [
        
    ];

    legendIds.forEach(id => {
        const lg = document.getElementById(id);
        if (lg) {
            lg.classList.remove('legend-hidden');
            lg.classList.add('legend-visible');
            lg.scrollTop = 0; // Reset scroll position
        }
    });
}

// =============================================================================================================================



// function minimize1() {
//     const topnav = document.getElementById('streetLightTableContainer');
//     const Encroachment = document.getElementById('EncroachmentTableContainer');
//     const Undeveloped = document.getElementById('undevelopedTablecontainer');
//     const RoadMaintenance = document.getElementById('RoadMaintenanceTableContainer');
//     const navElements = document.querySelectorAll('.feature_nav');
//     navElements.forEach(nav => {
//         nav.style.bottom = '3%'; // Reduced width when minimized
//     });
//     topnav.style.height = '0%'; // Reduced height when minimized
//     Encroachment.style.height = '0%'; // Reduced height when minimized
//     Undeveloped.style.height = '0%'; // Reduced height when minimized
//     RoadMaintenance.style.height = '0%'; // Reduced height when minimized
//     const legendIds = ['Priority_legend', 'type_legend', 'Condition_legend', 'Material_legend', 'Ownership_legend'];
//     // Loop through each legend and hide it
//     legendIds.forEach(function (legendId) {
//         const legendBtn = document.getElementById(legendId);
//         if (legendBtn) {  // Check if the element exists before manipulating it
//             legendBtn.style.display = 'none';
//         }
//     });
// }
// function maximize1() {
//     const topnav = document.getElementById('streetLightTableContainer');
//     const Encroachment = document.getElementById('EncroachmentTableContainer');
//     const Undeveloped = document.getElementById('undevelopedTablecontainer');
//     const RoadMaintenance = document.getElementById('RoadMaintenanceTableContainer');
//     const navElements = document.querySelectorAll('.feature_nav');
//     navElements.forEach(nav => {
//         nav.style.bottom = '29%'; // Reduced width when minimized
//     });
//     topnav.style.height = '29%'; // Reduced height when minimized
//     Encroachment.style.height = '29%'; // Reduced height when minimized
//     Undeveloped.style.height = '29%'; // Reduced height when minimized
//     RoadMaintenance.style.height = '29%'; // Reduced height when minimized
// }


//----------cancel button code-------------------//



document.querySelector('.back-icon').addEventListener('click', function() {
    window.history.back();
});
