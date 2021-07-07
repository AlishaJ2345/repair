import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt'
import { HttpClient } from '@angular/common/http';
import { LocalStorageService } from './localStorage.service';
import { Subject } from 'rxjs';

@Injectable()
export class AuthService {

  public isLoggedIn = new Subject();

  constructor(private _http: HttpClient, private jwtHelper: JwtHelperService,
     private local :LocalStorageService){}
 

  loggedIn() {
    let token = '';
    if(localStorage.getItem('key') !== null){
      const key = JSON.parse(localStorage.getItem('key'));
      if(key.token != undefined){
        token = key.token;
        const tokenExpired: boolean = this.jwtHelper.isTokenExpired(token);
        if(!tokenExpired){
          if(key.type != undefined){
            const type = key.type;
            if(type == 'employer'){
              this.isLoggedIn.next('true');
              return !tokenExpired;
            } else {
              this.isLoggedIn.next('true');
              return !tokenExpired;
            }
          } else {
            this.isLoggedIn.next('false');
            return !tokenExpired;
          }
        } else {
          this.isLoggedIn.next('false');
          return !tokenExpired;
        }
      } else {
        this.isLoggedIn.next('false');
        return false;
      }
    }else{
      this.isLoggedIn.next('false');
      return false;
    }
  }

  logout(){
    this.local.clear();
    this.isLoggedIn.next('false');
  }
}