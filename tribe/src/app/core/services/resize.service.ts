import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ResizeService{
    resizeSub : EventEmitter<any> = new EventEmitter();

    constructor(){

    }

    resizeWindow(){
        this.resizeSub.emit();
    }
}