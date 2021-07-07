import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Friend, User } from '../models/event.model';
import { environment } from '../../environments/environment.prod';
import { LocalStorageService } from '../services/localStorage.service';
import { Router } from '@angular/router';
import { ResponsiveService } from '../services/responsive.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  friendSub:Subscription;
  friends:Friend[];
  user:User;
  numberOfFriends:number;
  screenWidth:string = 'sm';
  deviceWidth:number = window.innerWidth;

  constructor(private _http: HttpClient, private local:LocalStorageService,
    private router:Router,private responsiveService: ResponsiveService) { 
    this.user = local.retreiveAll();
  }

  navToChat(){
    this.router.navigate(['chat']);
  }

  ngOnInit() {
    this.getFriends();
    //this.signedIn = this.auth.loggedIn();
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

  navToScan(){
    this.router.navigate(['scan']);
  }

  getFriends() {
    this.friendSub = this._http.post<Friend[]>(`${environment.API_URL}/getfriends`, {
      uid:this.user.uid
    })
      .subscribe(
        (result) => {
          if (result) {
            this.friends = result['friends'];                 //all posts retreived
            //console.log(this.friends);
            console.log(Object.keys(result).map(k => result[k]));
            this.numberOfFriends = this.friends.length;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }
  OnDestroy(){
    this.friendSub.unsubscribe();
  }

}
