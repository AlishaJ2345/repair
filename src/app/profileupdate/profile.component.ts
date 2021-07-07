import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Router } from '@angular/router';
import { LocalStorageService } from '../services/localStorage.service';
import { ToastService } from '../services/toast.service';
import { Subscription } from 'rxjs';
import { sprofile, device } from '../models/event.model';
import { ResponsiveService } from '../services/responsive.service';
import { PwaService } from '../services/pwa.service';
import { SwPush } from '@angular/service-worker';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MatDialog } from '@angular/material/dialog';
import { HealthSafteyComponent } from '../health-saftey/health-saftey.component';
import { PushNotificationService } from '../services/push-notification.service';
import { IfStmt } from '@angular/compiler';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class Profile2Component implements OnInit {

  title: string = 'Complete Your JB Profile';
  isStudent: boolean = false;
  isEmployer: boolean = false;
  Named: string = '';
  isNamed: boolean = false;
  Eprofileform: FormGroup;
  Sprofileform: FormGroup;
  profile: any;
  hasAccount: boolean = false;
  user: any;
  student: Subscription;
  employer: Subscription;
  studentStore: Subscription;
  employerStore: Subscription;
  updateStudent: Subscription;
  updateEmployer: Subscription;
  uploadpic: Subscription;
  logoupdatesub: Subscription;
  showupload: boolean = false;
  fileToUpload: File;
  cvToUpload: File;
  logo_url: string;
  currentLogo: string = '';
  logoload: boolean = false;
  screenWidth: string = 'sm';
  deviceWidth: number = window.innerWidth;
  notifyRadioButton: boolean = true;
  selectNotify: boolean = false;       // the state of the notify button
  selectPromote: boolean = true;
  isPwaReady: boolean = true;
  isPushSub: boolean = false;
  deviceInfo: device;
  modalWidth: number = 280;
  VAPID_PUBLIC = "BHe-O2ImmnLY8GzkVJYGdHmm2Y7vnR638NOJbrWNU3s9vx06vGxG8aACh4weGL5uBQlERRqenAuH6N1xejpaWj8";

  cardStyle = {
    'width': '260px'
  }
  cv_url:string = '';
  notify:boolean = false;
  promote:boolean = false;


  constructor(private fb: FormBuilder, private _http: HttpClient, private router: Router,
    private local: LocalStorageService, private toast: ToastService,
    private responsiveService: ResponsiveService, private pwa: PwaService,
    private deviceService: DeviceDetectorService, private swPush: SwPush,
    public dialog: MatDialog, private pushService: PushNotificationService,) {

    if (local.retreiveAll() != undefined) {
      this.user = local.retreiveAll();
      this.isStudent = (this.user.type === 'user' ? true : false);
      this.isEmployer = (this.user.type === 'employer' ? true : false);
      this.Named = this.user.name;
      this.deviceInfo = this.deviceService.getDeviceInfo();

      if (this.deviceInfo.os == 'iOS') {
        this.isPwaReady = false;
      }

      this.swPush.subscription
        .take(1)
        .subscribe(pushSubscription => {
          if (pushSubscription == null) {
            this.isPushSub = true;
          }
        });

    } else {
      this.router.navigate(['/login']);
    }
  }

  addApp($event) {
    this.pwa.promptEvent.prompt();
    this.pwa.promptEvent.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
          this.toast.tempSnackBar("App Installed");
        } else {
          console.log('User dismissed the A2HS prompt');
          this.toast.tempSnackBar("User dismissed App Install");
        }
        this.pwa.promptEvent = null;
      });

  }

  radioChange(selected) {
    console.log("select notify " + this.selectNotify);
    if (this.selectNotify == true) {
      this.openNotifyDialog();
    } else {
      this.unsubscribeFromPush();
      this.notifyChange(false);
    }

  }

  notifyChange(selected){
    let uid = this.user.uid;
    this.logoupdatesub = this._http.post(`${environment.API_URL}/subscribe`, { uid: uid, share: selected })
    .subscribe(
      (result) => {
        if (result) {
          this.toast.tempSnackBar('Notify me set to '+selected);
          this.profile.notify = selected;
          this.local.storeStudentProfile(this.profile);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error updating share settings ${err}`);
        }
      }
    );
  }


  promoteChange(selected){
    let uid = this.user.uid;
    this.logoupdatesub = this._http.post(`${environment.API_URL}/shareprofile`, { uid: uid, share: this.selectPromote })
    .subscribe(
      (result) => {
        if (result) {
          this.toast.tempSnackBar('Share Profile set to '+this.selectPromote);
          this.profile.share = this.selectPromote;
          this.local.storeStudentProfile(this.profile);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error updating share settings ${err}`);
        }
      }
    );
  }

  unsubscribeFromPush() {
    // Get active subscription
    console.log("unsubscribe from push");
    this.swPush.subscription
      .take(1)
      .subscribe(pushSubscription => {
        console.log('[App] pushSubscription', pushSubscription)
        // Delete the subscription from the backend

        this.updateStudent = this._http.post(`${environment.API_URL}/unsubpush`,
          { uid: this.user.uid })
          .subscribe(
            (result) => {
              this.toast.tempSnackBar(`You Stopped Notifications`);
              pushSubscription.unsubscribe()
                .then(success => {
                  console.log('[App] Unsubscription successful', success)
                  this.updateSubscription(false);
                })
                .catch(err => {
                  console.log('[App] Unsubscription failed', err)
                })
            },
            (err: HttpErrorResponse) => {
              if (err.error instanceof Error) {
                console.log(`error updating sprofile ${err}`);

              }
            }
          )
      })

  }

  openNotifyDialog(): void {
    const dialogRef = this.dialog.open(HealthSafteyComponent, {
      width: `${this.modalWidth}px`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // yes sign me up to notifications
        this.notifySubscribe();
        this.notifyChange(true);
      } else {  // not now do not notify
        // reset radio button 
        this.selectNotify = false;
        this.notifyChange(false);
      }
    });
  }

  notifySubscribe() {
    console.log("Subscribe to push")
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC,
      })
      .then(subscription => {
        // send subscription to the server
        this.pushService.sendSubscriptionToTheServer(subscription).subscribe();
        this.updateSubscription(true);
      })
      .catch(console.error)
  }

  ngOnInit() {

    this.Sprofileform = this.fb.group({                  //input form feilds
      uni: ['', [Validators.required, Validators.maxLength(128)]],
      qual: ['', [Validators.required, Validators.maxLength(128)]],
      major: ['', [Validators.required, Validators.maxLength(128)]],
      year: ['', [Validators.required, Validators.maxLength(30)]],
      location: ['', [Validators.required, Validators.maxLength(128)]]
    });
    this.Eprofileform = this.fb.group({                  //input form feilds
      company: ['', [Validators.required, Validators.maxLength(128)]],
      position: ['', [Validators.required, Validators.maxLength(128)]],
      address: ['', [Validators.required, Validators.maxLength(128)]],
      location: ['', [Validators.required, Validators.maxLength(128)]]
    });
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

    if (this.isStudent) {
      if (this.local.retreiveStudentProfile() !== null) {
        //console.log('sprofile is not null');

        this.hasAccount = true;
        this.profile = this.local.retreiveStudentProfile();
        if (this.profile != null) {
          this.selectNotify = this.profile.push_sub;
          this.Sprofileform.get('uni').setValue(this.profile.uni);
          this.Sprofileform.get('qual').setValue(this.profile.qual);
          this.Sprofileform.get('major').setValue(this.profile.major);
          this.Sprofileform.get('year').setValue(this.profile.year);
          this.Sprofileform.get('location').setValue(this.profile.location);
          this.cv_url = this.profile.cv_url;
          if(this.profile.push_sub != null){
            this.notify = this.profile.push_sub;
          }else{
            this.notify = false;
          }
          console.log("push_sub "+this.notify);
          this.promote = this.profile.share;
          console.log("promote "+this.promote);
        }
      } else {
        this.getStudentProfile();
      }
    } else if (this.isEmployer) {
      if (this.local.retreiveEmployerProfile() !== null) {
        //console.log('eprofile is not null');
        this.hasAccount = true;
        this.profile = this.local.retreiveEmployerProfile();
        if (this.profile != null) {
          this.Eprofileform.get('company').setValue(this.profile.company);
          this.Eprofileform.get('position').setValue(this.profile.position);
          this.Eprofileform.get('address').setValue(this.profile.address);
          this.Eprofileform.get('location').setValue(this.profile.location);
        }
      } else {
        this.getEmploymentProfile();
      }
    }
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

  getCardStyle() {
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
        'width': `${ans}px`
      }
    } else if (this.screenWidth == 'lg') {
      this.cardStyle = {
        'width': '900px'
      }
    }
  }

  get s() {
    return this.Sprofileform.controls;
  }

  get e() {
    return this.Eprofileform.controls;
  }

  handleFileInput(files: FileList) {
    //console.log('file set');
    this.fileToUpload = files.item(0);
    this.logoload = true;
    this.uploadEventPic();
  }

  handleCVInput(files: FileList) {
    //console.log('file set');
    this.cvToUpload = files.item(0);
    this.uploadCV();
  }

  uploadCV(){
    if(this.cvToUpload != null){
      const formData: FormData = new FormData();
      formData.append('cv', this.cvToUpload, this.cvToUpload.name);
      this.uploadpic = this._http.post(`${environment.UPLOAD_URL}uploadcv`, formData)
      .subscribe(
        (result: Response) => {
          this.cv_url = `${environment.UPLOAD_URL}${result['url']}`;
          this.toast.tempSnackBar('CV Uploaded');
          console.log("cv: "+this.cv_url);
          this.updateCV(this.cv_url);
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error uploading Logo CV ${err}`);
          }
        }
      )
    }
  }

  updateCV(url){
    const uid = this.user.uid;
    this.updateStudent = this._http.post(`${environment.API_URL}/updatecv`,
      { uid: uid, cv_url: url })
      .subscribe(
        (result) => {
          //route to home
          //console.log(Object.keys(result).map(k => result[k]));
          this.toast.tempSnackBar('Profile updated with new CV');
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error updating sprofile ${err}`);
          }
        }
      )
  }

  uploadEventPic() {
    if (this.fileToUpload != null) {
      const formData: FormData = new FormData();
      formData.append('photo', this.fileToUpload, this.fileToUpload.name);
      this.uploadpic = this._http.post(`${environment.UPLOAD_URL}uploadpic`, formData)
        .subscribe(
          (result: Response) => {
            this.currentLogo = `${environment.UPLOAD_URL}${result['url']}`;
            this.profile.logo_url = this.currentLogo;
            this.toast.tempSnackBar('Logo Uploaded');
            this.saveEmployerLogoUrl();

          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              console.log(`error uploading Logo pic ${err}`);
            }
          }
        )
    } else {
      alert('Please add a picture before submitting');
    }
  }

  saveEmployerLogoUrl() {
    const uid = this.user.uid;
    const url = this.currentLogo;
    localStorage.setItem('pic', url);
    //console.log(`viewprofile save Logo pic working url:${url}`);


    this.logoupdatesub = this._http.post(`${environment.API_URL}/logopicture`, { uid: uid, url: url })
      .subscribe(
        (result) => {
          if (result) {
            //console.log('success storing the url');
            this.profile.logo_url = url;
            this.local.storeEmployerProfile(this.profile);
            this.toast.tempSnackBar('account logo updated');
            this.logoload = false;
            this.showupload = false;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error saving profile pic url in profile ${err}`);
            this.logoload = false;
          }
        }
      );
  }

  getStudentProfile() {
    const uid = this.user.uid;
    const email = this.user.email;
    //console.log(`uid: ${uid} email: ${email}`);
    this.student = this._http.post<sprofile>(`${environment.API_URL}/getstudentprofile`, { uid: uid, email: email })
      .subscribe(
        (result) => {
          if (result) {
            this.profile = result['profile'][0];                 //all posts retreived
            //console.log(Object.keys(result).map(k => result[k]));
            //localStorage.setItem('sprofile', JSON.stringify(this.profile[0]));
            //this.local.storeStudentProfile(this.profile);
            //console.log(this.profile);
            this.local.storeStudentProfile(this.profile);
            this.Sprofileform.get('uni').setValue(this.profile.uni);
            this.Sprofileform.get('qual').setValue(this.profile.qual);
            this.Sprofileform.get('age').setValue(this.profile.age);
            this.Sprofileform.get('major').setValue(this.profile.major);
            this.Sprofileform.get('year').setValue(this.profile.year);
            this.Sprofileform.get('location').setValue(this.profile.location);
            this.cv_url = this.profile.cv_url;
            if(this.profile.push_sub != null){
              this.notify = this.profile.push_sub;
            }else{
              this.notify = false;
            }
            console.log("push_sub "+this.notify);
            this.promote = this.profile.share;
            console.log("promote "+this.promote);
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
    const uid = this.user.uid;
    const email = this.user.email;
    //console.log(`uid: ${uid} email: ${email}`);
    this.employer = this._http.post<sprofile>(`${environment.API_URL}/getemployerprofile`, { uid: uid, email: email })
      .subscribe(
        (result) => {
          if (result) {
            this.profile = result['profile'][0];                 //all posts retreived
            //console.log(Object.keys(result).map(k => result[k]));
            //localStorage.setItem('sprofile', JSON.stringify(this.profile[0]));
            this.local.storeEmployerProfile(this.profile);
            //console.log(this.profile);
            this.local.storeEmployerProfile(this.profile);
            this.Eprofileform.get('company').setValue(this.profile.company);
            this.Eprofileform.get('position').setValue(this.profile.position);
            this.Eprofileform.get('address').setValue(this.profile.address);
            this.Eprofileform.get('location').setValue(this.profile.location);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  navToProfile() {
    this.router.navigate(['profile']);
  }

  addSkills(){
    this.router.navigate(['skill']);
  }

  submitStudentProfile() {
    const val = this.Sprofileform.value;
    if (this.Sprofileform.status == 'VALID') {
      //console.log('student profile updated ' + this.hasAccount);
      if (this.hasAccount) {
        this.updateStudentProfile(val);
        this.local.storeStudentProfile(val);
      } else {
        //console.log('student profile completed ' + this.hasAccount);
        //this.storeStudent(val);

      }
    } else {
      this.title = 'Profile Incomplete';
      //console.log('not valid');
      this.toast.tempSnackBar(this.Sprofileform.status);
    }

  }

  submitEmployerProfile() {
    const val = this.Eprofileform.value;
    if (this.Eprofileform.status === 'VALID') {
      //console.log('employer profile updated ' + this.hasAccount);
      if (this.hasAccount) {
        this.updateEmployerProfile(val);
        this.local.storeEmployerProfile(val);
      } else {
        //console.log('student profile completed ' + this.hasAccount);

      }
    } else {
      this.title = 'Profile Incomplete';
      //console.log('not valid');
      this.toast.tempSnackBar(this.Eprofileform.status);
    }
  }

  updateStudentProfile(val) {
    //console.log('store student');
    const spid = this.profile.spid;
    const uid = this.user.uid;
    this.updateStudent = this._http.post(`${environment.API_URL}/updatestudentprofile`,
      { spid, uid, uni: val.uni, qual: val.qual, age: val.age, major: val.major, year: val.year, location: val.location })
      .subscribe(
        (result) => {
          //route to home
          //console.log(Object.keys(result).map(k => result[k]));
          //this.profile = result['profile'][0];
          this.title = 'Student Profile updated';
          this.toast.tempSnackBar('Account Details Updated');
          this.local.storeStudentProfile(result['profile'][0]);
          setTimeout(() => {
            this.router.navigate(['profile']);
          }, 2000);
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error updating sprofile ${err}`);
          }
        }
      )
  }
  updateEmployerProfile(val) {
    //const spid = this.profile.spid;
    const uid = this.user.uid;
    this.updateEmployer = this._http.post(`${environment.API_URL}/updateemployerprofile`,
      { uid: uid, company: val.company, position: val.position, address: val.address, location: val.location })
      .subscribe(
        (result) => {
          //route to home
          //console.log(Object.keys(result).map(k => result[k]));
          //this.profile = result['profile'][0];
          this.title = 'Employer Profile Updated';
          this.toast.tempSnackBar('Account Details Updated');
          this.local.storeEmployerProfile(result['profile'][0]);
          //this.local.storeEmployerProfile(result);
          setTimeout(() => {
            this.router.navigate(['profile']);
          }, 2000);
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error updating eprofile ${err}`);
          }
        }
      )
  }

  updateSubscription(toggle) {
    this.updateStudent = this._http.post(`${environment.API_URL}/updatepushsub`,
      { push_sub: toggle, uid: this.user.uid })
      .subscribe(
        (result) => {
          //this.toast.tempSnackBar(`You Stopped Notifications`);
          console.log("notications subscribed? "+toggle);
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error updating sprofile ${err}`);

          }
        }
      )
  }



  ngOnDestroy() {
    if (this.employer != undefined) {
      this.employer.unsubscribe();
    }
    if (this.student != undefined) {
      this.student.unsubscribe();
    }
    if (this.updateStudent != undefined) {
      this.updateStudent.unsubscribe();
    }
    if (this.updateEmployer != undefined) {
      this.updateEmployer.unsubscribe();
    }
    if (this.uploadpic != undefined) {
      this.uploadpic.unsubscribe();
    }
    if (this.logoupdatesub != undefined) {
      this.logoupdatesub.unsubscribe();
    }
  }

}
