import { Component, OnInit, ViewChild, ElementRef, Input, ViewEncapsulation } from "@angular/core";
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { StationService } from "../../core/services/station.service";
import { StationStatus } from "../../share/station.model";
import * as d3 from "d3";
import { ResizeService } from "src/app/core/services/resize.service";
import { DataModel} from "src/app/share/data.model";
import { QuarterModel} from "src/app/share/quarter.model";

@Component({
  selector: "app-station-status",
  templateUrl: "./station-status.component.html",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./station-status.component.css"]
})
export class StationStatusComponent implements OnInit {
  faInfoCircle = faInfoCircle;
  width: number;
  height: number = 100;
  margin = { top: 5, right: 20, bottom: 10, left: 100 };
  sortMethod: string = "BY_STATION";
  years: Array<number> = [2017, 2018, 2019];
  filterYear: number = 2019;
  topFiveStations: [];
  tooltipDestinations : String = `This section shows the top 5 destinations people head to from this station.
  You can click different year to see different destinations or click the bar chart to change the current station.
   `;
  svg;
  stationData: DataModel[];
  hourly;

  quarterData: QuarterModel[];
  quarter;

  @ViewChild("station_tooltip", { static: false }) tooltipRef: ElementRef;
  @Input() station: StationStatus;

  constructor(
    private stationService: StationService,
    private reszieService: ResizeService
  ) {
    this.topFiveStations = [];
    this.stationData = [];
    this.quarterData = [];
  }

  ngOnInit() {
    this.stationService.hoverStationSub.subscribe((station: StationStatus) => {
      // console.log(station);
      this.station = station;
      this.topFiveStations = this.stationService.getStationTopNInOut(
        this.station.id,
        5,
        true
      );

      this.stationData = this.stationService.getStation(this.station.id);
      this.quarterData = this.stationService.getQuarterData(this.station.id);

      // console.log(this.quarterData)

      this.updateData();
      this.updateSize();
      this.renderTravelTimesChart();
      this.renderHourlyChart();
      this.renderQuarterChart();
    });

    this.reszieService.resizeSub.subscribe(() => {
      this.updateChart();
    });
  }

  ngAfterViewInit() {}

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

  updateSize() {
    if (this.tooltipRef) {
      this.width = this.tooltipRef.nativeElement.offsetWidth;
      if (this.svg) {
        d3.select("#inOutBarChart").attr("width", this.width);
      }
      if (this.hourly) {
        d3.select("#hourlyChart").attr("width", this.width);

        var dash = document.getElementById("hover-tip");
        if (dash != null) {
          d3.select("#hover-tip").remove();
        }
        var listener = document.getElementById("listeners");
        if (listener != null) {
          d3.select("#listeners").remove();
        }
      }
      if (this.quarter) {
        d3.select("#QuarterChart").attr("width", this.width);
      }
      // this.height = this.tooltipRef.nativeElement.offsetHeight;
    }
  }

  onClickChangeYear(year) {
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
    this.renderHourlyChart();
    this.renderQuarterChart();
  }

  renderTravelTimesChart() {
    if (!this.tooltipRef || !this.tooltipRef.nativeElement || this.tooltipRef.nativeElement.offsetWidth === 0) {
      return;
    }
    var stationService = this.stationService;
    var data = this.topFiveStations;
    if (!data || data.length == 0) {
      d3.select("#inOutBarChart").style("display", "none");
    } else {
      d3.select("#inOutBarChart").style("display", "block");
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
      .attr("fill", "#529137")
      

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

    var stations = this.svg.selectAll(".stations").data(data, function(d: any) {
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

  renderHourlyChart() {
    var height = 300;
    var margin = { top: 50, right: 50, bottom: 30, left: 70 };
    var palette = ["#FFCF21", "#0191B4"];
    // console.log('Hello!!')
    if (!this.tooltipRef || !this.tooltipRef.nativeElement || this.tooltipRef.nativeElement.offsetWidth === 0) {
      return;
    }
    var data = this.stationData;
    // console.log(data);

    if (data.length == 0) {
      d3.select("#hourlyChart").style("display", "none");
    } else {
      d3.select("#hourlyChart").style("display", "block");
    }

    var hourly_d = [];
    var hourly_s = [];
    var houraly_list = [];

    for (var i = 0; i < 24; i++) {
      var d = data.filter(
        row => row.start_station == this.station.id && row.start_time_hour == i
      );
      var s = data.filter(
        row => row.end_station == this.station.id && row.end_time_hour == i
      );

      hourly_d.push({ time: i, value: d.length });
      hourly_s.push({ time: i, value: s.length });
      houraly_list.push([d.length, s.length]);
    }

    var hourly = [
      { type: "demand", values: hourly_d },
      { type: "supply", values: hourly_s }
    ];

    // console.log(hourly)

    this.width = this.tooltipRef.nativeElement.offsetWidth;
    // var chart_width = this.width - this.margin.left - this.margin.right;
    // var chart_height = this.height - this.margin.top - this.margin.bottom;
    var chart_width = this.width - margin.left - margin.right;
    var chart_height = height - margin.top - margin.bottom;

    if (!this.hourly) {
      this.hourly = d3
        .select("#hourlyChart")
        .attr("width", this.width)
        // .attr("height", this.height)
        .attr("height", height)
        .append("g")
        .attr(
          "transform",
          // "translate(" + this.margin.left + "," + this.margin.top + ")"
          "translate(" + margin.left + "," + margin.top + ")"
        );
    }

    var x = d3.scaleLinear().range([0, chart_width]);
    x.domain([0, 23]);

    var y = d3.scaleLinear().range([chart_height, 0]);

    y.domain([
      d3.min(hourly, function(h) {
        return d3.min(h.values, function(v) {
          return v.value;
        });
      }),
      d3.max(hourly, function(h) {
        return d3.max(h.values, function(v) {
          return v.value;
        });
      })
    ]);

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
      // d3.select('#hourlyY').remove()
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
      .domain(["demand", "supply"])
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

    var legendstr = ["Demand", "Supply"];

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
            return color("demand");
          } else {
            return color("supply");
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
      var rowname = ["Time", "Demand", "Supply", "Difference"];
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

      // .style('fill', datum[0]-datum[1] > 0 ? '#FF3D20': '#b5b5b5')
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

    this.width = this.tooltipRef.nativeElement.offsetWidth;
    var chart_width = this.width - this.margin.left - this.margin.right;
    var chart_height = this.height - this.margin.top - this.margin.bottom;
    var height = 300;
    var margin = { top: 50, right: 50, bottom: 30, left: 70 };


    if (!this.quarter) {
      this.quarter = d3
        .select("#QuarterChart")
        .attr("width", this.width)
        // .attr("height", this.height)
        .attr("height", height)
        .append("g")
        .attr(
          "transform",
          // "translate(" + this.margin.left + "," + this.margin.top + ")"
          "translate(" + margin.left + "," + margin.top + ")"
        );
    }


    // groupKey = "name"
    var keys = ['outtrip', 'intrip']
    var color = d3.scaleOrdinal()
                .range(["#2E344A", "#08968F"])
                    

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
        .domain([0, 500])
        .range([height, 0]); 

                        
                        
    this.quarter.selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr("transform", d => `translate(${x0(d.yr_q)},0)`)
        .selectAll("rect")
        .data(d => keys.map(key => ({key, value: d[key]})))
        .enter()
        .append('rect')
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => y(0) - y(d.value))
        .attr("fill", d => color(d.key));
                        
        this.quarter.append('g')               
        //    .attr("transform", "translate(0, "+ height+ ")")
        .call(d3.axisLeft(y).ticks(10))

        this.quarter.append('g')
        // .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x0))

                    // // console.log(color.domain())
                    // var legend = bar.append('g')
                    //    .attr('transform', `translate(${width},0)`)
                    //    .selectAll('g')
                    //    .data(color.domain().slice())
                    //    .enter()
                    //    .append('g')
                    //    .attr('transform', (d, i) => `translate(0,${i * 20 - 10})`)

                    // legend.append("rect")
                    //    .attr("x", -19)
                    //    .attr("width", 19)
                    //    .attr("height", 19)
                    //    .attr("fill", color);
 
                    // legend.append("text")
                    //    .attr("x", -60)
                    //    .attr("y", 9.5)
                    //    .attr("dy", "0.35em")
                    //    .text(d => d.slice(5, 9));

                    // bar.append("text")
                    //     .attr("text-anchor", "middle") 
                    //     .attr("transform", "translate(0,0)")
                    //     .attr('x', -10)
                    //     .attr('y', -15)
                    //     //    .attr("transform", "translate("+ (margin.top/5) +","+(height/2)+")rotate(-90)") 
                    //     .text("Rate");

                    // bar.append("text")
                    //     .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                    //     .attr("transform", "translate("+ (width/2) +","+(height+2*(margin.bottom/3))+")")  // centre below axis
                    //     .text("Countries");


  }
}
