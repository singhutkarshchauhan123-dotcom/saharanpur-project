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
    params: { LAYERS: "Solar:upneda" },
    serverType: "geoserver",
crossOrigin: "anonymous"
  }),
});
map.addLayer(solarLayer);





var solarLayer = new ol.layer.Image({
  title: "District Boundary",
  source: new ol.source.ImageWMS({
    url: `${GEOSERVER_Solar}/wms`,
    params: { LAYERS: "Solar:district_boundary" },
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
     // fill: new ol.style.Fill({ color: "#ff0000" }),
     // stroke: new ol.style.Stroke({ color: "#fff", width: 2 }),
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

      // map pe highlight + zoom
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


// ================= SOLAR POLYGON WITH ICON (WFS) =================

// WFS URL (polygon layer)
const solarPolygonWFS = `${GEOSERVER_Solar}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Solar:upneda&outputFormat=application/json`;

// Vector Source
const solarVectorSource = new ol.source.Vector({
  url: solarPolygonWFS,
  format: new ol.format.GeoJSON()
});

// Vector Layer with ICON + POLYGON
const solarVectorLayer = new ol.layer.Vector({
  title: "Solar Polygon with Icon",
  source: solarVectorSource,

  style: function(feature) {

    const geometry = feature.getGeometry();

    // polygon ka center (centroid approx)
    const center = ol.extent.getCenter(geometry.getExtent());

    return [

      // -------- Polygon Style --------
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "#00ffff",
          width: 1.5
        }),
        fill: new ol.style.Fill({
          color: "rgba(0,255,255,0.2)"
        })
      }),

      // -------- Icon Style --------
      new ol.style.Style({
        geometry: new ol.geom.Point(center),
        image: new ol.style.Icon({
          src: "https://cdn-icons-png.flaticon.com/512/18946/18946674.png",
          scale: 0.06,
          anchor: [0.5, 1]
        })
      })

    ];
  }
});

// Map me add karo
map.addLayer(solarVectorLayer);


// ================= AREA CHART LOGIC =================

// WFS polygon data (same jo tum use kar rahe ho)
const areaWFS = `${GEOSERVER_Solar}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Solar:upneda&outputFormat=application/json`;

async function loadAreaCharts() {
  try {
    const res = await fetch(areaWFS);
    const data = await res.json();

    const features = data.features;

    let areas = [];

    features.forEach((f, i) => {

      const geom = f.geometry;

      if (!geom || geom.type !== "Polygon") return;

      const coords = geom.coordinates[0];

      let area = 0;

      for (let i = 0; i < coords.length - 1; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[i + 1];
        area += (x1 * y2 - x2 * y1);
      }

      area = Math.abs(area / 2);

      // degree → approx meter conversion
      area = area * 111139 * 111139;

      let area_ha = area / 10000;

      areas.push({
        id: i + 1,
        area: area_ha,
        district: f.properties.District || "Unknown"
      });
    });

    renderCharts(areas);

  } catch (e) {
    console.error("Area chart error:", e);
  }
}


// ================= RENDER =================
function renderCharts(data) {

  // -------- SUMMARY --------
  const total = data.reduce((s, d) => s + d.area, 0);
  const avg = total / data.length;

  document.getElementById("areaSummaryCards").innerHTML = `
    <div class="summary-card">Total Area: ${total.toFixed(2)} ha</div>
    <div class="summary-card">Avg Area: ${avg.toFixed(2)} ha</div>
    <div class="summary-card">Total Polygons: ${data.length}</div>
  `;

  // -------- RANGE BUCKET --------
  const buckets = {
    "0-1": 0,
    "1-5": 0,
    "5-10": 0,
    "10-25": 0,
    "25-50": 0,
    "50+": 0
  };

  data.forEach(d => {
    if (d.area <= 1) buckets["0-1"]++;
    else if (d.area <= 5) buckets["1-5"]++;
    else if (d.area <= 10) buckets["5-10"]++;
    else if (d.area <= 25) buckets["10-25"]++;
    else if (d.area <= 50) buckets["25-50"]++;
    else buckets["50+"]++;
  });

  new Chart(document.getElementById("areaBucketChart"), {
    type: "bar",
    data: {
      labels: Object.keys(buckets),
      datasets: [{
        label: "Polygon Count",
        data: Object.values(buckets)
      }]
    }
  });

  // -------- PIE --------
  new Chart(document.getElementById("areaPieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(buckets),
      datasets: [{
        data: Object.values(buckets)
      }]
    }
  });

  // -------- DISTRICT --------
  let districtMap = {};

  data.forEach(d => {
    districtMap[d.district] = (districtMap[d.district] || 0) + d.area;
  });

  const districts = Object.keys(districtMap);
  const values = Object.values(districtMap);

  new Chart(document.getElementById("districtAreaChart"), {
    type: "bar",
    data: {
      labels: districts,
      datasets: [{
        label: "Area (ha)",
        data: values
      }]
    },
    options: {
      indexAxis: "y"
    }
  });

  // -------- TOP 10 --------
  const top10 = data.sort((a, b) => b.area - a.area).slice(0, 10);

  new Chart(document.getElementById("top10AreaChart"), {
    type: "line",
    data: {
      labels: top10.map(d => "ID-" + d.id),
      datasets: [{
        label: "Area",
        data: top10.map(d => d.area)
      }]
    }
  });
}


// ================= INIT =================
loadAreaCharts();



