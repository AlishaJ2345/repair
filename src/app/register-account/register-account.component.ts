import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User, device } from '../models/event.model';
import { environment } from 'src/environments/environment.prod';
import { LocalStorageService } from '../services/localStorage.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { PushNotificationService } from '../services/push-notification.service';
import { MatDialog } from '@angular/material/dialog';
import { HealthSafteyComponent } from '../health-saftey/health-saftey.component';
import { PwaService } from '../services/pwa.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-register-account',
  templateUrl: './register-account.component.html',
  styleUrls: ['./register-account.component.css']
})
export class RegisterAccountComponent implements OnInit {

  key: any;
  profile: any;
  email: string;
  password: string;
  type: string;
  user: string;
  uid: number;
  name: string;
  picurl: string;
  exp: number;                           // JWT expiry
  verifyed: boolean = false;
  cPassword: string = '';
  c2Password: string = '';
  c3Password: string = '';
  repassword: string = '';
  state: string = 'register';
  selected: string = 'user';
  student_id: string;
  noMatch: boolean = false;
  registeraction: boolean = false;
  registerSub: Subscription;
  notify: boolean = false;
  VAPID_PUBLIC = "BHe-O2ImmnLY8GzkVJYGdHmm2Y7vnR638NOJbrWNU3s9vx06vGxG8aACh4weGL5uBQlERRqenAuH6N1xejpaWj8";
  modalWidth: number = 280;
  notifyRadioButton:boolean = true;
  selectNotify:boolean = false;
  isPwaReady:boolean = true;
  isPushSub:boolean = false;
  deviceInfo:device;
  push_sub:boolean;
  isSubscribedToPush:boolean = false;
  updateStudent:Subscription;

  constructor(private _http: HttpClient, private local: LocalStorageService, private pushService: PushNotificationService,
    private toast: ToastService, private router: Router, private swPush: SwPush, public dialog: MatDialog,
    private pwa:PwaService, private deviceService: DeviceDetectorService) {

      this.deviceInfo = this.deviceService.getDeviceInfo();
      if(this.deviceInfo.os == 'iOS'){
        this.isPwaReady = false;
      }
      console.log("select value "+this.selected);

      this.swPush.subscription
      .take(1)
      .subscribe(pushSubscription => {
        if(pushSubscription == null){
          this.isPushSub = true;
        }
      });
    }

  ngOnInit() {
    this.swPush.subscription
    .take(1)
    .subscribe(pushSubscription => {
      if(pushSubscription == null){
        this.isPushSub = true;         // show subscribe
      } else {
        this.isSubscribedToPush = true;  // db true for subscribe
      }
    });
  }


  openNotifyDialog(): void {
    const dialogRef = this.dialog.open(HealthSafteyComponent, {
      width: `${this.modalWidth}px`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // yes sign me up to notifications
        this.notifySubscribe();
      } else {  // not now do not notify
        // reset radio button 
        this.selectNotify = false;
      }
    });
  }

  notifySubscribe() {
    console.log("notify called")
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC,
      })
      .then(subscription => {
        // send subscription to the server
        this.pushService.sendSubscriptionToTheServer(subscription).subscribe();
      })
      .catch(console.error)
  }

  addApp($event){
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
    this.openNotifyDialog();
  }

  checkRegPassMatch() {
    if (this.password == this.repassword) {
      this.noMatch = false;
    } else {
      this.noMatch = true;
    }
  }

  validateEmail(email) {
    const emailRegex = /^[-a-z0-9%s_+]+(\.[-a-z0-9%s_+]+)*@(?:[a-z0-9-]{1,63}\.){1,125}[a-z]{2,63}$/i;
    return emailRegex.test(email);
  }

  register() {
    if (this.email && this.password && this.name) {
      if (!this.noMatch) {
        if (this.validateEmail(this.email)) {
          this.registeraction = true;
          let email = this.email.toLowerCase();
          let password = this.password;
          let name = this.name;
          let student_id = this.student_id;
          name = name.replace(/ /g, "_");
          let type = this.selected;
          //console.log(this.selected);
          this.registerSub = this._http.post<User>(`${environment.API_URL}/auth/register`, { name, student_id, email, password, type })
            .subscribe(
              (result) => {
                if (result) {
                  //this.registeraction = false;
                  //console.log(Object.keys(result).map(k => result[k]));
                  let user = result['user'];
                  this.local.store(user);
                  this.uid = user.uid;
                  this.name = user.name;
                  this.email = user.email;
                  this.type = user.type;
                  this.exp = user.exp;
                  this.verifyed = user.verifyed;
                  this.email = user.email;
                  this.type = user.type;
                  //this.router.navigate(['createprofile']);
                  //this.accountType.emit(this.type);
                  //this.error = false;
                  this.updateSubscription();

                }
              },
              (err: HttpErrorResponse) => {
                // console.log(Object.keys(err).map(k => err[k]));
                //console.log("testerror "+ err.body.);
                //this.toast.notifySnackBar(""+ err)
                this.registeraction = false;
              }
            );
        } else {
          this.toast.notifySnackBar("Please Enter a Valid Email");
        }
      } else {
        this.toast.notifySnackBar("Passwords Do Not Match");
      }
    } else {
      this.toast.notifySnackBar("Please Complete All Fields");
    }
  }

  updateSubscription() {
    this.updateStudent = this._http.post(`${environment.API_URL}/updatepushsub`,
      { push_sub: this.isSubscribedToPush, uid: this.uid })
      .subscribe(
        (result) => {
          this.registeraction = false;
          this.toast.tempSnackBar(`Please Complete Profile`);
          this.router.navigate(['createprofile']);
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error updating sprofile ${err}`);
            this.registeraction = false;
          }
        }
      )
  }

}
