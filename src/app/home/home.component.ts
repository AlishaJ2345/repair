import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LocalStorageService } from '../services/localStorage.service';
import { environment } from 'src/environments/environment.prod';
import { Subscription, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { sprofile, eprofile, Posts, maps, Speakers, event_company, Company, servey } from '../models/event.model';
import { ToastService } from '../services/toast.service';
import { UsersapiService } from '../services/api.services';
import { ResponsiveService } from '../services/responsive.service';
import { Router } from '@angular/router';
import { Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServeyComponent } from '../servey/servey.component';
import { notStrictEqual } from 'assert';
import { setDefaultService } from 'selenium-webdriver/edge';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {


  signedIn: boolean = false;
  key: any;
  profilePic: string;
  student: Subscription;
  employer: Subscription;
  postSub: Subscription;
  postcompany: Subscription;
  attendingSub: Subscription;
  authSub: Subscription;
  SProfile: sprofile;
  EProfile: eprofile;
  current_eid: any;
  eid: number;
  event: Posts
  maps: maps[];
  speakers: Speakers[];
  companys: event_company[];
  jobs: Company[];
  attendence = { event: this.event, maps: this.maps, speakers: this.speakers, jobs: this.jobs, label: "" };
  screenWidth: string = 'sm';
  deviceWidth: number = window.innerWidth;
  gutterSize: string = '16px';
  footerHeight: string = '10';
  percentWidth: string = '100';
  modalWidth: number = 380;
  isLoggedIn: boolean = false;
  cardStyle = {
    'width': '280px'
  }
  buttonStyle = {
    'width': '20px',
    'height': '20px'
  }

  constructor(private client: UsersapiService, private auth: AuthService, private local: LocalStorageService,
    private _http: HttpClient, private toast: ToastService, private responsiveService: ResponsiveService,
    private router: Router, public dialog: MatDialog, private logCheck: UsersapiService) {

    if (this.local.retreiveEventID() != undefined) {
      this.current_eid = +this.local.retreiveEventID();
    }
    if (this.local.retreiveAll() != undefined) {
      this.key = this.local.retreiveAll();
      this.profilePic = `${environment.UPLOAD_URL}${this.key.pic_url}`;
      if (this.key.token != "") {
        if (this.key.type == 'user') {
          this.getStudentProfile();
        } else if (this.key.type == 'employer') {
          this.getEmploymentProfile();
        }
      }
    }
    this.getEid();
    this.isLoggedIn = this.logCheck.isLoggedIn();
  }

  openServeyDialog(): void {
    const dialogRef = this.dialog.open(ServeyComponent, {
      width: `${this.modalWidth}px`
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed '+result);
      if (result) {
        //console.log("result "+result.eventStars+ " notes "+result.eventNotes);
        //console.log("result "+result.appStars+ " notes "+result.appNotes);
        this.saveServey(result);
      } else {
        // servey incomplete
        console.log("nothing to db")
      }

    });
  }

  saveServey(result) {
    //console.log("Finish save servey");
    let eid = this.eid;
    this.employer = this._http.post<servey>(`${environment.API_URL}/feedback`, {
      eid: eid, event_stars: result.event_stars, event_notes: result.event_notes,
      app_stars: result.app_stars, app_notes: result.app_notes
    })
      .subscribe(
        (result) => {
          if (result) {
            //this.EProfile = result['profile'][0];                 //all posts retreived
            //this.local.storeEmployerProfile(this.EProfile);
            //console.log("store eprofile");
            this.toast.tempSnackBar("Thanks for the Feedback");
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error servey ${err}`);
          }
        }
      );
  }

  navToEvent() {
    this.router.navigate(['event']);
  }

  navToJobs() {
    this.router.navigate(['jobs']);
  }

  navToPrint() {
    this.router.navigate(['print']);
  }

  navToRegister() {
    this.router.navigate(['register']);
  }

  navToMaps() {
    this.router.navigate(['maps']);
  }

  navToSpeakers() {
    this.router.navigate(['speakers']);
  }

  navToFeedback() {
    this.openServeyDialog();
  }
  navToScan() {
    this.router.navigate(['scan']);
  }
  navToShare() {
    this.router.navigate(['share']);
  }
  navToFriends() {
    this.router.navigate(['friends']);
  }
  navToLogin() {
    this.router.navigate(['login']);
  }
  logout() {
    this.auth.logout();
    this.auth.loggedIn();
    this.router.navigate(['login']);
  }
  navToProfile() {
    this.router.navigate(['profile']);
  }

  clearLocal() {
    //console.log("clear localstorage")
    this.local.clearEventID();
  }

  ngOnInit() {
    //this.signedIn = this.auth.loggedIn();
    this.isLoggedIn = this.logCheck.isLoggedIn();
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = window.innerWidth;
      this.percentWidth = this.responsiveService.percentScreen;
      if (isMobile) {
        //console.log('Mobile device detected')
        this.screenWidth = this.responsiveService.screenWidth;
        this.modalWidth = (window.innerWidth - 10)
      }
      else {
        //console.log('Desktop detected')
        this.screenWidth = this.responsiveService.screenWidth;
        this.modalWidth = (window.innerWidth - 200)
      }
      this.getCardStyle();
      //this.getWidthStyle();
      //this.getButtonStyle();
    });
    this.onResize();
    this.authSub = this.auth.isLoggedIn.subscribe(answer => {
      //console.log("auth check triggered");
      if (answer == 'true') {
        //console.log("new auth check is true");
        this.isLoggedIn = true;
      } else {
        //console.log("new auth check is false");
        this.isLoggedIn = false;
        //this.cd.detectChanges();
      }
    });
    this.auth.loggedIn();
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

  getWidthStyle() {
    this.cardStyle = {
      'width': '100%'
    };
    if (this.screenWidth == 'sm') {
      this.cardStyle = {
        'width': `${this.percentWidth}%`
      }
    } else if (this.screenWidth == 'md') {
      this.cardStyle = {
        'width': '100%'
      }
    } else if (this.screenWidth == 'lg') {
      this.cardStyle = {
        'width': '90%'
      }
    }
    //return style;
  }

  getTextStyle() {
    let style = {};
    if (this.screenWidth == 'sm') {
      style = {
        'font-size': '10px'
      }
      if (this.deviceWidth < 300) {
        style = {
          'font-size': '11px'
        }
      }
      if (this.deviceWidth >= 300) {
        style = {
          'font-size': '12px'
        }
      }
      if (this.deviceWidth > 400) {
        style = {
          'font-size': '13px'
        }
      }
      if (this.deviceWidth > 500) {
        style = {
          'font-size': '14px'
        }
      }
      if (this.deviceWidth > 600) {
        style = {
          'font-size': '15px'
        }
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'font-size': '16px'
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'font-size': '18px'
      }
    }
    return style;
  }

  getButtonStyle() {
    this.buttonStyle = {
      'width': '20px',
      'height': '20px'
    };
    if (this.screenWidth == 'sm') {
      this.footerHeight = '50';
      this.gutterSize = '16px';
      this.buttonStyle = {
        'width': '50px',
        'height': '50px'
      }
      if (this.deviceWidth < 300) {
        this.footerHeight = '50';
        this.gutterSize = '16px';
        this.buttonStyle = {
          'width': '50px',
          'height': '50px'
        }
      }
      if (this.deviceWidth >= 300) {
        this.footerHeight = '50';
        this.gutterSize = '20px';
        this.buttonStyle = {
          'width': '60px',
          'height': '60px'
        }
      }
      if (this.deviceWidth > 400) {
        this.footerHeight = '50';
        this.gutterSize = '20px';
        this.buttonStyle = {
          'width': '70px',
          'height': '70px'
        }
      }
      if (this.deviceWidth > 500) {
        this.footerHeight = '50';
        this.gutterSize = '20px';
        this.buttonStyle = {
          'width': '80px',
          'height': '80px'
        }
      }
      if (this.deviceWidth > 600) {
        this.gutterSize = '24px';
        this.footerHeight = '50';
        this.buttonStyle = {
          'width': '90px',
          'height': '90px'
        }
      }
    } else if (this.screenWidth == 'md') {
      this.gutterSize = '28px';
      this.footerHeight = '50';
      this.buttonStyle = {
        'width': '120px',
        'height': '120px'
      }
    } else if (this.screenWidth == 'lg') {
      this.gutterSize = '32px';
      this.footerHeight = '50';
      this.buttonStyle = {
        'width': '120px',
        'height': '120px'
      }
    }
    //return this.buttonStyle;
  }


  getDetails() {
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
      this.toast.tempSnackBar("Event Details Retreived");
    });
  }

  getAttending(): Observable<any> {
    //console.log("inside get Attending "+this.eid);
    const eventSub = this._http.post<Posts[]>(`${environment.API_URL}/post`, { eid: this.eid }).map(res => res['post']);
    const mapsSub = this._http.post<maps[]>(`${environment.API_URL}/getmapsforevent`, { eid: this.eid }).map(res => res['maps']);
    const speakersSub = this._http.post<Speakers[]>(`${environment.API_URL}/getspeakersforevent`, { eid: this.eid }).map(res => res['speakers']);
    const jobsSub = this._http.post<Company[]>(`${environment.API_URL}/getcompanysforevent`, { eid: +this.eid }).map(res => res['companys']);
    return Observable.forkJoin([eventSub, mapsSub, speakersSub, jobsSub])
      .map(responses => {
        return responses;
      });
  }

  getEid() {
    this.postSub = this._http.get(`${environment.API_URL}/geteid`)
      .subscribe(
        (result) => {
          if (result) {
            //console.log(result[0].eid);
            this.eid = +result[0].eid;
            console.log('this.eid: ' + this.eid);
            if (this.current_eid != undefined) {
              if (this.current_eid == this.eid) {
                // correct event
                //console.log("current eid matches new eid");
              } else {
                this.toast.tempSnackBar("Retreiving Event Details");
                this.local.storeEventID(this.eid);
                this.getDetails();
              }
            } else {
              this.toast.tempSnackBar("Retreiving Event Details");
              this.local.storeEventID(this.eid);
              this.getDetails();
            }
          } else {
            console.log("no result found get eid");
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  getStudentProfile() {
    const uid = this.key.uid;
    const email = this.key.email;
    //console.log(`uid: ${uid} email: ${email}`);
    this.student = this._http.post<sprofile[]>(`${environment.API_URL}/getstudentprofile`, { uid: uid, email: email })
      .subscribe(
        (result) => {
          if (result) {
            this.SProfile = result['profile'][0];                 //all posts retreived
            if (this.SProfile == undefined) {
              this.router.navigate(['createprofile']);
            } else {
              this.local.storeStudentProfile(this.SProfile);
            }
            //console.log("store sprofile");
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  getEmploymentProfile() {
    const uid = this.key.uid;
    const email = this.key.email;
    //console.log(`uid: ${uid} email: ${email}`);
    this.employer = this._http.post<eprofile>(`${environment.API_URL}/getemployerprofile`, { uid: uid, email: email })
      .subscribe(
        (result) => {
          if (result) {
            this.EProfile = result['profile'][0];                 //all posts retreived
            if (this.EProfile == undefined) {
              this.router.navigate(['createprofile']);
            } else {
              this.local.storeEmployerProfile(this.EProfile);
            }
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  getCompanys() {
    //console.log("getcompanys event_company "+this.eid);
    this._http.post<Company[]>(`${environment.API_URL}/getcompanysforevent`,
      { eid: +this.eid })
      .subscribe(
        (result) => {
          if (result) {
            //console.log("get jobs result "+Object.keys(result).map(k => result[k]));
            //console.log("already added "+result);
            this.companys = result['companys'];
            console.log("company 1 name " + JSON.stringify(this.companys[0]));
            //this.getJobs();
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error setting student post in platform ${err}`);
          }
        }
      );
  }

  ngOnDestroy(): void {
    if (this.attendingSub != null) {
      this.attendingSub.unsubscribe();
    }
    if (this.student != null) {
      this.student.unsubscribe();
    }
    if (this.employer != null) {
      this.employer.unsubscribe();
    }
    if (this.postSub != null) {
      this.postSub.unsubscribe();
    }
  }

}
