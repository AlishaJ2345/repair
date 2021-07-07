import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Speakers } from '../models/event.model';
import { LocalStorageService } from '../services/localStorage.service';
import { ResponsiveService } from '../services/responsive.service';

@Component({
  selector: 'app-speakers',
  templateUrl: './speakers.component.html',
  styleUrls: ['./speakers.component.css']
})
export class SpeakersComponent implements OnInit,AfterViewInit {

//  company  job_title   profile  link  
  speakers:Speakers[];
  attendence:any;
  screenWidth:string = 'sm';
  deviceWidth:number = window.innerWidth;
  cardStyle = {
    'width': '260px'
  }
  speakerStyle = {
    'width': '240px'
  }

  constructor(private local:LocalStorageService,private responsiveService: ResponsiveService,
    private cdr: ChangeDetectorRef) { 

    if(local.retreiveAttending() != undefined){
      this.attendence = local.retreiveAttending();
      this.speakers = this.attendence.speakers;
    }
  }

  ngAfterViewInit(): void {
    this.onResize();
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
    let ans = (this.deviceWidth - 32);
    this.cardStyle = {
      'width': `${ans}px`
    } 
    if (this.screenWidth == 'sm') {
      this.cardStyle = {
        'width': `${ans}px`
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
    let test = {
      'width': `${ans}px`
    }
    //console.log("cardStyle "+ this.cardStyle.width);
    //return this.cardStyle;
  }

  getSpeakerStyle(){
    this.speakerStyle = {'width': '200px'};
    //this.deviceWidth = window.innerWidth;
    if (this.screenWidth == 'sm') {
      this.speakerStyle = {
        'width': '250px'
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

}
