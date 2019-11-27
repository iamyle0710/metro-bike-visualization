import { Component, OnInit, ViewChild, ElementRef, Input } from "@angular/core";
import { StationService } from "../../core/services/station.service";
import { StationStatus } from "../../share/station.model";
import * as d3 from "d3";
import { ResizeService } from 'src/app/core/services/resize.service';

@Component({
  selector: "app-station-status",
  templateUrl: "./station-status.component.html",
  styleUrls: ["./station-status.component.css"]
})
export class StationStatusComponent implements OnInit {
  // station: StationStatus;
  width: number;
  height: number = 100;
  margin = { top: 5, right: 20, bottom: 10, left: 100 };
  sortMethod: string = "BY_STATION";
  years : Array<number> = [2017, 2018, 2019];
  filterYear: number = 2019;
  topFiveStations: [];
  svg;
  @ViewChild("station_tooltip", { static: false }) tooltipRef: ElementRef;
  @Input() station : StationStatus;

  constructor(private stationService: StationService,
    private reszieService : ResizeService) {
    this.topFiveStations = [];
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.stationService.hoverStationSub.subscribe((station: StationStatus) => {
      // console.log(station);
      this.station = station;
      this.topFiveStations = this.stationService.getStationTopNInOut(
        this.station.id,
        5,
        true
      );
      this.updateData();
      this.updateSize();
      this.renderTravelTimesChart();
    });

    this.reszieService.resizeSub.subscribe(() => {
      this.updateChart();
    })
  }

  updateData() {
    this.topFiveStations = this.topFiveStations.sort((a: any, b: any) => {
      switch (this.sortMethod) {
        case "BY_STATION":
          return d3.descending(a.name, b.name);
          break;
        case "BY_TIMES":
          return d3.ascending(a.numberOftimes, b.numberOftimes);
          break;
      }
    });
  }

  updateSize(){
    if(this.tooltipRef){
      this.width = this.tooltipRef.nativeElement.offsetWidth;
      if(this.svg){
        d3.select("#inOutBarChart")
          .attr("width", this.width);
      }
      // this.height = this.tooltipRef.nativeElement.offsetHeight;
    }
  }

  onClickChangeYear(year){
    this.filterYear = year;
    this.stationService.setFilterYear(year);
  }

  onClickChangeSort(method) {
    switch (method) {
      case "BY_STATION":
      case "BY_TIMES":
        this.sortMethod = method;
        break;
    }

    this.updateData();
    this.renderTravelTimesChart();
  }

  updateChart() {
    // console.log("Station resized");
    var topFiveStations = this.stationService.getStationTopNInOut(
      this.station.id,
      5,
      true
    );
    this.updateSize();
    this.renderTravelTimesChart();
  }

  renderTravelTimesChart() {
    if (!this.tooltipRef) {
      return;
    }
    var data = this.topFiveStations;
    if(!data || data.length == 0){
      d3.select("#inOutBarChart")
        .style("display", "none")
    }
    else{
      d3.select("#inOutBarChart")
        .style("display", "block")
    }
    this.width = this.tooltipRef.nativeElement.offsetWidth;
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
    // maxValue = d3.max(stationInOutRecords["out"], function(d:any) { return +d.numberOftimes});
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
      .transition()
      .duration(300)
      .attr("y", function(d: any) {
        return y(d.stationId);
      })
      .attr("height", y.bandwidth())
      .attr("width", function(d: any) {
        return x(d.numberOftimes);
      })
      .attr("fill", "#529137");

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
      .attr("fill", "#529137");

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
      .attr("fill", "#fff")
      .attr("font-size", 10)
      .transition()
      .duration(400)
      .attr("x", function(d: any) {
        return x(d.numberOftimes) - 5 < 0 ? 0 : x(d.numberOftimes) - 5;
      })
      .attr("fill", "#fff")
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

    var stations = this.svg
      .selectAll(".stations")
      .data(data, function(d: any) {
        return d.stationId;
      });

    stations
      .enter()
      .append("text")
      .attr("class", "stations")
      .attr("x", -5)
      .attr("y", function(d: any) {
        return y(d.stationId) + y.bandwidth() / 2;
      })
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("text-transform", "uppercase")
      .attr("fill", "#fff")
      .attr("font-size", 8)
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
}
