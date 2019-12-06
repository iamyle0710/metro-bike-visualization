import { Component } from '@angular/core';
import { StationService } from './core/services/station.service';
import { StationStatus } from './share/station.model';
import { ResizeService } from './core/services/resize.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tribe';
  station : StationStatus;

  // constructor(
  //   private resizeService: ResizeService){

  // }
  

  constructor(private stationServie: StationService,
    private resizeService: ResizeService){
    this.stationServie.hoverStationSub.subscribe((station : StationStatus) => {
      this.station = station;
    })
  }

  onResize(event: any) {
    this.resizeService.resizeWindow();
  }
}
