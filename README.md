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
- [Presentation PDF](https://github.com/INF554/a5-zhaoyans/blob/master/final_presentation/final_presentation.pdf) and [transcript](https://github.com/INF554/a5-zhaoyans/blob/master/PRESENTATION_TRANSCRIPT.md)
- [Article](<article-pdf-url>) and [Overleaf URL](https://www.overleaf.com/read/vnpnvkwvddft)
- [YouTube video](<youtube-video-url>)

### PROJECT CONTRIBUTIONS

- Demonstration: Ming-Yi Lin (linmingy), Hsin-Yu Chang (hsinyuch), Zhaoyang Song(zhaoyans)
- Presentation: Ming-Yi Lin (linmingy), Hsin-Yu Chang (hsinyuch), Zhaoyang Song(zhaoyans)
- Transcript: Ming-Yi Lin (linmingy), Hsin-Yu Chang (hsinyuch), Zhaoyang Song(zhaoyans)
- Paper: Zhaoyang Song(zhaoyans)
- YouTube video: [<member-name> (<member-USC-username>) ...]
- Web site: Ming-Yi Lin (linmingy), Hsin-Yu Chang (hsinyuch)
- Bike Station Location Map : Ming-Yi Lin (linmingy)
- Top 5 Destinations (bar chart) : Ming-Yi Lin (linmingy)
- Ride Duration By Passholder Type : Ming-Yi Lin (linmingy)
- Bike Type Usage Growth : Ming-Yi Lin (linmingy)
- Bike Station Inbound and Outbound : Ming-Yi Lin (linmingy)
- Bike Share Station Proportional Map : Hsin-Yu Chang (hsinyuch)
- Bike Trips Time Series Chart : Hsin-Yu Chang (hsinyuch)
- Bike Trips Overall Inbound and Outbound Chart : Hsin-Yu Chang (hsinyuch)

### Project Set-Up
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

### Publish
- Build our Angular project and deploy on `pdms.usc.edu`
```
ng build --prod --base-href /~mingyi/tribe/
scp -r * linmingy@pdms.usc.edu:/home/linmingy/public_html/tribe
```

### GIT
- Over 200 commits contributed by all members

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
