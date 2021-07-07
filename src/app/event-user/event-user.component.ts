import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from '../services/localStorage.service';
import { Subscription } from 'rxjs';
import { timer } from 'rxjs/observable/timer';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { Friend, Label } from '../models/event.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-user',
  templateUrl: './event-user.component.html',
  styleUrls: ['./event-user.component.css']
})
export class EventUserComponent implements OnInit {
  capture: boolean = true;
  @ViewChild('scanner', { static: false }) scanner: ZXingScannerComponent;

  // qr code scanner
  camStarted: boolean = false;
  startScan: boolean = false;
  success: boolean = true;
  selectedDevice: MediaDeviceInfo;
  selected:string;
  devices: MediaDeviceInfo[];
  hasPermission: boolean;
  hasCameras:boolean = false;
  decoded: string = '';
  // event detail view
  postid: string = '';
  title: string = '';
  date: string = '';
  location: string = '';
  speakers: string = '';
  company: string = '';
  name: string;
  student_name = '';
  type = 'user';
  email: string;
  sid: string;
  picurl: string;
  user: any;
  profile: any;
  slides: boolean = false;
  share: boolean = false;
  jbconnect: boolean = false;
  notices: boolean = false;
  value2: string = '';
  label:Label;
  //sound player
  audio: any;
  // future events
  events: any;
  // speakers
  speakerList: any = [];
  // qr signin
  instance: any;
  showButtons: boolean = false;
  show: boolean = false;
  friend_eid:string;
  friend_sid:string;
  friend_name:string;
  friend_email:string;
  friend_share:boolean;
  typeOfScan:string = 'scan';

  scanprogress: boolean = false;
  maps: any;
  MAP: string = '../../assets/pics/City-campus-map.png';
  mapsSub: Subscription;
  speakersub: Subscription;
  signinsub: Subscription;
  qrsub: Subscription;
  timerSub:Subscription;
  friendSub:Subscription;
  printSub:Subscription;
  found:boolean = false;
  pic_url:string;
  deviceIndex:number = 0;
  qricon:string  = '../../assets/icons/qr-icon.png'

  model = {
    eventName: ""
  }
  elementType: 'url' | 'canvas' | 'img' = 'url';
  value: string = '';

  constructor(private _http: HttpClient, private local: LocalStorageService,
    private ref:ChangeDetectorRef, private toast:ToastService,
    private router:Router,) {
    this.user = local.retreiveAll();
    this.name = this.user.name;
    this.student_name = this.user.name;
    this.type = this.user.type;
    this.email = this.user.email;
    this.sid = this.user.uid;
    this.pic_url = this.user.pic_url;
    this.profile = this.local.retreiveStudentProfile();
  }

  getStyle() {
    //console.log(`getStyle hit`);
    return 'smallvideo';
  }

  swapCams(){
    if(this.devices.length > 1){
      if(this.deviceIndex == 1){
        this.selectedDevice = this.devices[0];
        this.deviceIndex = 0;
        //console.log('device '+this.selectedDevice);
      }else if (this.deviceIndex == 0){
        this.selectedDevice = this.devices[1];
        this.deviceIndex = 1;
        //console.log('device '+this.selectedDevice);
      } else {
        this.selectedDevice = this.devices[0];
        this.deviceIndex = 0;
      }
    } else {
      this.selectedDevice = this.devices[0];
      this.deviceIndex = 0;
    }
  }

  onChange(selectedValue: string) {
    //console.log("Selection changed", selectedValue);
    this.camStarted = false;
    //this.selectedDevice = this.scanner.getDeviceById(selectedValue);
    //this.scanner.changeDevice(this.selectedDevice);
    this.camStarted = true;
    this.ref.detectChanges();
  }

  startStop() {
    this.camStarted = !this.camStarted;
    this.startScan = !this.startScan;
  }

  displayCameras(cams: any[]) {
    //console.log("found cameras");
    this.scanprogress = true;
    this.devices = cams;
    this.ref.detectChanges();
    this.selectedDevice = cams[0];

  }

  ngAfterViewInit(){
    this.scanner.camerasFound.subscribe((cameras: MediaDeviceInfo[]) =>{
      this.devices = cameras;
      this.hasCameras = true;
      this.scanprogress = true; 
            // selects the devices's back camera by default
       for (const device of cameras) {
           if (/back|rear|environment/gi.test(device.label)) {
              //this.scanner.changeDevice(device);
               this.selectedDevice = device;
               break;
           }
       }
       if(this.selectedDevice == null){
        this.selectedDevice = cameras[0];
       }
        this.camStarted = true;
        this.ref.detectChanges();
    });

    this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) =>{
      alert("There is no camera found");
    });

    this.scanner.permissionResponse.subscribe((answer:boolean) => {
      this.hasPermission = answer;
    });
    const source = timer(1500);
    const timerSub = source.subscribe(val => {
      this.found = true;
    });
        

  }

  handleQrCodeResult(result) {
    this.playClick();
    this.decoded = result;
    this.getData(this.decoded);
    this.capture = false;
    this.startStop();
    //this.value = `${this.postid}*${this.sid}*${this.name}*${this.email}*${this.share}`;
    this.show = true;
    this.local.storeQR(this.value);
    this.local.storeEventTitle(this.title);
    this.scanprogress = false;
  }

  getData(data) {
    this.showButtons = true;
    let scannedData = data.split('*');
    //console.log("type of scan is "+scannedData[0]);
    if(scannedData[0] == 'user'){
      // it was a user qr code
      this.typeOfScan = "user";
      this.friend_eid = scannedData[1];
      this.friend_sid = scannedData[2];
      this.friend_name = scannedData[3];
      this.friend_email = scannedData[4];
      this.friend_share = scannedData[5];
      this.toast.tempSnackBar(`New Friend ${this.friend_name} Added!`);
      // db the new friendship
      this.makeFriend(this.sid, this.friend_name);
      setTimeout(() => this.router.navigate(['friends']), 3000);
      
    } else if(scannedData[0] == 'event') {
      // it was an event qr code
      this.typeOfScan = "event";
      this.postid = scannedData[1];                
      this.title = scannedData[2];
      this.date = scannedData[3];
      this.location = scannedData[4];
      this.speakers = scannedData[5];
      this.printStudent();
      this.getSpeakers(this.postid);
      setTimeout(() => 
      this.router.navigate(['event', this.postid])
      , 3000);
    }
  }

  playClick() {
    this.audio.play();
  }

  ngOnInit(): void {

    this.audio = new Audio();
    this.audio.src = "../../assets/sounds/camera.mp3";
    this.audio.load();

  }


  printStudent() {
    if(this.user.type == 'user'){
      //  https call...
      let labelType = 'studentLabel';
  /*    console.log("printStudent called\n"
      +" uid:" +this.user.uid +" eid: "+this.postid +" type: "+this.user.type
      +" lableType: "+labelType+" event_name: "+ this.title+" name: "+this.name
      +" programme: "+this.profile.qual+" major: "+ this.profile.major); */
  
      this.printSub = this._http.post<Label>(`${environment.API_URL}/printlabel`, {
        rid:"", uid:this.user.uid, eid:this.postid, type:this.user.type, label_type:labelType, 
        event_name:this.title, name:this.name,
         field1:this.profile.qual, field2:this.profile.major
      })
        .subscribe(
          (result) => {
            if (result) {
              this.label = result['label'];
              //console.log(Object.keys(result).map(k => result[k]));
              //console.log("printLabel result: " + this.label['label']);
              this.local.storeLabel(result['label']);
              this.toast.tempSnackBar("Employer Label is Printing");
            }
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              console.log(`error getting posts in landing ${err}`);
            }
          }
        );
    } else {
      this.toast.notifySnackBar("Employer cannot print student labels");
    }

  }

  fromQr() {
    //console.log("eid: "+this.postid+" sid: "+this.sid+" student_name: "+this.student_name+" type: "+this.type+" name "+this.title+" email: "+this.email);
    this.qrsub = this._http.post(`${environment.API_URL}/qrsignin`, {
      eid: this.postid, sid: this.sid, student_name: this.student_name, type: this.type, name: this.title, email: this.email
    })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(result['aid'].instance);
            this.instance = result['aid'].instance;
            //console.log(Object.keys(result).map(k => result[k]));
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  signIn() {
    //console.log(`slides:${this.slides} share:${this.share} promote:${this.jbconnect} notices:${this.notices}`);
    this.signinsub = this._http.post(`${environment.API_URL}/fullsignin`, {
      slides: this.slides, share: this.share, promote: this.jbconnect, notices: this.notices, instance: this.instance
    })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(result['aid']);
            //console.log(Object.keys(result).map(k => result[k]));
            this.value = `${this.postid}*${this.sid}*${this.name}*${this.email}*${this.share}`;
            this.local.storeQR(this.value);
            this.show = true;
            this.local.storeEventID(this.postid);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  getSpeakers(eid) {
    this.speakersub = this._http.post(`${environment.API_URL}/getspeaker`, {
      eid: eid
    })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(result['speaker'].name);
            //console.log(Object.keys(result).map(k => result[k]));
            this.speakerList.push(result['speaker']);                 //all posts retreived
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  getMaps() {
    //console.log('maps eventID: ' + this.postid);
    this.mapsSub = this._http.post(`${environment.API_URL}/getmapsforevent`, { eid: this.postid })
      .subscribe(
        (result) => {
          if (result) {
            this.maps = result;                 //all posts retreived
            this.MAP = this.maps[0].map_url;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting maps in user scan ${err}`);
          }
        }
      );
  }

  makeFriend(uid, friend_name,) {
    //console.log('sid: ' + uid + ' name: '+friend_name);// uid, friend = name
    this.friendSub = this._http.post<Friend>(`${environment.API_URL}/makefriends`, { uid: uid, friend: friend_name })
      .subscribe(
        (result) => {
          if (result) {
            console.log("friend made With: "+result['friends'].friend);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error make friends in user scan ${err}`);
          }
        }
      );
  }

  OnDestroy() {
    this.camStarted = false;
    this.mapsSub.unsubscribe();
    this.speakersub.unsubscribe();
    this.signinsub.unsubscribe();
    this.qrsub.unsubscribe();
    this.timerSub.unsubscribe();
    this.friendSub.unsubscribe();
    this.printSub.unsubscribe();
  }

}
