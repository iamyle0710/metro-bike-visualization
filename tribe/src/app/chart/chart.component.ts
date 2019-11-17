import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

import * as d3 from 'd3';
export interface DataType { cat : string; value : number;}

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {

    d3.csv('assets/data.csv', function (d: any) {
      return {
        cat: d.cat, 
        value: +d.value
      };
    })
    .then(function (data) {
        d3.select('#chart-svg').selectAll('rect')
          .data(data)
          .enter()
          .append('rect')
          .attr('y', function (d: {cat: string; value: number}, i: number) {
            return i * 25;
          })
          .attr('width', function (d: any) {
            return d.value * 100;
          })
          .attr('height', 20);
      }
    )
  }
}
