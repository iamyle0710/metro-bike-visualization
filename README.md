# INF 554 Final Project - Metro Bike Sharing

### TRIBE - Zhaoyang Song | Hsin-Yu Chang | Ming-Yi Lin
![Introduction](images/inf554_project_final.001.png)

## PROJECT SUMMARY

### PROJECT INFORMATION

- Project title: Metro Bike Sharing
- Group name: Tribe
- Team names: Hsin-Yu Chang(hsinyuch) | Ming-Yi Lin (linmingy) | Zhaoyang Song(zhaoyans)

### PROJECT ARTIFACTS

- [Demonstration URL](http://pdms.usc.edu/~linmingy/tribe/)
- [Presentation PDF](https://github.com/INF554/a5-zhaoyans/blob/master/final_presentation/final_presentation.pdf) and [Transcript](https://github.com/INF554/a5-zhaoyans/blob/master/PRESENTATION_TRANSCRIPT.md)
- [Article](<https://github.com/INF554/Tribe/blob/master/INF554_Tribe_Project_Report.pdf>) and [Overleaf URL](https://www.overleaf.com/read/vnpnvkwvddft)
- [YouTube video](https://youtu.be/ZbxIax6NoaM)

### PROJECT CONTRIBUTIONS

- Demonstration: Ming-Yi Lin (linmingy), Hsin-Yu Chang (hsinyuch), Zhaoyang Song(zhaoyans)
- Presentation: Ming-Yi Lin (linmingy), Hsin-Yu Chang (hsinyuch), Zhaoyang Song(zhaoyans)
- Transcript: Ming-Yi Lin (linmingy), Hsin-Yu Chang (hsinyuch), Zhaoyang Song(zhaoyans)
- Paper: Zhaoyang Song(zhaoyans)
- YouTube video: Ming-Yi Lin (linmingy), Hsin-Yu Chang (hsinyuch)
- Website: Ming-Yi Lin (linmingy), Hsin-Yu Chang (hsinyuch)
- Bike Station Location Map : Ming-Yi Lin (linmingy)
- Top 5 Destinations (bar chart) : Ming-Yi Lin (linmingy)
- Ride Duration By Passholder Type : Ming-Yi Lin (linmingy)
- Bike Type Usage Growth : Ming-Yi Lin (linmingy)
- Bike Station Inbound and Outbound : Ming-Yi Lin (linmingy)
- Bike Share Station Proportional Map : Hsin-Yu Chang (hsinyuch)
- Bike Trips Time Series Chart : Hsin-Yu Chang (hsinyuch)
- Bike Trips Overall Inbound and Outbound Chart : Hsin-Yu Chang (hsinyuch)

### DATA
- Metro Bike Share Data
   - The dataset is about bike trip information and is summarized for each quarter from 2016 to now
   - Data format includes `trip_id`, `duration`, `start_time`, `end_time`, `start_station`, `start_lat`, `start_lon`, `end_station`, `end_lat`, `end_lon`, `bike_id`, `plan_duration`, `trip_route_category`, `passholder_type` and `bike_type`
   - Implemented charts include `Overall Outbound / Inbound`, `Top 5 Outbound Destinations`, `Total Trips by Hour of the Day`, `Bike Station Inbound and Outbound`, `Ride Duration By Passholder Type` and `Bike Type Usage Growth`
   - We use all trip data from 2017 to 2019 in this project
   - [Data Source](https://bikeshare.metro.net/about/data/)
- Metro Bike Station Status
   - We use this data to visualize all the bike stations and show the number of available bikes and docks on the map
   - Implemented charts include `Bike Station Map`, `Bike Share Station Proportional Map`
   - [Data Source](http://bikeshare.metro.net/stations/json/)

### PROJECT SET-UP
- Clone the project
```
git clone https://github.com/INF554/Tribe.git
```
- Install Angular Client Tool
```
sudo npm install -g @angular/cli
```
- Install all the required packages in Node.js
```
cd tribe
sudo npm install
```
- Run the project
```
ng serve --open
```

### PUBLISH
- Build our Angular project and deploy on `pdms.usc.edu`
```
ng build --prod --base-href /~mingyi/tribe/
scp -r * linmingy@pdms.usc.edu:/home/linmingy/public_html/tribe
```

### GIT
- Over 200 commits contributed by all members

### DEMONSTRATION
#### Required Charts
- D3 Maps
   - Bike Share Station Proportional Map
      - Located in `Tribe` page
      - Demo Start Time : 00:52
- Responsive D3 Charts, Interactive D3 Charts, D3 Animated Transitions
   - Bar Charts
      - Top 5 Destinations
         - Located in `Visualization` page
         - Demo Start Time : 01:55
   - Group Bars Charts
      - Overall Outbound / Inbound
         - Located in `Visualization` page
         - Demo Start Time : 03:00
      - Bike Type Usage Growth
         - Located in `Analysis` page
         - Demo Start Time : 05:07
   - Line Charts
      - Total Trips by Hour of the Day
         - Located in `Visualization` page
         - Demo Start Time : 02:31
      - Ride Duration By Passholder Type
         - Located in `Analysis` page
         - Demo Start Time : 04:10
- D3 layouts
   - Circle Packing Layout
      - Bike Station Inbound and Outbound
         - Located in `Analysis` page
         - Demo Start Time : 03:36

### Development Details
#### Bootstrap
- Use `container-fluid`, `row` and combination of `col-number` to implement a responsive grid layout

#### Angular
- Using Service for components to communicate with each other
```typescript
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, EventEmitter } from '@angular/core';
import { StationStatus } from 'src/app/share/station.model';
import { QuarterModel } from 'src/app/share/quarter.model';


@Injectable()
export class StationService  {

    stationsGeojsonSub = new EventEmitter<any>();
    stationGeojson = {};
    stationsDemandSub = new EventEmitter<any>();
    stationsDemand = {};
    hoverStation: StationStatus = new StationStatus();
    hoverStationSub = new EventEmitter<StationStatus>();
    changeMapCenterSub = new EventEmitter<any>();
    metroJson: {};
    metroJsonSub = new EventEmitter<any>();
    
    constructor(private http : HttpClient){
        this.getStationJSON().subscribe((data) => {
            this.stationGeojson = data;
            this.stationsGeojsonSub.emit(data);
        })

        this.getStationInOut().subscribe((data) => {
            this.stationsDemand = data;
            this.stationsDemandSub.emit(data);
        })
        
        this.getMetro().subscribe((data) => {
            this.metroJson = data;
            this.metroJsonSub.emit(data);
        })

        this.getQuarter().subscribe((data) => {
            this.quarterJson = Object.values(data)
        })
    }

   ...
}
``` 
- Components access and subscribe data using Service
```typescript
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StationService } from '../core/services/station.service';
import { StationStatus } from '../share/station.model';
import { ResizeService } from '../core/services/resize.service';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css']
})
export class VisualizationComponent implements OnInit {

  station : StationStatus;
  width : number;

  @ViewChild("visualization", { static: false }) visualRef: ElementRef;

  constructor(private stationServie: StationService,
    private resizeService : ResizeService){
    this.stationServie.hoverStationSub.subscribe((station : StationStatus) => {
      this.station = station;
    })

    this.resizeService.resizeSub.subscribe(() => {
      this.updateSize();
    })
  }

  ...

}
```
#### Station Map
- Using Mapbox to deploy our bike stations
```typescript
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
```
- Draw Top 5 Outbound Stations
```typescript
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
```
#### Station Status
- Overall Outbound / Inbound
```typescript
renderQuarterChart(){
   var data = this.quarterData;
   if (!this.tooltipRef || !this.tooltipRef.nativeElement || this.tooltipRef.nativeElement.offsetWidth === 0) {
   return;
   }
   if (!data || data.length == 0) {
   d3.select("#QuarterChart").style("display", "none");
   } else {
   d3.select("#QuarterChart").style("display", "block");
   }

   var margin = { top: 20, right: 30, bottom: 40, left: 40 };

   var height = 220;
   var chart_width = this.width - margin.left - margin.right;
   var chart_height = height - margin.top - margin.bottom;
   var keys = ['outtrip', 'intrip']
   var color = d3.scaleOrdinal()
               .range(["#FFCF21", "#0191B4"])
                  
   // axis for countries
   var x0 = d3.scaleBand()  //x scale
      .domain(data.map(function(d) {return d.yr_q;}))
      .range([0, chart_width])
      .paddingInner(0.05);

   // axis for years
   var x1 = d3.scaleBand()
      .domain(keys)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05)

   var y = d3.scaleLinear() // y scale
      .domain([0, 
      d3.max(data, d => Math.max(d.intrip, d.outtrip))])
      .range([chart_height, 0]); 

   var xAxis = d3.axisBottom(x0).ticks(2).tickFormat(function(d) {
   return d.replace("_", " ");;
   }),
   yAxis = d3
   .axisLeft(y)
   .tickSizeInner(-chart_width)
   .ticks(5);

   if (!this.quarter) {
      this.quarter = d3
         .select("#QuarterChart")
         .attr("width", this.width)
         .attr("height", height)
         .append("g")
         .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
         );

      this.quarter
         .append("g")
         .attr("id", "quarterX")
         .attr("transform", "translate(0, " + chart_height + ")");
      
      this.quarter.append("g")
      .attr("id", "quarterY")
      .call(yAxis);

      this.quarter
      .append("text")
      .attr("transform", "rotate(-90)")
      .style('fill', '#fff')
      .attr("y", 3)
      .style('font-size', 10)
      .attr("dy", ".7em")
      .style("text-anchor", "end")
      .text("Total Trips");
   }
                              
   var qqyear = this.quarter.selectAll('.qqyear')
      .data(data)

   qqyear.enter()
      .append('g')
      .attr('class', 'qqyear')
      .attr("transform", d => `translate(${x0(d.yr_q)},0)`)
      .selectAll("rect")
      .data(d => keys.map(key => ({key, value: d[key]})))
      .enter()
      .append('rect')
      .attr("class", (d: any) => {
         return d.key;
      })
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => chart_height - y(d.value))
      .attr("fill", d => color(d.key));

   qqyear.transition()
   .attr("transform", d => `translate(${x0(d.yr_q)},0)`);

   qqyear.exit()
   .remove();

   qqyear
   .transition()
   .duration(500)
   .attr("transform", d => `translate(${x0(d.yr_q)},0)`)

   var qqbar = this.quarter
   .selectAll(".qqyear")
   .selectAll("rect")
   .data(d => keys.map(key => ({key, value: d[key]})));


   qqbar
   .transition()
   .duration(500)
   .attr("x", d => x1(d.key))
   .attr("y", d => y(d.value))
   .attr("width", x1.bandwidth())
   .attr("height", d => chart_height - y(d.value))
   .attr("fill", d => color(d.key));

   this.quarter
   .select("#quarterX")
   .transition()
   .duration(300)
   .call(xAxis);

   this.quarter
   .select("#quarterY")
   .transition()
   .duration(300)
   .call(yAxis);
}
```
- Top 5 Outbound Destinations
```typescript
renderTravelTimesChart() {
   if (!this.tooltipRef || !this.tooltipRef.nativeElement || this.tooltipRef.nativeElement.offsetWidth === 0) {
   return;
   }
   var stationService = this.stationService;
   var data = this.station.destinations;
   if (!data || data.length == 0) {
   d3.select("#inOutBarChart").style("display", "none");
   } else {
   d3.select("#inOutBarChart").style("display", "block");
   }

   var chart_width = this.width - this.margin.left - this.margin.right;
   var chart_height = this.height - this.margin.top - this.margin.bottom;

   var x = d3.scaleLinear().range([0, chart_width]);

   var y = d3
   .scaleBand()
   .range([chart_height, 0])
   .padding(0.2);

   var maxValue = d3.max(data, function(d: any) {
   return +d.numberOftimes;
   });
   maxValue = maxValue === 0 ? 1 : maxValue;

   if (!this.svg) {
   this.svg = d3
      .select("#inOutBarChart")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr(
         "transform",
         "translate(" + this.margin.left + "," + this.margin.top + ")"
      );
   }

   x.domain([0, maxValue]);
   y.domain(
   data.map(function(d: any) {
      return d.stationId;
   })
   );

   var bars = this.svg.selectAll(".bar").data(data, function(d: any) {
   return d.stationId;
   });

   bars
   .enter()
   .append("rect")
   .attr("class", "bar")
   .attr("x", 0)
   .attr("y", function(d: any) {
      return y(d.stationId);
   })
   .attr("height", y.bandwidth())
   .attr("width", 0)
   .style("cursor", "pointer")
   .on("mouseenter", function(d){
      d3.select(this).attr("opacity", 0.8)
   })
   .on("mouseleave", function(d){
      d3.select(this).attr("opacity", 1)
   })
   .on("click", function(d){
      stationService.setHoverStationById(d.stationId);
   })
   .transition()
   .duration(300)
   .attr("y", function(d: any) {
      return y(d.stationId);
   })
   .attr("height", y.bandwidth())
   .attr("width", function(d: any) {
      return x(d.numberOftimes);
   })
   .attr("fill", "#FFCF21")
   

   bars
   .transition()
   .duration(500)
   .attr("y", function(d: any) {
      return y(d.stationId);
   })
   .attr("height", y.bandwidth())
   .attr("width", function(d: any) {
      return x(d.numberOftimes);
   })
   .attr("fill", "#FFCF21");

   bars
   .exit()
   .transition()
   .duration(300)
   .attr("height", 0)
   .style("opacity", 0)
   .remove();

   var bar_values = this.svg
   .selectAll(".bar_values")
   .data(data, function(d: any) {
      return d.stationId;
   });

   bar_values
   .enter()
   .append("text")
   .attr("class", "bar_values")
   .attr("y", function(d: any) {
      return y(d.stationId) + y.bandwidth() / 2;
   })
   .attr("x", 0)
   .attr("text-anchor", "end")
   .attr("alignment-baseline", "middle")
   .attr("fill", "#343333")
   .attr("font-size", 12)
   .transition()
   .duration(400)
   .attr("x", function(d: any) {
      return x(d.numberOftimes) - 5 < 0 ? 0 : x(d.numberOftimes) - 5;
   })
   .attr("fill", "#343333")
   .text(function(d: any) {
      return d.numberOftimes;
   });

   bar_values
   .transition()
   .duration(400)
   .attr("x", function(d: any) {
      return x(d.numberOftimes) - 5 < 0 ? 0 : x(d.numberOftimes) - 5;
   })
   .attr("y", function(d: any) {
      return y(d.stationId) + y.bandwidth() / 2;
   })
   .text(function(d: any) {
      return d.numberOftimes;
   });

   bar_values
   .exit()
   .transition()
   .duration(400)
   .style("opacity", 0)
   .remove();

   var stations = this.svg.selectAll(".stations").data(data, function(d: any) {
   return d.stationId;
   });

   stations
   .enter()
   .append("text")
   .attr("class", "stations")
   .attr("x", -8)
   .attr("y", function(d: any) {
      return y(d.stationId) + y.bandwidth() / 2;
   })
   .attr("text-anchor", "end")
   .attr("alignment-baseline", "middle")
   .attr("text-transform", "uppercase")
   .attr("fill", "#fff")
   .attr("font-size", 12)
   .text(function(d: any) {
      return d.name;
   });

   stations
   .transition()
   .duration(300)
   .attr("x", -5)
   .attr("y", function(d: any) {
      return y(d.stationId) + y.bandwidth() / 2;
   });

   stations
   .exit()
   .transition()
   .duration(300)
   .attr("height", 0)
   .style("opacity", 0)
   .remove();
}
```
- Total Trips by Hour of the Day
```typescript
renderHourlyChart() {
   var height = 220;
   var margin = { top: 50, right: 50, bottom: 30, left: 70 };
   var palette = ["#FFCF21", "#0191B4"];

   if (!this.tooltipRef || !this.tooltipRef.nativeElement || this.tooltipRef.nativeElement.offsetWidth === 0) {
   return;
   }
   var hourly: any = this.stationData;

   if (hourly.length == 0) {
   d3.select("#hourlyChart").style("display", "none");
   } else {
   d3.select("#hourlyChart").style("display", "block");
   }

   var houraly_list = [];
   if(hourly.length !=0){
   for (var i = 0; i < 24; i++){
      // console.log(hourly[0][i], hourly[1][i])
      houraly_list.push([hourly[0]['values'][i].value, hourly[1]['values'][i].value]);
   }

   var chart_width = this.width - margin.left - margin.right;
   var chart_height = height - margin.top - margin.bottom;

   if (!this.hourly) {
      this.hourly = d3
         .select("#hourlyChart")
         .attr("width", this.width)
         .attr("height", height)
         .append("g")
         .attr(
         "transform",
         "translate(" + margin.left + "," + margin.top + ")"
         );
   }

   var x = d3.scaleLinear().range([0, chart_width]);
   x.domain([0, 23]);

   var y = d3.scaleLinear().range([chart_height, 0]);

   y.domain([
      d3.min(houraly_list, d=> Math.min(d[0], d[1])),
      d3.max(houraly_list, d=> Math.max(d[0], d[1]))
   ])

      var hourlyX = document.getElementById("hourlyX");
      var hourlyY = document.getElementById("hourlyY");

      var xAxis : any = d3.axisBottom(x);
      var yAxis : any = d3.axisLeft(y).ticks(4);

      if (hourlyX != null) {
        // d3.select('#hourlyX').remove()
        d3.select("#hourlyX")
          // .transition()
          // .duration(500)
          .call(
            xAxis.ticks(23).tickFormat(function(d) {
              return String(d);
            })
          );
      } else {
        this.hourly
          .append("g")
          .attr("id", "hourlyX")
          .attr("transform", "translate(0," + chart_height + ")")
          .call(
            xAxis.ticks(23).tickFormat(function(d) {
              return String(d);
            })
          );
      }

      if (hourlyY != null) {
        d3.select("#hourlyY")
          .transition()
          .duration(200)
          .call(yAxis);
      } else {
        this.hourly
          .append("g")
          .attr("id", "hourlyY")
          .call(yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 3)
          .attr("dy", ".7em")
          .style("text-anchor", "end")
          .text("Total Trips");
      }

      var color : any = d3
        .scaleOrdinal()
        .domain(["outbound", "inbound"])
        .range(palette);

      var lines = this.hourly.selectAll(".path").data(hourly);

      lines
        .enter()
        .append("path")
        .attr("class", "path")
        .attr("fill", "none")
        .attr("stroke", function(d) {
          return color(d.type);
        })
        .attr("stroke-width", 2)
        .attr("d", function(d) {
          return d3
            .line()
            .x(function(d: any) {
              return x(d.time);
            })
            .y(function(d: any) {
              return y(d.value);
            })(d.values);
        })
        .attr("opacity", 0.8);

      lines
        .transition()
        .duration(500)
        .attr("stroke", function(d) {
          return color(d.type);
        })
        .attr("stroke-width", 2)
        .attr("d", function(d) {
          return d3
            .line()
            .x(function(d: any) {
              return x(d.time);
            })
            .y(function(d: any) {
              return y(d.value);
            })(d.values);
        })
        .attr("opacity", 0.8);

      lines
        .exit()
        .transition()
        .duration(300)
        // .attr("height", 0)
        .style("opacity", 0)
        .remove();

      this.hourly.append("g").attr("id", "legend");

      var legendstr = ["Outbound", "Inbound"];

      var legend = d3
        .select("#legend")
        .selectAll("text")
        .data(legendstr);

      legend
        .enter()
        .append("text")
        .attr("x", chart_width + 5)
        .attr("y", function(d, i) {
          return y(houraly_list[23][i]);
        })
        .text(d => d)
        .style("font-size", "10px")
        .style("fill", (d: String) => {
          return color(d);
        });

      legend
        .transition()
        .duration(500)
        .attr("x", chart_width + 5)
        .attr("y", function(d, i) {
          return y(houraly_list[23][i]);
        })
        .text(d => d)
        .style("font-size", "10px")
        .style("fill", function(d) {
          return color(d);
        });

      legend
        .exit()
        .transition()
        .duration(300)
        // .attr("height", 0)
        .style("opacity", 0)
        .remove();

      const intervalListeners = this.hourly
        .append("g")
        .attr("id", "listeners")
        .selectAll(".listeners")
        .data(houraly_list);

      const hover = this.hourly.append("g").attr("id", "hover-tip");

      var listenwidth = chart_width / 24;
      intervalListeners
        .enter()
        .append("rect")
        .attr("class", "listeners")
        .attr("x", function(d, i) {
          return x(i) - listenwidth / 2;
        })
        // .attr("y", -this.margin.top)
        .attr("y", -margin.top)
        // .attr("height", this.height)
        .attr("height", height)
        .attr("width", listenwidth)
        .style("fill", "transparent")
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave);

      function onMouseEnter(datum, index) {
        // d3.select(this).style('fill', 'rgb(6,120,155)')
        hover
          .append("line")
          .attr("id", "hover-dash")
          .attr("fill", "none")
          .style("stroke", "#6D6D6D")
          .style("stroke-dasharray", "4")
          .attr("stroke-width", 2)
          .attr("x1", x(index))
          .attr("y1", 0)
          .attr("x2", x(index))
          .attr("y2", chart_height)
          .attr("opacity", 0.8);

        // circle
        hover
          .append("g")
          .attr("id", "hover-points")
          .selectAll(".hover-point")
          .data(datum)
          .enter()
          .append("circle")
          .attr("class", "hover-point")
          .attr("fill", function(d, i) {
            if (i == 0) {
              return color("outbound");
            } else {
              return color("inbound");
            }
          })
          .style("stroke", "#fff")
          .style("stroke-width", "2")
          .attr("cx", x(index))
          .attr("cy", d => y(d))
          .attr("r", "4")
          .attr("opacity", 0.8);

        // tooltip
        var tooltip = hover
          .append("g")
          .attr("id", "mytooltip")
          .attr(
            "transform",
            "translate(" + (x(index) - 30) + "," + -margin.top + ")"
          );

        var tooltip_width = 80;

        tooltip
          .append("rect")
          .style("fill", "#37464D")
          .attr("x", -tooltip_width / 2)
          .attr("y", 0)
          .attr("rx", 2)
          .attr("ry", 2)
          .attr("width", tooltip_width)
          .attr("height", margin.top - 5);

        // left word
        var rowname = ["Time", "Outbound", "Inbound", "Difference"];
        var rowheight = [12, 22, 32, 42];
        var rowcolor = ["#EEEEEE", palette[0], palette[1], "#EEEEEE"];
        var filldata = [index, datum[0], datum[1], datum[0] - datum[1]];

        tooltip
          .append("g")
          .attr("id", "myleft")
          .selectAll("text")
          .data(rowname)
          .enter()
          .append("text")
          .attr("x", -tooltip_width / 2 + 5)
          .attr("y", function(d, i) {
            return rowheight[i];
          })
          .text(d => d)
          .style("font-size", "10px")
          .style("fill", function(d, i) {
            return rowcolor[i];
          });

        tooltip
          .append("g")
          .attr("id", "myright")
          .selectAll("text")
          .data(filldata)
          .enter()
          .append("text")
          .attr("x", tooltip_width / 2 - 5)
          .attr("y", function(d, i) {
            return rowheight[i];
          })
          .text(d => d)
          .style("font-size", "10px")
          .style("fill", function(d, i) {
            return rowcolor[i];
          })
          .style("text-anchor", "end");
      }

      function onMouseLeave() {
        var dash = document.getElementById("hover-dash");
        var points = document.getElementById("hover-points");
        var tooltip = document.getElementById("mytooltip");
        if (dash != null) {
          d3.select("#hover-dash").remove();
        }
        if (points != null) {
          d3.select("#hover-points").remove();
        }
        if (tooltip != null) {
          d3.select("#mytooltip").remove();
        }
      }
    } 
  }
```

#### Anaylsis
- Bike Station Inbound and Outbound
```typescript
renderCirclePacking() {
   var data = this.chartData;

   if (!this.chartRef || data.name == "" || data.children.length == 0) {
   d3.select("#" + this.chartId)
      .selectAll("g")
      .remove();
   this.noData = true;
   return;
   }

   this.noData = false;
   
   // console.log(data);
   this.width = this.chartRef.nativeElement.offsetWidth * 0.5;
   this.height = this.width;

   var color = d3.scaleOrdinal([
   "#74d7ca",
   "#51b7c4",
   "#51b7c4",
   "#4196b7",
   "#4275a2",
   "#475385"
   ]);
   var format = d3.format(",d");
   var pack = data =>
   d3
      .pack()
      .size([this.width, this.height])
      .padding(10)(
      d3
         .hierarchy(data)
         .sum(d => d.value)
         .sort((a, b) => b.value - a.value)
   );

   const root = pack(data);
   let focus = root;
   
   if(!this.svg){
   this.svg = d3
      .select("#" + this.chartId)
      // .attr("width", this.width)
      .attr("height", this.height)
      .attr(
         "viewBox",
         `-${this.width / 2} -${this.height / 2} ${this.width} ${this.height}`
      )
      .style("display", "block")
      .style("margin", "0 -14px")
      .style("cursor", "pointer")
      .on("click", () => this.zoomCirclePacking(root));
   }
   
   this.svg.attr("height", this.height)
      .attr(
         "viewBox",
         `-${this.width / 2} -${this.height / 2} ${this.width} ${this.height}`
      )
      .selectAll("g").remove();

   this.node = this.svg
   .append("g")
   .selectAll("circle")
   .data(root.descendants())
   .join("circle")
   .attr("fill", (d: any) => (
      d.children ? color(d.depth) : "white"
   ))
   .attr("pointer-events", (d: any) => (!d.children ? "none" : null))
   .on("mouseover", function() {
      d3.select(this).attr("stroke", "#000");
   })
   .on("mouseout", function() {
      d3.select(this).attr("stroke", null);
   })
   .on(
      "click",
      d =>
         focus !== d &&
         (this.zoomCirclePacking(d), d3.event.stopPropagation())
   );

   this.label = this.svg
   .append("g")
   .style("font", "10px sans-serif")
   .attr("pointer-events", "none")
   .attr("text-anchor", "middle")
   .selectAll("text")
   .data(root.descendants())
   .join("text")
   .style("fill-opacity", d => (d.parent === root ? 1 : 0))
   .style("font-size", 14)
   .style("fill", "#22272c")
   .style("display", d => (d.parent === root ? "inline" : "none"))
   .text(d => {
      var text = d.data.name;
      return text;
   });

   this.zoomCirclePackingTo([root.x, root.y, root.r * 2]);
}
```
- Ride Duration By Passholder Type
```typescript
renderLineChart() {
   if (!this.chartRef) {
   return;
   }
   var data = this.chartData;

   this.width = this.chartRef.nativeElement.offsetWidth;
   var chart_width = this.width - this.margin.left - this.margin.right;
   var chart_height = this.height - this.margin.top - this.margin.bottom;

   var x = d3.scaleTime().range([0, chart_width]);
   var y = d3.scaleLinear().range([chart_height, 0]);
   var color = d3.scaleOrdinal([
   "#74d7ca",
   "#51b7c4",
   "#51b7c4",
   "#4196b7",
   "#4275a2",
   "#475385"
   ]);
   var hiddens = this.hidden;

   var xAxis = d3.axisBottom(x).ticks(5),
   yAxis = d3.axisLeft(y).ticks(5);

   var line = d3
   .line()
   .curve(d3.curveBasis)
   .x((d: any) => x(d.date))
   .y((d: any) => y(d.duration));

   var x_min: any = d3.min(data, (d: any) => {
   var value: any = d3.min(d.values, (d1: any) => {
      return d1.date;
   });
   return value;
   });
   var x_max: any = d3.max(data, (d: any) => {
   var value: any = d3.max(d.values, (d1: any) => {
      return d1.date;
   });
   return value;
   });
   var y_max: number = d3.max(data, (d: any) => {
   var value: number = d3.max(d.values, (d1: any) => {
      var v1: number = d1.duration;
      return v1;
   });
   return value;
   });

   x.domain([x_min, x_max]);
   y.domain([0, y_max]);

   if (!this.svg) {
   this.svg = d3
      .select("#" + this.chartId)
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr(
         "transform",
         "translate(" + this.margin.left + "," + this.margin.top + ")"
      );

   this.svg
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0, " + chart_height + ")");

   this.svg.append("g").attr("class", "axis axis--y");

   // Add Y Title
   this.svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("class", "ylabel")
      .attr("x", -chart_height / 2)
      .attr("y", -this.margin.left * 0.5 - 5)
      .text("Duration (minutes)");

   // Add X Title
   this.svg
      .append("text")
      .attr("class", "xlabel")
      .attr("x", chart_width / 2)
      .attr("y", chart_height + 30)
      .text("Date");

   // Add Legend
   this.svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + -90 + "," + 0 + ")");

   this.svg
      .select("g.legend")
      .selectAll("rect")
      .data(data, function(d) {
         return d.key;
      })
      .enter()
      .append("rect")
      .attr("class", (d: any) => d.key.replace(/\s/g, "_"))
      .attr("width", 20)
      .attr("height", 3)
      .attr("x", function(d, i) {
         return chart_width + 15;
      })
      .attr("y", function(d, i) {
         return i * 10 + 10;
      })
      .attr("fill", function(d, i) {
         return color(d.key);
      })
      .style("cursor", "pointer")
      .on("click", this.toggleLineSeries.bind(this));

   this.svg
      .select("g.legend")
      .selectAll("text")
      .data(data, function(d) {
         return d.key;
      })
      .enter()
      .append("text")
      .attr("class", (d: any) => d.key.replace(/\s/g, "_"))
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "start")
      .attr("font-size", 10)
      .attr("fill", "#aaa")
      .attr("x", function(d, i) {
         return chart_width + 45;
      })
      .attr("y", function(d, i) {
         return i * 10 + 12;
      })
      .text(function(d) {
         return d.key;
      })
      .style("cursor", "pointer")
      .on("click", this.toggleLineSeries.bind(this));
   }

   this.svg.selectAll(".line_group").remove();

   data.forEach((d: any, i: number) => {
   this.svg
      .append("g")
      .attr("class", "line_group")
      .attr("id", d.key.replace(/\s/g, "_"))
      .attr("opacity", function(){
         var id = d3.select(this).attr("id");
         return hiddens.indexOf(id) === -1 ? 1 : 0;
      })
      .append("path")
      .attr("class", "line")
      .style("stroke", color(d.key))
      .attr("d", line(d.values));
   });

   this.svg
   .select("g.axis--x")
   .transition()
   .duration(300)
   .call(xAxis);

   this.svg
   .select("g.axis--y")
   .transition()
   .duration(300)
   .call(yAxis);

   this.svg
   .select(".xlabel")
   .transition()
   .duration(300)
   .attr("x", chart_width / 2)
   .attr("y", chart_height + 30);

   this.svg
   .select(".ylabel")
   .transition()
   .duration(300)
   .attr("x", -chart_height / 2)
   .attr("y", -this.margin.left * 0.5 - 5);

   this.svg
   .select("g.legend")
   .selectAll("rect")
   .transition()
   .duration(300)
   .attr("x", function(d, i) {
      return chart_width + 15;
   })
   .attr("y", function(d, i) {
      return i * 10 + 10;
   });

   this.svg
   .select("g.legend")
   .selectAll("text")
   .transition()
   .duration(300)
   .attr("x", function(d, i) {
      return chart_width + 45;
   })
   .attr("y", function(d, i) {
      return i * 10 + 12;
   });
}
```
- Bike Type Usage Growth
```typescript
renderGroupBars() {
   if (!this.chartRef) {
   return;
   }

   var data = this.chartData;
   this.width = this.chartRef.nativeElement.offsetWidth;
   var chart_width = this.width - this.margin.left - this.margin.right;
   var chart_height = this.height - this.margin.top - this.margin.bottom;
   var x = d3
   .scaleBand()
   .domain(
      data.map(function(d: any) {
         return d.key;
      })
   )
   .range([0, chart_width])
   .paddingInner(0.2);
   var bikeTypes = {};

   data.forEach(function(d: any) {
   d.values.forEach((dv: any) => {
      if (!bikeTypes.hasOwnProperty(dv.bike_type)) {
         bikeTypes[dv.bike_type] = true;
      }
   });
   });

   var bikeTypeArr = Object.keys(bikeTypes);
   // console.log(data, bikeTypeArr);
   var xInScale = d3
   .scaleBand()
   .domain(bikeTypeArr)
   .range([0, x.bandwidth()]);
   var y_max: number = d3.max(data, (d: any) => {
   var values: Array<number> = d.values.map((obj: any) => {
      return obj.counts;
   });
   return isNaN(d3.max(values)) ? 1 : d3.max(values);
   });

   var y = d3
   .scaleLinear()
   .domain([0, y_max])
   .range([chart_height, 0]);
   var color = d3.scaleOrdinal([
   "#74d7ca",
   "#51b7c4",
   "#4196b7",
   // "#22bb33",
   // "#5be16a",
   // "#cdf6d2",
   // "#ffffff"
   ]);
   var hiddens = this.hidden;

   var xAxis = d3.axisBottom(x).ticks(5),
   yAxis = d3
      .axisLeft(y)
      .tickSizeInner(-chart_width)
      .ticks(5);

   if (!this.svg) {
   this.svg = d3
      .select("#" + this.chartId)
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr(
         "transform",
         "translate(" + this.margin.left + "," + this.margin.top + ")"
      );

   this.svg.append("g").attr("class", "main_chart");

   this.svg
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0, " + chart_height + ")")
      .call(xAxis);

   this.svg
      .append("g")
      .attr("class", "axis axis--y")
      

   // Add Y Title
   this.svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("class", "ylabel")
      .attr("x", -chart_height / 2)
      .attr("y", -this.margin.left * 0.5 - 5)
      .text("Counts");

   // Add X Title
   this.svg
      .append("text")
      .attr("class", "xlabel")
      .attr("x", chart_width / 2)
      .attr("y", chart_height + 30)
      .text("Date");

   // Add Legend
   this.svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + -90 + "," + 0 + ")");

   this.svg
      .select("g.legend")
      .selectAll("rect")
      .data(bikeTypeArr)
      .enter()
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("x", function(d, i) {
         return chart_width + 15;
      })
      .attr("y", function(d, i) {
         return i * 20 + 10;
      })
      .attr("fill", function(d) {
         return color(d);
      })
      .style("cursor", "pointer");

   this.svg
      .select("g.legend")
      .selectAll("text")
      .data(bikeTypeArr)
      .enter()
      .append("text")
      .style("cursor", "pointer")
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "start")
      .attr("font-size", 12)
      .attr("fill", "#aaa")
      .attr("x", function(d, i) {
         return chart_width + 45;
      })
      .attr("y", function(d, i) {
         return i * 20 + 18;
      })
      .text(function(d) {
         return d;
      })
      ;
   }

   // this.svg.selectAll(".months").remove();
   var groups = this.svg
   .select("g.main_chart")
   .selectAll("g.bargroup")
   .data(data, d => {
      return d.key;
   });

   groups
   .enter()
   .append("g")
   .attr("class", "bargroup")
   .attr("transform", d => {
      return "translate(" + x(d.key) + ",0)";
   })
   .selectAll("rect")
   .data(function(d) {
      // console.log(d);
      return d.counts.slice();
   })
   .enter()
   .append("rect")
   .attr("class", (d: any) => {
      return d.bike_type;
   })
   .attr("fill", (d, i) => {
      return color(d.bike_type);
   })
   .attr("width", xInScale.bandwidth())
   .attr("height", d => {
      return chart_height - y(d.usage);
   })
   .attr("opacity", function(d){
      return hiddens.indexOf(d.bike_type) === -1 ? 1 : 0;
   })
   .attr("x", function(d, i) {
      return xInScale(d.bike_type);
   })
   .attr("y", function(d) {
      return y(d.usage);
   });

   groups.transition().attr("transform", d => {
   return "translate(" + x(d.key) + ",0)";
   });

   groups
   .exit()
   // .transition()
   .remove();

   var bars = this.svg
   .selectAll(".bargroup")
   .selectAll("rect")
   .data(function(d: any) {
      return d.counts.slice();
   });

   bars
   .transition()
   .duration(500)
   .attr("x", function(d) {
      return xInScale(d.bike_type);
   })
   .attr("y", function(d) {
      return y(d.usage);
   })
   .attr("height", function(d) {
      return chart_height - y(d.usage);
   })
   .attr("width", xInScale.bandwidth())
   .attr("fill", function(d) {
      return color(d.bike_type);
   })
   .attr("opacity", function(d){
      return hiddens.indexOf(d.bike_type) === -1 ? 1 : 0;
   })
   

   bars
   .exit()
   .transition()
   .attr("y", function(d) {
      return chart_height;
   })
   .attr("height", 0)
   .attr("width", 0)
   .remove();

   this.svg.select("g.legend").remove();

   // Add Legend
   this.svg
   .append("g")
   .attr("class", "legend")
   .attr("transform", "translate(" + -90 + "," + -10 + ")");

   this.svg
   .select("g.legend")
   .selectAll("rect")
   .data(bikeTypeArr)
   .enter()
   .append("rect")
   .attr("class", (d: String) => {
      return d;
   })
   .attr("width", 15)
   .attr("height", 15)
   .attr("x", function(d, i) {
      return chart_width + 15;
   })
   .attr("y", function(d, i) {
      return i * 20 + 10;
   })
   .attr("fill", function(d) {
      return color(d);
   })
   .attr("opacity", function(d){
      return hiddens.indexOf(d) === -1 ? 1 : 0.2
   })
   .style("cursor", "pointer")
   .on("click", this.toggleBarSeries.bind(this));

   this.svg
   .select("g.legend")
   .selectAll("text")
   .data(bikeTypeArr)
   .enter()
   .append("text")
   .attr("class", (d: String) => {
      return d;
   })
   .attr("alignment-baseline", "middle")
   .attr("text-anchor", "start")
   .attr("font-size", 12)
   .attr("fill", "#aaa")
   .attr("x", function(d, i) {
      return chart_width + 45;
   })
   .attr("y", function(d, i) {
      return i * 20 + 18;
   })
   .attr("opacity", function(d){
      return hiddens.indexOf(d) === -1 ? 1 : 0.2
   })
   .style("cursor", "pointer")
   .text(function(d) {
      return d;
   })
   .on("click", this.toggleBarSeries.bind(this));

   this.svg
   .select("g.axis--x")
   .transition()
   .duration(300)
   .call(xAxis);

   this.svg
   .select("g.axis--y")
   .transition()
   .duration(300)
   .call(yAxis);
}
```



## Introduction

* Targeted audience : **Metro Bike Institute**<br>
* Our purposes :
   - **Quality on Maintaining Metro Bikes**<br>
   ![Purpose](images/inf554_project_final.002.png)
&nbsp;Which stations are high demanding?<br>
&nbsp;When to refill the bikes to meet the upcoming demand?<br>
&nbsp;How to tranfer bikes from station to station and maintain the bikes without high depreciation cost? <br>
&nbsp;How to encourage more users to use metro bikes as their public transportation?

   - **User Behavior Analysis**<br>
![Purpose](images/inf554_project_final.003.png)
&nbsp;Analyze users when, where and how they rent the metro bikes?

## Our Visualization
![Purpose](images/inf554_project_final.004.png)
* What is the topic?
    - Statistic Visualization of LA Metro Bike Share trip data
* What is the information you plan to present?
    - Maintain the bikes: When Where and how many bikes need to be refilled. Bike depreciation/
    - User behaviours: when do they use the bikes? Where are the start point and end point? What type of    trip? One way or round trip?
    - Performance so far: Are users increasing by years? How many people have the monthly plan or annual plan? How many people are using the free plan?
 
* Do you have a story?
   - "I took Metro every day to go to work at Venice Beach this summer. It still had 20 mins walking distance from the metro station to my company, so I planned to take the metro sharing bike. However, it became so hard for me to find a bike near the metro station. Either there was no bike at all or the bikes there just couldn’t work. However, sometimes I found several stations have way more bikes than it should be." -- Zhaoyang


## Secret Sauce
![Secret](images/inf554_project_final.005.png)
![Secret](images/inf554_project_final.006.png)
* Visualizing metro bikers' routes around Los Angeles
* Responsive User Interface: maintainer / marketer /  user mode
* Drill down details when clicking on certain route

## Our Plan

* Dataset : [Metro Bike Share Trip Data](https://bikeshare.metro.net/about/data/]) 
* Data collected from 2017 Q1 to 2019 Q2
* Technology : Javascript, D3.js, HTML5, Python 
![Technology](images/inf554_project_final.007.png)
* Design plans, building and evaluating : 
![Design Plan](images/inf554_project_final.008.png)
<br>&nbsp; 1. Analyze the bike station data.
<br>&nbsp; 2. Set the purpose and goals of our website.
<br>&nbsp; 3. Assign roles to make sure everyone knows their role and tasks.
<br>&nbsp; 4. Create a content strategy that gives the most efficient way to show information.
<br>&nbsp; 5. Design and create a mock-up of what our website should look like.
<br>&nbsp; 6. Develop our website using the technologies mentioned above.
<br>&nbsp; 7. Evaluate based on features testing, interactivity and visualization wheel.
* Risk : Hard to identify data based on user types since the data doesn't include user id

## How We Work Together?
![Work](images/inf554_project_final.009.png)
* Define the purpose and design ideas together in weekly meetings.
* Explore and analyze the data.
* Assign works and set timeline to finish all tasks.
* Meet weekly to 1. solve technical problems. 2. revise design plan

## Our Timeline
![Work](images/inf554_project_final.010.png)
* Biweek1 : Reseach on previous works on related topics and collect data which can be linked to our main data.
<br>e.g. bike lane map, users profiles...
* Biweek2 : Based on research, initial design on prototypes and layouts to meet our purposes.
* Biweek3 : Construct first-sketch website to build up our visualization and functions.
* Biweek4 : Experiment on users and refine the website.
* Biweek5 : Paper elaborating on the whole process we set up our project.
* Final : Final review on website and paper.

## Our Team
Zhaoyang : Product-Oriented thinking, Jquery Interactive Coding, Design skills, Data Analysis
<br> Hsin-Yu : User Interface Design, Statistical thinking, Data Visualization
<br> Ming-Yi : Web Developing, User Interface Desing, Data Processing 

## Overleaf Link
[overleaf link](https://www.overleaf.com/8681218574nrbhrmjpqgks)
