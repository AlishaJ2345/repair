import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { LocalStorageService } from '../services/localStorage.service';

import { ToastService } from '../services/toast.service';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Posts, maps, Speakers, event_company, Company } from '../models/event.model';
import { Router } from '@angular/router';
import { ResponsiveService } from '../services/responsive.service';

@Component({
  selector: 'app-qr-login',
  templateUrl: './qr-login.component.html',
  styleUrls: ['./qr-login.component.css']
})
export class QrLoginComponent implements OnInit {

  postSub:Subscription;
  attendingSub:Subscription;
  screenWidth:string = 'sm';
  deviceWidth:number = window.innerWidth;
  eid:number;
  event:Posts
  maps:maps[];
  speakers:Speakers[];
  companys:event_company[];
  jobs:Company[];
  attendence = { event: this.event, maps: this.maps, speakers: this.speakers, jobs:this.jobs, label: "" };

  constructor(private local: LocalStorageService, private responsiveService: ResponsiveService,
    private _http: HttpClient, private toast:ToastService, private router:Router) { 
    this.getEid();
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
    });
    this.onResize();
  }

  onResize() {
    this.responsiveService.checkWidth();
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

  getEid() {
    this.postSub = this._http.get(`${environment.API_URL}/geteid`)
      .subscribe(
        (result) => {
          if (result) {
            //console.log(result[0].eid);
            this.eid = +result[0].eid;
            this.toast.tempSnackBar("Retreiving Event Details");
            this.getDetails();
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  getDetails(){
    //console.log("inside getDetails "+this.eid)
      this.attendingSub = this.getAttending().subscribe((attending) => {
      //console.log(attending);
      this.event = attending[0];
      this.maps = attending[1];
      this.speakers = attending[2];
      this.jobs = attending[3];
      this.attendence.event = this.event[0];
      this.attendence.maps = this.maps;
      this.attendence.speakers = this.speakers;
      this.attendence.jobs = this.jobs;
      this.local.storeAttending(this.attendence);
      this.toast.tempSnackBar("Event Details Retreived... Redirecting");
      this.router.navigate(['print']);
    }); 
  }

  getAttending(): Observable<any> {
    //console.log("inside get Attending "+this.eid);
    const eventSub = this._http.post<Posts[]>(`${environment.API_URL}/post`, { eid: this.eid }).map(res => res['post']);
    const mapsSub = this._http.post<maps[]>(`${environment.API_URL}/getmapsforevent`, { eid: this.eid }).map(res => res['maps']);
    const speakersSub = this._http.post<Speakers[]>(`${environment.API_URL}/getspeakersforevent`, { eid: this.eid }).map(res => res['speakers']);
    const jobsSub = this._http.post<Company[]>(`${environment.API_URL}/getcompanysforevent`,{ eid: +this.eid }).map(res => res['companys']);
    return Observable.forkJoin([eventSub, mapsSub, speakersSub, jobsSub])
      .map(responses => {
        return responses;
      }); 
  } 

}
