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
  popup : mapboxgl.Popup = new mapboxgl.Popup({
    closeButton : false,
    closeOnClick : false
  });

  constructor(private mapService : MapService) {
    this.mapService.getJSON().subscribe((data : any) => {
      this.addBikeStationMarkers(data);      
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

  addBikeStationMarkers(data) {
    data.features.forEach(marker => {
      var el = document.createElement("div");
      var ratio = 100 * (marker.properties.bikesAvailable / marker.properties.totalDocks);
      el.innerHTML = [
        "<div class='bike_station_progess' style='top:"+(100 - ratio )+"%'></div>",
      ].join("")
      el.className = 'bike_station_marker';

      new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton : false}) // add popups
        .setHTML([
          "<div class='marker_header'>",
            "<span class='title'>" + marker.properties.addressStreet + "</span>",
          "</div>",
          "<div class='bike_dock_status'>",
            "<span class='flex_col'>",
              "<span class='status'>" + marker.properties.bikesAvailable + "</span>",
              "<span class='name'>Bikes</span>",
            "</span>",
            "<span class='flex_col'>",
              "<span class='status'>" + marker.properties.docksAvailable + "</span>",
              "<span class='name'>Docks</span>",
            "</span>",
          "</div>"
        ].join("")))
        .addTo(this.map);
    })
  }
}
