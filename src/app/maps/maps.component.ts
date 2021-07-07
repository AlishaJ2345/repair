import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subscribable, Subscription } from 'rxjs';
import { LocalStorageService } from '../services/localStorage.service';
import { ResponsiveService } from '../services/responsive.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit, OnDestroy {
  currentEvent:string;
  sub;
  maps:any = [];
  preview:boolean = false;
  fullScreen:any = '../../assets/pics/aut.gif';
  img;
  lens; result; cx; cy; pos; x; y;
  lrgImg:boolean = false;
  largeImage:string;
  // subscription
  mapsSub:Subscription;
  attendence:any;
  data:any;
  screenWidth:string = 'sm';
  deviceWidth:number = window.innerWidth;

  constructor(private route:ActivatedRoute, private _http:HttpClient,
    private router:Router, private local:LocalStorageService
    ,private responsiveService: ResponsiveService) { 
      if(local.retreiveAttending() != undefined){
        this.attendence = local.retreiveAttending();
        //console.log(this.attendence);
        this.maps = this.attendence.maps;
        //console.log("maps: "+this.maps);
      }
      if(local.retreiveEventID != undefined){
        this.currentEvent = local.retreiveEventID();
      }
  }

  fullScreenPic(index){
    this.largeImage = this.maps[index].map_url;
    //console.log('go to fullscreen pic '+ this.largeImage);
    this.lrgImg = !this.lrgImg;
  }

  fullScreenPicOff(){
    this.lrgImg = !this.lrgImg;
  }

  updateUrl(index){
    this.maps[index].map_url = '../../../../assets/pics/City-campus-map.PNG';
  }

  public onFloatClick(index) {
    this.fullScreen = this.maps[index].map_url;
    this.router.navigate(['zoom', this.fullScreen]);
    //this.preview = !this.preview;
  }

  offFloatClick(){
    this.preview = !this.preview;
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
    });
    this.onResize();
  }

  onResize() {
    this.responsiveService.checkWidth();
  }

  getImageStyle(){
    let style = {};
    if (this.screenWidth == 'sm') {
      style = {
        'width': '260px'
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'width': '380px'
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'width': '480px'
      }
    }
    return style;
  }

  getCardStyle(){
    let style = {};
    if (this.screenWidth == 'sm') {
      style = {
        'width': `${this.deviceWidth - 36}px`
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'width': `${this.deviceWidth - 80}px`
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'width': '900px'
      }
    }
    return style;
  }

  getMaps(){
    //console.log('maps eventID: '+this.currentEvent);
    this.mapsSub = this._http.post(`${environment.API_URL}/getmapsforevent`, { eid: this.currentEvent })
    .subscribe(
      (result) => {
        if (result) {
          //console.log(Object.keys(result).map(k => result[k]));
          //console.log(result['maps']);
          

          this.maps = result['maps'];                 //all posts retreived
          //console.log(this.maps[0]);
          //this.fullScreen = this.maps[0].map_url;

        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

  ngOnDestroy() {
    if(this.mapsSub != undefined){
      this.mapsSub.unsubscribe();
    }
  }

}
