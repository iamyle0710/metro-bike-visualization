import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class MapService  {

    constructor(private http : HttpClient){}

    public getStationJSON() : Observable<any>{
        return this.http.get("./assets/metro-bike-share-stations.json");
        // return this.http.get('https://bikeshare.metro.net/stations/json/')
    }

    public getTop5Destinations() : Observable<any>{
        return this.http.get('./assets/station_out_top5.json')
    }
}