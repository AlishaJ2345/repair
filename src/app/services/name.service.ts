import { Injectable } from '@angular/core';

@Injectable()
export class NameService {

  name:string = "NAME NOT SET";
  event:string = "EVENT NOT SET";

  setEventName(name){
    this.event = name;
  }

  getEventName(){
    return this.event;
  }

  setName(name){
    this.name = name;
  }
  getName(){
    return this.name;
  }
}
