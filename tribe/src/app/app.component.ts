import { Component } from '@angular/core';

export class Car{
  id : number;
  manufacturer : string;
  model : string;
  displ : number;
  year : number;
  cyl : number;
}

const cars : Car[] = [
  { id: 1, manufacturer: 'audi', model: 'a4', displ: 1.8, year: 1999, cyl: 4 },
  { id: 2, manufacturer: 'audi', model: 'a4', displ: 2.0, year: 2008, cyl: 4 },
  { id: 3, manufacturer: 'audi', model: 'a4', displ: 2.8, year: 1999, cyl: 6 },
  { id: 4, manufacturer: 'audi', model: 'a4', displ: 3.1, year: 2008, cyl: 6 },
]

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tribe';
  cars = cars;
  servers : Array<any> = [
    { name: 'audi', content: 'a4'},
    { name: 'BMW', content: 'a1'},
    { name: 'Toyota', content: 'a5'},
  ]

  onMapCreated = function(map){
    console.log(map);
    this.servers.push(
      { name : map.name, content : map.content}
    )
  }
}
