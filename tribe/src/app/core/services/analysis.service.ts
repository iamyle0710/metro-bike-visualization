import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

@Injectable()
export class AnalysisService{


    passholderTypeSub : EventEmitter<any> = new EventEmitter<any>();
    passholderType;
    passholderFilterYears = ['2018', '2019'];
    bikeUsageSub : EventEmitter<any> = new EventEmitter<any>();
    bikeUsage;
    bikeUsagesFilterYears = ['2018', '2019'];
    parseDate = d3.timeParse("%Y-%m");

    constructor(private http: HttpClient){
        
        this.getPassholderData().subscribe((data:[any]) => {
            // console.log(data);
            data.forEach((d:any) => {
                var month = d.month.length < 2 ? "0" + d.month : d.month;
                d.date = this.parseDate(d.year + "-" +month);
                d.duration = +d.duration;
            })

            this.passholderType = d3.nest()
                .key((d:any) => {
                    return d.passholder_type
                })
                .entries(data);
            
            for(var i = 0; i < this.passholderType.length; i++){
                if(this.passholderType[i].key == "Testing"){
                    this.passholderType.splice(i, 1);
                    break;
                }
            }

            this.updatePassholderData();
        });

        this.getBikeUsageData().subscribe((data: [any]) => {
            // console.log(data);
            data.forEach((d:any) => {
                var month = d.month.length < 2 ? "0" + d.month : d.month;
                d.date = d.year + "-" +month;
                d.counts = +d.counts;
            })

            this.bikeUsage = data;
            
            console.log(this.bikeUsage);
            this.updateBikeUsageData();
        })
    }

    private getPassholderData(){
        return this.http.get('./assets/duration_by_passholder_type.json');
    }

    private getBikeUsageData(){
        return this.http.get('./assets/biketype_counts.json');
    }

    updatePassholderData(){

        var years = this.passholderFilterYears || [];
        var filter_data = [];

        if(years.length > 0){
            this.passholderType.forEach((d:any) => {
                filter_data.push({
                    key : d.key,
                    values: d.values.slice()
                })
            });
    
            filter_data.forEach((d:any) => {
                d.values = d.values.filter(x => {
                    return years.indexOf(x.year) != -1;
                })
            })
        }
        else{
            filter_data = [];
        }
        
        this.passholderTypeSub.emit(filter_data);
    }

    updateBikeUsageData(){

        var years = this.bikeUsagesFilterYears || [];
        var filter_data = [];

        if(years.length > 0){
            this.bikeUsage.forEach((d:any) => {
                if(years.indexOf(d.year) >= 0){
                    filter_data.push(d);
                }
            });
        }
        else{
            filter_data = [];
        }
        
        filter_data = d3.nest()
            .key((d:any) => {
                return d.date
            })
            .entries(filter_data);

        filter_data.forEach((d:any) => {
            d.counts = [];
            d.values.forEach((dv:any) => {
                d.counts.push({
                    'bike_type' : dv.bike_type,
                    'usage' : dv.counts
                })
            });
        })
        this.bikeUsageSub.emit(filter_data);
    }
    
    setPassholderFilterYears(years){    
        this.passholderFilterYears = years;
        this.updatePassholderData();
    }

    setBikeUsageFilterYears(years){    
        this.bikeUsagesFilterYears = years;
        this.updateBikeUsageData();
    }
}