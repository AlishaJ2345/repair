import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { environment } from 'src/environments/environment.prod';
import { ActivatedRoute, Router } from '@angular/router';
import { Friend, User } from '../models/event.model';
import { LocalStorageService } from '../services/localStorage.service';
import { TransitionCheckState } from '@angular/material/checkbox';
import { ResponsiveService } from '../services/responsive.service';

@Component({
  selector: 'app-scan-notes',
  templateUrl: './scan-notes.component.html',
  styleUrls: ['./scan-notes.component.css']
})
export class ScanNotesComponent implements OnInit, OnDestroy {

  currentRate:number = 5;
  tag:string = '';
  notes:string = '';
  profilePic:string = "../../assets/pics/profile.jpg";
  empscan:Subscription;
  getprofilepicture:Subscription;
  student:any;
  uid:string = '1';
  eid:string;
  title:string = '';
  key:User;
  profile;
  cardStyle = {
    'width': '280px'
  }
  deviceWidth:number = 280;
  percentWidth:string = '100';
  screenWidth:string = 'sm';

  constructor(private toast:ToastService, private _http:HttpClient,
    private route:ActivatedRoute, private local:LocalStorageService,
    private responsiveService:ResponsiveService, private router:Router) {
      if(this.local.retreiveAll() != null){
        this.key = this.local.retreiveAll();
        if(this.local.retreiveEmployerProfile() != null){
          this.profile = this.local.retreiveEmployerProfile();
        }
      }
    }

  ngOnInit() {

    if(this.local.retreiveScan() != null){
      this.student = this.local.retreiveScan();
      this.profilePic = this.student.pic;
      //this.getPic(this.student.uid);
    }
    if(this.local.retreiveEventID() != null){
      this.eid = this.local.retreiveEventID()
    }
    if(this.local.retreiveEventTitle() != null){
      this.title = this.local.retreiveEventTitle();
    }
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = window.innerWidth;
      this.percentWidth = this.responsiveService.percentScreen;
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

  getCardStyle() {
    //let ans = (this.deviceWidth - 80);
    if (this.screenWidth == 'sm') {
      this.cardStyle = {
        'width': `${this.deviceWidth - 36}px`
      }
    } else if (this.screenWidth == 'md') {
      this.cardStyle = {
        'width': `${this.deviceWidth - 36}px`
      }
    } else if (this.screenWidth == 'lg') {
      this.cardStyle = {
        'width': '900px'
      }
    }
    //return this.cardStyle;
  }

  onRating(rating: number) {
    //console.log(rating);
    this.currentRate = rating;
  }

  autoGrowTextZone(e) {
    e.target.style.height = "0px";
    e.target.style.height = (e.target.scrollHeight + 25)+"px";
  }

  radioChange(selected) {
    this.tag = selected.value;
  }

  navToScan(){
    this.router.navigate(['scan']);
  }

  postScan() {
    //console.log(this.tag);
    this.empscan = this._http.post(`${environment.API_URL}/empscan`, {
      eid: this.eid, eventName: this.title, sid: this.student.uid, name: this.student.name,
      email: this.student.email, scannerEmail: this.key.email, company: this.profile.company, stars: this.currentRate, notes: this.notes,
      tag: this.tag, feedback: '', picture: this.profilePic, share: this.student.share
    })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(result['scan']);                 //all posts retreived
            this.notes = '';
            this.tag = '';
            this.currentRate = 5;
            this.toast.tempSnackBar(`Identity ${this.student.name}\n Saved to Database`)
            this.router.navigate(['scan']);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error posting scan ${err}`);
          }
        }
      );
  }

  getPic(sid) {
    //console.log('sid in getpic:' + this.sid);
    this.getprofilepicture = this._http.post(`${environment.API_URL}/getprofilepicture`, {
      sid: sid
    })
      .subscribe(
        (result) => {
          if (result) {
            this.profilePic = result['pic'].pic_url;
            console.log(`profilePic:${this.profilePic}`);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error posting scan ${err}`);
          }
        }
      );
  }

  ngOnDestroy(): void {
    if(this.empscan != null){
      this.empscan.unsubscribe();
    }
    if(this.getprofilepicture != null){
      this.getprofilepicture.unsubscribe();
    }
  }

}
