const BASE_URL = `${BASE_URL_All}:8991/Aligarh`;
const GEOSERVER_BASE_URL = "http://localhost:8080/geoserver/ALG_Summary";


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
['Bank_Road', 'Park_Road', 'Hospital_Road', 'Education_Road', 'Hotel_Road', 'ShowRoads'].forEach(id => {
    document.getElementById(id).addEventListener('click', showTables);
});

function showTables() {
    showElements(['dataTable_summary', 'tableContainer_summary']);
    hideElements(['legendBtn', 'Condition_legend', 'CUS_legend', 'RoadCategory_legend', 'Material_legend', 'Ownership_legend',
        'summary-table', 'tableContainer_summaryfilter',
    ]);
}

//------------------------------------ summary tables show and hide elements -------------------------
document.getElementById('table_icon').addEventListener('click', showTables2);

function showTables2() {
    showElements(['summary-table']);
    hideElements(['dataTable', 'tableContainer_summary', 'tableContainer_summaryfilter',
        'legendBtn', 'Condition_legend', 'CUS_legend', 'RoadCategory_legend',
        'Material_legend', 'Ownership_legend',
    ]);
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
var content;
var selectedFeature;

var view = new ol.View({
    projection: "EPSG:4326",
    center: [78.0738, 27.8922],
    zoom: 12,
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
            visible: false,
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
            visible: true,
            source: new ol.source.XYZ({
              
                attributionsCollapsible: false,
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                maxZoom: 23,
            }),
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


//-----------------------------------Boundaries------------------------------------//
var zone_boundary = new ol.layer.Image({
    title: "Aligarh Zone Boundary",
    source: new ol.source.ImageWMS({
        url: `${GEOSERVER_BASE_URL}/wms?`,
        params: {
            LAYERS: "ALG_Summary:aligarh_zone_boundary",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
map.addLayer(zone_boundary);

var ward_boundary = new ol.layer.Image({
    title: "Aligarh Ward Boundary",
    source: new ol.source.ImageWMS({
        url: `${GEOSERVER_BASE_URL}/wms?`,
        params: {
            LAYERS: "ALG_Summary:aligarh_ward_boundary",
        },
        ratio: 1,
        serverType: "geoserver",
    }),
});
map.addLayer(ward_boundary);


//---------------------------------------- charts and data --------------------------------------------//
function data_analysis() {
    window.open('https://lookerstudio.google.com/reporting/a6be1a2e-7fb8-414d-a2b3-b724766cb501', '_blank'); // Open Google in a new tab
}

/*----------------------------------------- javascript for sidebar----------------------------------------- */
//----------------- table Cancel btn ----------------------------//
document.querySelectorAll('.table-cancel-btn1').forEach(function (element) {
    element.addEventListener('click', function () {
        document.getElementById('tableContainer_summary').style.display = 'none';
        document.getElementById('tableContainer_summaryfilter').style.display = 'none';


        document.getElementById('summary-table').style.display = 'block';
        document.getElementById('popup').style.display = 'none';

        const Materiallegend = document.getElementById('Material_legend');
        Materiallegend.style.display = 'none';
        const Conditionlegend = document.getElementById('Condition_legend');
        Conditionlegend.style.display = 'none';

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

//------------------------------------- query panel --------------------------------------//
function query_panel1() {
    var x = document.getElementById("query_tab");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}



//-------------------------- zone wise road filter start----------------------------//
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

    const elementsToHide = ["road-filter", "query_tab", "popup_road", "tableContainer_summary",
        "tableContainer_summaryfilter", "content-wrapper", "topnav",];
    elementsToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = "none";
        }
    });

    const legendIds = [
        'Condition_legend', 'Material_legend', 'Ownership_legend', 'CUS_legend', 'RoadCategory_legend'];
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
            if (layer.get('title') !== 'Aligarh Zone Boundary' && layer.get('title') !== 'Aligarh Ward Boundary') {
                map.removeLayer(layer);
            }
        }
    });
}

function zoomToIndia() {
    const view = map.getView();

    // Define the approximate bounding box for India
    const extent = ol.proj.transformExtent(
        [82.08302446765529, 26.71400889838419, 82.24602173765878, 26.811349630444568],
        'EPSG:4326',
        view.getProjection()
    );
    // Set the map's center and zoom level explicitly
    view.setCenter([78.0738, 27.8922]);
    view.setZoom(12);
    view.setRotation(0);

}

/*----------------------------------------- javascript for navbar in table---------------------------------------- */
function updateNavBarWithFunctionName(functionName) {
    console.log("Updating navbar with function name:", functionName);
    // document.getElementById('featureName').textContent = functionName;

    document.querySelectorAll('.feature_name1').forEach(element => {
        element.textContent = functionName;
    });
}

function minimize1() {

    const topnav = document.getElementById('tableContainer_summary');

    const navElements = document.querySelectorAll('.feature_nav');
    navElements.forEach(nav => {
        nav.style.bottom = '3%'; // Reduced width when minimized
    });
    topnav.style.height = '0%'; // Reduced height when minimized

    const legendIds = ['Condition_legend', 'Material_legend', 'Ownership_legend'];

    // Loop through each legend and hide it
    legendIds.forEach(function (legendId) {
        const legendBtn = document.getElementById(legendId);
        if (legendBtn) {  // Check if the element exists before manipulating it
            legendBtn.style.display = 'none';
        }
    });


}
function maximize1() {
    const topnav = document.getElementById('tableContainer_summary');
    const navElements = document.querySelectorAll('.feature_nav');
    navElements.forEach(nav => {
        nav.style.bottom = '29%'; // Reduced width when minimized
    });

    topnav.style.height = '29%'; // Reduced height when minimized

}

//------------------------------------- MULTILINESTRING feature to the map from WKT format
function addMultilinestringFeatureFromWKT_General(wktString, color = 'black', width = 3) {
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
    console.log("Highlighting and scrolling to row: ", row);

    Array.from(dataTableBody_summary.querySelectorAll('tr')).forEach(tr => {
        tr.classList.remove('highlighted');
    });


    row.classList.add('highlighted');
    row.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    });
    console.log("Row scrolled into view.");
}

const styleElement = document.createElement('style');
styleElement.innerHTML = `
    tr.highlighted {
        background-color: yellow !important;
        color: black !important;
        z-index: 2001;
    }
`;
document.head.appendChild(styleElement);

// Create a map to associate features with table rows
const featureToRowMap = new Map();

const selectInteraction = new ol.interaction.Select({
    condition: ol.events.condition.click,
    layers: layer => layer instanceof ol.layer.Vector,

});
map.addInteraction(selectInteraction);

// Highlight table row on road feature click and scroll to it
selectInteraction.on('select', function (e) {
    if (e.selected.length > 0) {
        const selectedFeature = e.selected[0];
        console.log("Selected feature: ", selectedFeature);

        const featureId = selectedFeature.getId();
        console.log("Feature ID: ", featureId);

        const associatedRow = featureToRowMap.get(featureId);
        console.log("Associated row: ", associatedRow);

        if (associatedRow) {
            highlightAndScrollToRow(associatedRow);

        } else {
            console.warn("No associated row found for the selected feature.");
        }
    } else {
        console.log("No feature selected.");
    }
});


//----------------------------------optimise amenities-----------------------------

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
    console.log("The URL is:", `${BASE_URL}/getLocationData?type=${type}`);
    fetch(`${BASE_URL}/getLocationData?type=${type}`)
        .then(response => response.json())
        .then(data => {
            const features = data.data.map(point => {
                try {
                    const coords = point.geom_point.replace('POINT(', '').replace(')', '').split(' ');
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
            console.log(`${type} features added:`, features);

            document.getElementById(elementId).addEventListener('change', function () {
                layer.setVisible(this.checked);
            });
        })
        .catch(error => console.error(`Error fetching ${type} data:`, error));
}

// Location Types and Fetching Features for Points
const locationTypes = [
    { type: 'atm_bank', icon: '../assets/icons/bank.png', id: 'showBanks' },
    { type: 'bus_stop', icon: '../assets/icons/bus.png', id: 'showBus' },
    { type: 'charging', icon: '../assets/icons/charging.png', id: 'showCar' },
    { type: 'hospital', icon: '../assets/icons/hospital.png', id: 'showHospital' },
    { type: 'education', icon: '../assets/icons/education.png', id: 'showEducation' },
    { type: 'hotel', icon: '../assets/icons/hotel.png', id: 'showHotel' },
    { type: 'petrol_pump', icon: '../assets/icons/fuel.png', id: 'showPetrol' },
    { type: 'community_toilet', icon: '../assets/icons/toilet-.png', id: 'showCommunitytoilet' },
    { type: 'electric_substation', icon: '../assets/icons/power-plant.png', id: 'showElectric-Substation' },
    { type: 'landmark', icon: '../assets/icons/destination.png', id: 'showLandmarks' },
    { type: 'graveyard', icon: '../assets/icons/graveyard.png', id: 'showGraveyard' },
    { type: 'religious', icon: '../assets/icons/book.png', id: 'showReligious' },
    { type: 'post_office', icon: '../assets/icons/post-office.png', id: 'showPostOffice' },
    { type: 'central_gov', icon: '../assets/icons/Central.png', id: 'showCentralGov' },
    { type: 'state_gov', icon: '../assets/icons/State.png', id: 'showStateGov', scale: 0.02 },
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
            // Log the data to understand its structure
            console.log('Fetched park data:', data);

            if (!data || !Array.isArray(data.data)) {
                throw new Error('Invalid data format: expected an object with an array in "data" property.');
            }

            var format = new ol.format.WKT();
            var features = data.data.map(function (park) {
                console.log("WKT Geometry:", park.geom_point);

                try {
                    var feature = format.readFeature(park.geom_point, {
                        dataProjection: 'EPSG:4326', // Assuming WKT data is in EPSG:4326
                        featureProjection: 'EPSG:4326' // Assuming map view is EPSG:4326 (change to EPSG:3857 if needed)
                    });

                    feature.setStyle(createPolygonStyle()); // Apply polygon style to the feature
                    feature.set('name', park.name); // Add park name as an attribute
                    return feature;
                } catch (error) {
                    console.error('Error converting WKT to Feature:', park.geom_point, error);
                    return null;
                }
            }).filter(Boolean);

            vectorSource.addFeatures(features); // Add features to the source
            console.log('Park features added:', features);

            // Adjust map view to fit the extent of the features
            if (features.length > 0) {
                map.getView().fit(vectorSource.getExtent(), {
                    size: map.getSize(),
                    maxZoom: 12
                });
            }

            document.getElementById(elementId).addEventListener('change', function () {
                layer.setVisible(this.checked);
            });
        })
        .catch(error => console.error('Error fetching park data:', error));
}

// Add Park Layer (Polygon-based)
const parkVectorSource = new ol.source.Vector();
const parkVectorLayer = createVectorLayer(parkVectorSource);
map.addLayer(parkVectorLayer);

// Fetch and add park features
park_amenityFeature(`${BASE_URL}/getPark_newName`, parkVectorSource, parkVectorLayer, 'showParks');


//-------------------------------------------All Roads-------------------------//

const dataTableBody_summary = document.getElementById('dataBody_summary');
const dataTableBody_summaryfilter = document.getElementById('dataBody_summaryfilter');

ShowRoads.addEventListener('click', function () {
    updateNavBarWithFunctionName("All Roads");
    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector
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
            console.log('Received data:', responseData);
            console.log('getting all data');
            // Clear existing table rows
            dataTableBody_summary.innerHTML = '';
            // Check if 'data' is an array before iterating
            if (Array.isArray(responseData.data)) {
                responseData.data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                               <td>${item.gis_id}</td>
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
                            <td>${item.length_km}</td>
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


//--------------------------------optimise code of sidebar road analysis -----------------------------
function amenitiesRoadAnalysis(endpoint, layerName, featureFunction, elementId) {
    removeCurrentLayer();
    updateNavBarWithFunctionName(layerName);

    map.getLayers().getArray().slice().forEach(layer => {
        if (layer instanceof ol.layer.Vector && layer != parkVectorLayer) {
            map.removeLayer(layer);
        }
    });
    map.getOverlays().clear();

    fetch(`${BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(responseData => {
            console.log(`Received data for ${layerName}:`, responseData);

            // Reset UI
            dataTableBody_summary.innerHTML = '';
            featureToRowMap.clear();
            // map.getOverlays().clear();

            // 🔍 Handle new flat response structure
            if (Array.isArray(responseData)) {
                const countEntry = responseData[0];
                const features = responseData.slice(1); // skip first element

                console.log(`Total features in ${layerName}:`, countEntry.count);

                features.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                               <td>${item.gid}</td>
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
                            <td>${item.length_km}</td>
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
                        console.log(`WKT String for ${layerName}:`, item.geom);
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

Bank_Road.addEventListener('click', () => showAmenityWithRoads('roads-with-atms', 'Bank with Roads', addMultilinestringFeatureFromWKT, 'bank', '../assets/icons/bank.png', 'showBanks'));
Park_Road.addEventListener('click', () => showAmenityWithRoads('roads-with-Park', 'Park with Roads', addMultilinestringFeatureFromWKT_parkRoad));
Hospital_Road.addEventListener('click', () => showAmenityWithRoads('roads_with_hospital', 'Hospital with Roads', addMultilinestringFeatureFromWKT_HospitalRoad, 'hospital', '../assets/icons/hospital.png', 'showHospital'));
Hotel_Road.addEventListener('click', () => showAmenityWithRoads('roads-with-hotel', 'Hotel with Roads', addMultilinestringFeatureFromWKT_HotelRoad, 'hotel', '../assets/icons/hotel.png', 'showHotel'));
Education_Road.addEventListener('click', () => showAmenityWithRoads('roads-with-Education', 'Educational Institute with Roads', addMultilinestringFeatureFromWKT_EduRoad, 'education', '../assets/icons/education.png', 'showEducation'));

/// =========== COMBINED FUNCTION: Show Roads + Icons ======================
function showAmenityWithRoads(roadEndpoint, roadLayerName, roadFeatureFunction, pointType, iconPath, elementId, scale = 0.05) {
    // 1. Show Roads
    amenitiesRoadAnalysis(roadEndpoint, roadLayerName, roadFeatureFunction, elementId);

    // 2. Show Icons
    const vectorSource = new ol.source.Vector();
    const iconLayer = createVectorLayer(vectorSource);
    map.addLayer(iconLayer);

    const iconStyle = createIconStyle(iconPath, scale);
    amenitiesFeatures(pointType, iconStyle, vectorSource, iconLayer, elementId);
}

//----------------------------------------All amenities popup Data-------------------------//
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

    // Handle line feature popup
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
    }

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
    }
    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");
      
        for (var i = elem.length - 1; i >= 0; i--) {
            elem[i].remove();
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
            $(xml)
                .find("FeatureType")
                .each(function () {
                  
                    var name = $(this).find("Name").text();
                    $(this)
                        .find("Name")
                        .each(function () {
                            var value = $(this).text();
                            select.append(
                                "<option class='ddindent' value='" +
                                value +
                                "'>" +
                                value +
                                "</option>"
                            );
                        });
                });
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
        $(document).ready(function () {
            $.ajax({
                type: "GET",
                url:
                    `${GEOSERVER_BASE_URL}/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName=` +
                    value_layer,
                dataType: "xml",
                success: function (xml) {
                    var select = $("#attributes");
                   
                    $(xml)
                        .find("xsd\\:sequence")
                        .each(function () {
                            $(this)
                                .find("xsd\\:element")
                                .each(function () {
                                    var value = $(this).attr("name");
                                    var type = $(this).attr("type");
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
$(function () {
    $("#attributes").change(function () {
        var operator = document.getElementById("operator");
        var length = operator.options.length;
        for (i = length - 1; i >= 0; i--) {
            operator.options[i] = null;
        }
        var value_type = $(this).val();
        var value_attribute = $("#attributes option:selected").text();
        operator.options[0] = new Option("Select operator", "");
        if (
            value_type == "xsd:short" ||
            value_type == "xsd:int" ||
            value_type == "xsd:double" ||
            value_type == "xsd:long"
        ) {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option("Greater than", ">");
            operator1.options[2] = new Option("Less than", "<");
            operator1.options[3] = new Option("Equal to", "=");
        } else if (value_type == "xsd:string") {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option("Greater than", ">");
            operator1.options[2] = new Option("Less than", "<");
            operator1.options[3] = new Option("Like", "ILike");
        }
    });
});
// // layer dropdown draw query
$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: `${GEOSERVER_BASE_URL}/wfs?request=getCapabilities`,
        dataType: "xml",
        success: function (xml) {
            var select = $("#layer1");
            $(xml)
                .find("FeatureType")
                .each(function () {
                    
                    var name = $(this).find("Name").text();
                    $(this)
                        .find("Name")
                        .each(function () {
                            var value = $(this).text();
                            select.append(
                                "<option class='ddindent' value='" +
                                value +
                                "'>" +
                                value +
                                "</option>"
                            );
                        });
                });
        },
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
    }
    var layer = document.getElementById("layer");
    var value_layer = layer.options[layer.selectedIndex].value;
    var attribute = document.getElementById("attributes");
    var value_attribute = attribute.options[attribute.selectedIndex].text;
    var operator = document.getElementById("operator");
    var value_operator = operator.options[operator.selectedIndex].value;
    var txt = document.getElementById("value");
    var value_txt = txt.value;
    if (value_operator == "ILike") {
        value_txt = "'" + value_txt + "%25'";
    } else {
        value_txt = value_txt;
    }
    var url =
       
        `${GEOSERVER_BASE_URL}/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=${value_layer}&CQL_FILTER=${value_attribute} ${value_operator} '${encodeURIComponent(value_txt)}'&outputFormat=application/json`;
    //console.log(url);
    style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new ol.style.Stroke({
            color: "#8ECAED",
            width: 7,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: "#8ECAED",
            }),
        }),
    });
    geojson = new ol.layer.Vector({
      
        source: new ol.source.Vector({
            url: url,
            format: new ol.format.GeoJSON(),
        }),
        style: style,
    });
    geojson.getSource().on("addfeature", function () {
        map.getView().fit(geojson.getSource().getExtent(), {
            duration: 1590,
            size: map.getSize(),
        });
    });
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
        caption.style.backgroundColor = "#51929f";
        caption.style.color = "black";
        caption.innerHTML =
            " (Number of Features : " + data.features.length + " )";
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
                    tabCell.innerHTML = data.features[i].properties[col[j]];
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
            if (head.innerHTML == "id") {
                col_no = i + 1;
            }
        }
        var row_no = findRowNumber(col_no, feature.getId());
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
        if (head.innerHTML == "id") {
            col_no = i + 1;
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
    }
    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");
        
        for (var i = elem.length - 1; i >= 0; i--) {
            elem[i].remove();
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

            });
            draw1.on("drawend", function (evt) {
                var feature = evt.feature;
                var coords = feature.getGeometry();
                var format = new ol.format.WKT();
                var wkt = format.writeGeometry(coords);
                var layer_name = document.getElementById("layer1");
                var value_layer = layer_name.options[layer_name.selectedIndex].value;
                var url =
                    `${GEOSERVER_BASE_URL}/wfs?request=GetFeature&version=1.0.0&typeName=${value_layer}&outputFormat=json&cql_filter=INTERSECTS(geom,${wkt})`;
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
                    
                    source: new ol.source.Vector({
                        url: url,
                        format: new ol.format.GeoJSON(),
                    }),
                    style: style,
                });
                geojson.getSource().on("addfeature", function () {
                    map.getView().fit(geojson.getSource().getExtent(), {
                        duration: 1590,
                        size: map.getSize(),
                    });
                });
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
                    caption.innerHTML =
                        value_layer +
                        " (Number of Features : " +
                        data.features.length +
                        " )";
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
                                tabCell.innerHTML = data.features[i].properties[col[j]];
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
    var area = ol.sphere.getArea(polygon, {
        projection: "EPSG:4326",
    });
    
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
           
            for (var i = elem.length - 1; i >= 0; i--) {
                elem[i].remove();
                
            }
        }
        
    } else if (measuretype.value == "area" || measuretype.value == "length") {
        var type;
        if (measuretype.value == "area") {
            type = "Polygon";
        } else if (measuretype.value == "length") {
            type = "LineString";
        }
      
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



//-----------------------------------summary table ---------------------------------//

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
        'No. of Zones': { value: safeValue('zone_count'), onclick: 'Aligarh_Zone_no()' },
        'Total Road Length': { value: `${safeValue('total_length_km')} km`, onclick: "Aligarh_Road_Length_Count(); updateNavBarWithFunctionName('Total Road Length');" },
        'Total No. of Roads': { value: safeValue('total_length_count'), onclick: "Aligarh_Road_Length_Count(); updateNavBarWithFunctionName('Total Road Count');" },
        'Total Ward No.': { value: safeValue('ayo_ward'), onclick: 'Aligarh_Ward_NO()' },
        'Road Count by Condition': {
            value: `
                Good - <a href="javascript:void(0)" onclick="Aligarh_Condition_cat('condition','Good'); updateNavBarWithFunctionName('Road Condition Good');" style="color:green;">${safeValue('condition_count_green')}</a><br>
                Poor - <a href="javascript:void(0)" onclick="Aligarh_Condition_cat('condition','Poor'); updateNavBarWithFunctionName('Road Condition Poor');" style="color:red;">${safeValue('condition_count_red')}</a><br>
                Moderate - <a href="javascript:void(0)" onclick="Aligarh_Condition_cat('condition','Moderate'); updateNavBarWithFunctionName('Road Condition Moderate');" style="color:yellow;">${safeValue('condition_count_yellow')}</a><br>
                NA - <a href="javascript:void(0)" onclick="Aligarh_Condition_cat('condition','NA'); updateNavBarWithFunctionName('Road Condition NA');" style="color:pink;">${safeValue('condition_count_na')}</a><br>
            `
        },

        'Road Count by Material': {
            value: `
                Bitumen - <a href="javascript:void(0)" onclick="Aligarh_Material_cat('material','Bitumen'); updateNavBarWithFunctionName('Road Material Bitumen');" style="color:darkred;">${safeValue('count_bitumen')}</a><br>
                CC - <a href="javascript:void(0)" onclick="Aligarh_Material_cat('material','CC'); updateNavBarWithFunctionName('Road Material CC');" style="color:#1ad7b0;">${safeValue('count_cc')}</a><br>
                Interlocking - <a href="javascript:void(0)" onclick="Aligarh_Material_cat('material','Interlocking'); updateNavBarWithFunctionName('Road Material Interlocking');" style="color:#2392ed;">${safeValue('count_interlocking')}</a><br>
                BOE - <a href="javascript:void(0)" onclick="Aligarh_Material_cat('material','BOE'); updateNavBarWithFunctionName('Road Material BOE');" style="color:#f228ab;">${safeValue('count_boe')}</a><br>
                Kachcha - <a href="javascript:void(0)" onclick="Aligarh_Material_cat('material','Kachcha'); updateNavBarWithFunctionName('Road Material Kachcha');" style="color:#6036d0;">${safeValue('count_kachcha')}</a><br>
                NA - <a href="javascript:void(0)" onclick="Aligarh_Material_cat('material','NA'); updateNavBarWithFunctionName('Road Material NA');" style="color:#dfc223;">${safeValue('count_na')}</a>
                `,
            onclick: 'Aligarh_Material()'
        },
        'Road Count by Ownership': {
            value: `
                ALGNN - <a href="javascript:void(0)" onclick="Aligarh_Ownership_cat('ownership','Nagar Nigam'); updateNavBarWithFunctionName('Road Ownership Aligarh Nagar Nigam');" style="color:#5aeee5;">${safeValue('count_algnn')}</a><br>
                PWD - <a href="javascript:void(0)" onclick="Aligarh_Ownership_cat('ownership','PWD'); updateNavBarWithFunctionName('Road Ownership PWD');" style="color:#69e70f;">${safeValue('count_pwd')}</a><br>
                Deparment Roads - <a href="javascript:void(0)" onclick="Aligarh_Ownership_cat('ownership','Department Roads'); updateNavBarWithFunctionName('Road Ownership Deparment Roads');" style="color:#f16a16;">${safeValue('count_department_roads')}</a><br>
                Private Roads - <a href="javascript:void(0)" onclick="Aligarh_Ownership_cat('ownership','Private'); updateNavBarWithFunctionName('Road Ownership Private Road');" style="color:#ed2323;">${safeValue('count_pvt')}</a><br>
                Institutional Roads - <a href="javascript:void(0)" onclick="Aligarh_Ownership_cat('ownership','Institutional Roads'); updateNavBarWithFunctionName('Road Ownership Institutional Roads');" style="color:#5aeee5;">${safeValue('count_institutional_roads')}</a><br>
                NHAI - <a href="javascript:void(0)" onclick="Aligarh_Ownership_cat('ownership','NHAI'); updateNavBarWithFunctionName('Road Ownership NHAI');" style="color:#69e70f;">${safeValue('count_nhai')}</a><br>
                C.M GRID - <a href="javascript:void(0)" onclick="Aligarh_Ownership_cat('ownership','C.M GRID'); updateNavBarWithFunctionName('Road Ownership C.M GRID');" style="color:#f16a16;">${safeValue('count_grid')}</a><br>
                Railway - <a href="javascript:void(0)" onclick="Aligarh_Ownership_cat('ownership','Railway'); updateNavBarWithFunctionName('Road Ownership Railway');" style="color:#ed2323;">${safeValue('count_railway')}</a><br> 
         
                `,
            onclick: 'Aligarh_Ownership()'
        },
        'Road Count by CUS': {
            value: `
                Nagar Nigam Nidhi - <a href="javascript:void(0)" onclick="Aligarh_CUS_cat('cus','Nagar Nigam Nidhi'); updateNavBarWithFunctionName('Road CUS Nagar Nigam Nidhi');" style="color: cyan;">${safeValue('count_cus_nnn')}</a><br>
                PWD - <a href="javascript:void(0)" onclick="Aligarh_CUS_cat('cus','P.W.D'); updateNavBarWithFunctionName('Road CUS PWD');" style="color: #173dd6;">${safeValue('count_cus_pwd')}</a><br>
                SFC - <a href="javascript:void(0)" onclick="Aligarh_CUS_cat('cus','SFC'); updateNavBarWithFunctionName('Road CUS SFC');" style="color: #14ea54;">${safeValue('count_cus_sfc')}</a><br>
                Vidhayak Nidhi - <a href="javascript:void(0)" onclick="Aligarh_CUS_cat('cus','Vidhayak Nidhi'); updateNavBarWithFunctionName('Road CUS Vidhayak Nidhi');" style="color: #6e52e7;">${safeValue('count_cus_vidhayak')}</a><br>
                RES - <a href="javascript:void(0)" onclick="Aligarh_CUS_cat('cus','RES'); updateNavBarWithFunctionName('Road CUS RES');" style="color: #e6497d;">${safeValue('count_cus_res')}</a><br>
                UPSLDA - <a href="javascript:void(0)" onclick="Aligarh_CUS_cat('cus','UPSLDA'); updateNavBarWithFunctionName('Road CUS UPSLDA');" style="color: #f4ee40;">${safeValue('count_cus_upslda')}</a><br>
                Jila PANCHAYAT - <a href="javascript:void(0)" onclick="Aligarh_CUS_cat('cus','Jila Panchayat'); updateNavBarWithFunctionName('Road CUS Jila Panchayat');" style="color: #bad057;">${safeValue('count_cus_jila_panchayat')}</a><br>
                NHAI- <a href="javascript:void(0)" onclick="Aligarh_CUS_cat('cus','NHAI'); updateNavBarWithFunctionName('Road CUS NHAI');" style="color: #bad057;">${safeValue('count_cus_nhai')}</a><br>
                NA - <a href="javascript:void(0)" onclick="Aligarh_CUS_cat('cus','NA'); updateNavBarWithFunctionName('Road CUS NA');" style="color: #8717e2;">${safeValue('count_cus_na')}</a><br>
                `
            ,
        },
        'Road Count by Category': {
            value: `
                Local Street - <a href="javascript:void(0)" onclick="Aligarh_TypeSub_cat('category','Local Street'); updateNavBarWithFunctionName('Road Category Local Street');" style="color: #14cee3;">${safeValue('count_local_street')}</a><br>
                Collector - <a href="javascript:void(0)" onclick="Aligarh_TypeSub_cat('category','Collector'); updateNavBarWithFunctionName('Road Category Collector');" style="color: #e63dee;">${safeValue('count_collector')}</a><br>
                NA - <a href="javascript:void(0)" onclick="Aligarh_TypeSub_cat('category','NA'); updateNavBarWithFunctionName('Road Category NA');" style="color: #ec1248;">${safeValue('count_expressway')}</a><br>
                Arterial - <a href="javascript:void(0)" onclick="Aligarh_TypeSub_cat('category','Arterial'); updateNavBarWithFunctionName('Road Category Arterial');" style="color: #e1ca4c;">${safeValue('count_arterial')}</a><br>
                Sub Arterial - <a href="javascript:void(0)" onclick="Aligarh_TypeSub_cat('category','Sub Arterial'); updateNavBarWithFunctionName('Road Category Sub Arterial');" style="color: #83e45c;">${safeValue('count_subarterial')}</a><br>

                `, onclick: 'Aligarh_Type()'

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
            value: `<a href="javascript:void(0)" onclick="Aligarh_Zone_no('zone_no','${zoneNo}'); updateNavBarWithFunctionName('Zone-${zoneNo} Total Road Length');" style="color:black;">${data.length_km.toFixed(2)} km</a>`
        },
        {
            title: 'Total No. of Roads',
            value: `<a href="javascript:void(0)" onclick="Aligarh_Zone_no('zone_no','${zoneNo}'); updateNavBarWithFunctionName('Zone-${zoneNo} Total Road Count');" style="color:black;">${data.total_no_of_roads}</a>`
        },
       
        {
            title: 'Road Condition',
            value: `
                    Good <a href="javascript:void(0)" onclick="Aligarh_Zone_Condition('${zoneNo}','condition','Good'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Condition Good');" style="color:green;">- ${data.count_green}</a> <br> 
                    Moderate <a href="javascript:void(0)" onclick="Aligarh_Zone_Condition('${zoneNo}','condition','Moderate'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Condition Moderate');" style="color:yellow;">- ${data.count_yellow}</a> <br> 
                    Poor <a href="javascript:void(0)" onclick="Aligarh_Zone_Condition('${zoneNo}','condition','Poor'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Condition Poor');" style="color:red;">- ${data.count_red}</a><br>
                    NA <a href="javascript:void(0)" onclick="Aligarh_Zone_Condition('${zoneNo}','condition','NA'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Condition NA');" style="color:pink;">- ${data.count_na}</a> <br> 
                    `
        },
        {
            title: 'Materials',
            value: `
                    Bitumen <a href="javascript:void(0)" onclick="Aligarh_Zone_Material('${zoneNo}','material','Bitumen'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material Bitumen');" style="color:darkred;">- ${data.bitumen}</a> <br>
                    CC <a href="javascript:void(0)" onclick="Aligarh_Zone_Material('${zoneNo}','material','CC'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material CC');" style="color:#1ad7b0;">- ${data.cc}</a> <br>
                    Interlocking <a href="javascript:void(0)" onclick="Aligarh_Zone_Material('${zoneNo}','material','Interlocking'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material Interlocking');" style="color:#2392ed;">- ${data.interlocking}</a> <br>
                    BOE <a href="javascript:void(0)" onclick="Aligarh_Zone_Material('${zoneNo}','material','BOE'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material BOE');" style="color:#f228ab;">- ${data.boe}</a> <br>
                    Kachcha <a href="javascript:void(0)" onclick="Aligarh_Zone_Material('${zoneNo}','material','Kachcha'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material Kachcha');" style="color:#6036d0;">- ${data.kachcha}</a><br>
                    NA - <a href="javascript:void(0)" onclick="Aligarh_Zone_Material('${zoneNo}','material','NA'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Material NA');" style="color:#dfc223;">${data.count_na}</a>
                    `
        },
        {
            title: 'Ownership',
            value: `
                ALGNN - <a href="javascript:void(0)" onclick="Aligarh_Zone_Ownership('${zoneNo}','ownership','Nagar Nigam'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership Aligarh Nagar Nigam');" style="color:#5aeee5;">${data.count_algnn}</a><br>
                PWD - <a href="javascript:void(0)" onclick="Aligarh_Zone_Ownership('${zoneNo}','ownership','PWD'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership PWD');" style="color:#69e70f;">${data.count_pwd}</a><br>
                Deparment Roads - <a href="javascript:void(0)" onclick="Aligarh_Zone_Ownership('${zoneNo}','ownership','Department Roads'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership Deparment Roads');" style="color:#f16a16;">${data.count_department_roads}</a><br>
                Private Roads - <a href="javascript:void(0)" onclick="Aligarh_Zone_Ownership('${zoneNo}','ownership','Private'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership Private Road');" style="color:#ed2323;">${data.count_pvt}</a><br>
                Institutional Roads - <a href="javascript:void(0)" onclick="Aligarh_Zone_Ownership('${zoneNo}','ownership','Institutional Roads'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership Institutional Roads');" style="color:#5aeee5;">${data.count_institutional_roads}</a><br>
                NHAI - <a href="javascript:void(0)" onclick="Aligarh_Zone_Ownership('${zoneNo}','ownership','NHAI'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership NHAI');" style="color:#69e70f;">${data.count_nhai}</a><br>
                C.M GRID - <a href="javascript:void(0)" onclick="Aligarh_Zone_Ownership('${zoneNo}','ownership','C.M GRID'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership C.M GRID');" style="color:#f16a16;">${data.count_grid}</a><br>
                Railway - <a href="javascript:void(0)" onclick="Aligarh_Zone_Ownership('${zoneNo}','ownership','Railway'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Ownership Railway');" style="color:#ed2323;">${data.count_railway}</a><br> 
         
                `,
        },
        {
            title: 'CUS',
            value: ` 
                Nagar Nigam Nidhi - <a href="javascript:void(0)" onclick="Aligarh_Zone_CUS('${zoneNo}','cus','Nagar Nigam Nidhi'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS Nagar Nigam Nidhi');" style="color: cyan;">${data.count_cus_nnn}</a><br>
                PWD - <a href="javascript:void(0)" onclick="Aligarh_Zone_CUS('${zoneNo}','cus','P.W.D'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS PWD');" style="color: #173dd6;">${data.count_cus_pwd}</a><br>
                SFC - <a href="javascript:void(0)" onclick="Aligarh_Zone_CUS('${zoneNo}','cus','SFC'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS SFC');" style="color: #14ea54;">${data.count_cus_sfc}</a><br>
                Vidhayak Nidhi - <a href="javascript:void(0)" onclick="Aligarh_Zone_CUS('${zoneNo}','cus','Vidhayak Nidhi'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS Vidhayak Nidhi');" style="color: #6e52e7;">${data.count_cus_vidhayak}</a><br>
                RES - <a href="javascript:void(0)" onclick="Aligarh_Zone_CUS('${zoneNo}','cus','RES'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS RES');" style="color: #e6497d;">${data.count_cus_res}</a><br>
                UPSLDA - <a href="javascript:void(0)" onclick="Aligarh_Zone_CUS('${zoneNo}','cus','UPSLDA'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS UPSLDA');" style="color: #f4ee40;">${data.count_cus_upslda}</a><br>
                Jila PANCHAYAT - <a href="javascript:void(0)" onclick="Aligarh_Zone_CUS('${zoneNo}','cus','Jila Panchayat'); updateNavBarWithFunctionName('Road CUS Jila Panchayat');" style="color: #bad057;">${data.count_cus_jila_panchayat}</a><br>
                NHAI- <a href="javascript:void(0)" onclick="Aligarh_Zone_CUS('${zoneNo}','cus','NHAI'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS NHAI');" style="color: #bad057;">${data.count_cus_nhai}</a><br>
                NA - <a href="javascript:void(0)" onclick="Aligarh_Zone_CUS('${zoneNo}','cus','NA'); updateNavBarWithFunctionName('Zone-${zoneNo} Road CUS NA');" style="color: #8717e2;">${data.count_cus_na}</a><br>
                `
        },
        {
            title: 'Type Sub Category',
            value: `
                    Local Street - <a href="javascript:void(0)" onclick="Aligarh_Zone_TypeSub('${zoneNo}','category','Local Street'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Category Local Street');" style="color: #14cee3;">${data.count_local_street} </a><br>
                    Collector - <a href="javascript:void(0)" onclick="Aligarh_Zone_TypeSub('${zoneNo}','category','Collector'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Category Collector');" style="color: #e63dee;">${data.count_collector}</a><br>
                    Arterial - <a href="javascript:void(0)" onclick="Aligarh_Zone_TypeSub('${zoneNo}','category','Arterial'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Category Arterial');" style="color: #e1ca4c;">${data.count_arterial}</a><br>
                    Sub Arterial - <a href="javascript:void(0)" onclick="Aligarh_Zone_TypeSub('${zoneNo}','category','Sub Arterial'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Category Sub Arterial');" style="color: #83e45c;">${data.count_subarterial}</a><br>
                    NA - <a href="javascript:void(0)" onclick="Aligarh_Zone_TypeSub('${zoneNo}','category','NA'); updateNavBarWithFunctionName('Zone-${zoneNo} Road Category NA');" style="color: #83e45c;">${data.count_na}</a><br>
                   `

        },
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
        // zoneElement.style.backgroundColor = getUniqueColor();
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

//----------------------------zone  card count summary ----------------------------------------
function setCurrentZone(zoneName) {
    selectedZone = zoneName;
    updateZones(zoneName);
}

// ----------------------------------show all zones--------------------------------------------
function showZoneDetails(zoneName) {
    // Implement the logic based on your requirement
    console.log("Selected zone: " + zoneName);
    showAllZones(); // Or use another function to show the selected zone details
}


// //------------------------------- ward populate -------------------------------------------------------------------------------

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
                        value: `<a href="javascript:void(0)" onclick="Aligarh_Ward_no('ward_no', '${wardNo}'); updateNavBarWithFunctionName('Ward-${wardNo} Total Road Length');" style="color:black;">${responseData.length_km} km</a>`
                    },
                    {
                        title: 'Total No. of Roads',
                        value: `<a href="javascript:void(0)" onclick="Aligarh_Ward_no('ward_no', '${wardNo}'); updateNavBarWithFunctionName('Ward-${wardNo} Total Road Count');" style="color:black;">${responseData.total_no_of_roads}</a>`
                    },
                    {
                        title: 'Road Condition',
                        value: `
                                Good - <a href="javascript:void(0)" onclick="Aligarh_Ward_Condition('${wardNo}', 'condition', 'Good'); updateNavBarWithFunctionName('Ward-${wardNo} Road Condition Good');" style="color:green;">${responseData.count_green}</a><br> 
                                Moderate - <a href="javascript:void(0)" onclick="Aligarh_Ward_Condition('${wardNo}', 'condition', 'Moderate'); updateNavBarWithFunctionName('Ward-${wardNo} Road Condition Moderate');" style="color:yellow;">${responseData.count_yellow}</a><br> 
                                Poor - <a href="javascript:void(0)" onclick="Aligarh_Ward_Condition('${wardNo}', 'condition', 'Poor'); updateNavBarWithFunctionName('Ward-${wardNo} Road Condition Poor');" style="color:red;">${responseData.count_red}</a><br>
                                NA - <a href="javascript:void(0)" onclick="Aligarh_Ward_Condition('${wardNo}', 'condition', 'NA'); updateNavBarWithFunctionName('Ward-${wardNo} Road Condition NA');" style="color:pink;">${responseData.count_na}</a>
                                `
                    },
                    {
                        title: 'Materials',
                        value: `
                                Bitumen - <a href="javascript:void(0)" onclick="Aligarh_Ward_Material('${wardNo}', 'material', 'Bitumen'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material Bitumen');" style="color:darkred;">${responseData.bitumen}</a><br> 
                                CC - <a href="javascript:void(0)" onclick="Aligarh_Ward_Material('${wardNo}', 'material', 'CC'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material CC');" style="color:cyan;">${responseData.cc}</a><br> 
                                Interlocking - <a href="javascript:void(0)" onclick="Aligarh_Ward_Material('${wardNo}', 'material', 'Interlocking'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material Interlocking');" style="color:blue;">${responseData.interlocking}</a><br>
                                BOE - <a href="javascript:void(0)" onclick="Aligarh_Ward_Material('${wardNo}', 'material', 'BOE'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material BOE');" style="color:pink;">${responseData.boe}</a><br> 
                                Kachcha - <a href="javascript:void(0)" onclick="Aligarh_Ward_Material('${wardNo}', 'material', 'Kachcha'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material Kachcha');" style="color:purple;">${responseData.kachcha}</a><br>
                                NA - <a href="javascript:void(0)" onclick="Aligarh_Ward_Material('${wardNo}','material','NA'); updateNavBarWithFunctionName('Ward-${wardNo} Road Material NA');" style="color:#dfc223;">${responseData.count_na}</a>
                                `
                    },
                    {
                        title: 'Ownership',
                        value: `
                                ALGNN - <a href="javascript:void(0)" onclick="Aligarh_Ward_Ownership('${wardNo}','ownership','Nagar Nigam'); updateNavBarWithFunctionName('Zone-${wardNo} Road Ownership Aligarh Nagar Nigam');" style="color:#5aeee5;">${responseData.count_algnn}</a><br>
                                PWD - <a href="javascript:void(0)" onclick="Aligarh_Ward_Ownership('${wardNo}','ownership','PWD'); updateNavBarWithFunctionName('Zone-${wardNo} Road Ownership PWD');" style="color:#69e70f;">${responseData.count_pwd}</a><br>
                                Deparment Roads - <a href="javascript:void(0)" onclick="Aligarh_Ward_Ownership('${wardNo}','ownership','Department Roads'); updateNavBarWithFunctionName('Zone-${wardNo} Road Ownership Deparment Roads');" style="color:#f16a16;">${responseData.count_department_roads}</a><br>
                                Private Roads - <a href="javascript:void(0)" onclick="Aligarh_Ward_Ownership('${wardNo}','ownership','Private'); updateNavBarWithFunctionName('Zone-${wardNo} Road Ownership Private Road');" style="color:#ed2323;">${responseData.count_pvt}</a><br>
                                Institutional Roads - <a href="javascript:void(0)" onclick="Aligarh_Ward_Ownership('${wardNo}','ownership','Institutional Roads'); updateNavBarWithFunctionName('Zone-${wardNo} Road Ownership Institutional Roads');" style="color:#5aeee5;">${responseData.count_institutional_roads}</a><br>
                                NHAI - <a href="javascript:void(0)" onclick="Aligarh_Ward_Ownership('${wardNo}','ownership','NHAI'); updateNavBarWithFunctionName('Zone-${wardNo} Road Ownership NHAI');" style="color:#69e70f;">${responseData.count_nhai}</a><br>
                                C.M GRID - <a href="javascript:void(0)" onclick="Aligarh_Ward_Ownership('${wardNo}','ownership','C.M GRID'); updateNavBarWithFunctionName('Zone-${wardNo} Road Ownership C.M GRID');" style="color:#f16a16;">${responseData.count_grid}</a><br>
                                Railway - <a href="javascript:void(0)" onclick="Aligarh_Ward_Ownership('${wardNo}','ownership','Railway'); updateNavBarWithFunctionName('Zone-${wardNo} Road Ownership Railway');" style="color:#ed2323;">${responseData.count_railway}</a><br> 
                            `
                    },
                    {
                        title: 'CUS',
                        value: `
                                Nagar Nigam Nidhi - <a href="javascript:void(0)" onclick="Aligarh_Ward_CUS('${wardNo}','cus','Nagar Nigam Nidhi'); updateNavBarWithFunctionName('Zone-${wardNo} Road CUS Nagar Nigam Nidhi');" style="color: cyan;">${responseData.count_cus_nnn}</a><br>
                                PWD - <a href="javascript:void(0)" onclick="Aligarh_Ward_CUS('${wardNo}','cus','P.W.D'); updateNavBarWithFunctionName('Zone-${wardNo} Road CUS PWD');" style="color: #173dd6;">${responseData.count_cus_pwd}</a><br>
                                SFC - <a href="javascript:void(0)" onclick="Aligarh_Ward_CUS('${wardNo}','cus','SFC'); updateNavBarWithFunctionName('Zone-${wardNo} Road CUS SFC');" style="color: #14ea54;">${responseData.count_cus_sfc}</a><br>
                                Vidhayak Nidhi - <a href="javascript:void(0)" onclick="Aligarh_Ward_CUS('${wardNo}','cus','Vidhayak Nidhi'); updateNavBarWithFunctionName('Zone-${wardNo} Road CUS Vidhayak Nidhi');" style="color: #6e52e7;">${responseData.count_cus_vidhayak}</a><br>
                                RES - <a href="javascript:void(0)" onclick="Aligarh_Ward_CUS('${wardNo}','cus','RES'); updateNavBarWithFunctionName('Zone-${wardNo} Road CUS RES');" style="color: #e6497d;">${responseData.count_cus_res}</a><br>
                                UPSLDA - <a href="javascript:void(0)" onclick="Aligarh_Ward_CUS('${wardNo}','cus','UPSLDA'); updateNavBarWithFunctionName('Zone-${wardNo} Road CUS UPSLDA');" style="color: #f4ee40;">${responseData.count_cus_upslda}</a><br>
                                Jila PANCHAYAT - <a href="javascript:void(0)" onclick="Aligarh_Ward_CUS('${wardNo}','cus','Jila Panchayat'); updateNavBarWithFunctionName('Road CUS Jila Panchayat');" style="color: #bad057;">${responseData.count_cus_jila_panchayat}</a><br>
                                NHAI- <a href="javascript:void(0)" onclick="Aligarh_Ward_CUS('${wardNo}','cus','NHAI'); updateNavBarWithFunctionName('Zone-${wardNo} Road CUS NHAI');" style="color: #bad057;">${responseData.count_cus_nhai}</a><br>
                                NA - <a href="javascript:void(0)" onclick="Aligarh_Ward_CUS('${wardNo}','cus','NA'); updateNavBarWithFunctionName('Zone-${wardNo} Road CUS NA');" style="color: #8717e2;">${responseData.count_cus_na}</a><br>
                                    `  },
                    {
                        title: 'Type Sub Category',
                        value: `
                                Local Street - <a href="javascript:void(0)" onclick="Aligarh_Ward_TypeSub('${wardNo}','category','Local Street'); updateNavBarWithFunctionName('Ward-${wardNo} Road Category Local Street');" style="color: #14cee3;">${responseData.count_local_street} </a><br>
                                Collector - <a href="javascript:void(0)" onclick="Aligarh_Ward_TypeSub('${wardNo}','category','Collector'); updateNavBarWithFunctionName('Ward-${wardNo} Road Category Collector');" style="color: #e63dee;">${responseData.count_collector}</a><br>
                                Arterial - <a href="javascript:void(0)" onclick="Aligarh_Ward_TypeSub('${wardNo}','category','Arterial'); updateNavBarWithFunctionName('Ward-${wardNo} Road Category Arterial');" style="color: #e1ca4c;">${responseData.count_arterial}</a><br>
                                Sub Arterial - <a href="javascript:void(0)" onclick="Aligarh_Ward_TypeSub('${wardNo}','category','Sub Arterial'); updateNavBarWithFunctionName('Ward-${wardNo} Road Category Sub Arterial');" style="color: #83e45c;">${responseData.count_subarterial}</a><br>
                                NA - <a href="javascript:void(0)" onclick="Aligarh_Ward_TypeSub('${wardNo}','category','NA'); updateNavBarWithFunctionName('Ward-${wardNo} Road Category NA');" style="color: #83e45c;">${responseData.count_na}</a><br>
                              `},
                ];

                // Create and append vertical detail
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
        noWardsCard.innerHTML = '<p>No wards data available for this zone.</p>';
        content.appendChild(noWardsCard);
        return;
    }

    const wards = data[zoneName].wards;
    Object.keys(wards).forEach(wardName => {
        const ward = wards[wardName];
        const wardElement = document.createElement('div');
        wardElement.className = 'card';
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

let highlightLayer;
// :white_check_mark: Function to Append Data to Table and Add Click Event for Highlighting
function Table_Row_and_Layer_highlight(data) {
    // let dataTableBody_summary = document.getElementById("dataTableBody_summary");
    dataTableBody_summary.innerHTML = ""; // Clear previous data
    if (Array.isArray(data)) {
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.gis_id}</td>
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
                <td>${item.length_km}</td>
                <td>${item.condition}</td>
                <td>${item.yoc}</td>
                <td>${item.cus}</td>
            `;
            // :white_check_mark: Add Click Event to Row
            row.addEventListener('click', function () {
                let gisId = item.gis_id; // Get GIS ID from row data
                highlightFeatureOnMap(gisId); // Call function to highlight feature
                highlightTableRow(row); // Highlight the selected table row
            });
            dataTableBody_summary.appendChild(row);
        });
    } else {
        console.error('Expected an array but received:', data);
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
function highlightFeatureOnMap(gisId) {
    let wfsUrl = `${GEOSERVER_BASE_URL}/wfs?service=WFS&version=1.1.0&request=GetFeature
        &typename=ALG_Summary:aligarh_road_net_updated
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
    //.getSource().clear(); // Clear previous highlights
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

function Aligarh_Zone_No() {
    removeCurrentLayer();
    clearVectorLayers();
    // Create the WMS layer
    currentLayer = new ol.layer.Image({
        title: 'Zone Boundary',
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                LAYERS: "ALG_Summary:aligarh_zone_boundary",
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });
    // Add the layer to the map
    map.addLayer(currentLayer);
}
function Aligarh_Ward_NO() {
    removeCurrentLayer(); clearVectorLayers();
    currentLayer = new ol.layer.Image({
        title: 'Ward Boundary',
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                LAYERS: "ALG_Summary:aligarh_ward_boundary",
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    map.addLayer(currentLayer);
}

//--------------popup code for road----------------------//
function MVNN_Road_popup() {

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
                    .then(response => response.json())
                    .then(data => {
                        if (data.features && data.features.length > 0) {
                            const feature = data.features[0];
                            const properties = feature.properties;
                            selectedRoadProperties = properties;

                            // Show the popup with feature info
                            popup.innerHTML = buildPopupHTML(properties);
                            popup.style.display = 'block';
                            const mapSize = map.getSize();

                        } else {
                            popup.style.display = 'none';
                        }
                    })
                    .catch(() => {
                        popup.style.display = 'none';
                    });
            } else {
                popup.style.display = 'none';
            }
        } else {
            // Assume Vector Layer (WFS GeoJSON)
            let found = false;
            map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
                if (layer === currentLayer) {
                    const properties = feature.getProperties();
                    selectedRoadProperties = properties;

                    popup.innerHTML = buildPopupHTML(properties);
                    popup.style.display = 'block';
                    const mapSize = map.getSize();

                    found = true;
                    return true;
                }
            }, { hitTolerance: 5 });

            if (!found) {
                popup.style.display = 'none';
            }
        }
    });

    function buildPopupHTML(properties) {
        return `
            <div style="background-color:white; padding:10px; border-radius:6px;">
                <table style="background-color:white;">
                    <tr><td><strong>Field Name</strong></td><td><strong>Value</strong></td></tr>
                    <tr><td><strong>Zone No.</strong></td><td>${properties.zone_no || 'N/A'}</td></tr>
                    <tr><td><strong>Zone Name</strong></td><td>${properties.zone_name || 'N/A'}</td></tr>
                    <tr><td><strong>Ward No.</strong></td><td>${properties.ward_no || 'N/A'}</td></tr>
                    <tr><td><strong>Ward Name</strong></td><td>${properties.ward_name || 'N/A'}</td></tr>
                    <tr><td><strong>Right of Way</strong></td><td>${properties.row_meter || 'N/A'}</td></tr>
                    <tr><td><strong>Carriage Width</strong></td><td>${properties.carriage_w || 'N/A'}</td></tr>
                    <tr><td><strong>Condition</strong></td><td>${properties.condition || 'N/A'}</td></tr>
                    <tr><td><strong>Material</strong></td><td>${properties.material || 'N/A'}</td></tr>
                    <tr><td><strong>Ownership</strong></td><td>${properties.ownership || 'N/A'}</td></tr>
                    <tr><td><strong>Length(Km)</strong></td><td>${properties.length_km || 'N/A'}</td></tr>
                    <tr><td><strong>Road Name</strong></td><td>${properties.road_name || 'N/A'}</td></tr>
                </table>
            </div>
        `;
    }
}

function Aligarh_road_Length_Count() {
    removeCurrentLayer();
    clearVectorLayers();

    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'ALG_Summary:aligarh_road_net_updated',

            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    map.addLayer(currentLayer);
    MVNN_Road_popup();

}


function Aligarh_Ownership(cqlFilter) {
    removeCurrentLayer(); clearVectorLayers();
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'ALG_Summary:aligarh_road_own',
                'CQL_FILTER': cqlFilter,
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    map.addLayer(currentLayer);
    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('dataTable_summary').style.display = 'block';
    document.getElementById('dataTable_summaryfilter').style.display = 'block';
    document.getElementById('tableContainer_summaryfilter').style.display = 'block';

    MVNN_Road_popup();
    updateTable(cqlFilter);
}

function Aligarh_Material(cqlFilter) {
    removeCurrentLayer(); clearVectorLayers();
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'ALG_Summary:aligarh_road_mat',
                'CQL_FILTER': cqlFilter,
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    map.addLayer(currentLayer);
    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('dataTable_summary').style.display = 'block';
    document.getElementById('dataTable_summaryfilter').style.display = 'block';
    document.getElementById('tableContainer_summaryfilter').style.display = 'block';

    MVNN_Road_popup();
    updateTable(cqlFilter);
}
function Aligarh_Types(cqlFilter) {
    removeCurrentLayer(); clearVectorLayers();
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'ALG_Summary:aligarh_road_category',
                'CQL_FILTER': cqlFilter,
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });

    map.addLayer(currentLayer);
    document.getElementById('summary-table').style.display = 'none';
    document.getElementById('dataTable_summary').style.display = 'block';
    document.getElementById('dataTable_summaryfilter').style.display = 'block';
    document.getElementById('tableContainer_summaryfilter').style.display = 'block';

    MVNN_Road_popup();
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
        typeName: 'ALG_Summary:aligarh_road_net_updated',   // Replace with your WFS layer typename
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
    const url = `${GEOSERVER_BASE_URL}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=ALG_Summary:aligarh_road_net_updated&outputFormat=application/json`;

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
                // Log the road names
                console.log('Road Names:', roadNames);
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    // Send the request
    xhr.send();

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

        // Refresh Select2
        dropdown.trigger('change');
    }

    // Add an event listener to the dropdown
    $('#roadNamesDropdown').on('change', function () {
        let selectedRoadName = $(this).val();
        if (selectedRoadName) {
            fetchRoadData(selectedRoadName);
        }
    });

    function fetchRoadData(roadName) {
        let fetchUrl = wfsParams.url + '?service=' + wfsParams.service +
            '&version=' + wfsParams.version +
            '&request=GetFeature&typename=' + wfsParams.typeName +
            '&outputFormat=' + wfsParams.outputFormat +
            '&srsname=' + wfsParams.srsName +
            '&CQL_FILTER=road_name=\'' + roadName + '\'';

        console.log(fetchUrl);

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
                    currentLayer = vectorLayer;  // ✅ Set the active layer
                    MVNN_Road_popup();
                } else {
                    console.log('Error:', fetchXhr.responseText);
                }
            }
        };
        fetchXhr.send();
    }

});

//--------------------Search bar code end----------------------------//


//--------------------------------------------summary and road filter layer fetch-----------------------------------------------
function Aligarh_Zone_no(column, value) {
    removeCurrentLayer();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'ALG_Summary:aligarh_road_net_updated',
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    // Show data table
    // Fetch corresponding data
    fetchMVNN_ALLFilteredData(column, value);
}
function Aligarh_Ward_no(column, value) {
    removeCurrentLayer();

    // Enhanced CQL Filter to capture ward_no with mixed values
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;

    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debug log

    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'ALG_Summary:aligarh_road_net_updated',
                'CQL_FILTER': cqlFilter,
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });

    currentLayer.setZIndex(10);
    MVNN_Road_popup();
    map.addLayer(currentLayer);

    // Fetch data with enhanced logic (pass the same CQL filter)
    fetchMVNN_ALLFilteredData(column, value);  // Optional: You can enhance this function too if needed
}

function Aligarh_Condition_cat(column, value) {
    removeCurrentLayer();
    ///  clearVectorLayers();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'ALG_Summary:aligarh_road_condition',   // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Condition_legend').style.display = 'block';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    // Fetch corresponding data
    fetchMVNN_ALLFilteredData(column, value);
}
function Aligarh_Material_cat(column, value) {
    removeCurrentLayer();
    //  clearVectorLayers();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'ALG_Summary:aligarh_road_mat',  // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'block';

    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    // Fetch corresponding data
    fetchMVNN_ALLFilteredData(column, value);
}

function Aligarh_Ownership_cat(column, value) {
    removeCurrentLayer();
    //  clearVectorLayers();
    // Define dynamic CQL filter
    let cqlFilter = `(${column}='${value}' OR ${column} ILIKE '%/${value}' OR ${column} ILIKE '${value}/%' OR ${column} ILIKE '%/${value}/%' OR ${column} ILIKE '${value}')`;
    console.log(`Applying CQL_FILTER: ${cqlFilter}`); // Debugging log
    // Create a single WMS layer with CQL filter
    currentLayer = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: {
                'LAYERS': 'ALG_Summary:aligarh_road_own',   // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Ownership_legend').style.display = 'block';

    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    // Fetch corresponding data
    fetchMVNN_ALLFilteredData(column, value);
}

function Aligarh_CUS_cat(column, value) {
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
                'LAYERS': 'ALG_Summary:aligarh_road_cus',   // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('CUS_legend').style.display = 'block';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    // Fetch corresponding data
    fetchMVNN_ALLFilteredData(column, value);
}

function Aligarh_TypeSub_cat(column, value) {
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
                'LAYERS': 'ALG_Summary:aligarh_road_category',   // Same layer for all filters
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('RoadCategory_legend').style.display = 'block';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    // Fetch corresponding data
    fetchMVNN_ALLFilteredData(column, value);
}
//---------------------------------------------fetch data for summary and road filter ------------------------------------------------------
function fetchMVNN_ALLFilteredData(column, value) {
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
            document.getElementById('dataTable_summary').style.display = 'block';
            document.getElementById('tableContainer_summary').style.display = 'block';

        })
        .catch(error => {
            console.error(`Error fetching data for ${column}=${value}:`, error);
        });
    document.getElementById('Condition_legend').addEventListener('click', showlegend);
    document.getElementById('Material_legend').addEventListener('click', showlegend);
    document.getElementById('Ownership_legend').addEventListener('click', showlegend);
    document.getElementById('CUS_legend').addEventListener('click', showlegend);
    document.getElementById('RoadCategory_legend').addEventListener('click', showlegend);

    function showlegend() {
        legendBtn.style.display = 'block';
        legendBtn.style.bottom = '20%';
        legendBtn.style.left = '1%'; // Example of additional style
        legendBtn.style.Color = 'color'; // Example of additional style
    }
}

//-------------------------------Zonewise summary and road filter layer fetching --------------------------------------------//
function Aligarh_Zone_Condition(zone_no, column, value) {
    removeCurrentLayer();
    //  clearVectorLayers();

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
                'LAYERS': 'ALG_Summary:aligarh_road_condition',
                'CQL_FILTER': cqlFilter,
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10);
    MVNN_Road_popup();
    map.addLayer(currentLayer);

    // Legend display logic
    document.getElementById('Condition_legend').style.display = column === "condition" ? 'block' : 'none';
    document.getElementById('Material_legend').style.display = column === "material" ? 'block' : 'none';
    document.getElementById('Ownership_legend').style.display = column === "ownership" ? 'block' : 'none';
    document.getElementById('CUS_legend').style.display = column === "cus" ? 'none' : 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    // Fetch filtered table data
    fetchMVNNFilteredData(zone_no, column, value);
}

function Aligarh_Zone_Material(zone_no, column, value) {
    removeCurrentLayer();
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
                'LAYERS': 'ALG_Summary:aligarh_road_mat',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'block';

    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    // Fetch corresponding data
    fetchMVNNFilteredData(zone_no, column, value);
}
function Aligarh_Zone_Ownership(zone_no, column, value) {
    removeCurrentLayer();
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
                'LAYERS': 'ALG_Summary:aligarh_road_own',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Ownership_legend').style.display = 'block';
    document.getElementById('Material_legend').style.display = 'none';

    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    fetchMVNNFilteredData(zone_no, column, value);
}

function Aligarh_Zone_CUS(zone_no, column, value) {
    removeCurrentLayer();
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
                'LAYERS': 'ALG_Summary:aligarh_road_cus',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';

    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'block';
    document.getElementById('RoadCategory_legend').style.display = 'none';
    fetchMVNNFilteredData(zone_no, column, value);
}

function Aligarh_Zone_TypeSub(zone_no, column, value) {
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
    if (["material", "condition", "category", "ownership", "cus", "category"].includes(column)) {
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
                'LAYERS': 'ALG_Summary:aligarh_road_category',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'block';
    fetchMVNNFilteredData(zone_no, column, value);
}
//------------------------------------------ fetch data based on Zone summary and road filter ------------------------------------------------------------
function fetchMVNNFilteredData(zone_no, column, value) {
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
            Table_Row_and_Layer_highlight(responseData.data);
            document.getElementById('summary-table').style.display = 'none';
            document.getElementById('dataTable_summary').style.display = 'block';
            document.getElementById('tableContainer_summary').style.display = 'block';

        })
        .catch(error => {
            console.error(`Error fetching data for ${zone_no}, ${column}=${value}:`, error);
        });
    document.getElementById('Condition_legend').addEventListener('click', showlegend);
    document.getElementById('Material_legend').addEventListener('click', showlegend);
    document.getElementById('Ownership_legend').addEventListener('click', showlegend);
    function showlegend() {

        legendBtn.style.display = 'block';
        legendBtn.style.top = '70%';
        legendBtn.style.left = '1%'; // Example of additional style
        legendBtn.style.Color = 'color'; // Example of additional style
    }
}

//-------------------------------------------------- Wardwise  summary and road filter layer fetching -----------------------------------------//
function Aligarh_Ward_Condition(ward_no, column, value) {
    removeCurrentLayer();
    //  clearVectorLayers();

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
                'LAYERS': 'ALG_Summary:aligarh_road_condition', // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'none';

    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'block';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';

    // Fetch corresponding data
    fetchMVNNWardFilteredData(ward_no, column, value);
}
function Aligarh_Ward_Material(ward_no, column, value) {
    removeCurrentLayer();
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
                'LAYERS': 'ALG_Summary:aligarh_road_mat',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'block';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';

    // Fetch corresponding data
    fetchMVNNWardFilteredData(ward_no, column, value);
}

function Aligarh_Ward_Ownership(ward_no, column, value) {
    removeCurrentLayer();

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
                'LAYERS': 'ALG_Summary:aligarh_road_own',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })

    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'block';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'none';

    // Fetch corresponding data
    fetchMVNNWardFilteredData(ward_no, column, value);
}
function Aligarh_Ward_CUS(ward_no, column, value) {
    removeCurrentLayer();

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
                'LAYERS': 'ALG_Summary:aligarh_road_cus',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    // Showlegend
    document.getElementById('Material_legend').style.display = 'none';
    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'block';
    document.getElementById('RoadCategory_legend').style.display = 'none';

    // Fetch corresponding data
    fetchMVNNWardFilteredData(ward_no, column, value);
}
function Aligarh_Ward_TypeSub(ward_no, column, value) {
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
                'LAYERS': 'ALG_Summary:aligarh_road_category',   // Main layer for filtering
                'CQL_FILTER': cqlFilter, // Apply dynamic filtering
                'TILED': true
            },
            ratio: 1,
            serverType: 'geoserver',
            crossOrigin: "anonymous"
        })
    });
    currentLayer.setZIndex(10); // Ensure it is displayed on top
    MVNN_Road_popup();
    map.addLayer(currentLayer);
    // Showlegend
    document.getElementById('Material_legend').style.display = 'none';

    document.getElementById('Ownership_legend').style.display = 'none';
    document.getElementById('Condition_legend').style.display = 'none';
    document.getElementById('CUS_legend').style.display = 'none';
    document.getElementById('RoadCategory_legend').style.display = 'block';
    // Fetch corresponding data
    fetchMVNNWardFilteredData(ward_no, column, value);
}

// ----------------------------- fetch data based on Ward summary and road filter ----------------------------------------------------
function fetchMVNNWardFilteredData(ward_no, column, value) {
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
            Table_Row_and_Layer_highlight(responseData.data);
            document.getElementById('summary-table').style.display = 'none';
            document.getElementById('dataTable_summary').style.display = 'block';
            document.getElementById('tableContainer_summary').style.display = 'block';
        })
        .catch(error => {
            console.error(`Error fetching data for ${ward_no}, ${column}=${value}:`, error);
        });

}

//--------------------------------------------- download map and excel ----------------------------------------------------------------//
const downloadMapandExcel = document.querySelector(".fa-print");

downloadMapandExcel.addEventListener("click", () => {
    const table = document.getElementById('dataTable_summary');

    if (!table || table.rows.length === 0) {
        alert("No data in table. Please apply a filter first.");
        return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, "FilteredData");
    XLSX.writeFile(wb, `Filtered_Table_${Date.now()}.xlsx`);

    // Print Map Button Functionality
    // Open print dialog
    window.print();
})


//---------------------------------------------------------------------- Zone Boundary ------------------------------------------------//

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
        })
    });

    map.addLayer(currentZoneLayer);

    // Zoom to the feature
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
}

//------------------------------------------------ Ward Boundary --------------------------------------------------------//

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

//------------------------------------------------ summary filter ---------------------------------------------------//

document.addEventListener('DOMContentLoaded', () => {
    initializeDropdown('zoneSelect', '/getZones', 'zone_no');

    document.getElementById('zoneSelect').addEventListener('change', (e) => {
        const selectedZone = e.target.value;
        fetchAndPopulateWards(selectedZone, 'wardSelect');
        selectedFilters.zone = selectedZone;
        selectedFilters.ward = null; // Reset ward when zone changes
        updateMapAndTable();
    });

    const filters = ['ward', 'ownership', 'material'];
    filters.forEach(filter => {
        document.querySelector(`.${filter}-dropdown`).addEventListener('change', (e) => {
            selectedFilters[filter] = e.target.value;
            updateMapAndTable();
        });
    });
});

const selectedFilters = { zone: null, ward: null, ownership: null, material: null };

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
    if (selectedFilters.type) filterConditions.push(`category='${selectedFilters.type}'`);
    if (selectedFilters.material) filterConditions.push(`material='${selectedFilters.material}'`);

    const cqlFilter = filterConditions.join(' AND ');

    const layer = determineLayer();
    updateMapLayer(layer, cqlFilter);
    updateTable(layer, cqlFilter);
}

function determineLayer() {
    if (selectedFilters.material) {
        return 'ALG_Summary:aligarh_road_mat';
    } else if (selectedFilters.type) {
        return 'ALG_Summary:aligarh_road_category';
    } else if (selectedFilters.ownership) {
        return 'ALG_Summary:aligarh_road_own';
    }
    return 'ALG_Summary:aligarh_road_category';
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
                            <td>${properties.zone_no || 'N/A'}</td>
                            <td>${properties.zone_name || 'N/A'}</td>
                            <td>${properties.ward_no || 'N/A'}</td>
                            <td>${properties.ward_name || 'N/A'}</td>
                            <td>${properties.ownership || 'N/A'}</td>
                            <td>${properties.category || 'N/A'}</td>
                            <td>${properties.road_name || 'N/A'}</td>
                            <td>${properties.row_meter || 'N/A'}</td>
                            <td>${properties.row_as_per || 'N/A'}</td>
                            <td>${properties.carriage_w || 'N/A'}</td>
                            <td>${properties.material || 'N/A'}</td>
                            <td>${properties.length_km || 'N/A'}</td>
                            <td>${properties.condition || 'N/A'}</td>
                            <td>${properties.year_of_co || 'N/A'}</td>
                            <td>${properties.cus || 'N/A'}</td>
                        </tr>`);
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="16">No data available</td></tr>';
            }
        })
        .catch(err => console.error('Error fetching WFS data:', err));
}
