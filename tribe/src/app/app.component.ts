import { Component } from '@angular/core';
import { StationService } from './core/services/station.service';
import { StationStatus } from './share/station.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tribe';
  station : StationStatus;

  constructor(private stationServie: StationService){
    this.stationServie.hoverStationSub.subscribe((station : StationStatus) => {
      this.station = station;
    })
  }
}
