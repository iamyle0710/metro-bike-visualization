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
  noData : boolean  = false;
  hidden : Array<String> = [];
  svg;
  node;
  label;
  view;

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
      case "CIRCLE_PACKING":
        this.renderCirclePacking();
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
        // if (d.data.value) {
        //   text = text + "(" + d.data.value + ")";
        // }
        return text;
      });

      this.zoomCirclePackingTo([root.x, root.y, root.r * 2]);
  
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

  updateFilters(id){
    var index = this.hidden.indexOf(id);
    if(index == -1){
      this.hidden.push(id);
    }
    else{
      this.hidden.splice(index, 1);
    }
  }
  toggleLineSeries(d: any) {
    var id = d.key.replace(/\s/g, "_");
    var hiddens = this.hidden;
    this.updateFilters(id);

    this.svg
        .selectAll(".legend text")
        .attr("opacity", function(){
          var classes = d3.select(this).attr("class");
          var id = classes.split(" ")[0];
          return hiddens.indexOf(id) == -1 ? 1 : 0.3;
        })
        .classed("selected", function(){
          var classes = d3.select(this).attr("class");
          var id = classes.split(" ")[0];
          return hiddens.indexOf(id) == -1 ? true : false;
        });

    this.svg
      .selectAll(".legend rect")
      .attr("opacity", function(){
        var classes = d3.select(this).attr("class");
        var id = classes.split(" ")[0];
        return hiddens.indexOf(id) == -1 ? 1 : 0.3;
      })
      .classed("selected", function(){
        var classes = d3.select(this).attr("class");
        var id = classes.split(" ")[0];
        return hiddens.indexOf(id) == -1 ? true : false;
      });

    this.svg.selectAll(".line_group")
      .transition()
      .duration(300)
      .attr("opacity", function(){
        var id = d3.select(this).attr("id");
        return  hiddens.indexOf(id) == -1 ? 1 : 0;
      });
  
  }

  toggleBarSeries(d: String) {
    var id = d;
    var hiddens = this.hidden;
    this.updateFilters(id);

    this.svg
        .selectAll(".legend text")
        .attr("opacity", function(){
          var classes = d3.select(this).attr("class");
          var id = classes.split(" ")[0];
          return hiddens.indexOf(id) == -1 ? 1 : 0.3;
        })
        .classed("selected", function(){
          var classes = d3.select(this).attr("class");
          var id = classes.split(" ")[0];
          return hiddens.indexOf(id) == -1 ? true : false;
        });

    this.svg
      .selectAll(".legend rect")
      .attr("opacity", function(){
        var classes = d3.select(this).attr("class");
        var id = classes.split(" ")[0];
        return hiddens.indexOf(id) == -1 ? 1 : 0.3;
      })
      .classed("selected", function(){
        var classes = d3.select(this).attr("class");
        var id = classes.split(" ")[0];
        return hiddens.indexOf(id) == -1 ? true : false;
      });

    this.svg
      .selectAll(".bargroup rect")
      .transition()
      .duration(300)
      .attr("opacity", function(){
        var id = d3.select(this).attr("class");
        return  hiddens.indexOf(id) == -1 ? 1 : 0;
      });

    // if (
    //   this.svg
    //     .select(".legend")
    //     .selectAll("." + id)
    //     .classed("selected")
    // ) {
    //   this.svg
    //     .select(".legend")
    //     .selectAll("." + id)
    //     .attr("opacity", 1)
    //     .classed("selected", false);

    //   this.svg
    //     .selectAll(".bargroup ." + id)
    //     .transition()
    //     .duration(300)
    //     .attr("opacity", 1);
    // } else {
    //   this.svg
    //     .select(".legend")
    //     .selectAll("." + id)
    //     .attr("opacity", 0.1)
    //     .classed("selected", true);

    //   this.svg
    //     .selectAll(".bargroup ." + id)
    //     .transition()
    //     .duration(300)
    //     .attr("opacity", 0);
    // }
  }

  zoomCirclePacking(d) {
    const focus0 = focus;

    var focus = d;

    const transition = this.svg
      .transition()
      .duration(d3.event.altKey ? 7500 : 750)
      .tween("zoom", d => {
        const i = d3.interpolateZoom(this.view, [focus.x, focus.y, focus.r * 2]);
        return t => this.zoomCirclePackingTo(i(t));
      });

    this.label
      .filter(function(d) {
        return d.parent === focus || this.style.display === "inline";
      })
      .transition(transition)
      .style("fill-opacity", d => (d.parent === focus ? 1 : 0))
      .on("start", function(d) {
        if (d.parent === focus) this.style.display = "inline";
      })
      .on("end", function(d) {
        if (d.parent !== focus) this.style.display = "none";
      });
  }

  zoomCirclePackingTo(v) {
    const k = this.width / v[2];

    this.view = v;
    this.label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    this.node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    this.node.attr("r", d => d.r * k);
  }
}
