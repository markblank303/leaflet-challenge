var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

function createMap(earthquakes,plates) {
    var satellite = L.tileLayer(MAPBOX_URL, {
        attribution: ATTRIBUTION,
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var grayscale = L.tileLayer(MAPBOX_URL, {
        attribution: ATTRIBUTION,
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer(MAPBOX_URL, {
        attribution: ATTRIBUTION,
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Satelitte": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    var overlayMaps = {
        "Fault Lines": plates, 
        "Earthquakes": earthquakes
    };

    var myMap = L.map("map", {
        center: [37.090, -95.713],
        zoom: 5,
        layers: [satellite, earthquakes, plates]
    });
    earthquakes.addTo(myMap);

    var legend = createLegend();

    legend.addTo(myMap);

    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
};

function circleSize(magnitude) {
    return magnitude * 3;
};

function circleColor(magnitude) {
    if (magnitude < 1) {
        return "#00FF00"
    } else if (magnitude < 2) {
        return "#C2FF00"
    } else if (magnitude < 3) {
        return "#FFE400"
    } else if (magnitude < 4) {
        return "#FFAF00"
    } else if (magnitude < 5) {
        return "#FF7B00"
    } else {
        return "#FF0000"
    };
};

function createFeatures(earthquakeData,plateData) {
    
    var earthquakes = L.geoJSON(earthquakeData,{
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: circleSize(feature.properties.mag),
                fillColor: circleColor(feature.properties.mag),
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            });
        },
        onEachFeature: function(feature,layer) {
            layer.bindPopup(`<strong>${feature.properties.place}</strong><hr>Magnatude: ${feature.properties.mag}<br>${new Date(feature.properties.time)}`);
        }
    })

    var plates = L.geoJSON(plateData, {
        style: {
            color: "#FFE400",
        fillOpacity: 0}
    });

    createMap(earthquakes,plates);
};

function createLegend() {
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = [0,1,2,3,4,5];
        var labels = [];

        for (var i = 0; i < limits.length; i++) {
            div.innerHTML +=
                '<i style="background:' + circleColor(limits[i]) + '"></i> ' +
                limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
        }
    
        return div;
    };

    return legend;
}

d3.json(url, function (earthquakeData) {
    d3.json("static/js/PB2002_boundaries.json", function(plateData) {
        createFeatures(earthquakeData,plateData);
    })
});