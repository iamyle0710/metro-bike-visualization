import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { AnalysisService } from "../core/services/analysis.service";
import { StationService } from '../core/services/station.service';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: "app-analysis",
  templateUrl: "./analysis.component.html",
  styleUrls: ["./analysis.component.css"],
  providers: [AnalysisService]
})
export class AnalysisComponent implements OnInit {
  faInfoCircle = faInfoCircle;
  margin = { top: 20, right: 20, bottom: 70, left: 70 };
  width: number = 500;
  height: number = 500;
  svg;
  passholderYears = ['2017' ,'2018', '2019'];
  passholderFilterYears = ['2018', '2019'];
  passholderData = [];
  bikeUsagesYears = ['2018', '2019'];
  bikeUsagesFilterYears = ['2018', '2019'];
  bikeUsageData = [];
  bikeStation = {
    id : '3005',
    name : "7th & Flower"
  };
  bikeStations = [];
  bikeStationInOutData : any = {};
  bikeStationYears = ['2017','2018', '2019'];
  bikeStationFilterYears = ['2018', '2019'];
  tooltipBikeInOut = `You can select multiple years and a station to show all its inbound and outbound station`;
  tooltipPassholderType = `You can select multiple years or click the legend on the chart to show specific data`;
  tooltipBikeUsageGrowth = `You can select multiple years or click the legend on the chart to show specific data`;

  constructor(private analysisService: AnalysisService,
    private stationService : StationService) {

    this.analysisService.passholderTypeSub.subscribe(data => {
      // console.log(data);
      this.passholderData = data;
    });

    this.analysisService.bikeUsageSub.subscribe(data => {
      // console.log(data);
      this.bikeUsageData = data;
    });

    this.stationService.stationsDemandSub.subscribe((data)=>{
      this.bikeStations = this.stationService.getStations();
      this.bikeStationInOutData = this.stationService.getStationCircleLayout(this.bikeStation.id, this.bikeStationFilterYears);
    });
  }

  ngOnInit() {
    this.bikeStations = this.stationService.getStations();
    this.bikeStationInOutData = this.stationService.getStationCircleLayout(this.bikeStation.id, this.bikeStationFilterYears);
  }

  ngAfterViewInit(){
    this.bikeStations = this.stationService.getStations();
    this.bikeStationInOutData = this.stationService.getStationCircleLayout(this.bikeStation.id, this.bikeStationFilterYears);
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
      case "BIKESTATION":
        var data = this.bikeStationFilterYears;
        var index = data.indexOf(year);
        if(index == -1){
          data.push(year);
        }
        else{
          data.splice(index, 1);
        }
        this.bikeStationInOutData = this.stationService.getStationCircleLayout(this.bikeStation.id, this.bikeStationFilterYears);
        break;
    }
  }

  onClickChangeStation(station : { id: string, name : string}){
    this.bikeStation = station;
    this.bikeStationInOutData = this.stationService.getStationCircleLayout(this.bikeStation.id, this.bikeStationFilterYears);
  }

}
