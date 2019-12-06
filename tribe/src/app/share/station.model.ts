export class StationStatus {
    public id : number;
    public name : string = '';
    public destinations : Array<any> = [];
    public latitude : number;
    public longitude : number;
    public bikesAvailable : number = 0;
    public docksAvailable : number = 0;
    public totalInNumber : number = 0;
    public totalOutNumber : number = 0;

    constructor(){
        // this.name = name;
        // this.bikesAvailable = bikesAvailable;
        // this.docksAvailable = docksAvailable;
    }

}