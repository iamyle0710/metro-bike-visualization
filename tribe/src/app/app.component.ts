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
  isLoadingDone : boolean = false;
  countDown : number = 0;
  countDownInterval; 

  // constructor(
  //   private resizeService: ResizeService){

  // }
  

  constructor(private stationServie: StationService,
    private resizeService: ResizeService){
    this.stationServie.hoverStationSub.subscribe((station : StationStatus) => {
      this.station = station;
    })

    if(!this.isLoadingDone){
      this.loading();
    }
  }

  loading(){
    this.countDownInterval = setInterval(() => {
      var progress : any = Math.random() * 20;
      progress = parseInt(progress);
      this.countDown = progress + this.countDown >= 100 ? 100 : progress + this.countDown;
      
      if(this.countDown == 100){
        this.isLoadingDone = true;
        clearInterval(this.countDownInterval);
      }
    }, 500)
  }

  onResize(event: any) {
    this.resizeService.resizeWindow();
  }
}
