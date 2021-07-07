import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ResponsiveService } from './services/responsive.service';
import { Router, NavigationEnd, Event, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DeviceDetectorService } from 'ngx-device-detector';
import { device } from './models/event.model';
import { MatDialog } from '@angular/material/dialog';
import { BrowserComponent } from './browser/browser.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('sizer', { static: true }) sizer: ElementRef;

  title = 'hub';
  type: boolean = false;
  deviceWidth = window.innerWidth;
  path: string = '/';
  toolbar: boolean = false;
  percentWidth:string = '100';
  deviceInfo:device;
  modalWidth:number  = 280;
  browserMessage:number = 0;
  background:string = '#F07D00';
  isMobile:boolean = true;
  promptEvent:any;

  constructor(public dialog: MatDialog, private responsiveService: ResponsiveService,
     private router: Router, private cd: ChangeDetectorRef, private titleService: Title,
     private deviceService: DeviceDetectorService) {
      //this.toolbar = true;
      this.titleService.setTitle( "Career Connect" );

      this.checkDevice();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(BrowserComponent, {
      width: `${this.modalWidth}px`,
      data: this.browserMessage
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed '+result);
      if (result) {
        //alert("agree to browser change");
      } else {
        //alert("dissagree to browser change");
      }
    });
  }



  checkDevice(){
    this.deviceInfo = this.deviceService.getDeviceInfo();
    //console.log("device info "+this.deviceInfo);
    //console.log("device os "+this.deviceInfo.os);
    //console.log("device device "+this.deviceInfo.device);
    //console.log("device browser "+this.deviceInfo.browser);
    //console.log("device user agent "+this.deviceInfo.userAgent);

    if(this.deviceInfo.os == 'Mac' || this.deviceInfo.os == 'iOS'){
      if(this.deviceInfo.browser != 'Safari'){
        this.browserMessage = 1;
        this.openDialog();
      }
    }
    
  /*  else if(this.deviceInfo.os == 'Andriod'){
      if(this.deviceInfo.browser != 'Chrome' && this.deviceInfo.browser != 'FireFox' && this.deviceInfo.browser != 'Oprea'){
        this.browserMessage = 2;
        this.openDialog();
      }
    } else if(this.deviceInfo.os == 'Linux'){
      if(this.deviceInfo.browser != 'Chrome' && this.deviceInfo.browser != 'FireFox' && this.deviceInfo.browser != 'Oprea'){
        this.browserMessage = 3;
        this.openDialog();
      }
    }else {
      if(this.deviceInfo.browser != 'Chrome' && this.deviceInfo.browser != 'FireFox' && this.deviceInfo.browser != 'Oprea'){
        this.browserMessage = 4;
      }
    }  */
  }

  ngOnInit() {
    this.deviceWidth = window.innerWidth;
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = +this.responsiveService.screenWidth;
      this.percentWidth = this.responsiveService.percentScreen;
      this.isMobile = isMobile;
      if (isMobile) {
        //console.log("mobile detected");
        this.modalWidth = (window.innerWidth - 10)
        if(this.path == '/home' || this.path == '/'){
          this.toolbar = false;
        }else{
          this.toolbar = true;
        }
      } else {
        //console.log('Desktop detected')
        this.modalWidth = (window.innerWidth - 200)
        if (this.path == '/home' || this.path == '/'){
          this.toolbar = false;
        } else {
          this.toolbar = true;
        }
      }
      //console.log("inside responsiveservice toolbar : "+this.toolbar);
    });
    this.onResize("event");
    //console.log("after responsive toolbar : "+this.toolbar);

    this.router.events.filter((event: any) => event instanceof NavigationEnd).subscribe(event => {
      this.path = event.url;
      this.responsiveService.checkWidth();
      //console.log("path: " + this.path); 
      if (this.path == '/home' || this.path == '/') {
        this.toolbar = false;
  /*      if(this.isMobile){
          this.background = '#F07D00';
        }else {
          this.background = 'white';
        }  */
 /*       if(this.deviceWidth > 999){
          this.background = 'white';
        } else {
          this.background = '#F07D00';
        } */
      } else {
        this.toolbar = true;
      }
      if(this.toolbar == true){
        this.background = '#F07D00';
      } else {
        if(this.isMobile){
          this.background = '#F07D00';
        } else {
          this.background = 'white';
        }
      }
    });
    //this.responsiveService.checkWidth();
    //console.log("end of init toolbar : "+this.toolbar);
    
  }

  onResize(event) {
    this.responsiveService.checkWidth();
  }

  getWidth() {
    this.deviceWidth = window.innerWidth;
    if(this.deviceWidth < 325){
      return "100"
    } else if (this.deviceWidth < 769) {
      return "100"
    } else {
      return "90"
    }
  }

  setScreenWidth(){
    return window.innerWidth;
  }

  columnDefs = [
		{headerName: 'Make', field: 'make' },
		{headerName: 'Model', field: 'model' },
		{headerName: 'Price', field: 'price'}
	];

	rowData = [
		{ make: 'Toyota', model: 'Celica', price: 35000 },
		{ make: 'Ford', model: 'Mondeo', price: 32000 },
		{ make: 'Porsche', model: 'Boxter', price: 72000 }
	];
}
