import { Component, OnInit, Input } from "@angular/core";
import { environment } from "../../../environments/environment";
import * as mapboxgl from "mapbox-gl";
import * as d3 from "d3";

import { StationService } from "../../core/services/station.service";
import { StationStatus } from '../../share/station.model';
import { ResizeService } from 'src/app/core/services/resize.service';
import { LocationService } from 'src/app/core/services/location.service';

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
  station : StationStatus = new StationStatus();
  selectDestinations : Array<number> = [];
  markers: {};
  markersOnScreen: {};
  stationInOut : {};

  constructor(private stationService: StationService,
    private resizeService : ResizeService,
    private locationService : LocationService) {
    this.markers = {};
    this.markersOnScreen = {};
    this.lng = this.locationService.center[0];
    this.lat = this.locationService.center[1];

    this.stationService.stationsGeojsonSub.subscribe((data:any) => {
      if(Object.entries(data).length === 0){
        return;
      }
      this.loadGeojson(data);
    })

    this.stationService.hoverStationSub.subscribe((station: StationStatus) => {
      this.map.resize();
      this.station = station;
      // this.changeMapCenter(this.station.latitude, this.station.longitude);
      this.drawTopFiveStations();
    });

    this.stationService.changeMapCenterSub.subscribe(() => {
      this.changeMapCenter(this.station.latitude, this.station.longitude);
    });    
  }

  ngOnInit() {
    this.initMap();
  }
  
  ngAfterViewInit(){
    this.stationService.getStationGeojson(); 
    this.resizeService.resizeSub.subscribe(() => {
      this.map.resize();
    })
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
    this.map.addControl(new mapboxgl.NavigationControl(), "top-left");
  }
  
  changeMapCenter(lat, lng){
    this.map.flyTo({
      center: [lng,lat]
    });
  }

  loadGeojson(data:any){
    
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

      if(Object.entries(data).length !== 0){
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
            "circle-radius": 10
          }
        });
      }
      


      // this.map.getSource("line-animation").setData(data);

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
    // this.map.on("mouseleave", "stations", this.onMouseLeaveEvent.bind(this));
  }

  updateMarkers() {
    var newMarkers = {};
    var features = this.map.querySourceFeatures("stations");
    var currentHoverId = this.station.id || false;
    var destinationIds = this.station.destinations || [];

    for (var i = 0; i < features.length; i++) {
      var coords = features[i].geometry.coordinates;
      var props = features[i].properties;
      var ratio = 100 - 100 * (props.bikesAvailable / props.totalDocks);
      var id = props.kioskId;
      var isHidden = (!currentHoverId || destinationIds.indexOf(id) !== -1) ? false : true;
      var marker = this.markers.hasOwnProperty(id) ? this.markers[id] : false;

      if (!marker) {
        var el = document.createElement("div");
        
        // el.addEventListener('click', this.onClickSelectStation);
        el.innerHTML = [
          "<div class='bike_station_marker "+ (isHidden ? "hidden" : "") + "' id='marker_"+id+"'>",
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

  onClickSelectStation(e: any) {
    console.log(e);
  }

  onMouseHoverEvent(e: any) {
    // console.log(e);
    var id = e.features[0].properties.kioskId;
    if (e){
      this.stationService.setHoverStation(e);
    }
    
    // this.drawTopFiveStations({
    //   id : e.features[0].properties.kioskId,
    //   lat : e.features[0].properties.latitude,
    //   lng : e.features[0].properties.longitude,

    // });

    // this.createPopup(e);
  }

  onMouseLeaveEvent() {
    // this.station.name = "";
    this.map.getSource('line-animation').setData({
      type: "FeatureCollection",
      features: []
    });
    this.showStations();
    
  }

  drawTopFiveStations() {
    var destinations = this.station.destinations || [];
    this.hideStations(this.station.id);

    // Create a GeoJSON source with an empty lineString.
    var geojson = {
      type: "FeatureCollection",
      features: []
    };
    for (var i = 0; i < destinations.length; i++) {
      if(!isNaN(+destinations[i].latLng[0]) && !isNaN(+destinations[i].latLng[1])){
        geojson.features.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [
                this.station.longitude,
                this.station.latitude
              ],
              [+destinations[i].latLng[0], +destinations[i].latLng[1]]
            ]
          }
        });
      }
      
    }

    // add the line which will be modified in the animation
    this.map.getSource("line-animation").setData(geojson);

    // console.log(this.geojson);
  }

  // createPopup(e: any) {
  //   this.map.getCanvas().style.cursor = "pointer";
  //   var coordinates = e.features[0].geometry.coordinates.slice();
  //   var description = e.features[0].properties.addressStreet;

  //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
  //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  //   }

  //   // Populate the popup and set its coordinates
  //   // based on the feature found.
  //   this.popup
  //     .setLngLat(coordinates)
  //     .setHTML(
  //       [
  //         "<div class='marker_header'>",
  //         "<span class='title'>" + e.features[0].properties.name + "</span>",
  //         "</div>",
  //         "<div class='bike_dock_status'>",
  //         "<span class='flex_col'>",
  //         "<span class='status'>" +
  //           e.features[0].properties.bikesAvailable +
  //           "</span>",
  //         "<span class='name'>Bikes</span>",
  //         "</span>",
  //         "<span class='flex_col'>",
  //         "<span class='status'>" +
  //           e.features[0].properties.docksAvailable +
  //           "</span>",
  //         "<span class='name'>Docks</span>",
  //         "</span>",
  //         "</div>"
  //       ].join("")
  //     )
  //     .addTo(this.map);
  // }

  // removePopup() {
  //   this.map.getCanvas().style.cursor = "";
  //   this.popup.remove();
  // }

  showStations(){
    var markers = document.querySelectorAll(".bike_station_marker");
    for(var i = 0; i < markers.length; i++){
      markers[i]["classList"].remove("hidden");
    }
  }

  hideStations(stationId){
    var markers = document.querySelectorAll(".bike_station_marker");
    for(var i = 0; i < markers.length; i++){
      markers[i]["classList"].add("hidden");
      markers[i]["classList"].remove("selected");
    }
    // Change the current marker and destination markers opacity
    if(stationId){
      var id = stationId;
      // var destinations = this.stationInOut[id]["out"];
      var destinations = this.stationService.getStationTopNInOut(stationId, 5, true);
      var current_marker = document.querySelector("#marker_" + id);
      current_marker["classList"].remove("hidden");
      current_marker["classList"].add("selected");
      for(var i = 0; i < destinations.length; i++){
        var marker = document.querySelector("#marker_" + destinations[i].stationId);
        if(marker){
          marker["classList"].remove("hidden");
        }
      }
    }
  }
}
