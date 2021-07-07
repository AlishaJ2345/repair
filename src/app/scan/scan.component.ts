import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { LocalStorageService } from '../services/localStorage.service';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { Result } from '@zxing/library';
import { Label, Friend, User } from '../models/event.model';
import { Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';
import { ResponsiveService } from '../services/responsive.service';
import { MatDialog } from '@angular/material/dialog';
import { CameraErrorComponent } from '../camera-error/camera-error.component';
import { ToastService } from '../services/toast.service';
import { HttpErrorResponse, HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ConfirmPrintComponent } from '../confirm-print/confirm-print.component';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.css']
})
export class ScanComponent implements OnInit, OnDestroy {

  capture: boolean = true;
  //@ViewChild('scanner', { static: true }) scanner: ZXingScannerComponent;
  @ViewChild('scanner',{static:true, read: false}) scanner: ZXingScannerComponent;

  // qr code scanner
  camStarted: boolean = true;
  startScan: boolean = false;
  success: boolean = true;
  selectedDevice: MediaDeviceInfo;
  selected: string;
  devices: MediaDeviceInfo[];
  hasPermission;
  hasCameras;
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
  type;
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
  label: Label;
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
  friend_eid: string;
  friend_sid: string;
  friend_name: string;
  friend_email: string;
  friend_share: boolean;
  typeOfScan: string = 'scan';

  scanprogress: boolean = false;
  maps: any;
  MAP: string = '../../assets/pics/City-campus-map.png';
  mapsSub: Subscription;
  speakersub: Subscription;
  signinsub: Subscription;
  qrsub: Subscription;
  timerSub: Subscription;
  friendSub: Subscription;
  printSub: Subscription;
  found: boolean = true;
  pic_url: string;
  deviceIndex: number = 0;
  qricon: string = '../../assets/icons/qr-icon.png';
  deviceWidth: number;
  screenWidth: string = 'sm';
  cameraMessage: string = 'Looking for Camera';
  permissionMessage: string = 'Waiting for Permissions';
  camError: string = '';
  modalSize: number = 280;
  retryScan: boolean = false;
  showSelect: boolean = false;
  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo = null;
  hasDevices: boolean = false;
  qrResult: Result;
  qrResultString: string;
  attending: any;
  entryCode: string = '';
  labelType: string;
  key: User;
  feild1: string = '';
  feild2: string = '';
  friend = { eid: '', uid: '', name: '', email: '', share: true, pic: '' };
  scannedData: any;
  modalWidth: number = 280;
  model = {
    eventName: ""
  }
  elementType: 'url' | 'canvas' | 'img' = 'url';
  value: string = '';
  isGuest: boolean = false;
  qrFound:boolean = true;
  test:number =0;

  constructor(private local: LocalStorageService, private router: Router,
    private responsiveService: ResponsiveService, public dialog: MatDialog,
    private toast: ToastService, private _http: HttpClient) {
    if (this.local.retreiveAll() != null) {
      this.key = this.local.retreiveAll();
      this.type = this.key.type;
      if (this.type == 'user') {
        this.labelType = 'studentLabel';
        this.profile = this.local.retreiveStudentProfile();
        console.log("scan constructor " + this.profile.major);
      } else if (this.type == 'employer') {
        this.labelType = 'employerLabel';
        this.profile = this.local.retreiveEmployerProfile();
      } else {
        this.labelType = 'guestLabel';
      }
    } else {
      // no account or not logged in
      this.isGuest = true;
    }
    if (this.local.retreiveAttending() != null) {
      this.attending = this.local.retreiveAttending();
      if (this.attending.event.subject != '') {
        this.entryCode = this.attending.event.subject;
      } else {
        this.toast.tempSnackBar("Entry code is Empty");
      }
    } else {
      this.toast.tempSnackBar("no event Details found");
    }
  }

  openCameraDialog(): void {
    const dialogRef = this.dialog.open(CameraErrorComponent, {
      width: `${this.modalSize}px`,
      data: `${this.camError}`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != '') {
        if (result == this.entryCode) {
          this.router.navigate(['print']);
        } else {
          window.location.reload();
        }
      } else {
        window.location.reload();
      }
    });
  }

  openPrintDialog(): void {
    const dialogRef = this.dialog.open(ConfirmPrintComponent, {
      width: `${this.modalSize}px`
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.printLabel(true);
        setTimeout(() => this.router.navigate(['event']), 1000);
      } else {  // no label is printed
        //this.printLabel(true);
        setTimeout(() => this.router.navigate(['event']), 1000);
      }
    });
  }

  getStyle() {
    //console.log(`getStyle hit`);
    return 'smallvideo';
  }

  swapCams() {
    if (this.devices.length > 1) {
      if (this.deviceIndex == 1) {
        this.selectedDevice = this.devices[0];
        this.deviceIndex = 0;
        //console.log('device '+this.selectedDevice);
      } else if (this.deviceIndex == 0) {
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
    //this.ref.detectChanges();
  }

  startStop() {
    this.camStarted = !this.camStarted;
    this.startScan = !this.startScan;
  }
  /*
    displayCameras(cameras: MediaDeviceInfo[]) {
      //console.log("found cameras");
      this.scanprogress = true;
      //this.devices = cams;
      //this.ref.detectChanges();
      this.devices = cameras;
      this.cameraMessage = 'Camera found';
      this.scanprogress = true;
      // selects the devices's back camera by default
      for (const device of cameras) {
        if (/back|rear|environment/gi.test(device.label)) {
          this.scanner.changeDevice(device);
          this.selectedDevice = device;
          break;
        }
      }
      if (this.selectedDevice == null) {
        this.selectedDevice = cameras[0];
      }
      this.hasCameras = true;
    } */

  retry() {
    this.showSelect = true;
    this.camStarted = true;
    this.found = true;
    this.hasPermission = true;
  }

  ngAfterViewInit() {

    setTimeout(() => {
      if (this.hasDevices && this.hasPermission) {
        // camera has started nothing to do!
        this.camStarted = true;
      } else if (this.hasDevices == undefined && this.hasPermission == undefined) {
        // no camera detected can not get permissions on no camera
        this.camError = 'no camera detected';
        this.camStarted = false;
        this.openCameraDialog();
      } else if (this.hasDevices && this.hasPermission == undefined) {
        // camera detected but permissions waiting
        this.camError = 'camera detected but permissions waiting';
        this.camStarted = false;
        this.openCameraDialog();
      } else if (this.hasDevices && !this.hasPermission) {
        // camera detected but permission denied
        this.camError = 'camera detected but permissions denied';
        this.camStarted = false;
        this.openCameraDialog();
      }
    }, 3000);

  }

  processResult(result) {
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
    this.camStarted = false;
    this.showButtons = true;
    this.scannedData = data.split('*');
    if (this.scannedData[0] == 'event') {
      // it was an event qr code
      this.typeOfScan = "event";
      this.postid = this.scannedData[1];
      this.title = this.scannedData[2];
      this.date = this.scannedData[3];
      this.location = this.scannedData[4];
      this.speakers = this.scannedData[5];
      this.local.storeEventTitle(this.title);
      this.local.storeEventID(this.postid);
      this.printLabel(true);
      //this.openPrintDialog();

    } else if (this.scannedData[0] == 'user') {
      //  student scan condition
      //  `user*${this.eid}*${this.user.uid}*${this.user.name}*${this.user.email}*${true}`;
      this.typeOfScan = "event";
      this.friend.eid = this.scannedData[1];
      this.friend.uid = this.scannedData[2];
      this.friend.name = this.scannedData[3];
      this.friend.email = this.scannedData[4];
      this.friend.share = this.scannedData[5];
      this.friend.pic = this.scannedData[6];
      if (this.type != undefined) {
        if (this.type == 'user') {
          this.makeFriend(this.friend.uid, this.friend.name);
          setTimeout(() =>
            this.router.navigate(['friends'])
            , 1000);
        } else if (this.type == 'employer') {
          // send data to notes page
          this.local.storeScan(this.friend);
          this.router.navigate(['/notes']);

        }
      }

      //this.getPic();
      //this.startStop();
    } else {
      // non jbconnect qr code detected
    }
  }

  makeFriend(uid, name, ) {
    //console.log('sid: ' + uid + ' name: '+friend_name);// uid, friend = name
    this.friendSub = this._http.post<Friend>(`${environment.API_URL}/makefriends`, { uid: uid, friend: name })
      .subscribe(
        (result) => {
          if (result) {
            console.log("friend made With: " + result['friends'].friend);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error make friends in user scan ${err}`);
          }
        }
      );
  }

  printLabel(print) {
    var sid = 0;
    console.log("eid " + this.postid);
    if (this.isGuest == false) {
      if(this.key.type == 'user'){
        this.labelType == 'studentLabel';
        this.sid = this.key.sid;
        this.name = this.key.name;
        this.feild1 = this.profile.qual;
        this.feild2 = this.profile.major;
        console.log("student printlabel feild1 "+this.feild1);
      } else if(this.type == 'employer'){
        this.labelType == 'employerLabel';
        this.sid = '';
        this.name = this.key.name;
        this.feild1 = this.profile.company;
        this.feild2 = this.profile.position;
      }
      this.printSub = this._http.post<Label>(`${environment.API_URL}/postEntry`, {
        eid: this.postid, labelType: this.labelType, print: print,
        sid: this.sid, name: this.name,
        field1: this.feild1, field2: this.feild2
      })
        .subscribe(
          (result) => {
            if (result) {
              //console.log(Object.keys(result).map(k => result[k]));
              //console.log("printLabel result: " + result['label']);
              this.local.storeLabel(result['label']);
              if (this.labelType == 'studentLabel') {
  
                  this.toast.tempSnackBar("Student Label is Printing, Enter Success!");
  
              } else if (this.labelType = 'employerLabel') {
  
                  this.toast.tempSnackBar("Employer Label is Printing, Enter Success!");
  
              } else {
  
                  this.toast.tempSnackBar("Guest Label is Printing, Enter Success!");
  
              }
              //setTimeout(() => this.router.navigate(['event']), 1000);
              this.openPrintDialog();
            }
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              console.log(`error printEmployer ${err}`);
              this.toast.tempSnackBar("Error Label is NOT Printing");
            }
          }
        );  
    } else {
      this.router.navigate(['print']);
    }

  }

  playClick() {
    this.audio.play();
  }

  ngOnInit(): void {
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = window.innerWidth;

      if (isMobile) {
        //console.log('Mobile device detected')
        this.screenWidth = this.responsiveService.screenWidth;
        this.modalSize = (window.innerWidth - 10);
      }
      else {
        //console.log('Desktop detected')
        this.screenWidth = this.responsiveService.screenWidth;
        this.modalSize = (window.innerWidth - 200);
      }
    });
    this.onResize();
    this.audio = new Audio();
    this.audio.src = "../../assets/sounds/camera.mp3";
    this.audio.load();
    /*    this.permissionMessage = 'Waiting for Permissions';
    
        this.cameraMessage = 'Looking for Camera';
        this.scanner.camerasFound.subscribe((cameras: MediaDeviceInfo[]) => {
          console.log("cameras");
          this.devices = cameras;
          this.hasCameras = true;
          this.cameraMessage = 'Camera found';
          this.scanprogress = true;
          // selects the devices's back camera by default
          for (const device of cameras) {
            if (/back|rear|environment/gi.test(device.label)) {
              this.scanner.changeDevice(device);
              this.selectedDevice = device;
              break;
            }
          }
          if (this.selectedDevice == null) {
            this.selectedDevice = cameras[0];
          }
        });
        this.scanner.permissionResponse.subscribe((answer: boolean) => {
          console.log("permission");
          this.hasPermission = answer;
          if (this.hasPermission) {
            // camera has started
            this.camStarted = true;
            this.permissionMessage = 'Scanning';
            this.dialog.closeAll();
          } else {
            this.permissionMessage = 'Permission Denied By User';
            this.camStarted = false;
            this.openCameraDialog();
          }
        });
        const source = timer(1500);
        const timerSub = source.subscribe(val => {
          this.found = true;
        }); 
        this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) => {
          this.camError = 'no camera detected';
          this.camStarted = false;
          this.openCameraDialog();
        });   */
    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      console.log("devices");
      this.hasDevices = true;
      this.availableDevices = devices;
      this.found = true;
      // selects the devices's back camera by default
      for (const device of devices) {
        if (/back|rear|environment/gi.test(device.label)) {
          //this.scanner.changeDevice(device);
          this.currentDevice = device;
          break;
        }
      }
      // laptop for testing front facing camera
      if (this.currentDevice == undefined) {
        //this.scanner.changeDevice(this.currentDevice);
        this.currentDevice = devices[0];
      }
      if (this.hasPermission) {
        this.camStarted = true;
      }
    });

    this.scanner.camerasNotFound.subscribe(() => {
      this.hasDevices = false;
    });
    this.scanner.scanComplete.subscribe((result: Result) => {
      this.qrResult = result;
    });
    this.scanner.permissionResponse.subscribe((perm: boolean) => {
      console.log("permisson");
      this.camStarted = true;
      this.hasPermission = perm;
      if (this.hasPermission) {
        this.scanprogress = true;
        this.dialog.closeAll();
      } else {
        this.camStarted = false;
      }
    });
  }

  displayCameras(cameras: MediaDeviceInfo[]) {
    console.debug('Devices: ', cameras);
    this.availableDevices = cameras;
  }

  scanCompleteHandler(event) {
    //this.camStarted = false;
  }

  handleQrCodeResult(resultString: string) {
    this.camStarted = false;
    console.debug('Result: ', resultString);
    this.qrResultString = resultString;
    if(this.qrFound){
      this.processResult(this.qrResultString);
      this.qrFound = false;
    }

  }


  onDeviceSelectChange(selectedValue: string) {
    console.debug('Selection changed: ', selectedValue);
    //this.currentDevice = this.scanner.getDeviceById(selectedValue);
  }

  stateToEmoji(state: boolean): string {

    const states = {
      // not checked
      undefined: '❔',
      // failed to check
      null: '⭕',
      // success
      true: '✔',
      // can't touch that
      false: '❌'
    };

    return states['' + state];
  }

  onResize() {
    this.responsiveService.checkWidth();
  }

  getCardStyle() {
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

  ngOnDestroy(): void {
    this.camStarted = false;
  }

}
