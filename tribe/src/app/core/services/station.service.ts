import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, EventEmitter } from '@angular/core';
import { StationStatus } from 'src/app/share/station.model';

@Injectable()
export class StationService  {

    stationsGeojsonSub = new EventEmitter<any>();
    stationsDemandSub = new EventEmitter<any>();
    stationsDemand = {};
    hoverStation: StationStatus = new StationStatus();
    hoverStationSub = new EventEmitter<StationStatus>();
    

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
            return {
                in : [],
                out : []
            }
        }

        return {
            in : this.stationsDemand[stationId]["in"],
            out : this.stationsDemand[stationId]["out"]
        }

    }

    setHoverStation(e:any){
        if(!e){
            return;
        }
        this.hoverStation.id = e.features[0].properties.kioskId;
        this.hoverStation.name = e.features[0].properties.name;
        this.hoverStation.bikesAvailable = e.features[0].properties.bikesAvailable;
        this.hoverStation.docksAvailable = e.features[0].properties.docksAvailable;
        // if(this.stationsDemand[this.hoverStation.id]){
        //     this.hoverStation.totalInNumber = this.stationsDemand[this.hoverStation.id]["in"].map(x => x[2]).reduce((x:number,y:number) => x+y);
        //     this.hoverStation.totalOutNumber = this.stationsDemand[this.hoverStation.id]["out"].map(x => x[2]).reduce((x:number,y:number) => x+y)
        // }
        
        this.hoverStationSub.emit(this.hoverStation);
    }
}