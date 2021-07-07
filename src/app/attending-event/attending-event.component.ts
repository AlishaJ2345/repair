import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocalStorageService } from '../services/localStorage.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { Posts, maps, Speakers } from '../models/event.model';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Subscription } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/forkJoin';
//import * as moment from 'moment';
import * as moment from 'moment-mini-ts'
import { ResponsiveService } from '../services/responsive.service';


@Component({
  selector: 'app-attending-event',
  templateUrl: './attending-event.component.html',
  styleUrls: ['./attending-event.component.css']
})
export class AttendingEventComponent implements OnInit, OnDestroy {

  key: any;
  eid: any;
  currentPic: string;
  eventPic: string;
  accountPic: string;
  postSub: Subscription;
  mapsSub: Subscription;
  speakerSub: Subscription;
  attending:any;
  event: any[] = [];
  maps: any[] = [];
  speakers: any[] = [];
  recordEvent: any[];
  gettingEvent: boolean = false;
  loadingEvent: boolean = false;
  attendingEvent: string = 'Event Details';
  mapInsructions: string = 'Click a map to enlarge';
  event_name:string='temp event name';
  keyType:boolean = false;
  screenWidth:string = 'sm';
  deviceWidth:number = window.innerWidth;
  trunc:boolean = true;


  constructor(private local: LocalStorageService,
    private route: ActivatedRoute,
    private router: Router,
    private _http: HttpClient,
    private toast: ToastService,private responsiveService: ResponsiveService) {
    this.key = this.local.retreiveAll();
    if(this.key != undefined){
      this.accountPic = this.key.pic_url;
      this.keyType = (this.key.type = 'employer')? true : false;
    } else {
      this.accountPic = '../../assets/pics/profile.jpg';
    }
    if(this.local.retreiveEventID() != undefined){
      this.eid = this.local.retreiveEventID();
    }
    if(this.local.retreiveAttending() != undefined){
      this.attending = this.local.retreiveAttending();
      this.currentPic = this.attending.event.picurl;
      this.event = this.attending.event;
      this.maps = this.attending.maps;
      this.speakers = this.attending.speakers;
      this.event_name = this.attending.event.event_name;
    }

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

  getPicStyle(){
    let style = {};
    if (this.screenWidth == 'sm') {
      style = {
        'width': '255px'
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'width': '380px'
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'width': '475px'
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

  edit(eid){
    this.router.navigate(['edit', eid]);
  }

  getAttending(): Observable<any> {
    const eventSub = this._http.post<Posts[]>(`${environment.API_URL}/post`, { eid: this.eid }).map(res => res['post'][0]);
    const mapsSub = this._http.post<maps[]>(`${environment.API_URL}/getmapsforevent`, { eid: this.eid }).map(res => res['maps']);
    const speakersSub = this._http.post<Speakers[]>(`${environment.API_URL}/getspeakersforevent`, { eid: this.eid }).map(res => res['speakers']);

    return Observable.forkJoin([eventSub, mapsSub, speakersSub])
      .map(responses => {
        return responses;
      });
  }


  setMap(index) {
    this.currentPic = this.maps[index].map_url;

    // add text = pinch zoom screen
    this.mapInsructions = 'Pinch Zoom to mangnify map';
  }

  fromNow(start) {
    let time = Date.now();
    const now = moment(time);
    const expiration = moment(start);

    // get the difference between the moments
    const diff = expiration.diff(now);

    //express as a duration
    const diffDuration = moment.duration(diff);

    return " "+(diffDuration.days()) +" Days "+diffDuration.hours()+" Hours "+diffDuration.minutes()+" Minutes ";
  }

  // pass parms eid and event name
  gotoPrint() {
    this.router.navigate(['print', this.eid, this.event_name ]); // add eid to params 
  }

  getEvent(eid) {
    //console.log(`inside getevent ${eid}`);
    //console.log("url for get posts " + `${environment.API_URL}/post`);
    this.postSub = this._http.post<Posts[]>(`${environment.API_URL}/post`, { eid: eid })
      .subscribe(
        (result) => {
          if (result) {
            this.event = result['post'][0];
            this.gettingEvent = false;
            this.toast.tempSnackBar("Event Details retreived");
            this.loadingEvent = false;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
            this.gettingEvent = false;
            this.toast.tempSnackBar("Event Details error");
          }
        }
      );
  }

  getMaps(eid) {
    //console.log('maps eventID: ' + eid);
    this.mapsSub = this._http.post<maps[]>(`${environment.API_URL}/getmapsforevent`, { eid: eid })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(Object.keys(result).map(k => result[k]));

            //console.log(result['maps']); // undefined
            //this.maps = result['maps'];
            this.maps = result['maps'];
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  getSpeakers(eid) {
    //console.log('maps eventID: ' + eid);
    this.speakerSub = this._http.post<Speakers[]>(`${environment.API_URL}/getspeaker`, { eid: eid })
      .subscribe(
        (result) => {
          if (result) {
            this.speakers = result['speaker'];
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

    //this.postSub.unsubscribe();
    //this.mapsSub.unsubscribe();
    //this.speakerSub.unsubscribe();
  }

}
