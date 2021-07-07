import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';
import { Events, Uniquenumber, LoginUser, User, Skill } from '../models/event.model';
import * as moment from 'moment-mini-ts';
//import * as moment from 'moment';
//import * as moment from 'moment-mini-ts';import * as moment_ from 'moment';
import { LocalStorageService } from './localStorage.service';


@Injectable()
export class UsersapiService {

  public token: string;
  constructor(private _http:HttpClient, private local:LocalStorageService) { }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  getExpiration() {
    if(localStorage.getItem('key') != undefined){
      const expiration = localStorage.getItem('key');
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt.exp);
    }
    return moment(new Date());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }
  //get events from usersapi
  getEvents(){
    return this._http.get<Events[]>(`${environment.API_URL}/events`);
  }
  //get unique number to track posts
  getUnique(){
    return this._http.get<Uniquenumber>(`${environment.API_URL}/unique`);
  }
  getUsers(term): Observable<Skill[]> {
    return this._http.post<Skill[]>(`${environment.API_URL}/getallstudentskill`, {term});
  }
  searchUsers(term): Observable<Skill[]> {
    return this._http.post<Skill[]>(`${environment.API_URL}/searchstudentskill`, {term});
  }
  //insert admin account into admin db through users api
  registerUser(username:string, password:string ) {
    let email = username;
    let type = 'user';
    this._http.post<User>(`${environment.API_URL}/auth/register`, {email, password, type})
    .subscribe(user => {
      if (user) {
        const expiresAt = moment().add(user.exp, 'second');
        user.exp = JSON.stringify(expiresAt.valueOf());
        this.local.store(user);
        return true;
      } else {
        return false;
      }

    })
  }
  confirmUser(jwt) {
    return this._http.get<User>(`${environment.API_URL}/auth/confirmation/${jwt}`);
  }

  loginUser(username:string, password:string ) {
    return this._http.post<User>(`${environment.API_URL}/auth/login`, {username, password});
  }

}