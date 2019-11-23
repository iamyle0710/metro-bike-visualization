import { Component, OnInit, Input } from "@angular/core";
import { environment } from "../../environments/environment";
import { MapService } from "../core/services/map.service";
import * as mapboxgl from "mapbox-gl";
import * as turf from "turf";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"]
})
export class MapComponent implements OnInit {
  // initialization
  map: mapboxgl.Map;
  style: string = "mapbox://styles/mapbox/dark-v10";
  lat: number = 34.026283;
  lng: number = -118.272892;
  markers: {};
  markersOnScreen: {};
  top5Destinations: {};
  popup: mapboxgl.Popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });
  // Animation Line
  // speedFactor = 30; // number of frames per longitude degree
  // animation; // to store and cancel the animation
  // startTime = 0;
  // progress = 0; // progress = timestamp - startTime
  // resetTime = false; // indicator of whether time reset is needed for the animation

  constructor(private mapService: MapService) {
    this.markers = {};
    this.markersOnScreen = {};
    this.mapService.getTop5Destinations().subscribe((data: any) => {
      // console.log(data);
      this.top5Destinations = data;
    });

    this.mapService.getStationJSON().subscribe((data: any) => {
      this.map.on("load", () => {

        this.map.addSource("line-animation", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: []
          }
        });

        this.map.addSource("station", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: []
          }
        });

        this.map.addLayer({
          id: "stations",
          type: "circle",
          layout: {},
          source: {
            type: "geojson",
            data: data
          },
          paint: {
            "circle-color": "transparent",
            "circle-radius": 15
          }
        });


        this.map.getSource("line-animation").setData(data);

        this.map.addLayer({
          id: "top5-destinations",
          type: "line",
          source: "line-animation",
          paint: {
            "line-color": "#77d64b",
            "line-width": 3,
            "line-opacity": 0.8
          },
          layout: {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
        });
      });

      this.map.on("data", e => {
        if (e.sourceId !== "stations" || !e.isSourceLoaded) {
          return;
        }
        this.map.on("move", this.updateMarkers.bind(this));
        this.map.on("moveend", this.updateMarkers.bind(this));
        this.updateMarkers();
      });

      this.map.on("mouseenter", "stations", this.onMouseHoverEvent.bind(this));
      this.map.on("mouseleave", "stations", this.onMouseLeaveEvent.bind(this));
    });
  }

  ngOnInit() {
    this.initMap();
  }

  initMap() {
    mapboxgl.accessToken = environment.mapbox.accessToken;
    this.map = new mapboxgl.Map({
      container: "map",
      style: this.style,
      zoom: 13,
      center: [this.lng, this.lat]
    });

    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  updateMarkers() {
    var newMarkers = {};
    var features = this.map.querySourceFeatures("stations");

    for (var i = 0; i < features.length; i++) {
      var coords = features[i].geometry.coordinates;
      var props = features[i].properties;
      var ratio = 100 - 100 * (props.bikesAvailable / props.totalDocks);
      var id = props.kioskId;
      var marker = this.markers.hasOwnProperty(id) ? this.markers[id] : false;

      if (!marker) {
        var el = document.createElement("div");
        el.innerHTML = [
          "<div class='bike_station_marker'>",
          "<div class='bike_station_progess' style='top:" + ratio + "%'></div>",
          "</div>"
        ].join("");
        marker = this.markers[id] = new mapboxgl.Marker({
          element: el
        }).setLngLat(coords);
      }

      newMarkers[id] = marker;

      if (!this.markersOnScreen[id]) {
        marker.addTo(this.map);
      }
    }

    for (id in this.markersOnScreen) {
      if (!newMarkers[id]) {
        this.markersOnScreen[id].remove();
      }
    }
    this.markersOnScreen = newMarkers;
  }

  onMouseHoverEvent(e: any) {
    // console.log(e);
    this.animateDestinations(e);
    this.createPopup(e);
  }

  onMouseLeaveEvent() {
    // this.map.getSource('line-animation').setData({});
    this.removePopup();
  }

  animateDestinations(e: any) {
    var stationId = e.features[0].properties.kioskId;
    if (!this.top5Destinations[stationId]) {
      return;
    }
    var destinations = this.top5Destinations[stationId];
    // console.log(destinations);

    // Create a GeoJSON source with an empty lineString.
    var geojson = {
      type: "FeatureCollection",
      features: []
    };
    for (var i = 0; i < destinations.length; i++) {
      if(!isNaN(+destinations[i][1][0]) && !isNaN(+destinations[i][1][1])){
        geojson.features.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [
                e.features[0].properties.longitude,
                e.features[0].properties.latitude
              ],
              [+destinations[i][1][0], +destinations[i][1][1]]
            ]
          }
        });
      }
      
    }

    // add the line which will be modified in the animation
    this.map.getSource("line-animation").setData(geojson);

    // console.log(this.geojson);
  }

  createPopup(e: any) {
    this.map.getCanvas().style.cursor = "pointer";
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.addressStreet;

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    this.popup
      .setLngLat(coordinates)
      .setHTML(
        [
          "<div class='marker_header'>",
          "<span class='title'>" + e.features[0].properties.name + "</span>",
          "</div>",
          "<div class='bike_dock_status'>",
          "<span class='flex_col'>",
          "<span class='status'>" +
            e.features[0].properties.bikesAvailable +
            "</span>",
          "<span class='name'>Bikes</span>",
          "</span>",
          "<span class='flex_col'>",
          "<span class='status'>" +
            e.features[0].properties.docksAvailable +
            "</span>",
          "<span class='name'>Docks</span>",
          "</span>",
          "</div>"
        ].join("")
      )
      .addTo(this.map);
  }

  removePopup() {
    this.map.getCanvas().style.cursor = "";
    this.popup.remove();
  }
}
