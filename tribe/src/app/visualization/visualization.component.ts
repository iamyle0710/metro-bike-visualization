import { Component, OnInit } from '@angular/core';
import { StationService } from '../core/services/station.service';
import { StationStatus } from '../share/station.model';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css']
})
export class VisualizationComponent implements OnInit {

  station : StationStatus;
  
  constructor(private stationServie: StationService){
    this.stationServie.hoverStationSub.subscribe((station : StationStatus) => {
      this.station = station;
    })
  }

  ngOnInit() {
  }

}
