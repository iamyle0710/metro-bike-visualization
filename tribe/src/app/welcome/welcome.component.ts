import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import * as d3 from "d3";
import { LocationService } from "../core/services/location.service";
import { ResizeService } from "../core/services/resize.service";
import { Router } from '@angular/router';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  @ViewChild("stations", { static: true }) chartRef: ElementRef;
  @ViewChild("welcome_page", {static: true}) welcomePageRef : ElementRef;
  width: number;
  height: number;
  pageWidth: number;
  pageHeight: number;
  locationData = [];
  mapData = [];
  station;
  faInfoCircle = faInfoCircle;

  tooltipArea: String = `Metro bike share stations in Pasadena has been inactive since 2018
   `;

  tooltipMap: String = `The circles on map show active metro bike share stations in 2019. You may click on any circle to 
  get more insights around the selected area.
  `;



  
  constructor(private locationService: LocationService, private resizeService: ResizeService, private router:Router) {

    if (this.locationService.locationData.length === 0){
      this.locationService.locationDataSub.subscribe(data => {
        this.locationData = data;
        this.locationService.setLocationdata(data)
        // console.log(this.locationService.locationData);
        this.updateChart();
      });      
    }else{
      this.locationData = this.locationService.locationData;
      // console.log(this.locationData);
      this.updateChart();
    }

    if (this.locationService.mapData.length === 0){
      this.locationService.mapDataSub.subscribe(data => {
          this.mapData= data;
          this.locationService.setMapdata(data)
          console.log(this.locationService.mapData);
          this.updateChart();
        });     
    }else{
      this.mapData = this.locationService.mapData;
      console.log(this.mapData);
      this.updateChart();
    }
  }

  ngOnInit() {
    this.resizeService.resizeSub.subscribe(() => {
      // console.log('4');
      this.updateChart();
      
    });
    // console.log('5');
    this.updateChart();
  };

  ngOnChanges() {
    // console.log('3');
    this.updateChart();
    
  };


  updateChart() {
    this.updateSize();
    this.renderChart();
  }

  updateSize() {
    if (this.chartRef) {
      this.width = this.chartRef.nativeElement.offsetWidth;
      this.height = this.chartRef.nativeElement.offsetHeight;
    }

    if (this.welcomePageRef && this.welcomePageRef.nativeElement.offsetWidth !== 0){
      this.pageWidth = this.welcomePageRef.nativeElement.offsetWidth;
      this.pageHeight = this.welcomePageRef.nativeElement.offsetHeight;
    }

    if (this.width && this.height){
      this.station = d3.select("#stations")
    }

    // console.log(this.width)
    // console.log(this.height)
  }
  
  renderChart(){
    // console.log(this.locationData.length, this.mapData.length, this.chartRef);
    if(this.locationData.length !=0 && this.mapData.length != 0 && this.chartRef){
      if (this.station) {

        var station = this.locationData;
        var la:any = this.mapData;

        var width = this.width;
        var height = this.height;

        var scale = Math.sqrt(width*width+height*height)*32.5
        
        const regionset = [...new Set(station.map(item => item.Region))];

        var region = [];
        for (var i = 0; i < regionset.length; i++) {
          // console.log(regionset[i])
          var arr = station.filter(item => item.Region == regionset[i] && item.Status == 'Active');
          if(arr.length != 0){
            var lons = arr.map(item => item.lon).reduce((prev, next) => prev + next);
            var lats = arr.map(item => item.lat).reduce((prev, next) => prev + next);
            // console.log(lons/arr.length);
            region.push({
                area: regionset[i],
                stations: arr.length,
                point: [lons/arr.length, lats/arr.length]
            });
          }
        }

        // var color = d3
        // .scaleOrdinal()
        // .domain(regionset)
        // .range(['#FF3D20','#00C7D5', '#3A5154', '#9AACB8'])

        var bubble = d3
        .scaleSqrt()
        .domain([d3.min(region, r => r.stations), d3.max(region, r => r.stations)])
        .range([20*scale/40000, 70*scale/40000])

        

        var projection = d3.geoMercator()
                    .scale(scale)
                    // .center([-118.361149, 34.109704])
                    .center([-118.251179, 34.117857])

        var path = d3.geoPath().projection(projection);
     
        var border = this.station.selectAll(".states")
        .data(la["features"])
        
        
        border
        .enter()
        .append("path")
        .attr("class", "states")
        .attr("d", path);

        border
        .transition()
        .attr("d", path);

        border
        .exit()
        .remove()

        const boxHeight = 36;
        const boxWidth = 175;


        const hover = this.station.append('g')
        .attr("id", "hover-bubbletip")
        .attr('display', 'none')

        hover.append('rect')
        // .attr("id", "hover-left")
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('fill', '#0E8BA5')
        .attr('x', 0)
        .attr('y', 0)

        hover.append('rect')
        // .attr("id", "hover-right")
        .attr('width', boxHeight+3)
        .attr('height', boxHeight)
        .attr('fill', '#F8F9FB')
        .attr('stroke-width', '0')
        .attr('x', boxWidth-boxHeight*3/4)
        .attr('y', 0)
        // .style('opacity', '100%')


        hover
        .append('text')
        .attr("id", "hover-region")
        .attr('text-anchor',"start")
        .attr('dominant-baseline',"middle")
        .attr('x', "10")
        .attr('y', boxHeight/2)
        .style('fill', '#BECBE1')
        .style('font-weight', 'bold')

        hover
        .append('text')
        .attr("id", "hover-stations")
        .attr('dominant-baseline',"middle")
        // .attr('text-anchor',"start")
        .attr('text-anchor',"end")
        .attr('x', boxWidth-boxHeight*3/4+boxHeight-5)
        .attr('y', boxHeight/2)
        .style('fill', '#2D4159')

        var points = this.station.selectAll("circle")
        // .delay(5)  
        .data(region)
        
        points.enter()
        .append("circle")
        .style('fill', '#2F515C')
        .attr("cx", function (d) { return projection(d.point)[0]; })
        .attr("cy", function (d) { return projection(d.point)[1]; })
        .attr("r", function (d) { 
          console.log(bubble(d.stations));
          return bubble(d.stations); })
        // .style("fill", function (d) { return color(d.year);})
        .style("opacity", 0.8)
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)
        .on('click', onClick.bind(this))

        points
        .transition()
        .attr("cx", function (d) { return projection(d.point)[0]; })
        .attr("cy", function (d) { return projection(d.point)[1]; })
        .attr("r", function (d) { 
          console.log(bubble(d.stations));
          return bubble(d.stations); })
        // .on("mouseenter", onMouseEnter)
        // .on("mouseleave", onMouseLeave)
        // .on('click', onClick.bind(this));

        points
        .exit()
        .remove()

        var texts = d3.selectAll('.area')
        .on("mouseenter", onText)
        .on("mouseleave", outText)


        function onClick(datum){
          this.locationService.setCenter(datum.point);
          points.exit().remove();
          console.log(this.locationService.center);
          this.router.navigate(['/visualization']);
          // console.log(datum.point)
        }


        function onText(){
          var area = this.innerHTML == 'Downtown LA'? 'DTLA': this.innerHTML;
          var datum = region.filter(item => item.area == area)[0];
          console.log(datum)
          console.log(region)

          if(area == 'Pasadena'){
            d3.select(this)
            .style('background-color', 'rgba(0, 203, 241, 0.6)')

          
          }else{
            d3.select(this)
            .style('background-color', 'rgba(0, 203, 241, 0.6)')
            
            
            
            d3.select('#hover-bubbletip')
            .attr('display', 'block')

            console.log(datum.area)
            
            hover
            .attr("transform", (datum.area != 'North Hollywood' && datum.area != 'Port of LA') ?
            "translate(" + 
            (projection(datum.point)[0]+bubble(datum.stations))+"," + 
            (projection(datum.point)[1]+bubble(datum.stations)) + ")":
            "translate(" + 
            (projection(datum.point)[0]+bubble(datum.stations))+"," + 
            (projection(datum.point)[1]-bubble(datum.stations)-boxHeight) + ")")
            
            d3.select('#hover-region')
            .text(datum.area=='DTLA'? 'Downtown LA': datum.area )

            d3.select('#hover-stations')
            .text(datum.stations)

            d3.select('#hover-station')
            .attr('transform', "translate("+boxWidth*2/5+",0)")

            }  
        }

        function outText(){
          d3.select('#hover-bubbletip')
          .attr('display', 'none')
          d3.select(this)
          .style('background-color', 'rgba(0, 203, 241, 0)')

        }


        function onMouseEnter(datum, index){
          
          d3.select(this)
          .style("fill", '#0E8BA5')

          d3.select('#hover-bubbletip')
          .attr('display', 'block')
          
          hover
          .attr("transform", (datum.area != 'North Hollywood' && datum.area != 'Port of LA') ?
          "translate(" + 
          (projection(datum.point)[0]+bubble(datum.stations))+"," + 
          (projection(datum.point)[1]+bubble(datum.stations)) + ")":
          "translate(" + 
          (projection(datum.point)[0]+bubble(datum.stations))+"," + 
          (projection(datum.point)[1]-bubble(datum.stations)-boxHeight) + ")")
          
          d3.select('#hover-region')
          .text(datum.area)
          .text(datum.area=='DTLA'? 'Downtown LA':datum.area )


          d3.select('#hover-stations')
          .text(datum.stations)

          d3.select('#hover-station')
          .attr('transform', "translate("+boxWidth*2/5+",0)")
        }

        function onMouseLeave(datum, index){
          d3.select(this)
          .style("fill", '#2F515C')
          .style("stroke-width", '0')

          d3.select('#hover-bubbletip')
          .attr('display', 'none')

        }
      }
    }
  }
}
