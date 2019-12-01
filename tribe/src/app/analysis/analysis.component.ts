import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import * as d3 from "d3";
import { AnalysisService } from "../core/services/analysis.service";
import { ResizeService } from "../core/services/resize.service";

@Component({
  selector: "app-analysis",
  templateUrl: "./analysis.component.html",
  styleUrls: ["./analysis.component.css"],
  providers: [AnalysisService]
})
export class AnalysisComponent implements OnInit {
  margin = { top: 20, right: 20, bottom: 70, left: 70 };
  width: number = 500;
  height: number = 400;
  svg;
  passholderYears = ['2017' ,'2018', '2019'];
  passholderFilterYears = ['2018', '2019'];
  passholderData = [];
  bikeUsagesYears = ['2018', '2019'];
  bikeUsagesFilterYears = ['2018', '2019'];
  bikeUsageData = [];

  constructor(private analysisService: AnalysisService) {

    this.analysisService.passholderTypeSub.subscribe(data => {
      // console.log(data);
      this.passholderData = data;
    });

    this.analysisService.bikeUsageSub.subscribe(data => {
      // console.log(data);
      this.bikeUsageData = data;
    });
    
  }

  ngOnInit() {

  }

  onClickChangeYear(type, year){
    switch(type){
      case "PASSHOLDER":
        var data = this.passholderFilterYears;
        var index = data.indexOf(year);
        if(index == -1){
          data.push(year);
        }
        else{
          data.splice(index, 1);
        }
        this.analysisService.setPassholderFilterYears(this.passholderFilterYears);
        break;
      case "BIKEUSAGE":
        var data = this.bikeUsagesFilterYears;
        var index = data.indexOf(year);
        if(index == -1){
          data.push(year);
        }
        else{
          data.splice(index, 1);
        }
        this.analysisService.setBikeUsageFilterYears(this.bikeUsagesFilterYears);
        break;
    }
    
   
  }

  
}
