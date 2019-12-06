import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

@Injectable()
export class LocationService{
    
    locationDataSub : EventEmitter<any> = new EventEmitter<any>();
    mapDataSub : EventEmitter<any> = new EventEmitter<any>();

    locationData = [];
    mapData = [];
  

    center : number[] = [-118.272892, 34.026283];

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
        return this.http.get('./assets/city_boundaries.json');
    }

    setCenter(center: number[]){
      this.center = center;
    }

    setLocationdata(data: any[]){
      this.locationData = data;
    }

    setMapdata(data: any[]){
      this.mapData = data;
    }
}