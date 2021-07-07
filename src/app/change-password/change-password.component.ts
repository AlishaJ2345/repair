import { Component, OnInit, OnDestroy } from '@angular/core';
import { ResponsiveService } from '../services/responsive.service';
import { LocalStorageService } from '../services/localStorage.service';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/event.model';
import { environment } from 'src/environments/environment.prod';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  screenWidth:string = 'sm';
  cPassword: string = '';
  c2Password: string = '';
  c3Password: string = '';
  changeaction:boolean = false;
  noMatch:boolean = true;
  key:any;
  changesub:Subscription;
  deviceWidth:number = window.innerWidth;

  constructor(private responsiveService:ResponsiveService, private local:LocalStorageService,
    private _http:HttpClient, private toast:ToastService, private router:Router) { 

    if(local.retreiveAll() != undefined){
      this.key = local.retreiveAll();
    }
  }

  ngOnInit(){
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

  getCardStyle(){
    let style = {};
    if (this.screenWidth == 'sm') {
      style = {
        'width': `${this.deviceWidth}px`
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'width': `${this.deviceWidth}px`
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'width': '993px'
      }
    }
    return style;
  }

  changePassword(){
    if (this.c2Password == this.c3Password) {
      if (this.cPassword && this.c2Password) {
        //console.log('both feilds have a value');
        if (this.cPassword.length > 6 && this.c2Password.length > 6) {
          this.changeaction = true;
          //console.log('both feilds have more than 6 chars');
          let email = this.key.email;
          let password = this.cPassword;
          let newpass = this.c2Password;
          //send email reset
          this.changesub = this._http.post<User>(`${environment.API_URL}/auth/changepassword`, { email, password, newpass })
            .subscribe(
              (result: User) => {
                if (result) {
                  this.changeaction = false;
                  let user = result['user'];
                  this.local.store(user);
                  //this.toast.tempSnackBar('Password Changed');
                  this.toast.tempSnackBar('Password Changed');
                  setTimeout(() =>
                    this.router.navigate(['profile'])
                    , 3000);
                }
              },
              (err: HttpErrorResponse) => {
                this.changeaction = false;
                if (err.error instanceof Error) {
                  this.toast.tempSnackBar(`${err.status} message: ${err.statusText}`);
                }
              }
            );

        } else {
          this.toast.notifySnackBar('password must be more than 6 Chars');
        }
      } else {
        this.toast.notifySnackBar('both passwords must be more than 6 Chars');
      }
    } else {
      this.toast.notifySnackBar('new Passwords dont match');
    }
  }

  checkPassMatch() {
    if (this.c2Password == this.c3Password) {
      this.noMatch = false;
    } else {
      this.noMatch = true;
    }
  }

  ngOnDestroy(): void {
    if(this.changesub != null){
      this.changesub.unsubscribe();
    }
  }

}
