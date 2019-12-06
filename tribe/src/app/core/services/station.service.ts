import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, EventEmitter } from '@angular/core';
import { StationStatus } from 'src/app/share/station.model';
import { DataModel } from 'src/app/share/data.model';

@Injectable()
export class StationService  {

    stationsGeojsonSub = new EventEmitter<any>();
    stationGeojson = {};
    stationsDemandSub = new EventEmitter<any>();
    stationsDemand = {};
    filterYear : number = 2019;
    hoverStation: StationStatus = new StationStatus();
    hoverStationSub = new EventEmitter<StationStatus>();
    
    // metroJsonOb: {};
    metroJson: DataModel[];
    

    constructor(private http : HttpClient){
        this.getStationJSON().subscribe((data) => {
            this.stationGeojson = data;
            this.stationsGeojsonSub.emit(data);
        })

        this.getStationInOut().subscribe((data) => {
            this.stationsDemand = data;
            this.stationsDemandSub.emit(data);
        })

        this.getMetro().subscribe((data) => {
            this.metroJson = Object.values(data)
            // console.log(this.metroJson.filter(row => row.start_station == 3046 ||row.end_station == 3046))
            // console.log(typeof(this.metroJson))

            // console.log(typeof(this.metroJson))
            // console.log(this.metroJson)

        })
    }

    private getStationJSON() : Observable<any>{
        return this.http.get("assets/metro-bike-share-stations.json");
        // return this.http.get('https://bikeshare.metro.net/stations/json/')
    }

    private getStationInOut() : Observable<any>{
        return this.http.get('assets/station_in_out.json')
    }

    private getMetro() : Observable<DataModel>{
        return this.http.get<DataModel>('assets/metro-small.json');
    }

    getStationGeojson(){
        this.stationsGeojsonSub.emit(this.stationGeojson);
    }

    getStationTopNInOut(stationId : number, n : number, out : boolean = true){
        if(this.stationsDemand[this.filterYear].hasOwnProperty(stationId)){
            return out ? this.stationsDemand[this.filterYear][stationId]["out"].slice(0, n) : this.stationsDemand[this.filterYear][stationId]["in"].slice(0, n)
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

    getStations(){
        var stations = {};
        for(var year in this.stationsDemand){
            for(var station_id in this.stationsDemand[year]){
                if(!this.stationsDemand[year][station_id].name || this.stationsDemand[year][station_id].name.toUpperCase() == "UNKNOWN" || this.stationsDemand[year][station_id].name == ""){
                    continue;
                }
                stations[station_id] = {
                    id : station_id,
                    name : this.stationsDemand[year][station_id].name
                }
            }
        }

        return Object.values(stations);
    }

    getStationCircleLayout(stationId: String, filterYears : Array<string>){
        var data = {
            name : "",
            children : []
        };

        var summary = {
            inbound : {},
            outbound : {}
        };

        for(var i = 0; i < filterYears.length; i++){
            var year = filterYears[i];
            if(!this.stationsDemand[year] || !this.stationsDemand[year][stationId]){
                continue;
            }
            data.name = this.stationsDemand[year][stationId].name;
            this.stationsDemand[year][stationId]["in"].forEach((item: any) => {
                if(!summary.inbound.hasOwnProperty(item.name)){
                    summary.inbound[item.name] = 0;
                };
                summary.inbound[item.name] += +item.numberOftimes
            });

            this.stationsDemand[year][stationId]["out"].forEach((item: any) => {
                if(!summary.outbound.hasOwnProperty(item.name)){
                    summary.outbound[item.name] = 0;
                };
                summary.outbound[item.name] += +item.numberOftimes
            })
        }

        for(var type in summary){
            var child = {
                name : type,
                children : []
            };
            
            for(var stationName in summary[type]){
                child.children.push({
                    name : stationName,
                    value : summary[type][stationName]
                })
            }

            if(child.children.length > 0){
                data.children.push(child);
            }
        }
        
        return data;
    }

    getStation(stationId : number){
        if(this.metroJson){
            return this.metroJson.filter(row => (row.start_station == stationId  ||row.end_station == stationId) && row.end_time_year == this.filterYear);
        }
        
        return [];
    }

    setHoverStationById(stationId: number){
        if(this.stationGeojson || stationId == this.hoverStation.id){
            console.log(this.stationGeojson);
            var obj = this.stationGeojson.features.find(item => item.properties.kioskId == stationId);
            if(obj.properties){
                this.hoverStation.id = obj.properties.kioskId;
                this.hoverStation.name = obj.properties.name;
                this.hoverStation.bikesAvailable = obj.properties.bikesAvailable;
                this.hoverStation.docksAvailable = obj.properties.docksAvailable;
                this.hoverStation.destinations = this.getStationTopNInOut(this.hoverStation.id, 5);
                this.hoverStation.latitude = obj.properties.latitude;
                this.hoverStation.longitude = obj.properties.longitude;
                this.hoverStationSub.emit(this.hoverStation);
            }
        }
    }

    setHoverStation(e:any){
        if(!e || e.features[0].properties.kioskId == this.hoverStation.id ){
            return;
        }
        this.hoverStation.id = e.features[0].properties.kioskId;
        this.hoverStation.name = e.features[0].properties.name;
        this.hoverStation.bikesAvailable = e.features[0].properties.bikesAvailable;
        this.hoverStation.docksAvailable = e.features[0].properties.docksAvailable;
        this.hoverStation.destinations = this.getStationTopNInOut(this.hoverStation.id, 5);
        this.hoverStation.latitude = e.features[0].properties.latitude;
        this.hoverStation.longitude = e.features[0].properties.longitude;
        // if(this.stationsDemand[this.hoverStation.id]){
        //     this.hoverStation.totalInNumber = this.stationsDemand[this.hoverStation.id]["in"].map(x => x[2]).reduce((x:number,y:number) => x+y);
        //     this.hoverStation.totalOutNumber = this.stationsDemand[this.hoverStation.id]["out"].map(x => x[2]).reduce((x:number,y:number) => x+y)
        // }
        
        this.hoverStationSub.emit(this.hoverStation);
    }

    setFilterYear(year: number){
        this.filterYear = year;
        this.hoverStation.destinations = this.getStationTopNInOut(this.hoverStation.id, 5);
        this.hoverStationSub.emit(this.hoverStation);
    }
}