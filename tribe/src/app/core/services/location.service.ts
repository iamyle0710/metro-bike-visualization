import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

@Injectable()
export class LocationService{
    
    locationDataSub : EventEmitter<any> = new EventEmitter<any>();
    mapDataSub : EventEmitter<any> = new EventEmitter<any>();

    constructor(private http: HttpClient){
        
        this.getLocationData().subscribe((data:[any]) => {
          this.locationDataSub.emit(data)
        });

        this.getMapData().subscribe((data: [any]) => {
          this.mapDataSub.emit(data)
        })
    }

    private getLocationData(){
        return this.http.get('./assets/stationpoint.json');
    }

    private getMapData(){
        return this.http.get('./assets/city_boundaries.geojson');
    }

    // getPoints(){
    //   console.log(this.locationData);
    //   return this.locationData;
    // }

    // getMap(){
    //   console.log(this.mapData);
    //   return this.mapData;
  // }
}