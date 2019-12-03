import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import * as d3 from "d3";
import { LocationService } from "../core/services/location.service";
import { ResizeService } from "../core/services/resize.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  providers: [LocationService]
})
export class WelcomeComponent implements OnInit {
  @ViewChild("stations", { static: false }) chartRef: ElementRef;

  width: number;
  height: number;
  locationData = [];
  mapData = [];
  station;

  
  constructor(private locationService: LocationService, private resizeService: ResizeService) {
    this.locationService.locationDataSub.subscribe(data => {
      this.locationData = data;
      this.updateChart();
      // this.renderChart();
      // console.log(this.locationData);
    });

    this.locationService.mapDataSub.subscribe(data => {
      this.mapData= data;
      this.updateChart();
      // this.renderChart();
      // console.log(this.mapData);
    });
   }

  ngOnInit() {
  };
  ngOnChanges() {
    this.updateChart();
  };

  ngAfterViewInit() {
    this.resizeService.resizeSub.subscribe(() => {
      this.updateChart();
    });
  }

  updateChart() {
    this.updateSize();
    this.renderChart();

  }

  updateSize() {
    if (this.chartRef) {
      this.width = this.chartRef.nativeElement.offsetWidth;
      if (this.station) {
        d3.select("#stations").attr("width", this.width);
      }
    }
  }
  
  renderChart(){
    if(this.locationData.length !=0 && this.mapData.length != 0){
      if (!this.station) {
        
        var station = this.locationData;
        var la = this.mapData;

        this.width = this.chartRef.nativeElement.offsetWidth;
        this.height = this.chartRef.nativeElement.offsetWidth;

        this.station = d3.select("#stations")
        .attr("width", this.width)
        .attr("width", this.height);

        console.log(this.width)
        console.log(this.height)
        
        // var region = {};
        // station.forEach(function(item) {
        //   region[item.Region] = (region[item.Region] || 0) + 1;
        // })

        
        const regionset = [...new Set(station.map(item => item.Region))];
        // // console.log(region)
        // // la = this.mapData;
        var region = [];
        for (var i = 0; i < regionset.length; i++) {
          // console.log(regionset[i])
          var arr = station.filter(item => item.Region == regionset[i]);
          var lons = arr.map(item => item.lon).reduce((prev, next) => prev + next);
          var lats = arr.map(item => item.lat).reduce((prev, next) => prev + next);
          // console.log(lons/arr.length);
          region.push({
              area: regionset[i],
              stations: arr.length,
              point: [lons/arr.length, lats/arr.length]
          });
        }

        // console.log(region);
        // console.log(la);
        // console.log(la);
        
        // this.station = d3.select("#stations")
        

        console.log(this.width)
        console.log(this.height)
        // .attr("width", 900)
        // .attr("height", 600)

        var color = d3
        .scaleOrdinal()
        .domain(regionset)
        .range(['#FF3D20','#00C7D5', '#3A5154', '#9AACB8'])

        var bubble = d3
        .scaleSqrt()
        .domain([d3.min(region, r => r.stations), d3.max(region, r => r.stations)])
        .range([10, 50])

        // console.log(bubble);

        // station.forEach(element => {
        //   element.point = [element.lon, element.lat]   
        //   element.year = element.Go_live_date.slice(0,4) 
        // });
        // console.log(station)

        // var center = 

        var projection = d3.geoMercator()
                    .scale(32000)
                    .center([-118.408703, 33.946042])
                    // .center([-119.012550, 33.960832])
                    // .center([-118.949379, 33.927794])
                    // .center([-118.517528, 33.939066])
                    // .center([-118.3592, 34.0639])
                    // .fitSize([width, height], la);
        var path = d3.geoPath().projection(projection);
        var graticule = d3.geoGraticule()  // graticule generator
                    .step([10, 10]);

     
        this.station.append("path")
        .datum(graticule)  //data join with a single path
        .attr("class", "graticule")
        .attr("d", path);

        this.station.selectAll(".states")
        .data(la["features"])
        .enter()
        .append("path")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("class", "states")
        .attr("d", path);

        const hover = this.station.append('g')
        .attr("id", "hover-bubbletip")

        hover.append('rect')
        .attr("id", "hover-box")
        // .attr('rx', 5)
        // .attr('ry', 5)
        .attr('width', this.width/5 )
        .attr('height', this.height/15)
        .attr('fill', '#3B3E4A')
        .attr('opacity', 1)
        // .style('opacity', '100%')
        .attr('display', 'none')

        hover
        .append('text')
        .attr("id", "hover-region")
        .attr('text-anchor',"start")
        .attr('x', "5")
        .attr('y', this.height/24-10)

        hover
        .append('text')
        .attr("id", "hover-stations")
        .attr('text-anchor',"start")
        // .attr('text-anchor',"end")
        // .attr('x', width/5-5)
        // .attr('y', height/24)
        .attr('x', "5")
        .attr('y', this.height/24+10)

        var points = this.station.selectAll("circle")
        // .delay(5)  
        .data(region).enter()
        .append("circle")
        .attr("cx", function (d) { return projection(d.point)[0]; })
        .attr("cy", function (d) { return projection(d.point)[1]; })
        .attr("r", d => bubble(d.stations))
        // .style("fill", function (d) { return color(d.year);})
        .style("opacity", 0.8)
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)

        // points
        // .transition() // <------- TRANSITION STARTS HERE --------
        // .delay(function(d,i){ return 100*i; }) 
        // .duration(3000)
        // .attr("r", d => bubble(d.stations))

        function onMouseEnter(datum, index){
          // console.log(datum.area);
          
          d3.select(this)
          .style("fill", '#77d64b')
          .style("stroke", '#fff')
          .style("stroke-width", '2')
          
          hover
          .attr("transform", datum.area != 'North Hollywood'?
          "translate(" + 
          (projection(datum.point)[0]+bubble(datum.stations))+"," + 
          (projection(datum.point)[1]+bubble(datum.stations)) + ")":
          "translate(" + 
          (projection(datum.point)[0]-bubble(datum.stations)-this.width/5)+"," + 
          (projection(datum.point)[1]-bubble(datum.stations)-this.height/12) + ")")

          d3.select('#hover-region')
          .text(datum.area)

          d3.select('#hover-stations')
          .text(datum.stations+' stations')
          

          d3.select('#hover-station')
          .attr('transform', "translate("+this.width*4/25+",0)")

          d3.select('#hover-box')
          .attr('display', 'block')
          .attr("opacity", 1)
          .attr('x', 0)
          .attr('y', 0)



          
          
          // d3.select('#hover-region')
          // .attr('x', bubble(datum.stations))
          // .attr('y', bubble(datum.stations)/4)
          // .text(datum.area)
          // .style('fill', 'pink')
          

        }

        function onMouseLeave(datum, index){
          d3.select(this)
          .style("fill", 'black')
          .style("stroke-width", '0')

        }







      }
    }
  }
}
