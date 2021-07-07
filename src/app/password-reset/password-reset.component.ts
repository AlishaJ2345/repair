import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Router } from '@angular/router';
//import { JWT } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Validators } from '@angular/forms';
import { UsersapiService } from '../services/api.services';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoginUser, User } from '../models/event.model';
import { Response } from '@angular/http';
import { LocalStorageService } from '../services/localStorage.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  jwt:any;
  resetform:FormGroup;
  state:string = '';
  error:boolean = false;
  errormsg:string = 'error';
  constructor(private _http: HttpClient,
    private route: ActivatedRoute, private authService:UsersapiService,
    private router: Router,private fb:FormBuilder,
    private local:LocalStorageService) {

        this.resetform = this.fb.group({
          password: ['',Validators.required],
          password2: ['', Validators.required]
      });
    }

  ngOnInit() {
    this.route.params.subscribe(values => {
      this.jwt = values.jwt;
    });
  }

  updatePassword() {
    const val = this.resetform.value;
    if (val.password && val.password2) {
      //console.log('both feilds have a value');
      if(val.password.length > 6 && val.password2.length > 6) {
        //console.log('both feilds have more than 6 chars');
        if(val.password == val.password2){
          let password = val.password;
          //console.log('passwords match');
          this.error = false;
          this.errormsg = '';
          //send email reset
          this._http.post<User>(`${environment.API_URL}/auth/updatepassword/${this.jwt}`, {password})
          .subscribe(
            (result:User) => {
              if (result) {
                let user = result['user'];
                this.local.store(user);
                this.router.navigate(['home']);
              }
            },
            (err: HttpErrorResponse) => {
              if (err.error instanceof Error) {
              console.log(`update password status: ${err.status} message: ${err.statusText}`);
              }
            }
          );
        } else {
          this.error = true;
          this.errormsg = 'Passwords DONT match';
        }
      } else {
        this.error = true;
        this.errormsg = 'password must be more than 6 Chars';
      }
    } else {
      this.error = true;
      this.errormsg = 'you must enter your password twice';
    }
    //console.log(`password reset updatepassword ${this.jwt}`);
  }

}
