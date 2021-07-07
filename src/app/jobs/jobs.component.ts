import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalStorageService } from '../services/localStorage.service';
import { Company } from '../models/event.model';
import { ResponsiveService } from '../services/responsive.service';


Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})



export class JobsComponent implements OnInit, OnDestroy {


  attending:any;
  jobs:Company[] = [];
  screenWidth:string = 'sm';
  deviceWidth:number = window.innerWidth;
  value:number = 1;
  cardStyle = {
    'width': '280px'
  }
  speakerStyle = {
    'width': '250px'
  }

  constructor(private local:LocalStorageService,private responsiveService: ResponsiveService) { 

    if(local.retreiveAttending() != undefined){
      this.attending = local.retreiveAttending();
      this.jobs = this.attending.jobs;
      //console.log("jobs: "+this.jobs);
    }
  }

  radioChange(selected){
    //console.log("selected"+ selected.value);
    if (selected.value == 1){
      this.sortBooth();
    } else if (selected.value == 2 ){
      this.sortName();
    }
  }

  sortBooth(){
    this.jobs.sort((a,b) => a.booth_number.localeCompare(b.booth_number));
  }

  sortName(){
    this.jobs.sort((a,b) => a.org_name.localeCompare(b.org_name));
  }

  ngOnInit() {
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = window.innerWidth;
      if (isMobile) {
        //console.log('Mobile device detected')
        this.screenWidth = this.responsiveService.screenWidth;
      }
      else {
        //console.log('Desktop detected')
        this.screenWidth = this.responsiveService.screenWidth;
      }
      this.getCardStyle();
      this.getSpeakerStyle();
    });
    this.onResize();
  }

  onResize() {
    this.responsiveService.checkWidth();
  }

  getCardStyle(){
    //let ans = (this.deviceWidth - 36);
    if (this.screenWidth == 'sm') {
      this.cardStyle = {
        'width': `${this.deviceWidth - 36}px`
      } 
    } else if (this.screenWidth == 'md') {
      this.cardStyle = {
        'width': '500px'
      }
    } else if (this.screenWidth == 'lg') {
      this.cardStyle = {
        'width': '900px'
      }
    }
    //return this.cardStyle;
  }

  getSpeakerStyle(){
    let ans = (this.deviceWidth - 72);
    this.speakerStyle = {'width': '200px'};
    //this.deviceWidth = window.innerWidth;
    if (this.screenWidth == 'sm') {
      this.speakerStyle = {
        'width': '240px'
      }
    } else if (this.screenWidth == 'md') {
      this.speakerStyle = {
        'width': '350px'
      }
    } else if (this.screenWidth == 'lg') {
      this.speakerStyle = {
        'width': '500px'
      }
    }
  }

  ngOnDestroy(): void {
    
  }

}
