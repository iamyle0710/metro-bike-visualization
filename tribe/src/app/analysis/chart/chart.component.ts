import { Component, OnInit, Input, ElementRef, ViewChild } from "@angular/core";
import * as d3 from "d3";
import { ResizeService } from "src/app/core/services/resize.service";
import { AnalysisService } from "src/app/core/services/analysis.service";
import { nest } from "d3";

@Component({
  selector: "app-chart",
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.css"]
})
export class ChartComponent implements OnInit {
  @ViewChild("chart", { static: false }) chartRef: ElementRef;
  @Input("type") type: string;
  @Input("chartData") chartData;
  @Input("chartId") chartId: string;

  data = [];
  margin = { top: 20, right: 20, bottom: 70, left: 70 };
  width: number = 500;
  height: number = 400;
  svg;

  constructor(private resizeService: ResizeService) {}

  ngOnInit() {}

  ngOnChanges() {
    this.updateChart();
  }

  ngAfterViewInit() {
    this.resizeService.resizeSub.subscribe(() => {
      this.updateChart();
    });
  }

  updateChart() {
    this.updateSize();
    switch (this.type.toUpperCase()) {
      case "LINE":
        this.renderLineChart();
        break;
      case "GROUOBARS":
        this.renderGroupBars();
        break;
    }
  }
  updateSize() {
    if (this.chartRef) {
      this.width = this.chartRef.nativeElement.offsetWidth;
      if (this.svg) {
        d3.select("#" + this.chartId).attr("width", this.width);
      }
    }
  }

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
    var y_max:number = d3.max(data, (d: any) => {
      var values : Array<number> = d.values.map((obj: any) => {
        return obj.counts;
      });
      return isNaN(d3.max(values)) ?  1 : d3.max(values);
    });

    var y = d3
      .scaleLinear()
      .domain([0, y_max])
      .range([chart_height, 0]);
    var color = d3.scaleOrdinal([
      // "#fbb4ae",
      // "#b3cde3",
      // "#ccebc5",
      // "#decbe4",
      // "#fed9a6",
      // "#ffffcc",
      // "#e5d8bd",
      // "#fddaec",
      // "#f2f2f2"
      '#22bb33',
      '#5be16a',
      '#cdf6d2',
      '#ffffff'
    ]);

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

      this.svg.append("g")
        .attr("class", "main_chart");

      this.svg
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0, " + chart_height + ")")
        .call(xAxis);

      this.svg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

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
        });

      this.svg
        .select("g.legend")
        .selectAll("text")
        .data(bikeTypeArr)
        .enter()
        .append("text")
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
        });
    }

    // this.svg.selectAll(".months").remove();
    var groups = this.svg.select("g.main_chart")
      .selectAll("g.bargroup")
      .data(data, (d) => {
        return d.key;
      })
    
    groups.enter()
      .append("g")
      .attr("class", "bargroup")
      .attr("transform", d => {
        return "translate(" + x(d.key) + ",0)";
      })
      .selectAll("rect")
      .data(function(d){
        // console.log(d);
        return d.counts.slice()
      })
      .enter()
      .append("rect")
      .attr("class", (d:any) => {
        return d.bike_type
      })
      .attr("fill", (d,i) => {
        return color(d.bike_type);
      })
      .attr("width", xInScale.bandwidth())
      .attr("height", (d) => {
        return chart_height - y(d.usage);
      })
      .attr("x", function(d, i) { 
        return xInScale(d.bike_type); 
      })
      .attr("y", function(d) { 
        return y(d.usage); 
      });

    groups.transition()
      .attr("transform", d => {
        return "translate(" + x(d.key) + ",0)";
      });

    groups.exit()
      // .transition()
      .remove();

    var bars = this.svg.selectAll(".bargroup")
      .selectAll("rect")
      .data(function(d:any){
        return d.counts.slice()
      })

    bars.transition()
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
      .duration(500);
    
    bars.exit()
      .transition()
      .attr("y", function(d) { return chart_height; })
      .attr("height", 0)
      .attr("width", 0)
      .remove();


    this.svg
      .select("g.legend")
      .remove();

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
      .attr("class", (d:String) => {
        return d
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
      .on("click", this.toggleBarSeries.bind(this));

    this.svg
      .select("g.legend")
      .selectAll("text")
      .data(bikeTypeArr)
      .enter()
      .append("text")
      .attr("class", (d:String) => {
        return d
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
    var color = d3.scaleOrdinal(['#DB9E89', '#A55220', '#144642', '#848B7E', '#C19426']);
    
    var xAxis = d3.axisBottom(x).ticks(5),
      yAxis = d3.axisLeft(y).ticks(5);

    var line = d3
      .line()
      .curve(d3.curveBasis)
      .x((d: any) => x(d.date))
      .y((d: any) => y(d.duration));

    var x_min : any = d3.min(data, (d: any) => {
      var value: any = d3.min(d.values, (d1: any) => {
        return d1.date;
      });
      return value;
    });
    var x_max : any = d3.max(data, (d: any) => {
      var value : any =  d3.max(d.values, (d1: any) => {
        return d1.date;
      });
      return value;
    });
    var y_max : number = d3.max(data, (d: any) => {
      var value : number =  d3.max(d.values, (d1: any) => {
        var v1 : number = d1.duration;
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
        .attr("class", (d:any) => d.key.replace(/\s/g, "_"))
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
        .on("click", this.toggleLineSeries.bind(this));

      this.svg
        .select("g.legend")
        .selectAll("text")
        .data(data, function(d) {
          return d.key;
        })
        .enter()
        .append("text")
        .attr("class", (d:any) => d.key.replace(/\s/g, "_"))
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
        .on("click", this.toggleLineSeries.bind(this));
    }

    

    this.svg.selectAll(".line_group").remove();

    data.forEach((d: any, i: number) => {
      this.svg
        .append("g")
        .attr("class", "line_group")
        .attr("id", d.key.replace(/\s/g, "_"))
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
      })
      .on("click", this.toggleLineSeries.bind(this));

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

  toggleLineSeries(d:any){
    var id = d.key.replace(/\s/g, "_");
    if(this.svg.select(".legend").selectAll("." + id).classed("selected")){
      this.svg.select(".legend").selectAll("." + id)
        .attr("opacity", 1)
        .classed("selected", false);

      this.svg.select(".line_group#" + id)
        .transition()
        .attr("opacity", 1);
    }
    else{
      this.svg.select(".legend").selectAll("." + id)
        .attr("opacity", 0.1)
        .classed("selected", true);

      this.svg.select(".line_group#" + id)
        .transition()
        .attr("opacity", 0);
    }
  }

  toggleBarSeries(d:String){
    var id = d;
    if(this.svg.select(".legend").selectAll("." + id).classed("selected")){
      this.svg.select(".legend").selectAll("." + id)
        .attr("opacity", 1)
        .classed("selected", false);

      this.svg.selectAll(".bargroup ." + id)
        .transition()
        .attr("opacity", 1);
    }
    else{
      this.svg.select(".legend").selectAll("." + id)
        .attr("opacity", 0.1)
        .classed("selected", true);

      this.svg.selectAll(".bargroup ." + id)
        .transition()
        .attr("opacity", 0);
    }
  }
}
