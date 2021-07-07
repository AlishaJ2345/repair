import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../services/localStorage.service';
import { Router } from '@angular/router';
import { ResponsiveService } from '../services/responsive.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../models/event.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  isMobile: boolean = true;
  deviceWidth:number = 0;
  screenWidth:string = 'sm';
  isLoggedIn: boolean = false;
  authSub:Subscription;
  isEmployer:boolean = false;
  key:User;

  constructor(private local:LocalStorageService, private router:Router,
    private responsiveService:ResponsiveService, private auth: AuthService) {
      if(this.local.retreiveAll() != undefined){
        this.key = this.local.retreiveAll();
        if(this.key.type = 'employer'){
          this.isEmployer = true;
        }
      }
    }

  ngOnInit() {
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
    this.onResize('test');
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
  onResize(test) {
    this.responsiveService.checkWidth();
  }

  getMenuStyle(){
    let style = {};
    let menuWidth = window.innerWidth;
    if (this.screenWidth == 'sm') {
      style = {
        'width': `${menuWidth}px`
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'width': `${menuWidth / 2}px`
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'width': `${menuWidth / 4}px`
      }
    }
    return style;
  }

  clearAppData(){
    this.local.clearEventID();
    this.router.navigate(['home']);
  }

}
