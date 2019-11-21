import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from '../core/services/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  // initialization
  map : mapboxgl.Map;
  style : string = 'mapbox://styles/mapbox/dark-v10';
  lat : number = 34.026283;
  lng : number = -118.272892;
  markers : {};
  markersOnScreen : {};
  popup : mapboxgl.Popup = new mapboxgl.Popup({
    closeButton : false,
    closeOnClick : false
  });
  
  constructor(private mapService : MapService) {
    this.markers = {};
    this.markersOnScreen = {};
    this.mapService.getJSON().subscribe((data : any) => {
      

      this.map.on('load', () => {
        this.map.addLayer({
          "id" : "stations",
          "type" : "circle",
          "layout" : {},
          "source" : {
            "type" : "geojson",
            "data" : data
          },
          "paint" : {
            "circle-color" : "transparent",
            "circle-radius" : 10
          }
        })

        this.map.on('data', (e) => {
          if(e.sourceId !== "stations" || !e.isSourceLoaded){
            return;
          }

          this.map.on('mouseenter', 'stations', this.createPopup.bind(this));
          this.map.on('mouseleave', 'stations', this.removePopup.bind(this));
          this.map.on('move', this.updateMarkers.bind(this));
          this.map.on('moveend', this.updateMarkers.bind(this));
          this.updateMarkers();
        })
      })
    })
  }
  
  ngOnInit() {
    this.initMap();
  }

  initMap() {
    mapboxgl.accessToken = environment.mapbox.accessToken;
    this.map = new mapboxgl.Map({
      container : 'map',
      style : this.style,
      zoom : 13,
      center : [this.lng, this.lat]
    });

    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  updateMarkers(){
    var newMarkers = {};
    var features = this.map.querySourceFeatures("stations");

    for(var i = 0; i < features.length; i++){
      var coords = features[i].geometry.coordinates;
      var props = features[i].properties;
      var ratio = 100 - 100 * (props.bikesAvailable / props.totalDocks);
      var id = props.kioskId;
      var marker = (this.markers.hasOwnProperty(id)) ? this.markers[id] : false;
      
      if(!marker){
        var el = document.createElement("div");
        el.innerHTML = [
          "<div class='bike_station_marker'>",
            "<div class='bike_station_progess' style='top:" + ratio + "%'></div>",
          "</div>"
        ].join("");
        marker = this.markers[id] = new mapboxgl.Marker({element: el}).setLngLat(coords);
      }

      newMarkers[id] = marker;

      if(!this.markersOnScreen[id]){
        marker.addTo(this.map);
      }      
    }

    for(id in this.markersOnScreen){
      if(!newMarkers[id]){
        this.markersOnScreen[id].remove();
      }
    }
    this.markersOnScreen = newMarkers;
  }
  createPopup(e:any){
    this.map.getCanvas().style.cursor = 'pointer';
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.addressStreet;
    
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    
    // Populate the popup and set its coordinates
    // based on the feature found.
    this.popup.setLngLat(coordinates)
      .setHTML([
        "<div class='marker_header'>",
          "<span class='title'>" + e.features[0].properties.addressStreet + "</span>",
        "</div>",
        "<div class='bike_dock_status'>",
          "<span class='flex_col'>",
            "<span class='status'>" + e.features[0].properties.bikesAvailable + "</span>",
            "<span class='name'>Bikes</span>",
          "</span>",
          "<span class='flex_col'>",
            "<span class='status'>" + e.features[0].properties.docksAvailable + "</span>",
            "<span class='name'>Docks</span>",
          "</span>",
        "</div>"
      ].join(""))
      .addTo(this.map);
  }

  removePopup(){
    this.map.getCanvas().style.cursor = '';
    this.popup.remove();
  }
}
