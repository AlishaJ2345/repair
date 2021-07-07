import { Component, OnInit } from '@angular/core';
import { promoted } from 'src/app/models/event.model';


@Component({
  selector: 'app-talent',
  templateUrl: './talent.component.html',
  styleUrls: ['./talent.component.css']
})
export class TalentComponent implements OnInit {

  tabSelected:number = 0;
  lastTab:number = 0;
  candidate:any;

  constructor() { }

  ngOnInit() {
  }

  setCandidate(candy:promoted){
    console.log("inside parent "+candy.uid);
    this.candidate = candy;
    this.lastTab = this.tabSelected;
    this.tabSelected = 1;
  }

  goBack(mess){
    this.tabSelected = this.lastTab;
  }

}
