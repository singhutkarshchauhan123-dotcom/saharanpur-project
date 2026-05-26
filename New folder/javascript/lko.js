// const BASE_URL = `${BASE_URL_All}:8060/Lucknow`;
// const BASE_URL_ANALYSIS = `${BASE_URL_All}:8060/road_analysis`;
// const GEOSERVER_BASE_URL  =  `${GEOSERVER_URL_All}/Lko_Summary`;

const BASE_URL = `${BASE_URL_All}:8992/Lucknow`;
const GEOSERVER_BASE_URL = "http://localhost:8080/geoserver/Lko_Summary";


ol.proj.useGeographic();


//---------------------- header section start --------------------------//

// Grouped event listeners for similar functionality
function hideElements(elementIds) {
    elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) { element.style.display = 'none' }
    });
}

function showElements(elementIds) {
    elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) { element.style.display = 'block'; }
    });
}
//----------------------------------------- sidebar amenities show and hide elements -------------------------
['Bank_Road', 'Park_Road', 'Hospital_Road', 'Hotel_Road', 'Education_Road', 'ShowRoads'].forEach(id => {
    document.getElementById(id).addEventListener('click', showTables); });

function showTables() {
    showElements(['dataTable_summary', 'tableContainer_summary']);
    hideElements([ 'legendBtn', 'live_legend', 'type_legend', 'Condition_legend','CUS_legend','RoadCategory_legend','Material_legend', 'Ownership_legend',
         'summary-table',  'tableContainer_summaryfilter', 'table_data'
      
    ]);
}

//------------------------------------ summary tables show and hide elements -------------------------
document.getElementById('table_icon').addEventListener('click', showTables2);

function showTables2() {
    showElements(['summary-table']);
    hideElements([ 'dataTable_summary', 'tableContainer_summary','tableContainer_summaryfilter',  
         'legendBtn', 'live_legend', 'type_legend', 'Condition_legend','CUS_legend','RoadCategory_legend',
        'Material_legend', 'Ownership_legend','table_data'
       
    ]);
}


//------------------------------------ priority  show and hide elements -------------------------
['P1', 'P2', 'Not_Eligible'].forEach(id => {
    document.getElementById(id).addEventListener('click', showTables3); });

function showTables3() {
    showElements(['Scoring_dataTable', 'Scoreing_tableContainer','Priority_legend']);
    hideElements([
        'dataTable_summary',   'tableContainer_summary', 'live_legend','Under_Scheme_legend',
        'Ownership_legend', 'Material_legend', 'Condition_legend', 'type_legend', 'summary-table'
    ]);

    const priorityLegend = document.getElementById('Priority_legend');
    priorityLegend.style.display = 'block';
    priorityLegend.style.height = '15%';
    priorityLegend.style.top = '55%';
    priorityLegend.style.left = '1%';
}



$(document)
    .ready(
        function () {
            $("#search-bar").hide();
            $("#live_legend").hide();
            $("#legendBtn").click(
                function () {
                    $("#live_legend").toggle();
                }
            );
            $("#search-icon").click(
                function () {
                    $("#search-bar").toggle();
                }
            );
            $("#road_btn").click(
                function () {
                    $("#tableContainer_summaryfilter").hide();
                   
                }
            );
        });


var map, geojson, featureOverlay, overlays, style;
var selected, features, layer_name, layerControl;
var content, draw;
var selectedFeature;
// const london = fromLonLat([-0.12755, 51.507222]);

var view = new ol.View({
    projection: "EPSG:4326",
    center: [80.9402, 26.8268],
   
    // zoom: 12,
    minZoom:10,
    maxZoom:19
});

var base_maps = new ol.layer.Group({
    title: "Base maps",
	layers: [
	    new ol.layer.Tile({
	        title: 'OSM',
	        type: 'base',
	        visible: true,
			source: new ol.source.XYZ({
			  url: 'https://{a-c}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
			  attributions: '© OpenStreetMap France contributors'
			}),
	    }),
        new ol.layer.Tile({
            title: "CartoDB Positron",
            type: "base",
            visible: false,
            source: new ol.source.XYZ({
                url: "https://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                attributions:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                crossOrigin: "anonymous"
            }),
        }),
        new ol.layer.Tile({
            source: new ol.source.TileJSON({
                attributions: "@MapTiler",
                url: "https://api.maptiler.com/maps/toner-v2/tiles.json?key=iTVgqgYSsJMT2uIrziZq",
                crossOrigin: "anonymous"
            }),
            title: "Toner",
            type: "base",
            visible: false,
        }),
        new ol.layer.Tile({
            source: new ol.source.TileJSON({
                attributions: "@MapTiler",
                url: "https://api.maptiler.com/maps/topo-v2/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
                crossOrigin: "anonymous"
            }),
            title: "Topo",
            type: "base",
            visible: false,
            maxZoom: 23,
        }),
        new ol.layer.Tile({
            source: new ol.source.TileJSON({
                attributions: "@MapTiler",
                url: "https://api.maptiler.com/maps/backdrop/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
                crossOrigin: "anonymous"
            }),
            title: "Backdrop",
            type: "base",
            visible: false,
        }),
        new ol.layer.Tile({
            source: new ol.source.TileJSON({
                attributions: "@MapTiler",
                url: "https://api.maptiler.com/maps/outdoor-v2/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
                crossOrigin: "anonymous"
            }),
            title: "Outdoor",
            type: "base",
            visible: false,
        }),
        // Satellite Imagery
        new ol.layer.Tile({
            title: "Satellite (Imagery)",
            type: "base",
            visible: true,
            source: new ol.source.XYZ({
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                attributions: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>',
                crossOrigin: "anonymous",
                maxZoom: 23,
            }),
        }),
        // Labels Overlay
        new ol.layer.Tile({
            title: "Labels (Esri Reference)",
            type: "overlay", // not a base, sits on top
            visible: true,
            source: new ol.source.XYZ({
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
                attributions: 'Labels &copy; <a href="https://www.esri.com/">Esri</a>',
                crossOrigin: "anonymous",
                maxZoom: 23,
            }),
        }),
		new ol.layer.Tile({
		  source: new ol.source.TileJSON({
		    attributions: "@MapTiler",
		    url: "https://api.maptiler.com/maps/darkmatter/tiles.json?key=iVy8qXSX5hN7aJhQp2Na",
		    crossOrigin: "anonymous"
		  }),
		  title: "Dark Matter",
		  type: "base",
		  visible: false,
		}),
		
		
    ],
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

var OSM = new ol.layer.Tile({
    source: new ol.source.OSM(),
    type: "base",
    title: "OSM",
});

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
    minWidth: 140,
    target: 'scale_bar'
});

map.addControl(scale_line);

//------------------ charts and data ---------------------//
//function data_analysis() {
 //   window.open('https://lookerstudio.google.com/reporting/805db749-83e9-4abe-8901-c49dd431864e', '_blank'); // Open Google in a new tab
//}

function data_analysis() {
    //  console.log("data_analysis called");
    // Hide the map container
    document.getElementById('map').style.display = 'none';
    // Show the iframe container
    const iframeContainer = document.getElementById('iframe-container');
    iframeContainer.style.display = 'block';
	//iframeContainer.style.height='91vh';

	
    console.log("iframe-container displayed");
}
function closeReport() {
    //  console.log("closeReport called");
    // Hide the iframe container
    const iframeContainer = document.getElementById('iframe-container');
    iframeContainer.style.display = 'none';
    // Show the map container
    document.getElementById('map').style.display = 'block';
}


//-----------------------------------Boundaries------------------------------------//
var zone_boundary = new ol.layer.Image({
    title: "Lucknow Zone Boundary",
    //  extent: [-180, -90, -180, 90],
    source: new ol.source.ImageWMS({
        url: `${GEOSERVER_BASE_URL}/wms?`,
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
        url: `${GEOSERVER_BASE_URL}/wms?`,
        params: {
            LAYERS: "Lko_Summary:lucknow_ward_boundary",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
//overlays.getLayers().push(LNN_Boundary);
map.addLayer(ward_boundary);

var sewage = new ol.layer.Image({
    //title: "sewage",
	visible: false,
    //  extent: [-180, -90, -180, 90],
    source: new ol.source.ImageWMS({
        url: `${GEOSERVER_BASE_URL}/wms`,
        params: {
            LAYERS: "Lko_Summary:LNN_Sewage_net",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
//overlays.getLayers().push(LNN_Boundary);
map.addLayer(sewage);


var Manhole = new ol.layer.Image({
   // title: "Manhole",
	visible: false,
    //  extent: [-180, -90, -180, 90],
    source: new ol.source.ImageWMS({
        url: `${GEOSERVER_BASE_URL}/wms`,
        params: {
            LAYERS: "Lko_Summary:LNN_Manhole",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
//overlays.getLayers().push(LNN_Boundary);
map.addLayer(Manhole);

/*----------------------------------------- javascript for navbar in table---------------------------------------- */
function updateNavBarWithFunctionName(functionName) {
  //  //  console.log("Updating navbar with function name:", functionName);
    // document.getElementById('featureName').textContent = functionName;

    document.querySelectorAll('.feature_name1').forEach(element => {
        element.textContent = functionName;
    });
}

function minimize1() {
    const topnav = document.getElementById('tableContainer_summary');

    document.querySelectorAll('.feature_nav').forEach(nav => {
        nav.style.bottom = '3%';
    });

    topnav.style.height = '0%';

    const legendIds = [
		'Priority_legend',
        'Condition_legend',
        'Material_legend',
        'Ownership_legend',
        'CUS_legend',
        'RoadCategory_legend'
    ];

    legendIds.forEach(id => {
        const lg = document.getElementById(id);
        if (lg) {
            lg.classList.remove('legend-visible');
            lg.classList.add('legend-hidden');
            lg.scrollTop = 0;
        }
    });
}



function maximize1() {
    const topnav = document.getElementById('tableContainer_summary');

    document.querySelectorAll('.feature_nav').forEach(nav => {
        nav.style.bottom = '25%';
    });

    topnav.style.height = '22%';

    const legendIds = [
		'Priority_legend',
        'Condition_legend',
        'Material_legend',
        'Ownership_legend',
        'CUS_legend',
        'RoadCategory_legend'
    ];

    legendIds.forEach(id => {
        const lg = document.getElementById(id);
        if (lg) {
            lg.classList.remove('legend-hidden');
            lg.classList.add('legend-visible');
            lg.scrollTop = 0;
        }
    });
}

//------------------------------------- MULTILINESTRING feature to the map from WKT format
function addMultilinestringFeatureFromWKT_General(wktString, color = 'black', width = 2.5) {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wktString, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326'
    });

    const vectorSource = new ol.source.Vector({
        features: [feature]
    });

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: color,
                width: width
            })
        })
    });

    const featureId = `feature-${Math.random().toString(36).substr(2, 9)}`;
    feature.setId(featureId);

    map.addLayer(vectorLayer);
    return feature;
}

function addMultilinestringFeatureFromWKT(wktString) {
    return addMultilinestringFeatureFromWKT_General(wktString, '#EB5406', 3);
}
function addMultilinestringFeatureFromWKT_parkRoad(wktString) {
    return addMultilinestringFeatureFromWKT_General(wktString, '#04af70', 3);
}
function addMultilinestringFeatureFromWKT_EduRoad(wktString) {
    return addMultilinestringFeatureFromWKT_General(wktString, '#5c62d6', 3);
}
function addMultilinestringFeatureFromWKT_HospitalRoad(wktString) {
    return addMultilinestringFeatureFromWKT_General(wktString, 'cyan', 3);
}
function addMultilinestringFeatureFromWKT_HotelRoad(wktString) {
    return addMultilinestringFeatureFromWKT_General(wktString, 'darkblue', 3);
}
function addMultilinestringFeatureFromWKT_Ward(wktString) {
    return addMultilinestringFeatureFromWKT_General(wktString, 'red', 3);
}

function addMultilinestringFeatureFromWKT_priorityL(wktString, priority) {
    let color;
    switch (priority) {
        case 'Priority 1':
            color = '#EB5406';
            break;
        case 'Priority 2':
            color = '#00FF00';
            break;
        case 'Not Eligible':
            color = '#FFC300';
            break;
        default:
            color = 'black';
    }

    return addMultilinestringFeatureFromWKT_General(wktString, color, 3);
}

/*--------------------------------------- zoom function is to on table ------------------------------------------*/
// Define the style for the highlighted road feature
const highlightedStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#DFFF00',  // Highlight color
        width: 7        // Stroke width for visibility
    })
});

// Store the previously highlighted feature and layer for resetting the highlight
let previouslyHighlightedFeature = null;
let previouslyHighlightedLayer = null;

function zoomToRoadFeature(wkt) {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wkt, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.getView().getProjection()
    });

    const extent = feature.getGeometry().getExtent();
    map.getView().fit(extent, {
        duration: 1000, 
        maxZoom: 18     
    });

    if (previouslyHighlightedFeature && previouslyHighlightedLayer) {
        previouslyHighlightedFeature.setStyle(null);  
        previouslyHighlightedLayer.getSource().removeFeature(previouslyHighlightedFeature); 
        map.removeLayer(previouslyHighlightedLayer);  
    }

    feature.setStyle(highlightedStyle);
    const vectorSource = new ol.source.Vector({
        features: [feature]
    });

    const vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    map.addLayer(vectorLayer);

    previouslyHighlightedFeature = feature;
    previouslyHighlightedLayer = vectorLayer;
}

function highlightAndScrollToRow(row) {
    //  console.log("Highlighting and scrolling to row: ", row);

    Array.from(dataTableBody_summary.querySelectorAll('tr')).forEach(tr => {
        tr.classList.remove('highlighted');
    });
  //  Array.from(dataTableBody.querySelectorAll('tr')).forEach(tr => {
   //     tr.classList.remove('highlighted');
   // });
    
    row.classList.add('highlighted');
    row.scrollIntoView({
        behavior: 'smooth',  
        block: 'center',    
        inline: 'nearest'   
    });
    //  console.log("Row scrolled into view.");
}

const styleElement = document.createElement('style');
styleElement.innerHTML = `
    tr.highlighted {
        background-color: white !important;
        color: red !important;
        z-index: 2001;
    }
`;
document.head.appendChild(styleElement);

// Create a map to associate features with table rows
const featureToRowMap = new Map();

const selectInteraction = new ol.interaction.Select({
    condition: ol.events.condition.click,
    layers: layer => layer instanceof ol.layer.Vector,
    // style: null

});
map.addInteraction(selectInteraction);

// Highlight table row on road feature click and scroll to it
selectInteraction.on('select', function (e) {
    if (e.selected.length > 0) {
        const selectedFeature = e.selected[0];
       // //  console.log("Selected feature: ", selectedFeature);

        const featureId = selectedFeature.getId();
     //   //  console.log("Feature ID: ", featureId);

        const associatedRow = featureToRowMap.get(featureId);
     //   //  console.log("Associated row: ", associatedRow);

        if (associatedRow) {
            highlightAndScrollToRow(associatedRow);

        } else {
            console.warn("No associated row found for the selected feature.");
        }
    } else {
        //  console.log("No feature selected.");
    }
});




//------------------------------------- optimise code of priority ---------------------------------------
const dataTableBody_Scoring = document.getElementById('dataBody_Scoring');

function priorityBasedScoring(priority, label) {
    updateNavBarWithFunctionName(label);

    // Clear non-preserved vector layers
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            map.removeLayer(layer);
        }
    });

    map.getOverlays().clear();

    fetch(`${BASE_URL}/getPriorityLko?priority=${encodeURIComponent(priority)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(responseData => {
         //   //  console.log('Received data:', responseData);

            dataTableBody_Scoring.innerHTML = '';
            featureToRowMap.clear();

            if (Array.isArray(responseData.data)) {
                responseData.data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.gis_id}</td>
						<td>${item.road_id}</td>
                        <td>${item.zone_no}</td>
                        <td>${item.ward_no}</td>
                        <td>${item.road_name}</td>
                        <td>${item.row_meter}</td>
                         <td>${item.length_km ? item.length_km.toFixed(2) : 'N/A'}</td>
                        <td>${item.condition}</td>
                        <td>${item.total_scor}</td>
                        <td>${item.priority}</td>
                    `;
                    dataTableBody_Scoring.appendChild(row);

                    if (item.geom_wkt) {
                        const feature = addMultilinestringFeatureFromWKT_priorityL(item.geom_wkt, item.priority);
                        const featureId = feature.getId();
                        featureToRowMap.set(featureId, row);

                        row.addEventListener('click', function () {
                            zoomToRoadFeature(item.geom_wkt);
                            highlightAndScrollToRow(row);
                        });
                    }
                });
            } else {
                console.error('Expected array but received:', responseData.data);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    handleLegendDisplay(priority);
}

function handleLegendDisplay(priority) {
    // Hide all legends
    [type_legend, live_legend, Condition_legend, Material_legend, Ownership_legend, Priority_legend].forEach(legend => {
        if (legend) legend.style.display = 'none';
    });

   
}

// Attach event listeners
P1.addEventListener('click', () => priorityBasedScoring('Priority 1', 'First Priority'));
P2.addEventListener('click', () => priorityBasedScoring('Priority 2', 'Second Priority'));
Not_Eligible.addEventListener('click', () => priorityBasedScoring('Not Eligible', 'Not Eligible'));

//-------------------------------------------All Roads--------------------------------------------------------------------------------------//
ShowRoads.addEventListener('click', function () {
    updateNavBarWithFunctionName("All Roads");
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector
            // && !isLayerInPreservedList(layer)
        ) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();
    fetch(`${BASE_URL}/getAlltypeName`, {
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
           // console.log('Received data:', responseData);
            console.log('getting all data');
            // Clear existing table rows
            dataTableBody_summary.innerHTML = '';
            // Check if 'data' is an array before iterating
            if (Array.isArray(responseData.data)) {
                responseData.data.forEach(item => {
                    const row = document.createElement('tr');
             row.innerHTML = `
                               <td>${item.gis_id}</td>
							   <td>${item.road_id}</td>
                               <td>${item.zone_no}</td>
                               <td>${item.zone_name}</td>
                               <td>${item.ward_no}</td>
                            <td>${item.ward_name}</td>
                            <td>${item.ownership}</td>
                             <td>${item.category}</td>
                            <td>${item.road_name}</td>
                         <td>${item.row_meter}</td>
                            <td>${item.rowcls}</td>
                            <td>${item.carriage_w}</td>
                            <td>${item.material}</td>
                             <td>${item.length_km ? item.length_km.toFixed(2) : 'N/A'}</td>
                               <td>${item.condition}</td>
                            <td>${item.yoc}</td>
                            <td>${item.cus}</td>`;
                    dataTableBody_summary.appendChild(row);
                    // Check if the item has a geom_wkt property
                    if (item.geom_wkt) {
                        addMultilinestringFeatureFromWKT(item.geom_wkt);
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


// //--------------------------------optimise code of sidebar road analysis -----------------------------


function amenitiesRoadAnalysis(endpoint, layerName, featureFunction, elementId) {
    removeCurrentLayer();
    updateNavBarWithFunctionName(layerName);

    // Remove previous vector layers except the park layer
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector && layer !== parkVectorLayer) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    // --- ✅ Use GET instead of POST ---
    fetch(`${BASE_URL_ANALYSIS}/lucknow/${endpoint}`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(responseData => {
      //  console.log(`Received data for ${layerName}:`, responseData);

        // Reset UI
        dataTableBody_summary.innerHTML = '';
        featureToRowMap.clear();

        // Handle new flat response structure
        if (Array.isArray(responseData)) {
            const countEntry = responseData[0];
            const features = responseData.slice(1); // skip count

          //  console.log(`Total features in ${layerName}:`, countEntry.count);

            features.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.gid}</td>
					<td>${item.road_id ||'NA'}</td>
                    <td>${item.zone_no}</td>
                    <td>${item.zone_name}</td>
                    <td>${item.ward_no}</td>
                    <td>${item.ward_name}</td>
                    <td>${item.ownership}</td>
                    <td>${item.category}</td>
                    <td>${item.road_name}</td>
                    <td>${item.row_meter}</td>
                    <td>${item.rowcls}</td>
                    <td>${item.carriage_w}</td>
                    <td>${item.material}</td>
                     <td>${item.length_km ? item.length_km.toFixed(2) : 'N/A'}</td>
                    <td>${item.condition}</td>
                    <td>${item.yoc}</td>
                    <td>${item.cus}</td>`;

                dataTableBody_summary.appendChild(row);

                row.addEventListener('click', function () {
                    if (item.geom) {
                        zoomToRoadFeature(item.geom);
                        highlightAndScrollToRow(row);
                    }
                });

                if (item.geom) {
                  //  console.log(`WKT String for ${layerName}:`, item.geom);
                    const feature = featureFunction(item.geom);
                    if (feature) {
                        const featureId = feature.getId();
                        if (featureId) {
                            featureToRowMap.set(featureId, row);
                        }
                    }
                }
            });
        } else {
            console.error(`Expected flat array but got:`, responseData);
        }

        document.getElementById(elementId).addEventListener('change', function () {
            layer.setVisible(this.checked);
        });
    })
    .catch(error => console.error(`Error fetching data for ${layerName}:`, error));
}


// ShowRoads.addEventListener('click', () => showAmenityWithRoads('getAlltypeName', 'All Roads', addMultilinestringFeatureFromWKT));
Bank_Road.addEventListener('click', () => showAmenityWithRoads('roads-with-atms', 'Bank with Roads', addMultilinestringFeatureFromWKT,'bank','../assets/icons/bank.png','showBanks'));
Park_Road.addEventListener('click', () => showAmenityWithRoads('roads-with-park', 'Park with Roads', addMultilinestringFeatureFromWKT_parkRoad));
Hospital_Road.addEventListener('click', () => showAmenityWithRoads('roads-with-hospital', 'Hospital with Roads', addMultilinestringFeatureFromWKT_HospitalRoad,'hospital','../assets/icons/hospital.png','showHospital'));
Hotel_Road.addEventListener('click', () => showAmenityWithRoads('roads-with-hotel', 'Hotel with Roads', addMultilinestringFeatureFromWKT_HotelRoad,'hotel','../assets/icons/hotel.png','showHotel'));
Education_Road.addEventListener('click', () => showAmenityWithRoads('roads-with-education', 'Educational Institute with Roads', addMultilinestringFeatureFromWKT_EduRoad,'education','../assets/icons/education.png','showEducation'));
// Slum_Road.addEventListener('click', () => showAmenityWithRoads('getSlumRoad', 'Slum Roads', addMultilinestringFeatureFromWKT));

/// =========== COMBINED FUNCTION: Show Roads + Icons ======================
function showAmenityWithRoads(roadEndpoint, roadLayerName, roadFeatureFunction, pointType, iconPath, elementId, scale = 0.05) {
    // 1. Show Roads
    amenitiesRoadAnalysis(roadEndpoint, roadLayerName, roadFeatureFunction,elementId);

    // 2. Show Icons
    const vectorSource = new ol.source.Vector();
    const iconLayer = createVectorLayer(vectorSource);
    map.addLayer(iconLayer);

    const iconStyle = createIconStyle(iconPath, scale);
    amenitiesFeatures(pointType, iconStyle, vectorSource, iconLayer, elementId);
}

//--------------------------------------------amenities popup--------------------------------------------
// Popup initialization
var popupContainer = document.getElementById("popup_1");
var popup = new ol.Overlay({
    element: document.getElementById('popup'),
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0, -20],
});
map.addOverlay(popup);
map.on('click', function (event) {
    var pointFeature = null;
    var lineFeature = null;
    var polygonFeature = null;
    // Check if a feature was clicked
    map.forEachFeatureAtPixel(event.pixel, function (feature) {
        var geometryType = feature.getGeometry().getType();
        if (geometryType === 'Point') {
            pointFeature = feature;
            return true; // Stop iteration when point is found
        } else if (geometryType === 'LineString') {
            lineFeature = feature;
        } else if (geometryType === 'MultiPolygon') {
            polygonFeature = feature;
        }
    });
    // Handle point feature popup
    if (pointFeature) {
        var coordinates = pointFeature.getGeometry().getCoordinates();
        var name = pointFeature.get('name');
        var address = pointFeature.get('address');
        var phonenumbe = pointFeature.get('phone_no');
        popup.getElement().innerHTML = '<strong style="color:blue">Name -</strong> ' + name +
            '<br><br><strong style="color:blue">Address -</strong> ' + address +
            '<br><br><strong style="color:blue">Phone No. -</strong> ' + phonenumbe;
        popup.setPosition(coordinates);
        // Hide other popups
        popupContainer.style.display = 'none';
        return;
    }
	// --- GetFeatureInfo for Sewage (Diameter / Length both) ---
	let activeSewageLayer = null;
	let queryLayerName = null;

	// decide which sewage layer is active
	if (sewageDiameter.getVisible()) {
	  activeSewageLayer = sewageDiameter;
	  queryLayerName = "Lko_Summary:LNN_Sewage_net_diameter";
	}
	else if (sewageLength.getVisible()) {
	  activeSewageLayer = sewageLength;
	  queryLayerName = "Lko_Summary:LNN_Sewage_net_length";
	}

	if (activeSewageLayer) {

	  const viewResolution = map.getView().getResolution();

	  const url = activeSewageLayer.getSource().getFeatureInfoUrl(
	    event.coordinate,
	    viewResolution,
	    map.getView().getProjection(),
	    {
	      INFO_FORMAT: "application/json",
	      QUERY_LAYERS: queryLayerName
	    }
	  );

	  if (url) {
	    fetch(url)
	      .then(r => r.json())
	      .then(data => {

	        if (!data || !data.features || data.features.length === 0) return;

	        const props = data.features[0].properties;

	        const zone = props.zone_no ?? "N/A";
	        const ward = props.ward_no ?? "N/A";
	        const length = props.length ?? "N/A";
	        const diameter = props.dia_mm ?? "N/A";

	        popup.getElement().innerHTML =
	          '<h5 style="margin:0 0 6px 0; color:#0a4a7a; font-weight:bold;">Sewage Information</h5>' +
	          '<strong style="color:blue">Zone:</strong> ' + zone +
	          '<br><strong style="color:blue">Ward:</strong> ' + ward +
	          '<br><strong style="color:blue">Length (m):</strong> ' + length +
	          '<br><strong style="color:blue">Diameter (mm):</strong> ' + diameter;

	        popup.setPosition(event.coordinate);
	       // popupContainer.style.display = "block";
	      })
	      .catch(err => console.log(err));
	  }

	  return; // stop other popup handling
	}

	
	/*
if (lineFeature) {
        var properties = lineFeature.getProperties();
        var coordinate = event.coordinate;
        var contentHtml = '<h6>Road Data</h6>';
        for (var key in properties) {
            if (properties.hasOwnProperty(key) && key !== 'geometry' && key !== 'row_left' && key !== 'row_right') {
                contentHtml += '<p><strong>' + key + ':</strong> ' + properties[key] + '</p>';
            }
        }
        content.innerHTML = contentHtml;
        overlay.setPosition(coordinate);
        // Hide other popups
        popupContainer.style.display = 'none';
        return;
    }*/
	
    // Handle polygon feature popup
    if (polygonFeature) {
        var name = polygonFeature.get('name');
        popupContainer.innerHTML = '<strong style="color:green">Name:</strong> ' + name;
        popupContainer.style.display = 'block';
        // Hide other popups
        popup.setPosition(undefined);
        return;
    }
    // Hide all popups if no feature is found
    if (!pointFeature && !lineFeature && !polygonFeature) {
        popup.setPosition(undefined);
        popupContainer.style.display = 'none';
    }
});
// Handle pointer move to change cursor style when hovering over features
map.on('pointermove', function (event) {
    var hit = map.hasFeatureAtPixel(event.pixel);
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});


//  //----------------------------------optimise amenities-----------------------------

function createIconStyle(iconPath, scale = 0.05) {
    return new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: iconPath,
            scale: scale,
        })
    });
}

function createVectorLayer(source) {
    return new ol.layer.Vector({
        source: source,
        visible: false
    });
}

function amenitiesFeatures(type, iconStyle, vectorSource, layer, elementId) {
  //  console.log("The URL is:", `${BASE_URL}/getLocationData?type=${type}`);
    fetch(`${BASE_URL}/getLocationData?type=${type}`)
        .then(response => response.json())
        .then(data => {
            const features = data.data.map(point => {
                try {
					let coordsText = point.geom_point
					                    .replace('MULTIPOINT((', '')
					                    .replace('))', '')
					                    .replace('POINT(', '')
					                    .replace(')', '');
				      const coords = coordsText.trim().split(' ');
					  const lonLat = [parseFloat(coords[0]), parseFloat(coords[1])];

                    const feature = new ol.Feature({
                        geometry: new ol.geom.Point(lonLat),
                        name: point.name,
                        address: point.address,
                        phonenumbe: point.phonenumbe
                    });

                    feature.setStyle(iconStyle);
                    return feature;
                } catch (error) {
                    console.error(`Error adding ${type} feature:`, error);
                }
            }).filter(Boolean);

            vectorSource.addFeatures(features);
           // console.log(`${type} features added:`, features);

            document.getElementById(elementId).addEventListener('change', function () {
                layer.setVisible(this.checked);
            });
        })
        .catch(error => console.error(`Error fetching ${type} data:`, error));
}

// Location Types and Fetching Features for Points
const locationTypes = [
    { type: 'bank', icon: '../assets/icons/bank.png', id: 'showBanks' },
    { type: 'bus', icon: '../assets/icons/bus.png', id: 'showBus' },
   // { type: 'charging', icon: '../assets/icons/charging.png', id: 'showCar' },
    { type: 'hospital', icon: '../assets/icons/hospital.png', id: 'showHospital' },
    { type: 'education', icon: '../assets/icons/education.png', id: 'showEducation' },
    { type: 'hotel', icon: '../assets/icons/hotel.png', id: 'showHotel' },
    { type: 'petrol', icon: '../assets/icons/fuel.png', id: 'showPetrol' },
    { type: 'graveyard', icon: '../assets/icons/graveyard.png', id: 'showGraveyard' },
    { type: 'religious', icon: '../assets/icons/Book.png', id: 'showReligious' },
    { type: 'post_office', icon: '../assets/icons/post-office.png', id: 'showPostOffice' },
    { type: 'central_gov', icon: '../assets/icons/Central.png', id: 'showCentralGov', scale: 0.05},
    { type: 'state_gov', icon: '../assets/icons/State.png', id: 'showStateGov', scale: 0.02 },
    { type: 'stadium', icon: '../assets/icons/stadium.png', id: 'showStadium' } // Added Stadium
];

locationTypes.forEach(location => {
    const vectorSource = new ol.source.Vector();
    const vectorLayer = createVectorLayer(vectorSource);
    map.addLayer(vectorLayer);

    const iconStyle = createIconStyle(location.icon, location.scale || 0.05);
    amenitiesFeatures(location.type, iconStyle, vectorSource, vectorLayer, location.id);
});

//------------------------------------------------park---------------------//

function createPolygonStyle() {
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0, 150, 0, 0.5)', // Green color with 50% opacity
        }),
        stroke: new ol.style.Stroke({
            color: '#00FF00', // Green border
            width: 2,
        }),
    });
}

// Fetch and Add Polygon Features for Parks
function park_amenityFeature(url, vectorSource, layer, elementId) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
           // console.log('Fetched park data:', data);

            if (!data || !Array.isArray(data.data)) {
                throw new Error('Invalid data format: expected an object with an array in "data" property.');
            }

            const format = new ol.format.WKT();
            const features = data.data.map(park => {
                const wkt = park.geom_point;

                if (!wkt || typeof wkt !== 'string' || wkt.trim() === '') {
                    console.warn('Skipping empty or invalid WKT:', wkt);
                    return null;
                }

                try {
                    const feature = format.readFeature(wkt, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:4326' // Use 'EPSG:3857' if map view is in web mercator
                    });

                    feature.setStyle(createPolygonStyle());
                    feature.set('name', park.name || 'Unnamed Park');
                    return feature;
                } catch (error) {
                    console.error('Error converting WKT to Feature:', wkt, error);
                    return null;
                }
            }).filter(Boolean); // Remove nulls

            if (features.length > 0) {
                vectorSource.addFeatures(features);
              //  console.log('Park features added:', features);

                map.getView().fit(vectorSource.getExtent(), {
                    size: map.getSize(),
                    maxZoom: 12
                });
            } else {
                console.warn('No valid park features to display.');
            }

            const checkbox = document.getElementById(elementId);
            if (checkbox) {
                checkbox.addEventListener('change', function () {
                    layer.setVisible(this.checked);
                });
            } else {
                console.warn(`Element with ID "${elementId}" not found.`);
            }
        })
        .catch(error => {
            console.error('Error fetching park data:', error);
        });
}

// Add Park Layer (Polygon-based)
const parkVectorSource = new ol.source.Vector();
const parkVectorLayer = createVectorLayer(parkVectorSource);
map.addLayer(parkVectorLayer);

// Fetch and add park features
park_amenityFeature(`${BASE_URL}/getPark_newName`, parkVectorSource, parkVectorLayer, 'showParks');



//------------------------ query panel ---------------------------------/ /
document.getElementById('load-layer').addEventListener('click', function () {
    const loadLayer = document.getElementById('table_data');
    if (loadLayer.style.display === 'none' || loadLayer.style.display === '') {
        loadLayer.style.display = 'flex';
    } else {
        loadLayer.style.display = 'none';
    }
});

draw_type.onchange = function () {
    map.removeInteraction(draw1);
    if (draw) {
        map.removeInteraction(draw);
        map.removeOverlay(helpTooltip);
        map.removeOverlay(measureTooltip);
    }
    if (vectorLayer) {
        vectorLayer.getSource().clear();
    }
    if (vector1) {
        vector1.getSource().clear();
        // $('#table').empty();
    }
    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");
        //$('#measure_tool').empty();
        //alert(elem.length);
        for (var i = elem.length - 1; i >= 0; i--) {
            elem[i].remove();
            //alert(elem[i].innerHTML);
        }
    }
    add_draw_Interaction();
};
var source1 = new ol.source.Vector({
    wrapX: false,
});
var vector1 = new ol.layer.Vector({
    source: source1,
});
map.addLayer(vector1);
var draw1;
// layer dropdown query
$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: `${GEOSERVER_BASE_URL}/wfs?request=getCapabilities`,
        dataType: "xml",
        success: function (xml) {
            var select = $("#layer");
            const targetLayer = "Lko_Summary:lucknow_road_net"; // your desired layer
            $(xml)
                .find("FeatureType")
                .each(function () {
                    var name = $(this).find("Name").text().trim();
                    if (name === targetLayer) {
                        select.append(
                            `<option class='ddindent' value='${name}'>${name}</option>`
                        );
                    }
                });
        },
        error: function (xhr, status, error) {
            console.error("GeoServer request failed:", error);
        },
    });
});
// attribute dropdown
$(function () {
    $("#layer").change(function () {
        var attributes = document.getElementById("attributes");
        var length = attributes.options.length;
        for (i = length - 1; i >= 0; i--) {
            attributes.options[i] = null;
        }
        var value_layer = $(this).val();
        attributes.options[0] = new Option("Select attributes", "");
        //  alert(url);
        $(document).ready(function () {
            $.ajax({
                type: "GET",
                url:
                    `${GEOSERVER_BASE_URL}/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName=` +
                    value_layer,
                dataType: "xml",
                success: function (xml) {
                    var select = $("#attributes");
                    //var title = $(xml).find('xsd\\:complexType').attr('name');
                    //  alert(title);
                    $(xml)
                        .find("xsd\\:sequence")
                        .each(function () {
                            $(this)
                                .find("xsd\\:element")
                                .each(function () {
                                    var value = $(this).attr("name");
                                    //alert(value);
                                    var type = $(this).attr("type");
                                    //alert(type);
                                    if (value != "geom" && value != "the_geom") {
                                        select.append(
                                            "<option class='ddindent' value='" +
                                            type +
                                            "'>" +
                                            value +
                                            "</option>"
                                        );
                                    }
                                });
                        });
                },
            });
        });
    });
});
// // operator combo
$(function () {
    $("#attributes").change(function () {
        var operator = document.getElementById("operator");
        var length = operator.options.length;
        for (i = length - 1; i >= 0; i--) {
            operator.options[i] = null;
        }
        var value_type = $(this).val();
        // alert(value_type);
        var value_attribute = $("#attributes option:selected").text();
        operator.options[0] = new Option("Select operator", "");
        if (
            value_type == "xsd:short" ||
            value_type == "xsd:int" ||
            value_type == "xsd:double" ||
             value_type == "xsd:string" ||  
               value_type.includes("float") ||
            value_type.includes("decimal")||
            value_type == "xsd:long"
        ) {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option("Greater than", ">");
            operator1.options[2] = new Option("Less than", "<");
          //   operator1.options[3] = new Option("Like", "ILike");
            operator1.options[3] = new Option("Equal to", "=");
              operator1.options[4] = new Option('Between', 'BETWEEN');
        } else if (value_type == "xsd:string") {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option("Greater than", ">");
            operator1.options[2] = new Option("Less than", "<");
         //   operator1.options[3] = new Option("Like", "ILike");
             operator1.options[3] = new Option("Equal to", "=");
        }
    });
});

var highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: "rgba(255,0,0,0.3)",
    }),
    stroke: new ol.style.Stroke({
        color: "yellow",
        width: 3,
    }),
    image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({
            color: "white",
        }),
    }),
});
// function for finding row in the table when feature selected on map
function findRowNumber(cn1, v1) {
    var table = document.querySelector("#table");
    var rows = table.querySelectorAll("tr");
    var msg = "No such row exist";
    for (i = 1; i < rows.length; i++) {
        var tableData = rows[i].querySelectorAll("td");
        if (tableData[cn1 - 1].textContent == v1) {
            msg = i;
            break;
        }
    }
    return msg;
}
// function for loading query
function query() {
    $("#table").empty();
    if (geojson) {
        map.removeLayer(geojson);
    }
    if (selectedFeature) {
        selectedFeature.setStyle();
        selectedFeature = undefined;
    }
    if (vector1) {
        vector1.getSource().clear();
        // $('#table').empty();
    }
    //alert('jsbchdb');
    var layer = document.getElementById("layer");
    var value_layer = layer.options[layer.selectedIndex].value;
    //alert(value_layer);
    var attribute = document.getElementById("attributes");
    var value_attribute = attribute.options[attribute.selectedIndex].text;
    var operator = document.getElementById("operator");
    var value_operator = operator.options[operator.selectedIndex].value;
    //alert(value_operator);
    var txt = document.getElementById("value");
    var value_txt = txt.value;
    let cqlFilter = "";

if (value_operator === "BETWEEN") {

    const parts = value_txt.split(",");

    if (parts.length !== 2) {
        alert("For BETWEEN, enter value as: min,max");
        return;
    }

    const minVal = parts[0].trim();
    const maxVal = parts[1].trim();

    cqlFilter = `${value_attribute} BETWEEN ${minVal} AND ${maxVal}`;

} 
else if (value_operator === "ILike") {

    cqlFilter = `${value_attribute} ILIKE '%${value_txt}%'`;

} 
else {

    cqlFilter = `${value_attribute} ${value_operator} '${value_txt}'`;
}

    // if (value_operator == "ILike") {
    //     value_txt = "'" + value_txt + "%25'";
    //     //alert(value_txt);
    //     //value_attribute = 'strToLowerCase('+value_attribute+')';
    // } else {
    //     value_txt = value_txt;
    //     //value_attribute = value_attribute;
    // }
    //alert(value_txt);
    var url =
       
        `${GEOSERVER_BASE_URL}/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=${value_layer}&CQL_FILTER=${encodeURIComponent(cqlFilter)}&outputFormat=application/json`;
    //console.log(url);
    style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new ol.style.Stroke({
            color: "#8ECAED",
            width: 5,
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: "#8ECAED",
            }),
        }),
    });
    geojson = new ol.layer.Vector({
        //title:'dfdfd',
        //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
        source: new ol.source.Vector({
            url: url,
            format: new ol.format.GeoJSON(),
        }),
        style: style,
    });
    geojson.getSource().on("addfeature", function () {
        //alert(geojson.getSource().getExtent());
        map.getView().fit(geojson.getSource().getExtent(), {
            duration: 1590,
            size: map.getSize(),
        });
    });
    //overlays.getLayers().push(geojson);
    map.addLayer(geojson);
    $.getJSON(url, function (data) {
        var col = [];
        col.push("id");
        for (var i = 0; i < data.features.length; i++) {
            for (var key in data.features[i].properties) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }
		var table = document.createElement("table");
				table.setAttribute("class", "table table-hover table-striped");
				table.setAttribute("id", "table");

				var caption = document.createElement("caption");
				caption.setAttribute("id", "caption");
				caption.style.captionSide = "top";
				caption.style.backgroundColor = "#51929F";
				caption.style.color = "black";
				caption.style.padding = "6px";

				// 🔹 TEXT (Number of Features)
				var text = document.createElement("b");
				text.style.fontWeight = "900";
				text.style.color = "black";
				text.style.fontSize = "small";
				text.innerText = "Number of Features : " + data.features.length;

				// 🔹 CANCEL BUTTON
				var cancelBtn = document.createElement("button");
				cancelBtn.innerText = "✖";
				cancelBtn.style.marginLeft = "89%";
				cancelBtn.style.cursor = "pointer";
				cancelBtn.style.fontSize = "12px";
				cancelBtn.style.border = "none";
				cancelBtn.style.background = "transparent";

				// ❌ click par table remove
				cancelBtn.onclick = function () {
				    const tableDiv = document.getElementById("table_data");

				    // table remove
				    tableDiv.innerHTML = "";
				    tableDiv.style.height = "0";
				    tableDiv.style.display = "none";

				    // map full height

				    // OpenLayers ko resize signal
				    map.updateSize();
				};

				// caption me add karo
				caption.appendChild(text);
				caption.appendChild(cancelBtn);
				table.appendChild(caption);

				// ---------- TABLE HEADER ----------
				var tr = table.insertRow(-1);
				for (var i = 0; i < col.length - 22; i++) {
				    var th = document.createElement("th");
				    th.innerHTML = col[i];
				    tr.appendChild(th);
				}

				// ---------- TABLE DATA ----------
				for (var i = 0; i < data.features.length; i++) {
				    tr = table.insertRow(-1);
				    for (var j = 0; j < col.length - 22; j++) {
				        var tabCell = tr.insertCell(-1);
				        if (j == 0) {
				            tabCell.innerHTML = data.features[i]["id"];
				        } else {
				            tabCell.innerHTML = data.features[i].properties[col[j]];
				        }
				    }
				}

		        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
		          var divContainer = document.getElementById("table_data");
		        divContainer.innerHTML = "";
		        divContainer.appendChild(table);
		        document.getElementById("map").style.height = "100%";
		        document.getElementById("table_data").style.height = "20.6%";
		        map.updateSize();
		        addRowHandlers();
		    });
		    map.on("singleclick", highlight);
		}
            // highlight the feature on map and table on map click
            function highlight(evt) {
                if (selectedFeature) {
                    selectedFeature.setStyle();
                    selectedFeature = undefined;
                }
                var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
                    return feature;
                });
                if (feature && feature.getId() != undefined) {
                    var geometry = feature.getGeometry();
                    var coord = geometry.getCoordinates();
                    var coordinate = evt.coordinate;

                    $(function () {
                        $("#table td").each(function () {
                            $(this).parent("tr").css("background-color", "white");
                        });
                    });
                    feature.setStyle(highlightStyle);
                    selectedFeature = feature;
                    var table = document.getElementById("table");
                    var cells = table.getElementsByTagName("td");
                    var rows = document.getElementById("table").rows;
                    var heads = table.getElementsByTagName("th");
                    var col_no;
                    for (var i = 0; i < heads.length; i++) {
                        // Take each cell
                        var head = heads[i];
                        //alert(head.innerHTML);
                        if (head.innerHTML == "id") {
                            col_no = i + 1;
                            //alert(col_no);
                        }
                    }
                    var row_no = findRowNumber(col_no, feature.getId());
                    //alert(row_no);
                    var rows = document.querySelectorAll("#table tr");
                    rows[row_no].scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                    $(document).ready(function () {
                        $("#table td:nth-child(" + col_no + ")").each(function () {
                            if ($(this).text() == feature.getId()) {
                                $(this).parent("tr").css("background-color", "grey");
                            }
                        });
                    });
                } else {
                    $(function () {
                        $("#table td").each(function () {
                            $(this).parent("tr").css("background-color", "white");
                        });
                    });
                }

            }
            // highlight the feature on map and table on row select in table
            function addRowHandlers() {
                var rows = document.getElementById("table").rows;
                var heads = table.getElementsByTagName("th");
                var col_no;
                for (var i = 0; i < heads.length; i++) {
                    // Take each cell
                    var head = heads[i];
                    //alert(head.innerHTML);
                    if (head.innerHTML == "id") {
                        col_no = i + 1;
                        //alert(col_no);
                    }
                }
                for (i = 0; i < rows.length; i++) {
                    rows[i].onclick = (function () {
                        return function () {
                            if (selectedFeature) {
                                selectedFeature.setStyle();
                                selectedFeature = undefined;
                            }
                            $(function () {
                                $("#table td").each(function () {
                                    $(this).parent("tr").css("background-color", "white");
                                });
                            });
                            var cell = this.cells[col_no - 1];
                            var id = cell.innerHTML;
                            $(document).ready(function () {
                                $("#table td:nth-child(" + col_no + ")").each(function () {
                                    if ($(this).text() == id) {
                                        $(this).parent("tr").css("background-color", "grey");
                                    }
                                });
                            });
                            var features = geojson.getSource().getFeatures();
                            for (i = 0; i < features.length; i++) {
                                if (features[i].getId() == id) {
                                    //alert(features[i].feature.id);
                                    features[i].setStyle(highlightStyle);
                                    selectedFeature = features[i];
                                    var featureExtent = features[i].getGeometry().getExtent();
                                    if (featureExtent) {
                                        map.getView().fit(featureExtent, {
                                            duration: 1590,
                                            size: map.getSize(),
                                        });
                                    }
                                }
                            }
                            //alert("id:" + id);
                        };
                    })(rows[i]);
                }
            }






// //------------- draw function in query panel----------------------//
draw_type.onchange = function () {
    map.removeInteraction(draw1);
    if (draw) {
        map.removeInteraction(draw);
        map.removeOverlay(helpTooltip);
        map.removeOverlay(measureTooltip);
    }
    if (vectorLayer) {
        vectorLayer.getSource().clear();
    }
    if (vector1) {
        vector1.getSource().clear();
        // $('#table').empty();
    }
    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");
        //$('#measure_tool').empty();
        //alert(elem.length);
        for (var i = elem.length - 1; i >= 0; i--) {
            elem[i].remove();
            //alert(elem[i].innerHTML);
        }
    }
    add_draw_Interaction();
};
var source1 = new ol.source.Vector({
    wrapX: false,
});
var vector1 = new ol.layer.Vector({
    source: source1,
});
map.addLayer(vector1);
var draw1;
// measure Tool
function add_draw_Interaction() {
    var value = draw_type.value;
    //alert(value);
    if (value !== "None") {
        var geometryFunction;
        if (value === "Square") {
            value = "Circle";
            geometryFunction = new ol.interaction.Draw.createRegularPolygon(4);
        } else if (value === "Box") {
            value = "Circle";
            geometryFunction = new ol.interaction.Draw.createBox();
        } else if (value === "Star") {
            value = "Circle";
            geometryFunction = function (coordinates, geometry) {
                //alert(value);
                var center = coordinates[0];
                var last = coordinates[1];
                var dx = center[0] - last[0];
                var dy = center[1] - last[1];
                var radius = Math.sqrt(dx * dx + dy * dy);
                var rotation = Math.atan2(dy, dx);
                var newCoordinates = [];
                var numPoints = 12;
                for (var i = 0; i < numPoints; ++i) {
                    var angle = rotation + (i * 2 * Math.PI) / numPoints;
                    var fraction = i % 2 === 0 ? 1 : 0.5;
                    var offsetX = radius * fraction * Math.cos(angle);
                    var offsetY = radius * fraction * Math.sin(angle);
                    newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
                }
                newCoordinates.push(newCoordinates[0].slice());
                if (!geometry) {
                    geometry = new ol.geom.Polygon([newCoordinates]);
                } else {
                    geometry.setCoordinates([newCoordinates]);
                }
                return geometry;
            };
        }
        // map.addInteraction(draw1);
        if (draw_type.value == "select" || draw_type.value == "clear") {
            if (draw1) {
                map.removeInteraction(draw1);
            }
            vector1.getSource().clear();
            if (geojson) {
                geojson.getSource().clear();
                map.removeLayer(geojson);
            }
        } else if (
            draw_type.value == "Square" ||
            draw_type.value == "Polygon" ||
            draw_type.value == "Circle" ||
            draw_type.value == "Star" ||
            draw_type.value == "Box"
        ) {
            draw1 = new ol.interaction.Draw({
                source: source1,
                type: value,
                geometryFunction: geometryFunction,
            });
            map.addInteraction(draw1);
            draw1.on("drawstart", function (evt) {
                if (vector1) {
                    vector1.getSource().clear();
                }
                if (geojson) {
                    geojson.getSource().clear();
                    map.removeLayer(geojson);
                }

                //alert('bc');
            });
            draw1.on("drawend", function (evt) {
                var feature = evt.feature;
                var coords = feature.getGeometry();
                //console.log(coords);
                var format = new ol.format.WKT();
                var wkt = format.writeGeometry(coords);
                var layer_name = document.getElementById("layer1");
                var value_layer = layer_name.options[layer_name.selectedIndex].value;
                var url =
                    `${GEOSERVER_BASE_URL}/wfs?request=GetFeature&version=1.0.0&typeName=${value_layer}&outputFormat=json&cql_filter=INTERSECTS(geom,${wkt})`;
                //alert(url);
                style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: "rgba(255, 255, 255, 0.2)",
                    }),
                    stroke: new ol.style.Stroke({
                        color: "#ffcc33",
                        width: 3,
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: "#ffcc33",
                        }),
                    }),
                });
                geojson = new ol.layer.Vector({
                    // title:'dfdfd',
                    // title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
                    source: new ol.source.Vector({
                        url: url,
                        format: new ol.format.GeoJSON(),
                    }),
                    style: style,
                });
                geojson.getSource().on("addfeature", function () {
                    //alert(geojson.getSource().getExtent());
                    map.getView().fit(geojson.getSource().getExtent(), {
                        duration: 1590,
                        size: map.getSize(),
                    });
                });
                //overlays.getLayers().push(geojson);
                map.addLayer(geojson);
                map.removeInteraction(draw1);
                $.getJSON(url, function (data) {
                    var col = [];
                    col.push("id");
                    for (var i = 0; i < data.features.length; i++) {
                        for (var key in data.features[i].properties) {
                            if (col.indexOf(key) === -1) {
                                col.push(key);
                            }
                        }
                    }
                    var table = document.createElement("table");
                    table.setAttribute("class", "table table-hover table-striped");
                    table.setAttribute("id", "table1");
                    var caption = document.createElement("caption");
                    caption.setAttribute("id", "caption");
                   caption.style.captionSide = "top";
                    caption.style.backgroundColor = "#51929f";
                    caption.style.color = "black";
                    caption.innerHTML =
                      //  value_layer +
                        "<b> (Number of Features : " +
                        data.features.length +
                        " )</b>";
                    table.appendChild(caption);
                    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
                    var tr = table.insertRow(-1); // TABLE ROW.
                    for (var i = 0; i < col.length; i++) {
                        var th = document.createElement("th"); // TABLE HEADER.
                        th.innerHTML = col[i];
                        tr.appendChild(th);
                    }
                    // ADD JSON DATA TO THE TABLE AS ROWS.
                    for (var i = 0; i < data.features.length; i++) {
                        tr = table.insertRow(-1);
                        for (var j = 0; j < col.length; j++) {
                            var tabCell = tr.insertCell(-1);
                            if (j == 0) {
                                tabCell.innerHTML = data.features[i]["id"];
                            } else {
                                //alert(data.features[i]['id']);
                                tabCell.innerHTML = data.features[i].properties[col[j]];
                                //alert(tabCell.innerHTML);
                            }
                        }
                    }
                    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
                    var divContainer = document.getElementById("table_data");
                    divContainer.innerHTML = "";
                    divContainer.appendChild(table);
                    document.getElementById("map").style.height = "71%";
                    document.getElementById("table_data").style.height = "29%";
                    map.updateSize();
                    addRowHandlers();
                });
                map.on("singleclick", highlight);
            });
        }
    }
}
var source = new ol.source.Vector();
var vectorLayer = new ol.layer.Vector({
    //title: 'layer',
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new ol.style.Stroke({
            color: "#ffcc33",
            width: 2,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: "#ffcc33",
            }),
        }),
    }),
});
map.addLayer(vectorLayer);
/**
 * Currently drawn feature.
 * @type {module:ol/Feature~Feature}
 */
var sketch;
/**
 * The help tooltip element.
 * @type {Element}
 */
var helpTooltipElement;
/**
 * Overlay to show the help messages.
 * @type {module:ol/Overlay}
 */
var helpTooltip;
/**
 * The measure tooltip element.
 * @type {Element}
 */
var measureTooltipElement;
/**
 * Overlay to show the measurement.
 * @type {module:ol/Overlay}
 */
var measureTooltip;
/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
var continuePolygonMsg = "Click to continue drawing the polygon";
/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
var continueLineMsg = "Click to continue drawing the line";
var draw; // global so we can remove it later
/**
 * Format length output.
 * @param {module:ol/geom/LineString~LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function (line) {
    var length = ol.sphere.getLength(line, {
        projection: "EPSG:4326",
    });
    //var length = getLength(line);
    //var length = line.getLength({projection:'EPSG:4326'});
    var output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + " " + "km";
    } else {
        output = Math.round(length * 100) / 100 + " " + "m";
    }
    return output;
};
/**
 * Format area output.
 * @param {module:ol/geom/Polygon~Polygon} polygon The polygon.
 * @return {string}// Formatted area.
 */
var formatArea = function (polygon) {
    // var area = getArea(polygon);
    var area = ol.sphere.getArea(polygon, {
        projection: "EPSG:4326",
    });
    // var area = polygon.getArea();
    //alert(area);
    var output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
    } else {
        output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
    }
    return output;
};
function addInteraction() {
    if (measuretype.value == "select" || measuretype.value == "clear") {
        if (draw) {
            map.removeInteraction(draw);
        }
        if (vectorLayer) {
            vectorLayer.getSource().clear();
        }
        if (helpTooltip) {
            map.removeOverlay(helpTooltip);
        }
        if (measureTooltipElement) {
            var elem = document.getElementsByClassName("tooltip tooltip-static");
            //$('#measure_tool').empty();
            //alert(elem.length);
            for (var i = elem.length - 1; i >= 0; i--) {
                elem[i].remove();
                //alert(elem[i].innerHTML);
            }
        }
        //var elem1 = elem[0].innerHTML;
        //alert(elem1);
    } else if (measuretype.value == "area" || measuretype.value == "length") {
        var type;
        if (measuretype.value == "area") {
            type = "Polygon";
        } else if (measuretype.value == "length") {
            type = "LineString";
        }
        //alert(type);
        //var type = (measuretype.value == 'area' ? 'Polygon' : 'LineString');
        draw = new ol.interaction.Draw({
            source: source,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: "rgba(255, 255, 255, 0.5)",
                }),
                stroke: new ol.style.Stroke({
                    color: "rgba(0, 0, 0, 0.5)",
                    lineDash: [10, 10],
                    width: 2,
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: "rgba(0, 0, 0, 0.7)",
                    }),
                    fill: new ol.style.Fill({
                        color: "rgba(255, 255, 255, 0.5)",
                    }),
                }),
            }),
        });
        map.addInteraction(draw);
        createMeasureTooltip();
        createHelpTooltip();
        /**
         * Handle pointer move.
         * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
         */
        var pointerMoveHandler = function (evt) {
            if (evt.dragging) {
                return;
            }
            /** @type {string} */
            var helpMsg = "Click to start drawing";
            if (sketch) {
                var geom = sketch.getGeometry();
                if (geom instanceof ol.geom.Polygon) {
                    helpMsg = continuePolygonMsg;
                } else if (geom instanceof ol.geom.LineString) {
                    helpMsg = continueLineMsg;
                }
            }
            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);
            helpTooltipElement.classList.remove("hidden");
        };
        map.on("pointermove", pointerMoveHandler);
        map.getViewport().addEventListener("mouseout", function () {
            helpTooltipElement.classList.add("hidden");
        });
        var listener;
        draw.on(
            "drawstart",
            function (evt) {
                // set sketch
                //vectorLayer.getSource().clear();
                sketch = evt.feature;
                /** @type {module:ol/coordinate~Coordinate|undefined} */
                var tooltipCoord = evt.coordinate;
                listener = sketch.getGeometry().on("change", function (evt) {
                    var geom = evt.target;
                    var output;
                    if (geom instanceof ol.geom.Polygon) {
                        output = formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    } else if (geom instanceof ol.geom.LineString) {
                        output = formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            },
            this
        );
        draw.on(
            "drawend",
            function () {
                measureTooltipElement.className = "tooltip tooltip-static";
                measureTooltip.setOffset([0, -7]);
                // unset sketch
                sketch = null;
                // unset tooltip so that a new one can be created
                measureTooltipElement = null;
                createMeasureTooltip();
                ol.Observable.unByKey(listener);
            },
            this
        );
    }
}
/**
 * Creates a new help tooltip
 */

// function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement("div");
    helpTooltipElement.className = "tooltip hidden";
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: "center-left",
    });
    map.addOverlay(helpTooltip);
//}
/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement("div");
    measureTooltipElement.className = "tooltip tooltip-measure";
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: "bottom-center",
    });
    map.addOverlay(measureTooltip);
}

/*----------------------------------------- javascript for sidebar----------------------------------------- */

//const dataTableBody = document.getElementById('dataBody');
const dataTableBody_summary = document.getElementById('dataBody_summary');
const dataTableBody_summaryfilter = document.getElementById('dataBody_summaryfilter');

//----------------- table Cancel btn ----------------------------//
document.querySelectorAll('.table-cancel-btn1').forEach(function (element) {
    element.addEventListener('click', function () {
       //  document.getElementById('tableContainer_summary',).style.display = 'none';
        document.getElementById('Scoreing_tableContainer').style.display = 'none';
        document.getElementById('tableContainer_summary').style.display = 'none';
        document.getElementById('tableContainer_summaryfilter').style.display = 'none';
        document.getElementById('summary-table').style.display = 'block';

        const Materiallegend = document.getElementById('Material_legend');
        Materiallegend.style.display = 'none';
        const Conditionlegend = document.getElementById('Condition_legend');
        Conditionlegend.style.display = 'none';
		const typelegend = document.getElementById('Type_legend');
		        typelegend.style.display = 'none';

        const Ownerlegend = document.getElementById('Ownership_legend');
        Ownerlegend.style.display = 'none';
        const CUSlegend = document.getElementById('CUS_legend');
        CUSlegend.style.display = 'none';
        const RoadCatlegend = document.getElementById('RoadCategory_legend');
        RoadCatlegend.style.display = 'none';
        
    });
});

const hamburger = document.querySelector(".hamburger");
const sidebar = document.querySelector(".sidebar");
const cancelIcon = document.querySelector(".cancel-icon");

hamburger.addEventListener("click", () => {
    sidebar.classList.toggle("show");
    document.getElementById('query_tab').style.display = 'none';
    document.getElementById('road-filter').style.display = 'none';
});

cancelIcon.addEventListener("click", () => {
    sidebar.classList.remove("show");
});

document.querySelectorAll('.tab-cancel-icon').forEach(function (element) {
    element.addEventListener('click', function () {
        document.getElementById('query_tab').style.display = 'none';
        document.getElementById('measure-tab').style.display = 'none';
        document.getElementById('street-tab').style.display = 'none';
    });
});

//---------------------------- query panel ---------------------//
function query_panel1() {
    var x = document.getElementById("query_tab");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}



//-------------- zone wise road filter start-----------------//
function road_filter() {
    const roadFilter = document.getElementById('road-filter');
    roadFilter.style.display = roadFilter.style.display === 'block' ? 'none' : 'block';
   
}
//-------------- drain filter --------------------------//
function drain_filter() {
    const drainFilter = document.getElementById('drain-filter');
    drainFilter.style.display = drainFilter.style.display === 'block' ? 'none' : 'block';
}

//------------------------ Road , Drain filter & Street View Function toggle ------------------------//

let currentFilter = null; // Variable to track the currently visible filter

// Function to toggle road filter visibility
function road_filter() {
    toggleFilter('road-filter');
}

// Function to toggle drain filter visibility
function drain_filter() {
    toggleFilter('drain-filter');
}

// Function to handle the visibility of filters and street view
function toggleFilter(filterId) {
    const filters = ['road-filter']//, 'drain-filter']; // List of filter IDs

    filters.forEach(id => {
        const filter = document.getElementById(id);
        if (id === filterId) {
            // Toggle the clicked filter's visibility
            if (filter.style.display === 'block') {
                filter.style.display = 'none';
                currentFilter = null;
            } else {
                filter.style.display = 'block';
                currentFilter = id;
            }
        } else {
            // Hide other filters
            filter.style.display = 'none';
        }
    });
}

document.getElementById('clear-icon').onclick = clearAllVectorLayers;
function clearAllVectorLayers() {
    clearVectorLayers();

    map.getLayers().getArray().forEach(layer => {
        if (layer instanceof ol.layer.Vector) {
            layer.getSource().clear();
        }
    });

    zoomToIndia();
    if (typeof currentLayer !== 'undefined' && currentLayer) {
        map.removeLayer(currentLayer);
    }
    const elementsToHide = ["road-filter","filterBox", "query_tab","popup_road","tableContainer_summary", "Scoreing_tableContainer",
        "tableContainer_summaryfilter","summary-table" ];
    elementsToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = "none";
        }
    });
    const legendIds = [
        'Priority_legend', 'type_legend', 'Condition_legend','Material_legend', 'Ownership_legend', 'CUS_legend','RoadCategory_legend', 'Drain_Type_Legend',
        'Drain_Condition_Legend', 'Drain_Material_Legend','Drain_Status_Legend'];
    legendIds.forEach(legendID => {
        const legendBtn = document.getElementById(legendID);
        if (legendBtn) {
            legendBtn.style.display = 'none';
        }
    });
    const legendBtn = document.getElementById('legendBtn');
    if (legendBtn) {
        legendBtn.style.bottom = '3%';
    }
    map.getLayers().getArray().slice().forEach(layer => {
        if ((layer instanceof ol.layer.Tile || layer instanceof ol.layer.Image) &&
            (layer.getSource() instanceof ol.source.TileWMS || layer.getSource() instanceof ol.source.ImageWMS)) {
            if (layer.get('title') !== 'Lucknow Zone Boundary' && layer.get('title') !== 'Lucknow Ward Boundary') {
                map.removeLayer(layer);
            }
        }
    });
}


function zoomToIndia() {
    const view = map.getView();

    // Define the approximate bounding box for India
    const extent = ol.proj.transformExtent(
        [82.44302446765529, 26.71400889838419, 82.54602173765878, 26.811349630444568], 
        'EPSG:4326', 
        view.getProjection() 
    );
    // Set the map's center and zoom level explicitly
    view.setCenter([80.9402, 26.8268]);
    view.setZoom(12); 
    view.setRotation(0);

}


//-------------------------------street viewpoints -----------------------------------------//

function street_view() {
    // Remove any existing layer
    removeCurrentLayer();

    // Create the new WMS layer
    currentLayer = new ol.layer.Image({
        title: 'LNN View points',
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms?`,
            params: {
                'LAYERS': 'Lko_Summary:lnnviewpoints',
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    // Add the new layer to the map
    map.addLayer(currentLayer);

    // Define the popup container
    var container = document.getElementById('popup');

    // Set up click event handler
    map.on('singleclick', function (evt) {
        var viewResolution = map.getView().getResolution();
        var url = currentLayer.getSource().getFeatureInfoUrl(
            evt.coordinate, viewResolution, 'EPSG:4326', {
            'INFO_FORMAT': 'text/html'
        });

        console.log('Feature Info URL:', url); // Log the URL for debugging

        if (url) {
            $.get(url)
                .done(function (data) {
                    console.log('Feature Info Response:', data); // Log the response for debugging

                    var contentHtml = '<h6>Street View and Road Images</h6>';
                    var parsedData = $(data);

                    // Initialize variables to store URLs
                    var streetViewUrl = '';
                    var imageUrl = '';

                    // Find the correct <td> elements containing the URLs
                    parsedData.find('td').each(function () {
                        var text = $(this).text().trim();
                        if (text.startsWith('http://maps.google.com') || text.startsWith('https://maps.google.com') || text.startsWith('https://www.google.com')) {
                            streetViewUrl = text;
                        }
                        if (text.startsWith('https://drive.google.com')) {
                            imageUrl = text;
                        }
                    });

                    console.log("street_view_url:", streetViewUrl);
                    console.log("image_url:", imageUrl);

                    // Build popup content with icons
                    if (streetViewUrl || imageUrl) {
                        contentHtml += '<div class="icons-container">';

                        if (streetViewUrl) {
                            contentHtml += '<button class="icon-button" onclick="window.open(\'' + streetViewUrl + '\', \'_blank\')">' +
                                '<img src="/image_path/google-maps.png" alt="Street View" class="icon-img"></button>';
                        }
                        if (imageUrl) {
                            contentHtml += '<button class="icon-button" onclick="window.open(\'' + imageUrl + '\', \'_blank\')">' +
                                '<img src="/image_path/image-files.png" alt="Image" class="icon-img"></button>';
                        }

                        contentHtml += '</div>';
                    } else {
                        contentHtml += '<p>No information available for this point.</p>';
                    }

                    // Display the popup at the clicked coordinate
                    popup.setPosition(evt.coordinate);
                    popup.getElement().innerHTML = contentHtml; // Set popup content
                    container.style.display = 'block'; // Ensure the popup is visible
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    console.error('Error fetching feature info:', textStatus, errorThrown);
                    popup.setPosition(evt.coordinate);
                    popup.getElement().innerHTML = '<p>Failed to fetch feature info.</p>'; // Display error message
                    container.style.display = 'block'; // Ensure the popup is visible
                });
        } else {
            console.error('No URL returned for WMS GetFeatureInfo request.');
        }
    });
}



//---------------------------------------------------- summary table ---------------------------------------------------//



function navigateTo(tabName) {
    const content = document.getElementById('content');
    content.innerHTML = '';

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Add active class to the clicked tab
    const activeTab = Array.from(tabs).find(tab => tab.getAttribute('data-tab') === tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    if (tabName === 'Summary') {
        updateSummary();
    } else if (tabName === 'Zones') {
        if (selectedZone) {
            updateZones(selectedZone);
        } else {
            content.innerHTML = '<p>Select a zone from Summary to see details here.</p>';
        }
    } else if (tabName === 'Wards') {
        if (selectedZone) {
            updateWards(selectedZone);
        } else {
            content.innerHTML = '<p>Select a zone from Summary to see wards details here.</p>';
        }
    } else if (tabName === 'WardDetails') {
        if (selectedZone && selectedWard) {
            updateWardDetails(selectedZone, selectedWard);
        } else {
            content.innerHTML = '<p>Select a ward from Wards to see details here.</p>';
        }
    }

}


// Add event listener to the button with ID 'loadZonesButton'
document.getElementById('table_icon').addEventListener('click', loadZones);

document.getElementById('summary_id').addEventListener('click', loadZones);


/* ------------------------------zone no function calling-------------------------------*/
function loadZones() {
    fetch(`${BASE_URL}/getTotalZone`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("✅ API Response:", data); // For Debugging

            updateSummary(data); // Only call if data structure is valid
        })
        .catch(error => console.error("❌ Error fetching zone data:", error));
}

function updateSummary(data) {
    if (!data || typeof data !== 'object') {
       // console.error("❌ updateSummary() received invalid data:", data);
        return;
    }

    const content = document.getElementById('content');
    if (!content) {
        console.error("❌ #content element not found!");
        return;
    }

    content.innerHTML = '';

    console.log("✅ Received Data in updateSummary:", data); // For Debugging

    const safeValue = (key) => key in data && data[key] !== null && data[key] !== undefined
        ? data[key]
        : 'N/A';

    const summaryData = {
        'No. of Zones': { value: safeValue('zone_count')},
        'Total Road Length': { value: `${safeValue('total_length_km').toFixed(2)} km`},
        'Total No. of Roads': { value: safeValue('total_length_count') },
        'Total Ward No.': { value: safeValue('lko_ward') },
        'Road Count by Condition': {
            value: `
			Good - <a href="javascript:void(0)" onclick="Lucknow_Condition_cat('condition','Good'); updateNavBarWithFunctionName('Road Condition : Good');" style="color:#71DC7F;">${safeValue('condition_count_green')}</a><br>
			               Poor - <a href="javascript:void(0)" onclick="Lucknow_Condition_cat('condition','Poor'); updateNavBarWithFunctionName('Road Condition : Poor');" style="color:#EC3B20;">${safeValue('condition_count_red')}</a><br>
			               Moderate - <a href="javascript:void(0)" onclick="Lucknow_Condition_cat('condition','Moderate'); updateNavBarWithFunctionName('Road Condition : Moderate');" style="color:yellow;">${safeValue('condition_count_yellow')}</a><br>
			           `,
			onclick: 'Lucknow_Condition()'
        },
        'Road Count by Material': {
            value: `
                Bitumen - <a href="javascript:void(0)" onclick="Lucknow_Material_cat('material','Bitumen'); updateNavBarWithFunctionName('Road Material : Bitumen');" style="color:darkred;">${safeValue('count_bitumen')}</a><br>
                CC - <a href="javascript:void(0)" onclick="Lucknow_Material_cat('material','CC'); updateNavBarWithFunctionName('Road Material : CC');" style="color:#1ad7b0;">${safeValue('count_cc')}</a><br>
                Interlocking - <a href="javascript:void(0)" onclick="Lucknow_Material_cat('material','Interlocking'); updateNavBarWithFunctionName('Road Material : Interlocking');" style="color:#2392ed;">${safeValue('count_interlocking')}</a><br>
                BOE - <a href="javascript:void(0)" onclick="Lucknow_Material_cat('material','BOE'); updateNavBarWithFunctionName('Road Material : BOE');" style="color:#f228ab;">${safeValue('count_boe')}</a><br>
                Kachcha - <a href="javascript:void(0)" onclick="Lucknow_Material_cat('material','Kachcha'); updateNavBarWithFunctionName('Road Material : Kachcha');" style="color:#6036d0;">${safeValue('count_kachcha')}</a><br>
                Stone - <a href="javascript:void(0)" onclick="Lucknow_Material_cat('material','Stone'); updateNavBarWithFunctionName('Road Material : Stone');" style="color:#dfc223;">${safeValue('count_stone')}</a>
               
                `,
            onclick: 'Lucknow_Material()'
        },
        'Road Count by Ownership': {
            value: `
                LNN - <a href="javascript:void(0)" onclick="Lucknow_Ownership_cat('ownership','LNN'); updateNavBarWithFunctionName('Road Ownership : Lucknow Nagar Nigam');" style="color:#5aeee5;">${safeValue('count_lnn')}</a><br>
                PWD - <a href="javascript:void(0)" onclick="Lucknow_Ownership_cat('ownership','PWD'); updateNavBarWithFunctionName('Road Ownership : PWD');" style="color:#69E70F;">${safeValue('count_pwd')}</a><br>
                Railway - <a href="javascript:void(0)" onclick="Lucknow_Ownership_cat('ownership','Railway'); updateNavBarWithFunctionName('Road Ownership Railway');" style="color:#dfee2a;">${safeValue('count_railway')}</a><br>
                Private Roads - <a href="javascript:void(0)" onclick="Lucknow_Ownership_cat('ownership','Private'); updateNavBarWithFunctionName('Road Ownership : Private Roads');" style="color:#B91B1E;">${safeValue('count_pvt')}</a><br>
                NHAI - <a href="javascript:void(0)" onclick="Lucknow_Ownership_cat('ownership','NHAI'); updateNavBarWithFunctionName('Road Ownership NHAI');" style="color:#2F5EEA;">${safeValue('count_nhai')}</a><br>
                Development Authority - <a href="javascript:void(0)" onclick="Lucknow_Ownership_cat('ownership','Development Authority'); updateNavBarWithFunctionName('Road Ownership : Development Authority');" style="color:#f16a16;">${safeValue('count_lda')}</a><br>
                Defence - <a href="javascript:void(0)" onclick="Lucknow_Ownership_cat('ownership','Defence'); updateNavBarWithFunctionName('Road Ownership : Defence');" style="color:#EEC82E;">${safeValue('count_defence')}</a><br>
                Department Roads - <a href="javascript:void(0)" onclick="Lucknow_Ownership_cat('ownership','Department Roads'); updateNavBarWithFunctionName('Road Ownership : Department Roads');" style="color:#8D139B;">${safeValue('count_department')}</a><br>
                Institutional Roads - <a href="javascript:void(0)" onclick="Lucknow_Ownership_cat('ownership','Institutional Road'); updateNavBarWithFunctionName('Road Ownership : Institutional Roads');" style="color:#168DE7;">${safeValue('count_institutional')}</a><br>
                `,
            onclick: 'Lucknow_Ownership()'
        },
        'Road Count by CUS': {
            value: `
                14th Finance - <a href="javascript:void(0)" onclick="Lucknow_CUS_cat('cus','14th Finance'); updateNavBarWithFunctionName('Road CUS : 14th Finance');" style="color: #d61739;">${safeValue('count_14th')}</a><br>
                15th Finance - <a href="javascript:void(0)" onclick="Lucknow_CUS_cat('cus','15th Finance'); updateNavBarWithFunctionName('Road CUS : 15th Finance');" style="color: #e63dee;">${safeValue('count_15th')}</a><br>
                Nagar Nigam Nidhi - <a href="javascript:void(0)" onclick="Lucknow_CUS_cat('cus','Nagar Nigam Nidhi'); updateNavBarWithFunctionName('Road CUS : Nagar Nigam Nidhi');" style="color: cyan;">${safeValue('count_nnn')}</a><br>
                PWD - <a href="javascript:void(0)" onclick="Lucknow_CUS_cat('cus','PWD'); updateNavBarWithFunctionName('Road CUS : PWD');" style="color: #69E70F;">${safeValue('count_cus_pwd')}</a><br>
                 LDA - <a href="javascript:void(0)" onclick="Lucknow_CUS_cat('cus','LDA'); updateNavBarWithFunctionName('Road CUS : LDA');" style="color: #73e88e;">${safeValue('count_cus_lda')}</a><br>
                Railway - <a href="javascript:void(0)" onclick="Lucknow_CUS_cat('cus','Railway'); updateNavBarWithFunctionName('Road CUS : Railway');" style="color: #dfee2a;">${safeValue('count_cus_railway')}</a><br>
                NA- <a href="javascript:void(0)" onclick="Lucknow_CUS_cat('cus','NA'); updateNavBarWithFunctionName('Road CUS : NA');" style="color: #e5a8d4;">${safeValue('count_cus_na')}</a><br>
                Others- <a href="javascript:void(0)" onclick="Lucknow_CUS_cat('cus_class','Others'); updateNavBarWithFunctionName('Road CUS : Others');" style="color: #831042;">${safeValue('count_cus_others')}</a><br>
               
                `
            ,
           // onclick: 'Lucknow_CUS()'
        },
        'Road Count by Category': {
            value: `
                Local Street - <a href="javascript:void(0)" onclick="Lucknow_TypeSub_cat('category','Local Street'); updateNavBarWithFunctionName('Road Category : Local Street');" style="color: #14cee3;">${safeValue('count_local_street')}</a><br>
                Collector - <a href="javascript:void(0)" onclick="Lucknow_TypeSub_cat('category','Collector'); updateNavBarWithFunctionName('Road Category : Collector');" style="color: #e63dee;">${safeValue('count_collector')}</a><br>
                Arterial - <a href="javascript:void(0)" onclick="Lucknow_TypeSub_cat('category','Arterial'); updateNavBarWithFunctionName('Road Category : Arterial');" style="color: #e1ca4c;">${safeValue('count_arterial')}</a><br>
                Sub Arterial - <a href="javascript:void(0)" onclick="Lucknow_TypeSub_cat('category','Sub Arterial'); updateNavBarWithFunctionName('Road Category : Sub Arterial');" style="color: #83e45c;">${safeValue('count_subarterial')}</a><br>
                `, onclick: 'Lucknow_Types()'
            
        }
    };


    Object.entries(summaryData).forEach(([title, details]) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <h3>${details.onclick ? `<a href="javascript:void(0)" onclick="${details.onclick}">${title}</a>` : title}</h3>
            <p>${details.value}</p>
        `;
        content.appendChild(cardElement);
    });
}

//----------------------------------- Dropdown Zone Selection Code  -----------------------------------------------------------------

function populateZonesDropdown() {
    const zonesDropdown = document.getElementById('zonesDropdown');
    zonesDropdown.innerHTML = ''; // Clear existing content

    // Fetch the zone data from the API
    fetch(`${BASE_URL}/getZones`)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Zones API Response:", data); // Debugging: Log the API response

            // Check if zones data exists and handle accordingly
            if (data && data.status && Array.isArray(data.data)) {
                data.data.forEach(zone => {
                    const zoneElement = document.createElement('a');
                    zoneElement.href = "#";
                    zoneElement.innerHTML = `Zone ${zone.zone_no}`;  // Display zone number, or use zone names if available

                    // When a zone is clicked, fetch and display its wards
                    zoneElement.onclick = function () {
                        const zoneNo = zone.zone_no;  // Use 'zone_no' from the API
                        loadZoneData(zoneNo, `Zone ${zoneNo}`);  // Pass zone name as 'Zone {zone_no}'
                        populateWardsDropdown(zoneNo);
                        getZoneBoundary(zoneNo);  // Populate the wards dropdown based on the selected zone
                        return false;  // Prevent the default anchor link behavior
                    };
                    zonesDropdown.appendChild(zoneElement);
                });
            } else {
                console.error("❌ No zones data found or incorrect format:", data);
                zonesDropdown.innerHTML = "<p>No zones available.</p>";  // Show a fallback message if no zones are found
            }
        })
        .catch(error => {
            console.error("❌ Error fetching zones data:", error);
            zonesDropdown.innerHTML = "<p>Error loading zones.</p>";  // Show a fallback message if the fetch fails
        });
}

populateZonesDropdown();

function loadZoneData(zoneNo, zoneName) {
    fetch(`${BASE_URL}/getZoneData?zone_no=${zoneNo}`)
        .then(response => response.json())
        .then(responseData => {
            if (responseData.status) {
                updateZones(zoneNo, zoneName, responseData);
            } else {
                console.error('Error:', responseData.message);
            }
        })
        .catch(error => {
            console.error('Error fetching zone data:', error);
        });
}

function updateZones(zoneNo, zoneName, data) {
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (!zoneNo || !zoneName || !data) {
        content.innerHTML = '<p>No data available for this zone.</p>';
        return;
    }

    // Display Zone Header
    const zoneInfoCard = document.createElement('div');
    zoneInfoCard.className = 'card';
    zoneInfoCard.style.backgroundColor = '#5072A7';
    zoneInfoCard.style.textAlign = 'center';
    zoneInfoCard.style.color = 'white';
    zoneInfoCard.innerHTML = `<h4>${zoneName}</h4>`;
    content.appendChild(zoneInfoCard);

    // Define zone data cards
    const zoneCards = [
        { 
            title: 'Total Road Length', 
            value: `<a href="javascript:void(0)" onclick="Lucknow_Zone_no('zone_no','${zoneNo}'); updateNavBarWithFunctionName('Zone-${zoneNo} Total Road Length');" style="color:black;">${data.length_km.toFixed(2)} km</a>` 
        },
        { 
            title: 'Total No. of Roads', 
            value: `<a href="javascript:void(0)" onclick="Lucknow_Zone_no('zone_no','${zoneNo}'); updateNavBarWithFunctionName('Zone-${zoneNo} Total Road Count');" style="color:black;">${data.total_no_of_roads}</a>` 
        },
       
        { 
            title: 'Road Condition', 
            value: 			`Good <a href="javascript:void(0)" onclick="Lucknow_Zone_Condition('${zoneNo}','condition','Good'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Condition : Good');" style="color:#71DC7F;">- ${data.count_green}</a> <br> 
			                    Moderate <a href="javascript:void(0)" onclick="Lucknow_Zone_Condition('${zoneNo}','condition','Moderate'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Condition : Moderate');" style="color:#E0E31A;">- ${data.count_yellow}</a> <br> 
			                    Poor <a href="javascript:void(0)" onclick="Lucknow_Zone_Condition('${zoneNo}','condition','Poor'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Condition : Poor');" style="color:#EC3B20;">- ${data.count_red}</a><br>

			                    `
        },
        { 
            title: 'Materials', 
            value: `Bitumen <a href="javascript:void(0)" onclick="Lucknow_Zone_Material('${zoneNo}','material','Bitumen'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material : Bitumen');" style="color:darkred;">- ${data.count_bitumen}</a> <br>
                    CC <a href="javascript:void(0)" onclick="Lucknow_Zone_Material('${zoneNo}','material','CC'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material : CC');" style="color:#1ad7b0;">- ${data.count_cc}</a> <br>
                    Interlocking <a href="javascript:void(0)" onclick="Lucknow_Zone_Material('${zoneNo}','material','Interlocking'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material : Interlocking');" style="color:#2392ed;">- ${data.count_interlocking}</a> <br>
                    BOE <a href="javascript:void(0)" onclick="Lucknow_Zone_Material('${zoneNo}','material','BOE'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material : BOE');" style="color:#f228ab;">- ${data.count_boe}</a> <br>
                    Kachcha <a href="javascript:void(0)" onclick="Lucknow_Zone_Material('${zoneNo}','material','Kachcha'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material : Kachcha');" style="color:#6036d0;">- ${data.count_kachcha}</a><br>
                    Stone <a href="javascript:void(0)" onclick="Lucknow_Zone_Material('${zoneNo}','material','Stone'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material : Stone');" style="color:#f228ab;">- ${data.count_stone}</a> <br>
                    `
        
       },
        { 
            title: 'Ownership', 
            value: `LNN <a href="javascript:void(0)" onclick="Lucknow_Zone_Ownership('${zoneNo}','ownership','LNN'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership : Lucknow Nagar Nigam');" style="color:#5aeee5;">- ${data.count_lnn}</a> <br>
                    PWD <a href="javascript:void(0)" onclick="Lucknow_Zone_Ownership('${zoneNo}','ownership','PWD'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership : PWD');" style="color:#69E70F;">- ${data.count_pwd}</a> <br>
                    Private Roads <a href="javascript:void(0)" onclick="Lucknow_Zone_Ownership('${zoneNo}','ownership','Private'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership : Private Roads');" style="color:#B91B1E;">- ${data.count_pvt}</a><br>
                    Development Authority - <a href="javascript:void(0)" onclick="Lucknow_Zone_Ownership('${zoneNo}', 'ownership', 'Development Authority'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership Lucknow Development Authority');" style="color:#E58F2D;">${data.count_lda}</a><br>
                    Railway - <a href="javascript:void(0)" onclick="Lucknow_Zone_Ownership('${zoneNo}','ownership','Railway'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership Railway');" style="color:#dfee2a;">${data.count_railway}</a><br>
                    NHAI - <a href="javascript:void(0)" onclick="Lucknow_Zone_Ownership('${zoneNo}','ownership','NHAI'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership NHAI');" style="color:#2F5EEA;">${data.count_nhai}</a><br>
                    Defence - <a href="javascript:void(0)" onclick="Lucknow_Zone_Ownership('${zoneNo}','ownership','Defence'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership : Defence');" style="color:#EEC82E;">${data.count_defence}</a><br>
                    Department Roads - <a href="javascript:void(0)" onclick="Lucknow_Zone_Ownership('${zoneNo}','ownership','Department Roads'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership : Department Roads');" style="color:#8D139B;">${data.count_department}</a><br>
                    Institutional Roads - <a href="javascript:void(0)" onclick="Lucknow_Zone_Ownership('${zoneNo}','ownership','Institutional Road'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership : Institutional Roads');" style="color:#168DE7;">${data.count_institutional}</a><br>
                  `
            },
                {
                    title: 'CUS',
                    value: `
                        14th Finance - <a href="javascript:void(0)" onclick="Lucknow_Zone_CUS('${zoneNo}','cus','14th Finance'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS : 14th Finance');" style="color: #d61739;">${data.count_14th}</a><br>
                        15th Finance - <a href="javascript:void(0)" onclick="Lucknow_Zone_CUS('${zoneNo}','cus','15th Finance'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS : 15th Finance');" style="color: #e63dee;">${data.count_15th}</a><br>
                        Nagar Nigam Nidhi - <a href="javascript:void(0)" onclick="Lucknow_Zone_CUS('${zoneNo}','cus','Nagar Nigam Nidhi'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS : Nagar Nigam Nidhi');" style="color: cyan;">${data.count_nnn}</a><br>
                        PWD - <a href="javascript:void(0)" onclick="Lucknow_Zone_CUS('${zoneNo}','cus','PWD'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS : PWD');" style="color: #69E70F;">${data.count_cus_pwd}</a><br>
                        LDA - <a href="javascript:void(0)" onclick="Lucknow_Zone_CUS('${zoneNo}','cus','LDA'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS : LDA');" style="color: #73e88e;">${data.count_cus_lda}</a><br>
                        Railway - <a href="javascript:void(0)" onclick="Lucknow_Zone_CUS('${zoneNo}','cus','Railway'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS : Railway');" style="color: #dfee2a;">${data.count_cus_railway}</a><br>
                        NA- <a href="javascript:void(0)" onclick="Lucknow_Zone_CUS('${zoneNo}','cus','NA'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS : NA');" style="color: #e5a8d4;">${data.count_cus_na}</a><br>
                        Others - <a href="javascript:void(0)" onclick="Lucknow_Zone_CUS('${zoneNo}','cus_class','Others'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS : Others');" style="color: #831042;">${data.count_cus_others}</a><br>

                        `  },
               {
                title: 'Type Sub Category',
                value: `
                    Local Street - <a href="javascript:void(0)" onclick="Lucknow_Zone_TypeSub('${zoneNo}','category','Local Street'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Category : Local Street');" style="color: #14cee3;">${data.count_local_street} </a><br>
                    Collector - <a href="javascript:void(0)" onclick="Lucknow_Zone_TypeSub('${zoneNo}','category','Collector'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Category : Collector');" style="color: #e63dee;">${data.count_collector}</a><br>
                    Arterial - <a href="javascript:void(0)" onclick="Lucknow_Zone_TypeSub('${zoneNo}','category','Arterial'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Category : Arterial');" style="color: #e1ca4c;">${data.count_arterial}</a><br>
                    Sub Arterial - <a href="javascript:void(0)" onclick="Lucknow_Zone_TypeSub('${zoneNo}','category','Sub Arterial'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Category : Sub Arterial');" style="color: #83e45c;">${data.count_subarterial}</a><br>
    
                    `
                ,
            }
    ];

    // Append cards to the content div
    zoneCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `<h4>${card.title}</h4><p>${card.value}</p>`;
        content.appendChild(cardElement);
    });
}


//----------------------------------------------- all Zone Data is Corrected-------------------------------------------------------------

function showAllZones() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    // Handle active class for the Zones tab
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const zonesTab = document.querySelector('[data-tab="Zones"]');
    if (zonesTab) {
        zonesTab.classList.add('active');
    }

    const zoneKeys = Object.keys(data).filter(key => key !== 'Summary' && key !== 'View');

    zoneKeys.forEach(zoneName => {
        const zoneData = data[zoneName];

        // Create a container for each zone and a dropdown list for wards
        const zoneContainer = document.createElement('div');
        zoneContainer.className = 'zone-container';

        const zoneElement = document.createElement('div');
        zoneElement.className = 'card';
        zoneElement.innerHTML = `
            <h4>${zoneName}</h4>
            <a href="#" onclick="toggleDropdown('${zoneName}'); return false;">Toggle Wards</a>
        `;

        // Create a dropdown container for the wards
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.id = `dropdown-${zoneName}`;
        dropdown.style.display = 'none'; // Initially hidden

        // Add each ward to the dropdown
        const wards = Object.keys(zoneData.wards);
        wards.forEach(wardName => {
            const wardElement = document.createElement('div');
            wardElement.className = 'ward-item';
            wardElement.innerHTML = `
                <p>${wardName}</p>
                <a href="#" onclick="setCurrentWard('${zoneName}', '${wardName}'); return false;">View Details</a>
            `;
            dropdown.appendChild(wardElement);
        });

        // Append the dropdown to the zone container
        zoneContainer.appendChild(zoneElement);
        zoneContainer.appendChild(dropdown);

        // Append the zone container to the content
        content.appendChild(zoneContainer);
    });
}

function toggleDropdown(zoneName) {
    const dropdown = document.getElementById(`dropdown-${zoneName}`);
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

//----------------------------zone  card count summary --------------------
function setCurrentZone(zoneName) {
    selectedZone = zoneName;
    updateZones(zoneName);
}

// ----------------------------------show all zones
function showZoneDetails(zoneName) {
    // Implement the logic based on your requirement
    console.log("Selected zone: " + zoneName);
    showAllZones(); // Or use another function to show the selected zone details
}


//------------------------------- ward populate -------------------------------------------------------------------------------

function populateWardsDropdown(zoneNo) {
    const wardsDropdown = document.getElementById('zonesDropdownwards');
    wardsDropdown.innerHTML = ''; // Clear existing content

    // Fetch the wards data for the selected zone
    fetch(`${BASE_URL}/getWardsForZone?zone_no=${zoneNo}`)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Wards API Response:", data);  // Debugging: Log the wards data

            if (data && data.status && Array.isArray(data.data)) {
                // Loop through the wards and create links
                data.data.forEach(ward => {
                    const wardElement = document.createElement('a');
                    wardElement.href = "#";
                    wardElement.innerHTML = `Ward ${ward.ward_no}`;  // Assuming the ward has 'ward_no' property

                    // When a ward is clicked, load its details
                    wardElement.onclick = function () {
                        const wardNo = ward.ward_no;  // Use 'ward_no' from the API
                        loadWardData(zoneNo, wardNo, `Ward ${wardNo}`); 
                        getwardBoundary(wardNo); // Fetch ward data
                        return false;  // Prevent the default anchor link behavior
                    };

                    wardsDropdown.appendChild(wardElement);
                });
            } else {
                console.error("❌ No wards data found for the selected zone:", data);
                wardsDropdown.innerHTML = "<p>No wards available for this zone.</p>";  // Show a fallback message if no wards are found
            }
        })
        .catch(error => {
            console.error("❌ Error fetching wards data:", error);
            wardsDropdown.innerHTML = "<p>Error loading wards.</p>";  // Show a fallback message if the fetch fails
        });
}


function loadWardData(zoneNo, wardNo, wardName) {
    fetch(`${BASE_URL}/getZoneWardData?zone_no=${zoneNo}&ward_no=${wardNo}`)
        .then(response => response.json())
        .then(responseData => {
            if (responseData.status) {
                console.log("Ward Data Fetched:", responseData);

                // Get content container
                const content = document.getElementById('content');
                content.innerHTML = '';

                // Set active class for the Wards tab
                document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                document.querySelector('[data-tab="Wards"]')?.classList.add('active');

                // Create Ward Info Card
                const wardInfoCard = document.createElement('div');
                wardInfoCard.className = 'card ward-card';
                wardInfoCard.innerHTML = `<h4>${wardName}</h4>`;
                content.appendChild(wardInfoCard);

                // Define dynamic details with colors and onclick functions
                const details = [
                   
                    { 
                        title: 'Total Road Length', 
                        value: `<a href="javascript:void(0)" onclick="Lucknow_Zone_no('ward_no', '${wardNo}'); updateNavBarWithFunctionName('Ward-${wardNo} Total Road Length');" style="color:black;">${responseData.length_km.toFixed(2)}km</a>` 
                    },
                    { 
                        title: 'Total No. of Roads', 
                        value: `<a href="javascript:void(0)" onclick="Lucknow_Zone_no('ward_no', '${wardNo}'); updateNavBarWithFunctionName('Ward-${wardNo} Total Road Count');" style="color:black;">${responseData.total_no_of_roads}</a>` 
                    },
                    { 
						title: 'Road Condition',
						value: `Good - <a href="javascript:void(0)" onclick="Lucknow_Ward_Condition('${wardNo}', 'condition', 'Good'); updateNavBarWithFunctionName('Ward-${wardNo} Road Condition : Good');" style="color:#71DC7F;">${responseData.count_green}</a> 
						                                <br> Moderate - <a href="javascript:void(0)" onclick="Lucknow_Ward_Condition('${wardNo}', 'condition', 'Moderate'); updateNavBarWithFunctionName('Ward-${wardNo} Road Condition : Moderate');" style="color:#E0E31A;">${responseData.count_yellow}</a> 
						                                <br> Poor - <a href="javascript:void(0)" onclick="Lucknow_Ward_Condition('${wardNo}', 'condition', 'Poor'); updateNavBarWithFunctionName('Ward-${wardNo} Road Condition : Poor');" style="color:#EC3B20;">${responseData.count_red}</a>
						                                `  

                            },
                    { 
                        title: 'Materials', 
                        value: `Bitumen - <a href="javascript:void(0)" onclick="Lucknow_Ward_Material('${wardNo}', 'material', 'Bitumen'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material : Bitumen');" style="color:darkred;">${responseData.count_bitumen}</a><br> 
                        CC - <a href="javascript:void(0)" onclick="Lucknow_Ward_Material('${wardNo}', 'material', 'CC'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material : CC');" style="color:cyan;">${responseData.count_cc}</a><br> 
                        Interlocking - <a href="javascript:void(0)" onclick="Lucknow_Ward_Material('${wardNo}', 'material', 'Interlocking'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material : Interlocking');" style="color:blue;">${responseData.count_interlocking}</a><br> 
                        BOE - <a href="javascript:void(0)" onclick="Lucknow_Ward_Material('${wardNo}', 'material', 'BOE'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material : BOE');" style="color:pink;">${responseData.count_boe}</a><br>
                        Kachcha - <a href="javascript:void(0)" onclick="Lucknow_Ward_Material('${wardNo}', 'material', 'Kachcha'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material : Kachcha');" style="color:purple;">${responseData.count_kachcha}</a><br>
                        Stone <a href="javascript:void(0)" onclick="Lucknow_Ward_Material('${wardNo}','material','Stone'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material : Stone');" style="color:#f228ab;">- ${responseData.count_stone}</a> <br>
                
                         ` 
                    },
                    { 
                        title: 'Ownership', 
                        value: `LNN - <a href="javascript:void(0)" onclick="Lucknow_Ward_Ownership('${wardNo}', 'ownership','LNN'); updateNavBarWithFunctionName('Ward-${wardNo} Road Ownership : Lucknow Nagar Nigam');" style="color:#5aeee5;">${responseData.count_lnn}</a><br>
                                PWD <a href="javascript:void(0)" onclick="Lucknow_Ward_Ownership('${wardNo}','ownership','PWD'); updateNavBarWithFunctionName('Ward-${wardNo} Road Ownership : PWD');" style="color:#69e70f;">- ${responseData.count_pwd}</a> <br>
                                Private Roads <a href="javascript:void(0)" onclick="Lucknow_Ward_Ownership('${wardNo}','ownership','Private'); updateNavBarWithFunctionName('Ward-${wardNo} Road Ownership : Private Roads');" style="color:#B91B1E;">- ${responseData.count_pvt}</a><br>
                                Development Authority - <a href="javascript:void(0)" onclick="Lucknow_Ward_Ownership('${wardNo}', 'ownership', 'Development Authority'); updateNavBarWithFunctionName('Ward-${wardNo} Road Ownership Lucknow Development Authority');" style="color:#E58F2D;">${responseData.count_lda}</a><br>
                                Railway - <a href="javascript:void(0)" onclick="Lucknow_Ward_Ownership('${wardNo}','ownership','Railway'); updateNavBarWithFunctionName('Ward-${wardNo} Road Ownership Railway');" style="color:#dfee2a;">${responseData.count_railway}</a><br>
                                NHAI - <a href="javascript:void(0)" onclick="Lucknow_Ward_Ownership('${wardNo}','ownership','NHAI'); updateNavBarWithFunctionName('Ward-${wardNo} Road Ownership NHAI');" style="color:#2F5EEA;">${responseData.count_nhai}</a><br>
                                Defence - <a href="javascript:void(0)" onclick="Lucknow_Ward_Ownership('${wardNo}','ownership','Defence'); updateNavBarWithFunctionName('Ward-${wardNo} Road Ownership : Defence');" style="color:#EEC82E;">${responseData.count_defence}</a><br>
                                Department Roads - <a href="javascript:void(0)" onclick="Lucknow_Ward_Ownership('${wardNo}','ownership','Department Roads'); updateNavBarWithFunctionName('Ward-${wardNo} Road Ownership : Department Roads');" style="color:#8D139B;">${responseData.count_department}</a><br>
                                Institutional Roads - <a href="javascript:void(0)" onclick="Lucknow_Ward_Ownership('${wardNo}','ownership','Institutional Road'); updateNavBarWithFunctionName('Ward-${wardNo} Road Ownership : Institutional Roads');" style="color:#168DE7;">${responseData.count_institutional}</a><br>
                                `
                            },
                            {
                                title: 'CUS',
                                value: `
                                  
                                    14th Finance - <a href="javascript:void(0)" onclick="Lucknow_Ward_CUS('${wardNo}','cus','14th Finance'); updateNavBarWithFunctionName('Ward-${wardNo} Road CUS : 14th Finance');" style="color: #d61739;">${responseData.count_14th}</a><br>
                                    15th Finance - <a href="javascript:void(0)" onclick="Lucknow_Ward_CUS('${wardNo}','cus','15th Finance'); updateNavBarWithFunctionName('Ward-${wardNo} Road CUS : 15th Finance');" style="color: #e63dee;">${responseData.count_15th}</a><br>
                                    Nagar Nigam Nidhi - <a href="javascript:void(0)" onclick="Lucknow_Ward_CUS('${wardNo}','cus''Nagar Nigam Nidhi'); updateNavBarWithFunctionName('Ward-${wardNo} Road CUS : Nagar Nigam Nidhi');" style="color: cyan;">${responseData.count_nnn}</a><br>
                                    PWD - <a href="javascript:void(0)" onclick="Lucknow_Ward_CUS('${wardNo}','cus''PWD'); updateNavBarWithFunctionName('Ward-${wardNo} Road CUS : PWD');" style="color: #69E70F;">${responseData.count_cus_pwd}</a><br>
                                    LDA - <a href="javascript:void(0)" onclick="Lucknow_Ward_CUS('${wardNo}','cus''LDA'); updateNavBarWithFunctionName('Ward-${wardNo} Road CUS : LDA');" style="color: #e6497d;">${responseData.count_cus_lda}</a><br>
                                    Railway - <a href="javascript:void(0)" onclick="Lucknow_Ward_CUS('${wardNo}','cus''Railway'); updateNavBarWithFunctionName('Ward-${wardNo} Road CUS : Railway');" style="color: #dfee2a;">${responseData.count_cus_railway}</a><br>
                                    NA- <a href="javascript:void(0)" onclick="Lucknow_Ward_CUS('${wardNo}','cus','NA'); updateNavBarWithFunctionName('Ward-${wardNo} Road CUS : NA');" style="color: #e5a8d4;">${responseData.count_cus_na}</a><br>
                                    Others- <a href="javascript:void(0)" onclick="Lucknow_Ward_CUS('${wardNo}','cus_class','Others'); updateNavBarWithFunctionName('Ward-${wardNo} Road CUS : Others');" style="color: #831042;">${responseData.count_cus_others}</a><br>
           
                                    `  },
                           {
                            title: 'Category',
                            value: `
                                Local Street - <a href="javascript:void(0)" onclick="Lucknow_Ward_TypeSub('${wardNo}','category','Local Street'); updateNavBarWithFunctionName('Ward-${wardNo} Road Category : Local Street');" style="color: #14cee3;">${responseData.count_local_street} </a><br>
                                Collector - <a href="javascript:void(0)" onclick="Lucknow_Ward_TypeSub('${wardNo}','category','Collector'); updateNavBarWithFunctionName('Ward-${wardNo} Road Category : Collector');" style="color: #e63dee;">${responseData.count_collector}</a><br>
                                Arterial - <a href="javascript:void(0)" onclick="Lucknow_Ward_TypeSub('${wardNo}','category','Arterial'); updateNavBarWithFunctionName('Ward-${wardNo} Road Category : Arterial');" style="color: #e1ca4c;">${responseData.count_arterial}</a><br>
                                Sub Arterial - <a href="javascript:void(0)" onclick="Lucknow_Ward_TypeSub('${wardNo}','category','Sub Arterial'); updateNavBarWithFunctionName('Ward-${wardNo} Road Category : Sub Arterial');" style="color: #83e45c;">${responseData.count_subarterial}</a><br>
                
                                `
                            ,
                        }
                ];

                // Create and append vertical detail cards
                details.forEach(detail => {
                    const detailElement = document.createElement('div');
                    detailElement.className = 'card detail-card';
                    detailElement.innerHTML = `<h4>${detail.title}</h4><p>${detail.value}</p>`;
                    content.appendChild(detailElement);
                });

            } else {
                console.error('Error:', responseData.message);
            }
        })
        .catch(error => {
            console.error('Error fetching ward data:', error);
        });
}


function setCurrentWard(zoneName, wardName) {
    selectedZone = zoneName;
    selectedWard = wardName;
    navigateTo('WardDetails');
}

let selectedZone = null;
let selectedWard = null;

function removeWards() {
    selectedWard = ''; // Clear current ward selection
    const content = document.getElementById('content');
    content.innerHTML = '';
}

//--------------------------------------ward wise Deatils -------------------------------------------------------------------------

function updateWards(zoneName) {
    const content = document.getElementById('content');
    content.innerHTML = '';

    // Display a card showing which zone's wards are being displayed
    const wardInfoCard = document.createElement('div');
    wardInfoCard.className = 'card';
    wardInfoCard.style.backgroundColor = '#5072A7';
    wardInfoCard.style.alignContent = 'center';
    wardInfoCard.style.textAlign = 'center';
    wardInfoCard.style.color = 'white';
    wardInfoCard.innerHTML = `
        <h4> Wards in ${zoneName}</h4>
    `;
    content.appendChild(wardInfoCard);

    if (!data[zoneName] || !data[zoneName].wards) {
        const noWardsCard = document.createElement('div');
        noWardsCard.className = 'card';
        // noWardsCard.style.backgroundColor = getUniqueColor();
        noWardsCard.innerHTML = '<p>No wards data available for this zone.</p>';
        content.appendChild(noWardsCard);
        return;
    }

    const wards = data[zoneName].wards;
    Object.keys(wards).forEach(wardName => {
        const ward = wards[wardName];
        const wardElement = document.createElement('div');
        wardElement.className = 'card';
        // wardElement.style.backgroundColor = getUniqueColor();
        wardElement.innerHTML = `
            <h4>${wardName}</h4>
            <p>Total No. of Roads: ${ward.totalRoads}</p>
            <a href="#${wardName}" onclick="setCurrentWard('${wardName}'); return false;">View Details</a>
        `;
        content.appendChild(wardElement);
    });
}

function minimize() {
    const topnav = document.getElementById('topnav');
    const contentWrapper = document.getElementById('content-wrapper');

    topnav.style.bottom = '2%'; // Reduced height when minimized

    contentWrapper.style.height = '0'; // Reduced height when minimized
    contentWrapper.style.overflow = 'hidden';
    contentWrapper.style.opacity = '0.5'; // Slight opacity to indicate minimized state

}

function maximize() {
    const topnav = document.getElementById('topnav');
    const contentWrapper = document.getElementById('content-wrapper');

    topnav.style.bottom = '34%'; // Reduced height when minimized
    topnav.style.display = 'flex';

    contentWrapper.style.height = 'auto'; // Restore original height
    contentWrapper.style.overflow = 'auto'; // Enable scrolling if necessary
    contentWrapper.style.opacity = '1'; // Full opacity when maximized
}

function closeNav() {
    document.getElementById('topnav').style.display = 'none';
    document.getElementById('content-wrapper').style.display = 'none';
}

function summary_table() {
console.log("table-icon clicked");
    const topnav = document.getElementById('topnav');
    const contentWrapper = document.getElementById('content-wrapper');

    document.getElementById('road-filter').style.display = 'none';
     document.getElementById('query_tab').style.display = 'none';


    if (topnav.classList.contains('hidden')) {
        topnav.classList.remove('hidden');
        contentWrapper.classList.remove('hidden');
    } else {
        topnav.classList.add('hidden');
        contentWrapper.classList.add('hidden');
    }
}
// Initially hide the topnav and content-wrapper
document.addEventListener('DOMContentLoaded', () => {
    const topnav = document.getElementById('topnav');
    const contentWrapper = document.getElementById('content-wrapper');
    topnav.classList.add('hidden');
    contentWrapper.classList.add('hidden');
});

// Initialize view
navigateTo('Summary');

//------------------------------------------------------ clear vector layer ------------------------------------------------------------//
function clearVectorLayers() {
    // Create an array to hold layers that you want to preserve
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector 
           //  && !isLayerInPreservedList(layer)
        ) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

}


// function for highlighting table row and click on table then highlight layer--------------//

map.on('singleclick', function (evt) {
    const viewResolution = map.getView().getResolution();
    const projection = map.getView().getProjection();
    const source = currentLayer?.getSource?.();

    // ✅ Case 1: WMS (has getFeatureInfoUrl)
    if (source && typeof source.getFeatureInfoUrl === 'function') {
        const url = source.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution,
            projection,
            { 'INFO_FORMAT': 'application/json' }
        );

        if (url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log('GeoServer Response:', data);
                    if (data.features && data.features.length > 0) {
                        let properties = data.features[0].properties;
                        console.log("WMS Feature Properties:", properties);

                        let gisId = properties.gis_id;

                        if (gisId) {
                            console.log('Feature ID:', data.features[0].id);
                            highlightTableRowByGISID(gisId);
                            highlightFeatureOnMap(gisId);
                        } else {
                            console.warn('No GIS ID in WMS feature.');
                        }
                    } else {
                        console.warn('No features found in WMS click.');
                    }
                })
                .catch(error => console.error('Error fetching WMS feature info:', error));
        }
    }

    // ✅ Case 2: Vector layer (WFS GeoJSON)
    else {
        let found = false;
        map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            if (layer === currentLayer) {
                let props = feature.getProperties();
                // ✅ INSERT HERE
                console.log("Feature Properties:", props);
                // let gisId = props.gis_id;
                const gisId = props.gis_id || props.gid || props.GIS_ID || null;

                if (!gisId) {
                    console.warn("No associated GIS ID found for selected feature.");
                }


                if (gisId) {
                    console.log("Selected feature: ", feature);
                    console.log("Feature ID: ", feature.getId());
                    console.log("Associated row: ", gisId);

                    highlightTableRowByGISID(gisId);
                    highlightFeatureOnMap(gisId);
                    found = true;
                } else {
                    console.warn('Feature has no GIS ID');
                }
                found = true;
                return true;
            }
        }, { hitTolerance: 5 });

        if (!found) {
            console.warn("No feature selected.");
        }
    }
});

// ----------------- Function to Highlight the Corresponding Table Row
function highlightTableRowByGISID(gisId) {
    let tableRows = document.querySelectorAll("#dataTable_summary tbody tr");
    tableRows.forEach(row => {
        row.classList.remove("highlight"); // Remove previous highlight
        let rowGISID = row.getElementsByTagName("td")[0].innerText; // Assuming GIS ID is in the first column
        if (rowGISID == gisId) {
            row.classList.add("highlight");
            row.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
}

//let highlightLayer;
// :white_check_mark: Function to Append Data to Table and Add Click Event for Highlighting
//function Table_Row_and_Layer_highlight(data) {
 //   dataTableBody_summary.innerHTML = ""; // Clear previous data
   // if (Array.isArray(data)) {
     //   data.forEach(item => {
       //     const row = document.createElement('tr');
         //   row.innerHTML = `
           //     <td>${item.gis_id}</td>
             //   <td>${item.zone_no}</td>
               // <td>${item.zone_name}</td>
               // <td>${item.ward_no}</td>
               // <td>${item.ward_name}</td>
             //   <td>${item.ownership}</td>
               
              //   <td>${item.category}</td>
                //<td>${item.road_name}</td>
              //  <td>${item.row_meter}</td>
             //   <td>${item.rowcls}</td>
              //  <td>${item.carriage_w}</td>
              // <td>${item.material}</td>
              //  <td>${item.length_km}</td>
             //   <td>${item.condition}</td>
            //   <td>${item.yoc}</td>
            //    <td>${item.cus}</td>
          //  `;
         //   // :white_check_mark: Add Click Event to Row
         //   row.addEventListener('click', function () {
        //        let gisId = item.gis_id; // Get GIS ID from row data
        //        highlightFeatureOnMap(gisId); // Call function to highlight feature
        //        highlightTableRow(row); // Highlight the selected table row
        //    });
        //    dataTableBody_summary.appendChild(row);
      //  });
   // } else {
   //     console.error('Expected an array but received:', data);
  // }
//}

/*function Table_Row_and_Layer_highlight(data) {
    const tbody = dataTableBody_summary;
    tbody.innerHTML = `<tr>
  <td colspan="16" style="text-align:center; padding:10px;">
    <div class="loader"></div>
    <div style="font-weight:bold; color:#555;">Loading ${data.length} records...</div>
  </td>
</tr>`;
    // Ensure it's an array
    if (!Array.isArray(data)) {
        console.error("Expected an array but received:", data);
        tbody.innerHTML = `<tr><td colspan="16" style="color:red; text-align:center;">Invalid data format</td></tr>`;
        return;
    }
    // Use setTimeout to allow the browser to render the "Loading..." message first
    setTimeout(() => {
        const fragment = document.createDocumentFragment();
        data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.gis_id || "N/A"}</td>
                <td>${item.zone_no || "N/A"}</td>
                <td>${item.zone_name || "N/A"}</td>
                <td>${item.ward_no || "N/A"}</td>
                <td>${item.ward_name || "N/A"}</td>
                <td>${item.ownership || "N/A"}</td>
                <td>${item.category || "N/A"}</td>
                <td>${item.road_name || "N/A"}</td>
                <td>${item.row_meter || "N/A"}</td>
                <td>${item.rowcls || "N/A"}</td>
                <td>${item.carriage_w || "N/A"}</td>
                <td>${item.material || "N/A"}</td>
                <td>${item.length_km || "N/A"}</td>
                <td>${item.condition || "N/A"}</td>
                <td>${item.yoc || "N/A"}</td>
                <td>${item.cus || "N/A"}</td>
            `;
            row.addEventListener("click", () => {
                highlightFeatureOnMap(item.gis_id);
                highlightTableRow(row);
            });
            fragment.appendChild(row);
        });
        // Replace loading message with actual rows
        tbody.innerHTML = "";
        tbody.appendChild(fragment);
        console.log(`:white_check_mark: Rendered ${data.length} rows successfully`);
    }, 100); // small delay ensures UI updates before heavy rendering
}*/

/*---------function Table_Row_and_Layer_highlight(data) {
    const tbody = dataTableBody_summary;
    const BATCH_SIZE = 10000; // how many rows to render at once
    let currentIndex = 0;
    tbody.innerHTML = "";
    // Safety check
    if (!Array.isArray(data)) {
        console.error("Expected an array but received:", data);
        tbody.innerHTML = `<tr><td colspan="16" style="color:red; text-align:center;">Invalid data format</td></tr>`;
        return;
    }
    console.log(`:rocket: Starting lazy rendering for ${data.length} rows...`);
    // Create a small loading indicator
    const loadingRow = document.createElement("tr");
    loadingRow.innerHTML = `
        <td colspan="16" style="text-align:center; padding:10px;">
            <div class="loader"></div>
            <div style="font-weight:bold; color:#555;">Loading data...</div>
        </td>`;
    tbody.appendChild(loadingRow);
    function renderNextBatch() {
        const fragment = document.createDocumentFragment();
        const end = Math.min(currentIndex + BATCH_SIZE, data.length);
        for (let i = currentIndex; i < end; i++) {
            const item = data[i];
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.gis_id || "N/A"}</td>
				<td>${item.road_id || "N/A"}</td>
                <td>${item.zone_no || "N/A"}</td>
                <td>${item.zone_name || "N/A"}</td>
                <td>${item.ward_no || "N/A"}</td>
                <td>${item.ward_name || "N/A"}</td>
                <td>${item.ownership || "N/A"}</td>
                <td>${item.category || "N/A"}</td>
                <td>${item.road_name || "N/A"}</td>
                <td>${item.row_meter || "N/A"}</td>
                <td>${item.rowcls || "N/A"}</td>
                <td>${item.carriage_w || "N/A"}</td>
                <td>${item.material || "N/A"}</td>
                 <td>${item.length_km ? item.length_km.toFixed(2) : 'N/A'}</td>
                <td>${item.condition || "N/A"}</td>
                <td>${item.yoc || "N/A"}</td>
                <td>${item.cus || "N/A"}</td>
            `;
            // Preserve your click highlight behavior
            row.addEventListener("click", () => {
                highlightFeatureOnMap(item.gis_id);
                highlightTableRow(row);
            });
            fragment.appendChild(row);
        }
        // First batch replaces loader, later batches append
        if (currentIndex === 0) tbody.innerHTML = "";
        tbody.appendChild(fragment);
        currentIndex = end;
        // Schedule the next batch
        if (currentIndex < data.length) {
            requestAnimationFrame(renderNextBatch);
        } else {
            console.log(`:white_check_mark: Fully rendered ${data.length} rows`);
        }
    }
    // Kick off rendering
    requestAnimationFrame(renderNextBatch);
}*/
const ROWS_PER_PAGE = 50;

let currentPage = 1;
let TOTAL_RECORDS = 0;
let ALL_ROWS = [];


let highlightLayer;
function updateFeatureNavIndex() {
  const infoEl = document.getElementById("tableIndexInfo");

  if (!TOTAL_RECORDS || TOTAL_RECORDS === 0) {
    infoEl.innerText = "No records";
    return;
  }

  const start = (currentPage - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(currentPage * ROWS_PER_PAGE, TOTAL_RECORDS);

  infoEl.innerText = `Showing ${start}–${end} of ${TOTAL_RECORDS}`;
}

// :white_check_mark: Function to Append Data to Table and Add Click Event for Highlighting
function Table_Row_and_Layer_highlight(data) {
    // let dataTableBody_summary = document.getElementById("dataTableBody_summary");
    dataTableBody_summary.innerHTML = ""; // Clear previous data
   ALL_ROWS = [];
    if (!Array.isArray(data)||data.length === 0) {
	       const emptyRow = document.createElement('tr');
	       emptyRow.innerHTML = '<td colspan="18">No data available</td>';
	       dataTableBody_summary.appendChild(emptyRow);
	      
          
        TOTAL_RECORDS = 0;
        updateFeatureNavIndex();
           return;
	   }
        TOTAL_RECORDS = data.length;
    //if (Array.isArray(data)) {
       data.forEach(item => {
  const row = document.createElement('tr');

  // store geom invisibly on the row
  row.dataset.geom = item.geom_wkt;

  row.innerHTML = `
    <td>${item.gis_id}</td>
    <td>${item.road_id || 'N/A'}</td>
    <td>${item.zone_no}</td>  
    <td>${item.zone_name}</td>
    <td>${item.ward_no}</td>
    <td>${item.ward_name}</td>
    <td>${item.ownership}</td>
    <td>${item.category}</td>
    <td>${item.road_name}</td>
    <td>${item.row_meter}</td>
    <td>${item.row_apr}</td>
    <td>${item.carriage_w}</td>
    <td>${item.material}</td>
    <td>${item.length_km ? item.length_km.toFixed(2) : 'N/A'}</td>
    <td>${item.condition}</td>
    <td>${item.yoc}</td>
    <td>${item.cus}</td>
  `;

            // :white_check_mark: Add Click Event to Row
            row.addEventListener('click', function () {
               // let gisId = item.gis_id; // Get GIS ID from row data
                highlightFeatureOnMap(item.gis_id); // Call function to highlight feature
                highlightTableRow(row); // Highlight the selected table row
            });
            dataTableBody_summary.appendChild(row);
             ALL_ROWS.push(row);
        });
          currentPage = 1;
    renderPage();
   // } else {
    //    console.error('Expected an array but received:'); //, data);
   // }
}
function renderPage() {
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;

  ALL_ROWS.forEach((row, i) => {
    row.style.display = (i >= start && i < end) ? "" : "none";
  });

  updateFeatureNavIndex();
}
function nextPage() {
  if (currentPage * ROWS_PER_PAGE < TOTAL_RECORDS) {
    currentPage++;
    renderPage();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
}
// :white_check_mark: Function to Highlight the Table Row
function highlightTableRow(selectedRow) {
    let tableRows = document.querySelectorAll("#dataTable_summary tbody tr");
    tableRows.forEach(row => {
        row.classList.remove("highlight"); // Remove previous highlight
    });
    selectedRow.classList.add("highlight"); // Add highlight to selected row
}

// :white_check_mark: Function to Highlight Feature on Map Based on GIS ID
/*function highlightFeatureOnMap(gisId) {
    let wfsUrl = `${GEOSERVER_BASE_URL}/wfs?service=WFS&version=1.1.0&request=GetFeature
        &typename=Lko_Summary:lucknow_road_net
        &outputFormat=application/json
        &CQL_FILTER=gis_id=${gisId}`;
    console.log('Fetching Feature:', wfsUrl);
    fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
            console.log('WFS Response:', data); // :white_check_mark: Debug the response
            if (data.features && data.features.length > 0) {
                let feature = new ol.format.GeoJSON().readFeature(data.features[0], {
                    dataProjection: 'EPSG:4326',
                    featureProjection: map.getView().getProjection()
                });
                console.log('Feature to Highlight:', feature); // :white_check_mark: Debug feature
                addFeatureHighlight(feature);
            } else {
                console.warn('No matching feature found for GIS ID:', gisId);
            }
        })
        .catch(error => console.error('Error fetching WFS feature:', error));
}
*/

function highlightFeatureOnMap(gisId) {
    let wfsUrl = `${GEOSERVER_BASE_URL}/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=Lko_Summary:lucknow_road_net&outputFormat=application/json&CQL_FILTER=gis_id=${gisId}`;
    console.log('Fetching Feature:', wfsUrl);
    fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
            console.log('WFS Response:', data); // :white_check_mark: Debug the response
            if (data.features && data.features.length > 0) {
                let feature = new ol.format.GeoJSON().readFeature(data.features[0], {
                    dataProjection: 'EPSG:4326',
                    featureProjection: map.getView().getProjection()
                });
                console.log('Feature to Highlight:', feature); // :white_check_mark: Debug feature
                addFeatureHighlight(feature);
            } else {
                console.warn('No matching feature found for GIS ID:', gisId);
            }
        })
        .catch(error => console.error('Error fetching WFS feature:', error));
}





// :white_check_mark: Function to Add and Highlight the Selected Feature
function addFeatureHighlight(feature) {
    map.removeLayer(highlightLayer);
    if (!feature) {
        console.warn("No feature found to highlight.");
        return;
    }
     highlightLayer = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow', // Highlight border color
                width: 7 // Stroke width
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 0, 0.3)' // Semi-transparent yellow fill
            })
        })
    });
    map.addLayer(highlightLayer); // Add highlight layer to map
    highlightLayer.getSource().addFeature(feature); // Add feature to highlight layer
    // Ensure the feature has valid geometry before zooming
    let extent = feature.getGeometry().getExtent();
    if (extent && extent[0] !== Infinity) {
        map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
    } else {
        console.warn("Feature has invalid geometry:", feature);
    }
}



//-----------------------------Data fetch to table summary------------//

var currentLayer = null;

function removeCurrentLayer() {
    if (currentLayer) {  // Check if there's a current layer on the map
        map.removeLayer(currentLayer);  // Remove the current layer from the map
        currentLayer = null;  // Reset the currentLayer variable
    }
}



//--------------popup code for road----------------------//
function LNN_Road_popup() {

    const existingPopup = document.getElementById('popup_road');
    if (existingPopup) {
        existingPopup.remove();  // Remove any old popups
    }
    // Create a popup element
    const popup = document.createElement('div');
    popup.id = 'popup_road';
    popup.style.display = 'none';

    document.body.appendChild(popup);

    // Add a click event listener
  map.on('singleclick', function (event) {

        const viewResolution = map.getView().getResolution();
        const projection = map.getView().getProjection();
        const source = currentLayer?.getSource?.();

        // Check if current layer is WMS (has getFeatureInfoUrl function)
        if (source && typeof source.getFeatureInfoUrl === 'function') {
            const url = source.getFeatureInfoUrl(
                event.coordinate,
                viewResolution,
                projection,
                { 'INFO_FORMAT': 'application/json' }
            );

			if (url) {
									               fetch(url)
									                   .then(res => res.json())
									                   .then(data => {
									                       if (data.features && data.features.length > 0) {
									                           const properties = data.features[0].properties;
									                           selectedRoadProperties = properties;
									                           popup.innerHTML = buildPopupHTML(properties);
									                           popup.style.display = 'block';
									                           // Attach close button AFTER HTML loads
									                           setTimeout(() => {
									                               const closeBtn = document.getElementById("popupCloseBtn");
									                               if (closeBtn) {
									                                   closeBtn.onclick = () => popup.style.display = "none";
									                               }
									                           }, 0);
									                       } else popup.style.display = 'none';
									                   })
									                   .catch(() => popup.style.display = 'none');
									           }
									           return;
									       }
									       // ---------- VECTOR LAYER ----------
									       let found = false;
									       map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
									           if (layer === currentLayer) {
									               const properties = feature.getProperties();
									               selectedRoadProperties = properties;
									               popup.innerHTML = buildPopupHTML(properties);
									               popup.style.display = 'block';
									               // Attach close button AFTER HTML loads
									               setTimeout(() => {
									                   const closeBtn = document.getElementById("popupCloseBtn");
									                   if (closeBtn) {
									                       closeBtn.onclick = () => popup.style.display = "none";
									                   }
									               }, 0);
									               found = true;
									               return true;
									           }
									       });
									       if (!found)popup.style.display = 'none';
									   });


				    function buildPopupHTML(properties) {
				        return `
						 <div style="
								position:relative;
								            background: rgb(255 255 255 / 90%);
								            color: rgba(0, 0, 0, 1);
								            padding: 10px 13px;
								            border-radius: 10px;
								            border-left: 4px solid #3772a7ff;
								            box-shadow: 0 2px 10px rgba(240, 235, 235, 0.5);
								            font-family: 'Segoe UI', Roboto, sans-serif;
								            font-size: 14px;
								            line-height: 1.5;
								            max-width: 330px;
						">
						<span id="popupCloseBtn"
						            style="
						                position:absolute;
						                top:6px;
						                right:0px;
						                cursor:pointer;
						                font-size:20px;
						                color:#ff0000;
						                font-weight:bold;
						            ">&times;</span>
									<h3 style="margin-top:0; margin-bottom:8px; font-size:21px; color:brown;
									                  font-weight:900; border-bottom:1px solid #2a6194ff; padding-bottom:4px;">
									           Road Information
									       </h3>
						  <div class="row-line"><strong>Road Id :</strong> ${properties.road_id || 'N/A'}</div>
						  <div class="row-line"><strong>Zone No :</strong> ${properties.zone_no || 'N/A'}</div>
						  <div class="row-line"><strong>Zone Name :</strong> ${properties.zone_name || 'N/A'}</div>
						  <div class="row-line"><strong>Ward No :</strong> ${properties.ward_no || 'N/A'}</div>
						  <div class="row-line"><strong>Ward Name :</strong> ${properties.ward_name || 'N/A'}</div>
						  <div class="row-line"><strong>Right of Way :</strong> ${properties.row_meter || 'N/A'}</div>
						  <div class="row-line"><strong>Carriage Width :</strong> ${properties.carriage_w || 'N/A'}</div>
						  <div class="row-line"><strong>Category :</strong> ${properties.category || 'N/A'}</div>
						  <div class="row-line"><strong>Condition :</strong> ${properties.condition || 'N/A'}</div>
						  <div class="row-line"><strong>Material :</strong> ${properties.material || 'N/A'}</div>
						  <div class="row-line"><strong>Ownership :</strong> ${properties.ownership || 'N/A'}</div>
						  <div class="row-line"><strong>Length (Km) :</strong> ${
						      properties.length_km !== null && properties.length_km !== undefined
						          ? Number(properties.length_km).toFixed(2)
						          : 'N/A'
						  }</div>

						  <div class="row-line"><strong>Road Name :</strong> ${properties.road_name || 'N/A'}</div>
						</div>
						        `;
				    }
				}

function Lucknow_Road_Length_Count() {
    removeCurrentLayer();
    clearVectorLayers();

    currentLayer = new ol.layer.Image({
        //  title: 'Ward Boundary',
        //     extent: [-180, -90, -180, 90],
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net',

            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    //overlays.getLayers().push(LNN_Ward_Boundary);
    map.addLayer(currentLayer);
    LNN_Road_popup();

}

function Lucknow_Condition(cqlFilter) {
    removeCurrentLayer(); clearVectorLayers();
    currentLayer = new ol.layer.Image({
        //   title: 'Ward Boundary',
        //     extent: [-180, -90, -180, 90],
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS':'Lko_Summary:lucknow_road_net_condition',                               
                'CQL_FILTER': cqlFilter,
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    //overlays.getLayers().push(LNN_Ward_Boundary);
    map.addLayer(currentLayer);
    document.getElementById('summary-table').style.display = 'none';
    // document.getElementById('dataTable_summary').style.display = 'block';
    document.getElementById('dataTable_summaryfilter').style.display = 'block';
    document.getElementById('tableContainer_summaryfilter').style.display = 'block';

    LNN_Road_popup();
    //  fetchLNNTypeData();
    updateTable(cqlFilter);
}

function Lucknow_Ownership(cqlFilter) {
    removeCurrentLayer(); clearVectorLayers();
    currentLayer = new ol.layer.Image({
        //   title: 'Ward Boundary',
        //     extent: [-180, -90, -180, 90],
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS':'Lko_Summary:lucknow_road_net_own',                               
                'CQL_FILTER': cqlFilter,
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    //overlays.getLayers().push(LNN_Ward_Boundary);
    map.addLayer(currentLayer);
    document.getElementById('summary-table').style.display = 'none';
    // document.getElementById('dataTable_summary').style.display = 'block';
    document.getElementById('dataTable_summaryfilter').style.display = 'block';
    document.getElementById('tableContainer_summaryfilter').style.display = 'block';

    LNN_Road_popup();
    //  fetchLNNTypeData();
    updateTable(cqlFilter);
}

function Lucknow_Material(cqlFilter) {
    removeCurrentLayer(); clearVectorLayers();
    currentLayer = new ol.layer.Image({
        //   title: 'Ward Boundary',
        //     extent: [-180, -90, -180, 90],
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS':'Lko_Summary:lucknow_road_net_material',                                  
                'CQL_FILTER': cqlFilter,
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    //overlays.getLayers().push(LNN_Ward_Boundary);
    map.addLayer(currentLayer);
    document.getElementById('summary-table').style.display = 'none';
    // document.getElementById('dataTable_summary').style.display = 'block';
    document.getElementById('dataTable_summaryfilter').style.display = 'block';
    document.getElementById('tableContainer_summaryfilter').style.display = 'block';

    LNN_Road_popup();
    //  fetchLNNTypeData();
    updateTable(cqlFilter);
}
function Lucknow_Types(cqlFilter) {
    removeCurrentLayer(); clearVectorLayers();
    currentLayer = new ol.layer.Image({
        //   title: 'Ward Boundary',
        //     extent: [-180, -90, -180, 90],
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_category',                                                       
                'CQL_FILTER': cqlFilter,
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    //overlays.getLayers().push(LNN_Ward_Boundary);
    map.addLayer(currentLayer);
    document.getElementById('summary-table').style.display = 'none';
    // document.getElementById('dataTable_summary').style.display = 'block';
    document.getElementById('dataTable_summaryfilter').style.display = 'block';
    document.getElementById('tableContainer_summaryfilter').style.display = 'block';

    LNN_Road_popup();
    // fetchLNNTypeData();
    updateTable(cqlFilter);
}

//--------------------Search bar code--------------------------//

var currentLayer = null;
$(document).ready(function () {
    // Initialize Select2 on the dropdown
    $('#roadNamesDropdown').select2({
        placeholder: "Search by road name",
        allowClear: true
    });

    // Define your WFS parameters
    var wfsParams = {
        service: 'WFS',
        version: '1.1.0',
        outputFormat: 'application/json',
        srsName: 'EPSG:4326', // Coordinate system of your data
        typeName: 'Lko_Summary:lucknow_road_net',   // Replace with your WFS layer typename
        url: `${GEOSERVER_BASE_URL}/wfs` // Replace with your WFS server URL
    };

    // Create a vector source and layer
    var vectorSource = new ol.source.Vector({
        format: new ol.format.GeoJSON()
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'cyan', // Custom line color
                width: 5 // Custom line width in pixels
            })
        })
    });
    map.addLayer(vectorLayer);

    // Define the URL for the WFS request
    const url = `${GEOSERVER_BASE_URL}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=Lko_Summary:lucknow_road_net&outputFormat=application/json`;

    // Create the XMLHttpRequest
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Parse the JSON response
                let response = JSON.parse(xhr.responseText);
                // Extract road_name properties from the features, filter out nulls
                let roadNames = response.features
                    .map(feature => feature.properties.road_name)
                    .filter(roadName => roadName !== null && roadName !== '');
                populateDropdown(roadNames);
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };
    // Send the request
    xhr.send();

    // Function to populate dropdown with all road names
    function populateDropdown(roadNames) {
        let dropdown = $('#roadNamesDropdown');
        // Clear existing options
        dropdown.empty();
        // Create a default option
        let defaultOption = new Option('Search by Road Name', '', true, true);
        dropdown.append(defaultOption);
        // Populate dropdown with road names
        roadNames.forEach(roadName => {
            let option = new Option(roadName, roadName, false, false);
            dropdown.append(option);
        });
        // Refresh Select2 and open the dropdown to display all options
        dropdown.trigger('change');
        dropdown.select2('open');  // Open the dropdown when populated
    }

    // Add an event listener to the dropdown
    $('#roadNamesDropdown').on('change', function () {
        let selectedRoadName = $(this).val();
        if (selectedRoadName) {
            fetchRoadData(selectedRoadName);
        }
    });

    // Function to fetch road data based on selected road name
    function fetchRoadData(roadName) {
        let fetchUrl = wfsParams.url + '?service=' + wfsParams.service +
            '&version=' + wfsParams.version +
            '&request=GetFeature&typename=' + wfsParams.typeName +
            '&outputFormat=' + wfsParams.outputFormat +
            '&srsname=' + wfsParams.srsName +
            '&CQL_FILTER=road_name=\'' + roadName + '\'';
        
        let fetchXhr = new XMLHttpRequest();
        fetchXhr.open('GET', fetchUrl, true);
        fetchXhr.onreadystatechange = function () {
            if (fetchXhr.readyState === 4) {
                if (fetchXhr.status === 200) {
                    let response = JSON.parse(fetchXhr.responseText);
                    vectorSource.clear();
                    let features = new ol.format.GeoJSON().readFeatures(response);
                    vectorSource.addFeatures(features);
                    map.getView().fit(vectorSource.getExtent());
                    currentLayer = vectorLayer;  // :white_check_mark: Set the active layer
                    LNN_Road_popup();
                } else {
                    console.log('Error:', fetchXhr.responseText);
                }
            }
        };
        fetchXhr.send();
    }
});
//--------------------Search bar code end----------------------------//

//--------------------Search bar code end----------------------------//




function Lucknow_Zone_no(column, value) {
    removeCurrentLayer();
   // clearVectorLayers();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net',   
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    // Show data table
    // Fetch corresponding data
    fetchLNN_ALLFilteredData(column, value);
}
function Lucknow_Ward_no(column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    document.getElementById('Scoreing_tableContainer').style.display='none';

    // Enhanced CQL Filter to capture ward_no with mixed values
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    
  //  console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debug log

    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net',
                'CQL_FILTER': cqlFilter,
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });

    currentLayer.setZIndex(10);
    LNN_Road_popup();
    map.addLayer(currentLayer);

    // Fetch data with enhanced logic (pass the same CQL filter)
    fetchLNN_ALLFilteredData(column, value);  // Optional: You can enhance this function too if needed
}


function Lucknow_Condition_cat(column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_condition',   // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Condition_legend').style.display = 'block';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('Priority_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    //    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('Scoreing_tableContainer').style.display = 'none';
    // Fetch corresponding data
    fetchLNN_ALLFilteredData(column, value);
}
function Lucknow_Material_cat(column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_material',  // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'block';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('Priority_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    document.getElementById('Scoreing_tableContainer').style.display = 'none';
   
    // Fetch corresponding data
    fetchLNN_ALLFilteredData(column, value);
    
}

function Lucknow_Ownership_cat(column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS':'Lko_Summary:lucknow_road_net_own',   // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Ownership_legend').style.display = 'block';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('Priority_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    document.getElementById('Scoreing_tableContainer').style.display = 'none';
    // Fetch corresponding data
    fetchLNN_ALLFilteredData(column, value);
}

function Lucknow_CUS_cat(column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_cus',   // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('CUS_legend').style.display = 'block';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('Priority_legend').style.display = 'none';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    document.getElementById('Scoreing_tableContainer').style.display = 'none';
    // Fetch corresponding data
    fetchLNN_ALLFilteredData(column, value);
}

function Lucknow_TypeSub_cat(column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': '	Lko_Summary:lucknow_road_net_category',   // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('RoadCategory_legend').style.display = 'block';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('Priority_legend').style.display = 'none';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Scoreing_tableContainer').style.display = 'none';
    // Fetch corresponding data
    fetchLNN_ALLFilteredData(column, value);
}
// Function to fetch data dynamically based on column and value
function fetchLNN_ALLFilteredData(column, value) {
    zoomToIndia();
    fetch(`${BASE_URL}/getData?column=${column}&value=${value}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(responseData => {
            console.log("Full API Response:", responseData); // :mag: Debugging
            if (!responseData || !Array.isArray(responseData.data)) {
                console.error("Invalid API response:", responseData);
                return; // :rotating_light: Prevent function execution if data is not valid
            }
           // appendToSummaryTable(responseData.data);
           Table_Row_and_Layer_highlight(responseData.data);
            document.getElementById('summary-table').style.display = 'none';
              document.getElementById('Scoreing_tableContainer').style.display = 'none';
            document.getElementById('dataTable_summary').style.display = 'block';
            document.getElementById('tableContainer_summary').style.display = 'block';
           

        })
        .catch(error => {
            console.error(`Error fetching data for ${column}=${value}:`, error);
        });
       // document.getElementById('live_legend').addEventListener('click', showlegend);
        document.getElementById('type_legend').addEventListener('click', showlegend);
        document.getElementById('Condition_legend').addEventListener('click', showlegend);
        document.getElementById('Material_legend').addEventListener('click', showlegend);
        document.getElementById('Ownership_legend').addEventListener('click', showlegend);
        document.getElementById('CUS_legend').addEventListener('click', showlegend);
        document.getElementById('RoadCategory_legend').addEventListener('click', showlegend);
       
function showlegend() {
       
  //  var legendBtn = document.getElementById('legendBtn');
    legendBtn.style.display = 'block';
    legendBtn.style.bottom = '20%';
    legendBtn.style.left = '1%'; // Example of additional style
    legendBtn.style.Color = 'color'; // Example of additional style
}
}


/*let currentPage = 0;
let isLoading = false;
let hasMore = true;
let activeColumn = null;
let activeValue = null;
function fetchLNN_ALLFilteredData(column, value) {
    zoomToIndia();
    activeColumn = column;
    activeValue = value;
    currentPage = 0;
    hasMore = true;
    isLoading = false;
    const container = document.getElementById('tableContainer_summary');
    const toBody = document.getElementById('dataBody_summary');
    if (toBody) toBody.innerHTML = '';
    // show the table container
    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('Scoreing_tableContainer').style.display = 'none';
    document.getElementById('dataTable_summary').style.display = 'block';
    document.getElementById('tableContainer_summary').style.display = 'block';
    // Load first batch instantly
   // loadPageData(true);
}
*/
// function loadPageData(isFirstBatch = false) {
//     if (!hasMore || isLoading) return;
//     isLoading = true;
//     const spinner = document.getElementById('loadingSpinner');
//     const progressLabel = document.getElementById('progressLabel');
//     if (spinner) spinner.style.display = 'block'; // :point_left: show spinner
//     if (progressLabel) progressLabel.innerText = "Loading roads..."; // initial text
//     fetch(`${BASE_URL}/getData?column=${activeColumn}&value=${activeValue}&page=${currentPage}&size=10000`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' }
//     })
//     .then(response => response.json())
//     .then(responseData => {
//         isLoading = false;
//         if (!responseData.status || !Array.isArray(responseData.data)) {
//             if (spinner) spinner.style.display = 'none';
//             return;
//         }
//         appendTableRows(responseData.data);
//         const total = responseData.total_records || 0;
//         const loaded = Math.min((currentPage + 1) * 10000, total);
//         if (progressLabel) progressLabel.innerText = `Loaded ${loaded} / ${total} roads`;
//         hasMore = responseData.hasMore;
//         if (hasMore) {
//             currentPage++;
//             setTimeout(() => loadPageData(false), isFirstBatch ? 1000 : 2000);
//         } else {
//             if (progressLabel) progressLabel.innerText = " All roads loaded.";
//             setTimeout(() => {
//                 if (spinner) spinner.style.display = 'none';
//             }, 1000);
//         }
//     })
//     .catch(err => {
//         console.error("Error loading page data:", err);
//         isLoading = false;
//         if (progressLabel) progressLabel.innerText = ":x: Error loading data.";
//         if (spinner) spinner.style.display = 'none';
//     });
// }
// function appendTableRows(data) {
//     const dataTableBody_summary = document.getElementById('dataBody_summary');
//     if (!dataTableBody_summary) {
//         console.error(":x: Element with id 'dataBody_summary' not found!");
//         return;
//     }
//     const fragment = document.createDocumentFragment();
//     data.forEach(item => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${item.gis_id || "N/A"}</td>
// 			<td>${item.road_id || "N/A"}</td>
//             <td>${item.zone_no || "N/A"}</td>
//             <td>${item.zone_name || "N/A"}</td>
//             <td>${item.ward_no || "N/A"}</td>
//             <td>${item.ward_name || "N/A"}</td>
//             <td>${item.ownership || "N/A"}</td>
//             <td>${item.category || "N/A"}</td>
//             <td>${item.road_name || "N/A"}</td>
//             <td>${item.row_meter || "N/A"}</td>
//             <td>${item.rowcls || "N/A"}</td>
//             <td>${item.carriage_w || "N/A"}</td>
//             <td>${item.material || "N/A"}</td>
//              <td>${item.length_km ? item.length_km.toFixed(2) : 'N/A'}</td>
//             <td>${item.condition || "N/A"}</td>
//             <td>${item.yoc || "N/A"}</td>
//             <td>${item.cus || "N/A"}</td>
//         `;
//         row.addEventListener('click', () => {
//             highlightFeatureOnMap(item.gis_id);
//             highlightTableRow(row);
//         });
//         fragment.appendChild(row);
//     });
//     dataTableBody_summary.appendChild(fragment);
// }
//--------------------Zonewise new code---------------------------------//
function Lucknow_Zone_Condition(zone_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();

    let validColumns = ["condition", "category", "material", "ownership", "cus"];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }

    // ✅ Smart CQL filter for fields that might have combined values (multi-value columns)
    let cqlFilter = "";

    if (["material", "condition", "category", "ownership", "cus"].includes(column)) {
        cqlFilter = `zone_no='${zone_no}' AND (${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    } else {
        cqlFilter = `zone_no='${zone_no}' AND ${column}='${value}'`;
    }

    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging

    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_condition',
                'CQL_FILTER': cqlFilter,
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });

    currentLayer.setZIndex(10);
    LNN_Road_popup();
    map.addLayer(currentLayer);

    // Legend display logic
    document.getElementById('Condition_legend').style.display = column === "condition" ? 'block' : 'none';
    document.getElementById('Material_legend').style.display = column === "material" ? 'block' : 'none';
    document.getElementById('type_legend').style.display = column === "type" ? 'block' : 'none';
    document.getElementById('Ownership_legend').style.display = column === "ownership" ? 'block' : 'none';
    document.getElementById('CUS_legend').style.display = column === "cus" ? 'none' : 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    document.getElementById('Scoreing_tableContainer').style.display = 'none';
    // Fetch filtered table data
    fetchLNNFilteredData(zone_no, column, value);
}


function Lucknow_Zone_Material(zone_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Ensure column is valid to prevent errors
    let validColumns = ["condition", "category", "material", "ownership","cus"];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }
    // Define dynamic CQL filter for Zone + Column + Value
    let cqlFilter = "";

    if (["material", "condition", "category", "ownership" ,"cus"].includes(column)) {
        cqlFilter = `zone_no='${zone_no}' AND (${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    } else {
        cqlFilter = `zone_no='${zone_no}' AND ${column}='${value}'`;
    }
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS':'Lko_Summary:lucknow_road_net_material',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'block';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
      document.getElementById('Scoreing_tableContainer').style.display = 'none';
    // Fetch corresponding data
    fetchLNNFilteredData(zone_no, column, value);
}
function Lucknow_Zone_Ownership(zone_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Ensure column is valid to prevent errors
    let validColumns = ["condition", "category", "material", "ownership", "cus"];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }
    // Define dynamic CQL filter for Zone + Column + Value
    let cqlFilter = "";

    if (["material", "condition", "category", "ownership", "cus"].includes(column)) {
        cqlFilter = `zone_no='${zone_no}' AND (${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    } else {
        cqlFilter = `zone_no='${zone_no}' AND ${column}='${value}'`;
    }
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_own',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Ownership_legend').style.display = 'block';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
      document.getElementById('Scoreing_tableContainer').style.display = 'none';
    fetchLNNFilteredData(zone_no, column, value);
}

function Lucknow_Zone_CUS(zone_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Ensure column is valid to prevent errors
    let validColumns = ["condition", "category", "material", "ownership", "cus","cus_class"];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }
    // Define dynamic CQL filter for Zone + Column + Value
    let cqlFilter = "";

    if (["material", "condition", "category", "ownership" ,"cus"].includes(column)) {
        cqlFilter = `zone_no='${zone_no}' AND (${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    } else {
        cqlFilter = `zone_no='${zone_no}' AND ${column}='${value}'`;
    }
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_cus',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'block';
    document.getElementById('RoadCategory_legend').style.display = 'none';
      document.getElementById('Scoreing_tableContainer').style.display = 'none';
    fetchLNNFilteredData(zone_no, column, value);
}

function Lucknow_Zone_TypeSub(zone_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Ensure column is valid to prevent errors
    let validColumns = ["condition", "category", "material", "ownership", "cus",];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }
    // Define dynamic CQL filter for Zone + Column + Value
    let cqlFilter = "";
    if (["material", "condition", "category", "ownership" ,"cus","category"].includes(column)) {
        cqlFilter = `zone_no='${zone_no}' AND (${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    } else {
        cqlFilter = `zone_no='${zone_no}' AND ${column}='${value}'`;
    }
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_category',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'block';
    document.getElementById('Scoreing_tableContainer').style.display = 'none';
    fetchLNNFilteredData(zone_no, column, value);
}
// Function to fetch data dynamically based on Zone, Column, and Value
function fetchLNNFilteredData(zone_no, column, value) {
    // zoomToIndia();
    fetch(`${BASE_URL}/getDataByZoneAndFilter?zone_no=${zone_no}&column=${column}&value=${value}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(responseData => {
            console.log(`Received data for ${zone_no}, ${column}=${value}:`, responseData);
            dataTableBody_summary.innerHTML = ''; // Clear existing table rows
           // appendToSummaryTable(responseData.data);
           Table_Row_and_Layer_highlight(responseData.data);
             document.getElementById('Scoreing_tableContainer').style.display = 'none';
            document.getElementById('summary-table').style.display = 'none';
            document.getElementById('dataTable_summary').style.display = 'block';
            document.getElementById('tableContainer_summary').style.display = 'block';
       
         })
        .catch(error => {
            console.error(`Error fetching data for ${zone_no}, ${column}=${value}:`, error);
        });
      //  document.getElementById('live_legend').addEventListener('click', showlegend);
        document.getElementById('type_legend').addEventListener('click', showlegend);
        document.getElementById('Condition_legend').addEventListener('click', showlegend);
        document.getElementById('Material_legend').addEventListener('click', showlegend);
        document.getElementById('Ownership_legend').addEventListener('click', showlegend);
function showlegend() {
       
  //  var legendBtn = document.getElementById('legendBtn');
    legendBtn.style.display = 'block';
    legendBtn.style.top = '70%';
    legendBtn.style.left = '1%'; // Example of additional style
    legendBtn.style.Color = 'color'; // Example of additional style
}
}

//---------------------------Wardwise filter new code -----------------------//

function Lucknow_Ward_Condition(ward_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();
   
    // Ensure column is valid to prevent errors
    let validColumns = ["condition", "category", "material", "ownership", "cus"];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }
    // Define dynamic CQL filter for Zone + Column + Value
    let cqlFilter = `(ward_no='${ward_no}' OR ward_no ILIKE '%/${ward_no}' OR ward_no ILIKE '${ward_no}/%' OR ward_no ILIKE '%/${ward_no}/%' OR ward_no ILIKE '${ward_no}') AND ${column}='${value}'`;

    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS':'Lko_Summary:lucknow_road_net_condition', // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'block';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
      document.getElementById('Scoreing_tableContainer').style.display = 'none';
  
    // Fetch corresponding data
    fetchLNNWardFilteredData(ward_no, column, value);
}
function Lucknow_Ward_Material(ward_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Ensure column is valid to prevent errors
    let validColumns = ["condition", "category", "material", "ownership", "cus"];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }
    // Define dynamic CQL filter for Zone + Column + Value
    let cqlFilter = `(ward_no='${ward_no}' OR ward_no ILIKE '%/${ward_no}' OR ward_no ILIKE '${ward_no}/%' OR ward_no ILIKE '%/${ward_no}/%' OR ward_no ILIKE '${ward_no}') AND ${column}='${value}'`;

    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_material',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'block';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
      document.getElementById('Scoreing_tableContainer').style.display = 'none';
    
    // Fetch corresponding data
    fetchLNNWardFilteredData(ward_no, column, value);
}

function Lucknow_Ward_Ownership(ward_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();
   
    // Ensure column is valid to prevent errors
    let validColumns = ["condition", "category", "material", "ownership", "cus"];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }
    // Define dynamic CQL filter for Zone + Column + Value
    let cqlFilter = `(ward_no='${ward_no}' OR ward_no ILIKE '%/${ward_no}' OR ward_no ILIKE '${ward_no}/%' OR ward_no ILIKE '%/${ward_no}/%' OR ward_no ILIKE '${ward_no}') AND ${column}='${value}'`;

    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            crossOrigin: 'anonymous', // ✅ REQUIRED!
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_own',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
        
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'block';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
      document.getElementById('Scoreing_tableContainer').style.display = 'none';
   
    // Fetch corresponding data
    fetchLNNWardFilteredData(ward_no, column, value);
}
function Lucknow_Ward_CUS(ward_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();
   
    // Ensure column is valid to prevent errors
    let validColumns = ["condition", "category", "material", "ownership","cus","cus_class"];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }
    // Define dynamic CQL filter for Zone + Column + Value
    let cqlFilter = `(ward_no='${ward_no}' OR ward_no ILIKE '%/${ward_no}' OR ward_no ILIKE '${ward_no}/%' OR ward_no ILIKE '%/${ward_no}/%' OR ward_no ILIKE '${ward_no}') AND ${column}='${value}'`;

    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_cus',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    // Showlegend
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'block';  
    document.getElementById('RoadCategory_legend').style.display = 'none';
      document.getElementById('Scoreing_tableContainer').style.display = 'none';

    // Fetch corresponding data
    fetchLNNWardFilteredData(ward_no, column, value);
}
function Lucknow_Ward_TypeSub(ward_no, column, value) {
    removeCurrentLayer();
    clearVectorLayers();
    // Ensure column is valid to prevent errors
    let validColumns = ["condition", "category", "material", "ownership","cus"];
    if (!validColumns.includes(column)) {
        console.error(`Invalid column: ${column}`);
        return;
    }
    // Define dynamic CQL filter for Zone + Column + Value
    let cqlFilter = `(ward_no='${ward_no}' OR ward_no ILIKE '%/${ward_no}' OR ward_no ILIKE '${ward_no}/%' OR ward_no ILIKE '%/${ward_no}/%' OR ward_no ILIKE '${ward_no}') AND ${column}='${value}'`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'Lko_Summary:lucknow_road_net_category',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    LNN_Road_popup();
    map.addLayer(currentLayer);
    // Showlegend
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('type_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'block';
      document.getElementById('Scoreing_tableContainer').style.display = 'none';
    // Fetch corresponding data
    fetchLNNWardFilteredData(ward_no, column, value);
}




// Function to fetch data dynamically based on Zone, Column, and Value
function fetchLNNWardFilteredData(ward_no, column, value) {
    // zoomToIndia();
    fetch(`${BASE_URL}/getDataByWardAndFilter?ward_no=${ward_no}&column=${column}&value=${value}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(responseData => {
            console.log(`Received data for ${ward_no}, ${column}=${value}:`, responseData);
            dataTableBody_summary.innerHTML = ''; // Clear existing table rows
          //  appendToSummaryTable(responseData.data);
            Table_Row_and_Layer_highlight(responseData.data);
            document.getElementById('summary-table').style.display = 'none';
              document.getElementById('Scoreing_tableContainer').style.display = 'none';
            document.getElementById('dataTable_summary').style.display = 'block';
            document.getElementById('tableContainer_summary').style.display = 'block';
        })
        .catch(error => {
            console.error(`Error fetching data for ${ward_no}, ${column}=${value}:`, error);
        });
        
}

//------------------download map and excel------------------------//

const downloadBtn = document.getElementById("downloadBtn");
const downloadMenu = document.getElementById("downloadMenu");

downloadBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  downloadMenu.classList.toggle("hidden");
});

// close menu if clicked outside
document.addEventListener("click", () => {
  downloadMenu.classList.add("hidden");
});

downloadMenu.addEventListener("click", (e) => {
  const type = e.target.getAttribute("data-type");
  if (!type) return;

  downloadMenu.classList.add("hidden");

  const table = document.getElementById("dataTable_summary");

  if (type !== "print") {
    if (!table || table.rows.length === 0) {
      alert("No data in table. Please apply a filter first.");
      return;
    }
  }

  const stamp = Date.now();

  switch (type) {
    case "excel":
      downloadTableAsExcel(table, `Filtered_Table_${stamp}.xlsx`);
      break;

    case "pdf":
      downloadTableAsPDF(table, stamp);
      break;

   case "kml":
  const kmlText = downloadTableAsKML(table, stamp);
  if (kmlText) {
    openKMLInGoogleEarth(kmlText);
  }
  break;

   
  case "print": {
    document.body.classList.add("print-mode");

    const view = map.getView();

    // ---- SAVE ORIGINAL STATE ----
    const originalCenter = view.getCenter().slice();
    const originalResolution = view.getResolution();

    setTimeout(() => {
      // ---- FORCE MAP RESIZE ----
      map.updateSize();

      // ---- PRINT-ONLY ADJUSTMENT ----
      const pixelShift = 500;          // tune once (300–500 typical)
      const zoomFactor = 1.2;

      const shiftInMapUnits = pixelShift * originalResolution;

      view.setCenter([
        originalCenter[0] + shiftInMapUnits, // X shift only
        originalCenter[1]
      ]);

      view.setResolution(originalResolution * zoomFactor);

    }, 100);

    // ---- PRINT AFTER VIEW IS STABLE ----
    setTimeout(() => {
      window.print();
    }, 1000);

    // ---- RESTORE MAP AFTER PRINT ----
    setTimeout(() => {
      view.setCenter(originalCenter);
      view.setResolution(originalResolution);

      document.body.classList.remove("print-mode");
      map.updateSize();
    }, 1200);

    break;
  }

}
});
function cloneTableWithoutGeom(table) {
  const clone = table.cloneNode(true);

  const headers = Array.from(clone.querySelectorAll("thead th"))
    .map(th => th.innerText.trim().toLowerCase());

  const geomIndex = headers.indexOf("geom");
  if (geomIndex === -1) return clone;

  // remove header
  clone.querySelectorAll("thead tr").forEach(tr => {
    tr.deleteCell(geomIndex);
  });

  // remove body cells
  clone.querySelectorAll("tbody tr").forEach(tr => {
    tr.deleteCell(geomIndex);
  });

  return clone;
}

//===================Excel===================

function downloadTableAsExcel(table, filename) {
  const cleanTable = cloneTableWithoutGeom(table);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(cleanTable);
  XLSX.utils.book_append_sheet(wb, ws, "FilteredData");
  XLSX.writeFile(wb, filename);
}



// ================= KML =================
function downloadTableAsKML(table) {  
	// ---------- XML escape (MANDATORY for Google Earth) ----------//
  const xmlEscape = v =>    v ? v.replace(/&/g,"&amp;") .replace(/</g,"&lt;") .replace(/>/g,"&gt;").replace(/"/g,"&quot;")  
       .replace(/'/g,"&apos;") : ""; 
 // ---------- Normalize headers ----------
  const headers = Array.from(table.querySelectorAll("thead th"))  .map(th =>    th.innerText      .trim()      .toLowerCase() 
     .replace(/\(([^)]+)\)/g, "_$1")   // (km) → _km  
    .replace(/[^a-z0-9]+/g, "_")      .replace(/^_|_$/g, "")  ); 
 const getVal = (tr, name) => {    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_"); 
	   const idx = headers.indexOf(key);    return idx !== -1 ? tr.children[idx]?.innerText.trim() : "";  }; 
	 let kml = `<?xml version="1.0" encoding="UTF-8"?>\n`; 
	 kml += `<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n`;
	  const rows = table.querySelectorAll("tbody tr");  rows.forEach((tr, i) => {    //  READ GEOM FROM DATASET  
	  const geomText = tr.dataset.geom;  
	  if (      !geomText ||      !geomText.startsWith("MULTILINESTRING") ||      geomText.includes("EMPTY")    ) return;  
	  // ---------- Parse MULTILINESTRING ----------  
	  const lines = geomText      .replace(/^MULTILINESTRING\s*\(\(/i, "")  .replace(/\)\)\s*$/i, "") .split(/\)\s*,\s*\(/); 
	   lines.forEach((line, j) => {   
		   const coordinates = line        .replace(/[()]/g, "") .split(",") .map(c => {    
			      const parts = c.trim().split(/\s+/);          if (parts.length < 2) return null;       
			   const lon = parseFloat(parts[0]);     
			     const lat = parseFloat(parts[1]);    
			      if (isNaN(lon) || isNaN(lat)) return null;   return `${lon},${lat},0`;        }) 
			 .filter(Boolean)        .join(" ");      if (!coordinates) return;  
   kml += `<Placemark>\n`;  
    kml += `<name>${xmlEscape(getVal(tr,"road_name") || `Feature ${i+1}`)}</name>\n`; 
     kml += `<ExtendedData> 
 <Data name="road_id"><value>${xmlEscape(getVal(tr,"road_id"))}</value></Data> 
 <Data name="road_name"><value>${xmlEscape(getVal(tr,"road_name"))}</value></Data> 
 <Data name="row_meter"><value>${xmlEscape(getVal(tr,"row_meter"))}</value></Data> 
 <Data name="length_km"><value>${xmlEscape(getVal(tr,"length_km"))}</value></Data> 
 <Data name="material"><value>${xmlEscape(getVal(tr,"material"))}</value></Data> 
 <Data name="ownership"><value>${xmlEscape(getVal(tr,"ownership"))}</value></Data>
</ExtendedData>`;  
    kml += `<LineString>  <tessellate>1</tessellate>  <coordinates>${coordinates}</coordinates></LineString></Placemark>\n`;    });  });
  kml += `</Document>\n</kml>`; 
 return kml;
}

// function openKMLInGoogleEarth(kmlText) {
//   const blob = new Blob([kmlText], {
//     type: "application/vnd.google-earth.kml+xml"
//   });

//   const url = URL.createObjectURL(blob);

//   window.open("https://earth.google.com/web/", "_blank");

//   setTimeout(() => {
//     window.open(url, "_blank");
//   }, 3000);
// }

function openKMLInGoogleEarth(kmlText) {
  const blob = new Blob([kmlText], {
    type: "application/vnd.google-earth.kml+xml"
  });

  const url = URL.createObjectURL(blob);

  // 🔹 FORCE DOWNLOAD
  const a = document.createElement("a");
  a.href = url;
  a.download = `roads_${Date.now()}.kml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // 🔹 OPEN GOOGLE EARTH WEB
  window.open("https://earth.google.com/web/", "_blank");

  // cleanup
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

//=================PDF===================

function downloadTableAsPDF(table, stamp) {
	const jsPDF = window.jspdf?.jsPDF || window.jsPDF;

	if (!jsPDF) {
	  alert("jsPDF library not loaded");
	  return;
	}





  const pdf = new jsPDF("l", "mm", "a4");
  pdf.text("Filtered Table Data", 14, 15);

  // ---- get headers & find GEOM index ----
  const headerCells = Array.from(table.querySelectorAll("thead th"));
  const headers = headerCells.map(th => th.innerText.trim());

  const geomIndex = headers.findIndex(h => h.toLowerCase() === "geom");

  // ---- remove GEOM from headers ----
  const cleanHeaders =
    geomIndex === -1
      ? headers
      : headers.filter((_, i) => i !== geomIndex);

  // ---- build body without GEOM column ----
  const body = Array.from(table.querySelectorAll("tbody tr")).map(tr =>
    Array.from(tr.querySelectorAll("td"))
      .filter((_, i) => i !== geomIndex)
      .map(td => td.innerText.trim())
  );

  pdf.autoTable({
    head: [cleanHeaders],
    body: body,
    startY: 20,
    styles: { fontSize: 7 },
    theme: "grid"
  });

  pdf.save(`Filtered_Table_${stamp}.pdf`);
}
	

//------------------------------------------------ Zone Boundary ------------------------------------------

let currentZoneLayer = null; // Store the current layer

function getZoneBoundary(zoneNo) {
    fetch(`${BASE_URL}/getZoneBoundary?zone_no=${zoneNo}`)
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const geojson = JSON.parse(data.geometry);
                highlightZoneBoundary(geojson);
            } else {
                console.error("Error:", data.message);
            }
        })
        .catch(error => console.error("Error fetching boundary:", error));
}

function highlightZoneBoundary(geojson) {
    // Remove previous layer if it exists
    // if (currentZoneLayer) {
    //     map.removeLayer(currentZoneLayer);
    // }

    removeCurrentLayer();
    clearVectorLayers();
    const format = new ol.format.GeoJSON();
    const feature = format.readFeature(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326'
    });

    const vectorSource = new ol.source.Vector({
        features: [feature]
    });

    currentZoneLayer = new ol.layer.Vector({ // Store the new layer
        source: vectorSource,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellowgreen',
                width: 4
            }),
            // fill: new ol.style.Fill({
            //     color: 'rgba(255, 0, 0, 0.2)'
            // })
        })
    });

    map.addLayer(currentZoneLayer);

    // Zoom to the feature
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
}

//------------------------------------------------ Ward Boundary --------------------------------------------------------

function getwardBoundary(wardNo) {
    fetch(`${BASE_URL}/getWardBoundary?ward_no=${wardNo}`)
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const geojson = JSON.parse(data.geometry);
                highlightZoneBoundary(geojson);
            } else {
                console.error("Error:", data.message);
            }
        })
        .catch(error => console.error("Error fetching boundary:", error));
}



//------------------------------------------------ summary filter based on zone , ward, material,ownership ---------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdown('zoneSelect', '/getZones', 'zone_no');
    document.getElementById('zoneSelect').addEventListener('change', (e) => {
        const selectedZone = e.target.value;
        fetchAndPopulateWards(selectedZone, 'wardSelect');
        selectedFilters.zone = selectedZone;
        selectedFilters.ward = null; // Reset ward when zone changes
        updateMapAndTable();
    });
    const filters = ['ward', 'ownership', 'category', 'condition', 'material'];
    filters.forEach(filter => {
        document.querySelector(`.${filter}-dropdown`).addEventListener('change', (e) => {
            selectedFilters[filter] = e.target.value;
            // Reset other filters so legend/layer switches correctly
    if (filter === 'material') {
        selectedFilters.category = null;
        selectedFilters.ownership = null;
        selectedFilters.condition = null;
    }
    if (filter === 'category') {
        selectedFilters.material = null;
        selectedFilters.ownership = null;
        selectedFilters.condition = null;
    }
    if (filter === 'ownership') {
        selectedFilters.material = null;
        selectedFilters.category = null;
        selectedFilters.condition = null;
    }
    if (filter === 'condition') {
        selectedFilters.material = null;
        selectedFilters.category = null;
        selectedFilters.ownership = null;
    }
            updateMapAndTable();
        });
    });
});
const selectedFilters = { zone: null, ward: null, ownership: null, category: null, material: null ,condition: null};
function initializeDropdown(dropdownId, endpoint, key) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = `<option value="">Select ${key.replace('_', ' ')}</option>`;
    fetch(`${BASE_URL}${endpoint}`)
        .then(res => res.json())
        .then(data => {
            if (data.status && data.data.length) {
                data.data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[key];
                    option.textContent = item[key];
                    dropdown.appendChild(option);
                });
            }
        })
        .catch(err => console.error('Error fetching dropdown data:', err));
}
function fetchAndPopulateWards(zone, wardDropdownId) {
    const wardDropdown = document.getElementById(wardDropdownId);
    wardDropdown.innerHTML = '<option value="">Select Ward</option>';
    fetch(`${BASE_URL}/getWardsForZone?zone_no=${zone}`)
        .then(res => res.json())
        .then(data => {
            if (data.status && data.data.length) {
                data.data.forEach(ward => {
                    const option = document.createElement('option');
                    option.value = ward.ward_no;
                    option.textContent = ward.ward_no;
                    wardDropdown.appendChild(option);
                });
            }
        })
        .catch(err => console.error('Error fetching wards:', err));
}
function updateMapAndTable() {
    let filterConditions = [];
    if (selectedFilters.zone) filterConditions.push(`zone_no='${selectedFilters.zone}'`);
    if (selectedFilters.ward) filterConditions.push(`ward_no='${selectedFilters.ward}'`);
    if (selectedFilters.ownership) filterConditions.push(`ownership='${selectedFilters.ownership}'`);
    if (selectedFilters.condition) filterConditions.push(`condition='${selectedFilters.condition}'`);
    if (selectedFilters.category) filterConditions.push(`category='${selectedFilters.category}'`);
    if (selectedFilters.material) filterConditions.push(`material='${selectedFilters.material}'`);
    const cqlFilter = filterConditions.join(' AND ');
    const layer = determineLayer();
    updateMapLayer(layer, cqlFilter);
    updateTable(layer, cqlFilter);
}
function determineLayer() {
    if (selectedFilters.material) {
        document.getElementById('Material_legend').style.display = 'block';
        document.getElementById('Condition_legend').style.display = 'none';
        document.getElementById('RoadCategory_legend').style.display = 'none';
        document.getElementById('Ownership_legend').style.display = 'none';
        return 'Lko_Summary:lucknow_road_net_material';
    } else if (selectedFilters.category) {
        document.getElementById('RoadCategory_legend').style.display = 'block';
        document.getElementById('Condition_legend').style.display = 'none';
        document.getElementById('Ownership_legend').style.display = 'none';
        document.getElementById('Material_legend').style.display = 'none';
        return 'Lko_Summary:lucknow_road_net_category';
    } else if (selectedFilters.ownership) {
        document.getElementById('Ownership_legend').style.display = 'block';
        document.getElementById('Condition_legend').style.display = 'none';
        document.getElementById('RoadCategory_legend').style.display = 'none';
        document.getElementById('Material_legend').style.display = 'none';
        return 'Lko_Summary:lucknow_road_net_own';
    } else if (selectedFilters.condition) {
        document.getElementById('Condition_legend').style.display = 'block';
        document.getElementById('RoadCategory_legend').style.display = 'none';
        document.getElementById('Ownership_legend').style.display = 'none';
        document.getElementById('Material_legend').style.display = 'none';
        return 'Lko_Summary:lucknow_road_net_condition';
    }
    return 'Lko_Summary:lucknow_road_net';
}
function updateMapLayer(layer, cqlFilter) {
    removeCurrentLayer();
    clearVectorLayers();
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: { 'LAYERS': layer, 'CQL_FILTER': cqlFilter },
            ratio: 1,
            serverType: 'geoserver'
        })
    });
    map.addLayer(currentLayer);
}
function updateTable(layer, cqlFilter) {
    const tableBody = document.getElementById('dataBody_summaryfilter');
    tableBody.innerHTML = '';
    fetch(`${GEOSERVER_BASE_URL}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer}&outputFormat=application/json&CQL_FILTER=${encodeURIComponent(cqlFilter)}`)
        .then(res => res.json())
        .then(geojson => {
            if (geojson.features.length > 0) {
                geojson.features.forEach(({ properties }) => {
                    tableBody.insertAdjacentHTML('beforeend', `
                        <tr>
                            <td>${properties.gis_id}</td>
                             <td>${properties.road_id}</td>
                            <td>${properties.zone_no || 'N/A'}</td>
                            <td>${properties.zone_name || 'N/A'}</td>
                            <td>${properties.ward_no || 'N/A'}</td>
                            <td>${properties.ward_name || 'N/A'}</td>
                            <td>${properties.ownership || 'N/A'}</td>
                            <td>${properties.category || 'N/A'}</td>
                            <td>${properties.road_name || 'N/A'}</td>
                            <td>${properties.row_meter || 'N/A'}</td>
                            <td>${properties.row_apr || 'N/A'}</td>
                            <td>${properties.carriage_w || 'N/A'}</td>
                            <td>${properties.material || 'N/A'}</td>
                            <td>${properties.length_km?properties.length_km.toFixed(2) : 'N/A'}</td>
                            <td>${properties.condition || 'N/A'}</td>
                            <td>${properties.yoc || 'N/A'}</td>
                            <td>${properties.cus || 'N/A'}</td>
                        </tr>`);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="16">No data available</td></tr>';
            }
        })
        .catch(err => console.error('Error fetching WFS data:', err));
}






function showSelectedRoadsLayer() {
    alert("Data not available");
}
document.querySelector('.back-icon').addEventListener('click', function() {
    window.history.back();
});


document.getElementById("Manhole").addEventListener("change", function (e) {
    Manhole.setVisible(e.target.checked);
});

//============================================ SEWAGE LAYER ===============================================


// Diameter based sewage
var sewageDiameter = new ol.layer.Image({
  visible: false,
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_BASE_URL}/wms`,
    params: {
      LAYERS: "Lko_Summary:LNN_Sewage_net_diameter"
    },
    ratio: 1,
    serverType: "geoserver"
  })
});

// Length based sewage
var sewageLength = new ol.layer.Image({
  visible: false,
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_BASE_URL}/wms`,
    params: {
      LAYERS: "Lko_Summary:LNN_Sewage_net_length"
    },
    ratio: 1,
    serverType: "geoserver"
  })
});

map.addLayer(sewageDiameter);
map.addLayer(sewageLength);


/* ---------- initial state ---------- */
const sewageLegendBox   = document.getElementById("sewage-legend");
const sewageLegendTitle = document.getElementById("sewage-legend-title");
const sewageLegendImg   = document.getElementById("sewage-legend-img");

sewageLegendBox.style.display = "none";
sewageLegendTitle.innerText = "";
sewageLegendImg.src = "";

/* ---------- show legend ---------- */
function showSewageLegend(layerName, headerText) {
  if (!layerName || !headerText) return;

  const legendUrl =
    `${GEOSERVER_BASE_URL}/wms` +
    `?REQUEST=GetLegendGraphic` +
    `&VERSION=1.0.0` +
    `&FORMAT=image/png` +
    `&LAYER=${layerName}` +
    `&_=${Date.now()}`;

  sewageLegendTitle.innerText = headerText;
  sewageLegendImg.src = legendUrl;
  sewageLegendBox.style.display = "block";
}

/* ---------- hide legend ---------- */
function hideSewageLegend() {
  sewageLegendBox.style.display = "none";
  sewageLegendTitle.innerText = "";
  sewageLegendImg.src = "";
}

/* ---------- sewage checkbox ---------- */
document.getElementById("ShowSewage").addEventListener("change", function () {

  if (!this.checked) {
    hideSewageLegend();
    return;
  }

  // checkbox ON → check which radio is selected
  const selectedRadio =
    document.querySelector('input[name="sewageMode"]:checked');

  if (!selectedRadio) return;

  if (selectedRadio.value === "diameter") {
    showSewageLegend(
      "Lko_Summary:LNN_Sewage_net_diameter",
      "Sewage Diameter Classification"
    );
  }

  if (selectedRadio.value === "length") {
    showSewageLegend(
      "Lko_Summary:LNN_Sewage_net_length",
      "Sewage Length Classification"
    );
  }
});

/* ---------- radio button change ---------- */
document.querySelectorAll('input[name="sewageMode"]').forEach(radio => {
  radio.addEventListener("change", function () {
    if (!this.checked) return;

    if (this.value === "diameter") {
      showSewageLegend(
        "Lko_Summary:LNN_Sewage_net_diameter",
        "Sewage Diameter Classification"
      );
    }

    if (this.value === "length") {
      showSewageLegend(
        "Lko_Summary:LNN_Sewage_net_length",
        "Sewage Length Classification"
      );
    }
  });
});







document.getElementById("ShowSewage").addEventListener("change", function () {
  const checked = this.checked;

  document.getElementById("sewage-mode").style.display =
    checked ? "block" : "none";

  if (!checked) {
    sewageDiameter.setVisible(false);
    sewageLength.setVisible(false);
    document.getElementById("sewage-legend").style.display = "none";
    return;
  }

  // default → diameter
  sewageDiameter.setVisible(true);
  sewageLength.setVisible(false);
  updateSewageLegend("Lko_Summary:LNN_Sewage_net_diameter");
});




document
  .querySelector('input[value="diameter"]')
  .addEventListener("change", function () {

    if (!this.checked) return;

    sewageDiameter.setVisible(true);
    sewageLength.setVisible(false);

    updateSewageLegend("Lko_Summary:LNN_Sewage_net_diameter");
});


document
  .querySelector('input[value="length"]')
  .addEventListener("change", function () {

    if (!this.checked) return;

    sewageDiameter.setVisible(false);
    sewageLength.setVisible(true);

    updateSewageLegend("Lko_Summary:LNN_Sewage_net_length");
});
