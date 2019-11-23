import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class StationService  {

    stationsGeojsonSub = new EventEmitter<any>();
    stationsDemandSub = new EventEmitter<any>();
    stationsDemand = {};

    constructor(private http : HttpClient){
        this.getStationJSON().subscribe((data) => {
            this.stationsGeojsonSub.emit(data);
        })

        this.getStationInOut().subscribe((data) => {
            this.stationsDemandSub.emit(data);
            this.stationsDemand = data;
        })
    }

    private getStationJSON() : Observable<any>{
        // return this.http.get("./assets/metro-bike-share-stations.json");
        return this.http.get('https://bikeshare.metro.net/stations/json/')
    }

    private getStationInOut() : Observable<any>{
        return this.http.get('./assets/station_in_out.json')
    }

    getStationTopNInOut(stationId : number, n : number, out : boolean){
        if(this.stationsDemand.hasOwnProperty(stationId)){
            return out ? this.stationsDemand[stationId]["out"].slice(0, n) : this.stationsDemand[stationId]["in"].slice(0, n)
        }
        else{
            return []
        }
    }

    getStationAllInOutRecords(stationId: number){
        if(!this.stationsDemand.hasOwnProperty(stationId)){
            return [
                {
                    id : stationId,
                    type : "in",
                    value :0  
                },
                {
                    id : stationId,
                    type : "out",
                    value :0  
                }
            ]
        }

        return [
            {
                id : stationId,
                type : "in",
                value : this.stationsDemand[stationId]["in"].map(x => x[2]).reduce((x:number,y:number) => x+y)
            },
            {
                id : stationId,
                type : "out",
                value : this.stationsDemand[stationId]["out"].map(x => x[2]).reduce((x:number,y:number) => x+y)
            }
        ]
    }
}