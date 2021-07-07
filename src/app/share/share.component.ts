import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../services/localStorage.service';
import { Router } from '@angular/router';
import { ResponsiveService } from '../services/responsive.service';


@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {

  user: any;
  profile: any;
  company: string;
  employer: boolean = false;
  student: boolean = false;
  backgroundImage: string = "../../assets/pics/event.jpeg";

  // booleans for data to share
  shareName:boolean = true;
  shareEmail:boolean = true;
  shareProfile:boolean = true;
  sharePicture:boolean = true;
  eid: string = '0';
  elementType: 'url' | 'canvas' | 'img' = 'url';
  value: string = 'dfgdfghdfhbdfghbdfghbdfg';
  promoteUser:boolean = true;
  receiveEmails:boolean = true;
  viewShareSettings:boolean = false;
  screenWidth:string = 'sm';
  deviceWidth:number = window.innerWidth;

  constructor(private local: LocalStorageService, private router: Router
    ,private responsiveService: ResponsiveService) {
    this.user = local.retreiveAll();
    if (local.retreiveEventID() != null) {
      this.eid = local.retreiveEventID();
    }

    this.value = `user*${this.eid}*${this.user.uid}*${this.user.name}*${this.user.email}*${true}`;

    if (this.user.type == 'user') {
      this.student = true;
      this.profile = this.local.retreiveStudentProfile();
    } else if (this.user.type == 'employer') {
      this.employer = true;
      this.profile = this.local.retreiveEmployerProfile();
    }
    
  }

  ngOnInit() {
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

  ngAfterViewInit(){
    this.makeQR();
  }

  toggleSettings(){
    this.viewShareSettings = !this.viewShareSettings;
  }

  navToScan() {
    this.router.navigate(['scan']);
  }

  makeQR(){
    //console.log("name: "+this.shareName+ " email: "+this.shareEmail+" profile: "+this.shareProfile)
    var share = true;
    var name = (this.shareName) ? this.user.name : "private";
    var email = (this.shareEmail) ? this.user.email : "private";
    var profile = (this.shareProfile) ? this.user.uid: "private";
    var picture = (this.sharePicture) ? this.user.pic_url: "private";
    if(name == 'private'){
      share = false;
    }
    this.value = `user*${this.eid}*${profile}*${name}*${email}*${share}*${picture}`;

  }



}
