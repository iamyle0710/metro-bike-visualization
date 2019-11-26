import { Component, OnInit, Input } from "@angular/core";
import { environment } from "../../environments/environment";
import { StationService } from "../core/services/station.service";
import { StationStatus } from '../share/station.model';
import * as mapboxgl from "mapbox-gl";
import * as d3 from "d3";

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

  constructor(private stationService: StationService) {
    this.markers = {};
    this.markersOnScreen = {};
    // this.stationService.stationsDemandSub.subscribe((data: any) => {
    //   // console.log(data);
    //   this.stationInOut = data;
    // });

    this.stationService.stationsGeojsonSub.subscribe((data: any) => {
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
            "circle-radius": 10
          }
        });


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
    this.map.addControl(new mapboxgl.NavigationControl(), "top-left");
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
        // el.addEventListener('click', this.onClickSelectStation);
        el.innerHTML = [
          "<div class='bike_station_marker' id='marker_"+id+"'>",
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
    
    
    // var stationInOutRecords = this.stationService.getStationAllInOutRecords(id);
    // console.log(stationInOutRecords);
    // this.station.name = e.features[0].properties.name;
    // this.station.bikesAvailable = e.features[0].properties.bikesAvailable;
    // this.station.docksAvailable = e.features[0].properties.docksAvailable;
    
    // var margin = { top: 40, right: 10, bottom : 30, left : 10};
    // var width = 190;
    // var height = 150;
    // var chart_width = width - margin.left - margin.right;
    // var chart_height = height - margin.top - margin.bottom;

    // var x = d3.scaleBand()
    //   .range([0, chart_width])
    //   .padding(0.05);

    // var y = d3.scaleLinear()
    //   .range([chart_height, 0]);

    // var maxValue = d3.max(stationInOutRecords, function(d) { return d.value});
    // maxValue = maxValue === 0 ? 1 : maxValue;
    // var svg = d3.select("#inOutBarChart")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .selectAll("g")
    //   .remove();

    // var g = d3.select("#inOutBarChart").append("g")
    //   .attr("transform", "translate("+ margin.left + "," + margin.top + ")");

    // x.domain(stationInOutRecords.map(d => d.type));
    // y.domain([0, maxValue]);

    // var bars = g.selectAll(".bar")
    //   .data(stationInOutRecords, function(d){ 
    //     return d["id"];
    //   })
    
    // bars.enter()
    //   .append("rect")
    //   // .attr("class", "bar")      
    //   .attr("x", function(d){
    //     return x(d.type);
    //   })
    //   .attr("y", chart_height)
    //   .attr("width", x.bandwidth())
    //   .attr("height", 0)
    //   .transition()
    //   .duration(500)
    //   .attr("y", function(d){
    //     return y(d.value);
    //   })
    //   .attr("width", x.bandwidth())
    //   .attr("height", function(d){
    //     return chart_height - y(d.value);
    //   })
    //   .attr("fill", "#529137")
    
    // bars.enter()
    //   .append("text")    
    //   .attr("x", function(d){
    //     return x(d.type) + x.bandwidth() / 2;
    //   })
    //   .attr("y", chart_height + 15)
    //   .attr("opacity", 0)
    //   .attr("text-anchor",  "middle")
    //   .attr("alignment-baseline", "middle")
    //   .attr("text-transform", "uppercase")
    //   .attr("fill", "#529137")
    //   .transition()
    //   .duration(500)
    //   .attr("y", function(d){
    //     return y(d.value) + 15;
    //   })
    //   .attr("fill", "#fff")
    //   .attr("opacity", 1)
    //   .text(d => d.value);

    // bars.exit()
    //   .transition()
    //   .duration(500)
    //   .attr("height", 0)
    //   .style("opacity", 0)
    //   .remove();

    // bars.enter()
    //   .append("text")
    //   .attr("x", function(d){
    //     return x(d.type) + x.bandwidth() / 2;
    //   })
    //   .attr("y", chart_height + 10)
    //   .attr("text-anchor",  "middle")
    //   .attr("alignment-baseline", "middle")
    //   .attr("text-transform", "uppercase")
    //   .attr("font-size", 10)
    //   .text(function(d){
    //     return d.type.toUpperCase();
    //   })

    // g.append("text")
    //   .attr("y", -20)
    //   .attr("x", chart_width / 2)
    //   .attr("text-anchor",  "middle")
    //   .attr("alignment-baseline", "middle")
    //   .attr("font-size", 20)
    //   .attr("font-family", "sans-serif")
    //   .text("Travel Times")

    this.drawTopFiveStations(e);

    // this.createPopup(e);
  }

  onMouseLeaveEvent() {
    // this.station.name = "";
    this.map.getSource('line-animation').setData({
      type: "FeatureCollection",
      features: []
    });
    // this.removePopup();
    this.showStations();
    
  }

  drawTopFiveStations(e: any) {
    var stationId = e.features[0].properties.kioskId;
    var destinations = this.stationService.getStationTopNInOut(stationId, 5, true);
    this.hideStations(stationId);

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
                e.features[0].properties.longitude,
                e.features[0].properties.latitude
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
      markers[i]["style"].opacity = 1;
    }
  }

  hideStations(stationId){
    var markers = document.querySelectorAll(".bike_station_marker");
    for(var i = 0; i < markers.length; i++){
      markers[i]["style"].opacity = 0.2;
    }
    // Change the current marker and destination markers opacity
    if(stationId){
      var id = stationId;
      // var destinations = this.stationInOut[id]["out"];
      var destinations = this.stationService.getStationTopNInOut(stationId, 5, true);
      var current_marker = document.querySelector("#marker_" + id);
      current_marker["style"].opacity = 1;

      for(var i = 0; i < destinations.length; i++){
        var marker = document.querySelector("#marker_" + destinations[i].stationId);
        if(marker){
          marker["style"].opacity = 1;
        }
      }
    }
  }
}
