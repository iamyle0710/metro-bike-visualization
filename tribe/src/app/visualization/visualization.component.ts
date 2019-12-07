import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StationService } from '../core/services/station.service';
import { StationStatus } from '../share/station.model';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { ResizeService } from '../core/services/resize.service';

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css']
})
export class VisualizationComponent implements OnInit {

  faChevronUp = faChevronUp;
  station : StationStatus;
  width : number;

  @ViewChild("visualization", { static: true }) visualRef: ElementRef;

  constructor(private stationServie: StationService,
    private resizeService : ResizeService){
    this.stationServie.hoverStationSub.subscribe((station : StationStatus) => {
      this.station = station;
    })

    this.resizeService.resizeSub.subscribe(() => {
      this.updateSize();
    })
  }

  ngOnInit() {
  }

  ngAfterViewInit(){
    this.updateSize();
  }

  updateSize(){
    if(this.visualRef && this.visualRef.nativeElement.offsetWidth != 0){
      this.width = this.visualRef.nativeElement.offsetWidth;
    }
  }

}
