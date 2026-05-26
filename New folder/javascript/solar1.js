// ================= CONFIG =================
const BASE_URL = `${BASE_URL_All}:8060/solar`;
const GEOSERVER_Above_10 = `${GEOSERVER_URL_All}/above_10m`;
const GEOSERVER_Solar = `${GEOSERVER_URL_All}/Solar`;

ol.proj.useGeographic();

// ================= MAP VIEW =================
var view = new ol.View({
  projection: "EPSG:4326",
  center: [80.9402, 26.8268],
  zoom: 7,
});

// ================= BASE MAPS =================
var base_maps = new ol.layer.Group({
  title: "Base maps",
  layers: [
    new ol.layer.Tile({
      title: "Satellite",
      type: "base",
      visible: true,
      source: new ol.source.XYZ({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        crossOrigin: "anonymous",
      }),
    }),
  ],
});

// ================= MAP =================
var overlays = new ol.layer.Group({
  title: "Overlays",
  layers: [],
});

var map = new ol.Map({
  target: "map",
  view: view,
});

map.addLayer(base_maps);
map.addLayer(overlays);

// ================= CONTROLS =================
map.addControl(new ol.control.LayerSwitcher());
map.addControl(new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326'
}));

map.addControl(new ol.control.ScaleLine({
  units: 'metric',
  bar: true,
  steps: 6,
  text: true,
}));

// ================= BOUNDARY =================
var upBoundary = new ol.layer.Image({
  title: "U.P. Boundary",
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_Above_10}/wms`,
    params: { LAYERS: "above_10m:UP_District" },
    serverType: "geoserver",
    // crossOrigin: "anonymous"
  }),
});
map.addLayer(upBoundary);

// ================= SOLAR WMS =================
var solarLayer = new ol.layer.Image({
  title: "Solar Points",
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_Solar}/wms`,
    params: { LAYERS: "Solar:solar_points" },
    serverType: "geoserver",
crossOrigin: "anonymous"
  }),
});
map.addLayer(solarLayer);

// ================= HIGHLIGHT LAYER =================
const highlightSource = new ol.source.Vector();

const highlightLayer = new ol.layer.Vector({
  source: highlightSource,
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({ color: "#ff0000" }),
      stroke: new ol.style.Stroke({ color: "#fff", width: 2 }),
    }),
  }),
});

map.addLayer(highlightLayer);

// ================= WFS URL =================
const wfsUrl = `${GEOSERVER_Solar}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Solar:solar_points&outputFormat=application/json`;

// ================= LOAD DATA =================
async function loadSolarData() {
  try {
    const res = await fetch(wfsUrl);
    const text = await res.text();

    console.log("RAW:", text);

    const data = JSON.parse(text);

    if (!data.features || data.features.length === 0) {
      console.warn("No features found");
      return;
    }

    console.log("Total features:", data.features.length);

    generateTable(data.features);

  } catch (err) {
    console.error("Error:", err);
  }
}

// ================= TABLE =================
function generateTable(features) {
  const table = document.getElementById("solarTable");
  table.innerHTML = "";

  if (!features.length) return;

  const headers = Object.keys(features[0].properties);

  // Header
  let thead = "<tr>";
  headers.forEach(h => thead += `<th>${h}</th>`);
  thead += "</tr>";

  // Body
  let tbody = "";

  features.forEach((f, index) => {
    tbody += `<tr data-index="${index}">`;

    headers.forEach(h => {
      const val = f.properties[h] ?? "";
      tbody += `<td>${val}</td>`;
    });

    tbody += "</tr>";
  });

  table.innerHTML = thead + tbody;

  // ================= CLICK EVENT =================
  const rows = table.querySelectorAll("tr[data-index]");

  rows.forEach(row => {
    row.addEventListener("click", function () {

      rows.forEach(r => r.classList.remove("active-row"));
      this.classList.add("active-row");

      const index = this.getAttribute("data-index");
      const feature = features[index];

      zoomToFeature(feature);
    });
  });
}

// ================= ZOOM FUNCTION =================
function zoomToFeature(featureGeoJSON) {

  highlightSource.clear();

  const format = new ol.format.GeoJSON();

  const feature = format.readFeature(featureGeoJSON, {
    featureProjection: "EPSG:4326"
  });

  highlightSource.addFeature(feature);

  map.getView().fit(feature.getGeometry().getExtent(), {
    duration: 800,
    padding: [50, 50, 50, 50],
    maxZoom: 18,
  });
}

// ================= INIT =================
loadSolarData();