import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LocalStorageService } from '../services/localStorage.service';
import { ResponsiveService } from '../services/responsive.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { ignoreElements } from 'rxjs-compat/operator/ignoreElements';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit, OnDestroy {


  user: any;
  showAdmin: boolean = true;
  isMobile = true;
  screenWidth;
  deviceWidth = window.innerWidth;
  isloggedIn: boolean = false;
  authSub: Subscription;
  sizeSub: Subscription;
  showAdminBanner: boolean = true;
  extraLarge: boolean = false;
  percentWidth: string = '100';
  otherBanner: string = '../../assets/brand/headers/mobile_sm1.png';
  logo: string = '../assets/brand/logos/AUT_Logo-mobile_sm1.png';
  left: string = '0';
  logoWidth = '10';
  bannerHeight:string = '64';
  isAligned:boolean = false;
  adjust:boolean = true;
  padding:boolean = true;
  removePadding:boolean = false;

  constructor(private local: LocalStorageService, private responsiveService: ResponsiveService,
    private auth: AuthService, private cd: ChangeDetectorRef) {

    console.log("init showAdmin" + this.showAdmin);
    if (this.local.retreiveAll() != undefined) {
      this.user = this.local.retreiveAll();
      if (this.user.type == 'employer') {
        //console.log("show admin links in toolbar");
        this.showAdmin = true;
        console.log("type employer showAdmin " + this.showAdmin);
      } else {
        this.showAdmin = false;
        console.log("type user showAdmin " + this.showAdmin);
        //console.log("students see no links in toolbar");
      }
    } else {
      this.showAdmin = false;
      console.log("type none showAdmin " + this.showAdmin);
      //console.log("in toolbar you are not logged in!");
    }
  }

  ngOnInit() {

    this.authSub = this.auth.isLoggedIn.subscribe(answer => {
      //console.log("auth check triggered");
      if (answer == 'true') {
        //console.log("new auth check is true");
        this.isloggedIn = true;
        this.cd.detectChanges();
      } else {
        //console.log("new auth check is false");
        this.isloggedIn = false;
        this.cd.detectChanges();
      }
    });
    this.auth.loggedIn();
    this.sizeSub = this.responsiveService.getMobileStatus().subscribe(isMobile => {

      //console.log('Mobile device detected')
      this.isMobile = true;
      this.screenWidth = this.responsiveService.screenWidth;
      this.deviceWidth = window.innerWidth;
      this.percentWidth = this.responsiveService.percentScreen;
      this.getHeaderStyle();
    });
    this.onResize("wer");
  }

  onResize(qwe) {
    this.responsiveService.checkWidth();
    this.deviceWidth = window.innerWidth;
    //console.log("screen size in percent "+this.percentWidth);
  }

  getHeaderStyle() {
    this.isAligned = true;
    this.adjust = false;
    this.removePadding = false;
    this.bannerHeight = '38';
    this.logo = "../../assets/brand/headers/remko-hedder.png"
    if (this.screenWidth == 'sm') {
      if(this.deviceWidth < 350){
        this.removePadding = true;
        this.isAligned = true;
        this.bannerHeight = '38';
        this.logo = "../../assets/brand/headers/remko-hedder.png"
      }else if (this.deviceWidth < 426) {
        this.isAligned = false;
        this.bannerHeight = '52';
        this.logo = "../../assets/brand/headers/logo_header-mobile.png";
      } else {
        this.bannerHeight = '52';
        this.logo = "../../assets/brand/headers/logo_header-mobile.png";
      }
    } else if (this.screenWidth == 'md') {
      this.bannerHeight = '70';
      if (this.deviceWidth < 769) {
        this.logo = "../../assets/brand/headers/logo_header-tablet.png";
      } else {
        this.logo = "../../assets/brand/headers/logo_header-tablet.png";
      }
    } else if (this.screenWidth == 'lg') {
      this.bannerHeight = '100';
      this.logo = "../../assets/brand/headers/logo_header-desktop.png";
    }
  }


  OnDestroy() {

  }

  ngOnDestroy(): void {
    this.cd.detach();
    this.authSub.unsubscribe();
    this.sizeSub.unsubscribe();
  }


}
