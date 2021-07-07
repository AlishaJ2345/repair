import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User, Posts } from '../models/event.model';
import { LocalStorageService } from '../services/localStorage.service';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Label } from '../models/event.model';
import { environment } from '../../environments/environment.prod';
import { ToastService } from '../services/toast.service';
import { BackurlService } from '../services/backurl.service';
import { MatDialog } from '@angular/material/dialog';
import { HealthSafteyComponent } from '../health-saftey/health-saftey.component';
import { ResponsiveService } from '../services/responsive.service';
import { ConfirmPrintComponent } from '../confirm-print/confirm-print.component';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-make-lable',
  templateUrl: './make-lable.component.html',
  styleUrls: ['./make-lable.component.css']
})
export class MakeLableComponent implements OnInit, OnDestroy, AfterViewInit {

  StudentLabel: FormGroup;
  EmployerLabel: FormGroup;
  GuestLabel: FormGroup;
  user: User;
  labelType: string = 'studentLabel';
  printPrgress: boolean = false;
  labelTypesArray: string[] = ['studentLabel', 'employerLabel', 'guestLabel'];
  labelArrayIndex: number = 2;
  labelArrayRange: number = this.labelTypesArray.length - 1;
  printSub: Subscription;
  postSub:Subscription;
  label: Label;
  event: Posts;
  //   hard coded for testing
  event_name: string = 'Event name';
  eid: number = 0;
  identered: string = '';
  profile: any;
  screenWidth: string = 'sm';
  deviceWidth: number = window.innerWidth;
  val: any;
  sid: number = 0;
  station:number = 1;
  feild1: string = '';
  feild2: string = '';
  modalWidth: number = 280;
  totalCharsAllowed = 21;
  nameSize = 28;
  majorSize = 35; 
  cardStyle = {
    'width': '260px'
  }
  stationNum:number = 0;
  hasStation:boolean = false;
  hasSubmitted:boolean = false;
  isInputShown:boolean = true;


  constructor(private fb: FormBuilder, private local: LocalStorageService,
    private _http: HttpClient, private activated: ActivatedRoute,
    private router: Router, private toast: ToastService, private back: BackurlService,
    public dialog: MatDialog, private responsiveService: ResponsiveService, private routes: ActivatedRoute) {
    this.user = local.retreiveAll();
    this.getEid();
    let temp = this.router.url;
    console.log("station "+temp);
    if(temp.includes('station')){
      let loc = temp.length -1;
      console.log("station # "+temp[loc]);
      this.stationNum = +temp[loc];
      this.hasStation = true;
    }


  }

  

  getEvent(eid) {
    this.postSub = this._http.post<Posts>(`${environment.API_URL}/post`, {eid:eid})
      .subscribe(
        (result) => {
          if (result) {
            console.log(Object.keys(result).map(k => result[k]));
            this.event = result['post'][0];                 //all posts retreived
            this.event_name = this.event.event_name;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error make label in get event ${err}`);
          }
        }
      );
  }

  getEid() {
    this.postSub = this._http.get(`${environment.API_URL}/geteid`)
      .subscribe(
        (result) => {
          if (result) {

            if (result != undefined) {
              //console.log(result[0].eid);
              this.eid = +result[0].eid;
              console.log('this.eid: ' + this.eid);
              this.getEvent(this.eid);
            } 
          } else {
            console.log("no result found get eid");
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error make label in landing ${err}`);
          }
        }
      );
  }


  openHSDialog(): void {
    const dialogRef = this.dialog.open(HealthSafteyComponent, {
      width: `${this.modalWidth}px`
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed '+result);
      if (result) {
        this.openPrintDialog(0);
      } else {
        this.toast.notifySnackBar("You May Not Enter the Event!");
      }

    });
  }

  openPrintDialog(stationNum): void {
    const dialogRef = this.dialog.open(ConfirmPrintComponent, {
      width: `${this.modalWidth}px`,
      data: { stationNum: stationNum, eventName: this.event_name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result == 'account'){
        setTimeout(() => this.router.navigate(['register']), 1000);
      } else {
        if (result) {
          setTimeout(() => this.router.navigate(['event']), 1000);
          //this.printLabel(true);
        } else {  // no label is printed
          setTimeout(() => this.router.navigate(['event']), 1000);
          //this.printLabel(true);
        }
      }
    });
  }


  ngOnInit() {

    //this.eid = +this.local.retreiveEventID();
    //this.event_name = this.event_name;
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      //console.log("responsive hit");
      this.deviceWidth = window.innerWidth;
      if (isMobile) {
        //console.log('Mobile device detected')
        this.screenWidth = this.responsiveService.screenWidth;
      }
      else {
        //console.log('Desktop detected')
        this.screenWidth = this.responsiveService.screenWidth;
      }
      this.getCardStyle();
    });
    this.onResize();
    this.nextLabel();

    this.labelType = 'studentLabel';
    this.StudentLabel = this.fb.group({
      id: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(5)]],
      station: ['', [Validators.required, Validators.minLength(1)]],
      name: ['', [Validators.required, Validators.maxLength(28)]],
      programme: ['', [Validators.maxLength(21)]],
      major: ['', [Validators.maxLength(35)]]
    });
    this.EmployerLabel = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(28)]],
      station: ['', [Validators.required, Validators.minLength(1)]],
      company: ['', [Validators.required, Validators.maxLength(21)]],
      position: ['', [Validators.maxLength(35)]]
    });
    this.GuestLabel = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(28)]],
      station: ['', [Validators.required, Validators.minLength(1)]],
      detail: ['', [Validators.maxLength(21)]]
    });
    if(this.hasStation){
      this.StudentLabel.controls['station'].setValue(this.stationNum);
      this.EmployerLabel.controls['station'].setValue(this.stationNum);
      this.GuestLabel.controls['station'].setValue(this.stationNum);
      this.isInputShown = false;
    }

  }

  ngAfterViewInit(): void {
    this.onResize();
  }

  onResize() {
    this.responsiveService.checkWidth();
  }

  getCardStyle(){
    let ans = (this.deviceWidth - 32);
    this.cardStyle = {
      'width': `${ans}px`
    } 
    if (this.screenWidth == 'sm') {
      this.cardStyle = {
        'width': `${ans}px`
      } 
    } else if (this.screenWidth == 'md') {
      this.cardStyle = {
        'width': '500px'
      }
    } else if (this.screenWidth == 'lg') {
      this.cardStyle = {
        'width': '900px'
      }
    }
    let test = {
      'width': `${ans}px`
    }

  }

  idIsLongEnought() {
    if (this.identered.length >= 6) {
      console.log("true");
      return true;
    } else {
      console.log("false");
      return false;
    }
  }


  nextLabel() {
    //console.log("next label index:" + this.labelArrayIndex)
    if (this.labelArrayIndex >= this.labelArrayRange) {
      this.labelArrayIndex = 0;
    } else if (this.labelArrayIndex < this.labelArrayRange) {
      this.labelArrayIndex++;
    }

  }

  printLabel(print) {
    if(this.hasSubmitted == false){
      console.log("printlabel hit for the first time");
      this.hasSubmitted = true;
      var sid = 0;
      console.log("eid " + this.eid);
      if (this.labelType == 'studentLabel') {
        this.val = this.StudentLabel.value;
        this.station = this.val.station;
        this.sid = this.val.id;
        this.feild1 = this.val.programme;
        this.feild2 = this.val.major;
      } else if (this.labelType == 'employerLabel') {
        this.val = this.EmployerLabel.value;
        this.station = this.val.station;
        this.feild1 = this.val.company;
        this.feild2 = this.val.position;
      } else {
        this.val = this.GuestLabel.value;
        this.station = this.val.station;
        this.feild1 = this.val.detail;
      }
      console.log("station "+this.station);
      this.printSub = this._http.post<Label>(`${environment.API_URL}/postEntry`, {
        eid: this.eid, station: this.station, labelType: this.labelType, print: print,
        sid: this.sid, name: this.val.name,
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
              this.openPrintDialog(this.station);
            }
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              console.log(`error printEmployer ${err}`);
              this.toast.tempSnackBar("Error Label is NOT Printing");
            }
          }
        );
    }

  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.EmployerLabel.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    //console.log("invalid:  "+invalid[0].tostring());
    return invalid;
  }


  radioChange(selected) {
    //console.log("selected"+ selected.value);
    
    if (selected.value == 1) {
      this.labelType = 'studentLabel';
      this.StudentLabel.controls['station'].setValue(this.stationNum);
    } else if (selected.value == 2) {
      this.labelType = 'employerLabel';
      this.EmployerLabel.controls['station'].setValue(this.stationNum);
      this.findInvalidControls();
    } else if (selected.value == 3) {
      this.labelType = 'guestLabel';
      this.GuestLabel.controls['station'].setValue(this.stationNum);
    }
    /*    if (this.labelType == 'studentLabel') {
            this.StudentLabel = this.fb.group({
              id: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(5)]],
              name: ['', [Validators.required, Validators.maxLength(21)]],
              programme: ['', [Validators.maxLength(21)]],
              major: ['', [Validators.maxLength(21)]]
            }); 
            
          }
        } else if(selected.value == 2) {
          this.labelType = 'employerLabel';
          if(this.labelType == 'employerLabel')
          this.EmployerLabel = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(21)]],
            company: ['', [Validators.required, Validators.maxLength(21)]],
            position: ['', [Validators.required, Validators.maxLength(21)]]
          });
        }else if (selected.value == 3) {
          this.labelType = 'guestLabel';
          if (this.labelType == 'guestLabel') {
            this.GuestLabel = this.fb.group({
              name: ['', [Validators.required, Validators.maxLength(21)]],
              detail: ['', [Validators.maxLength(21)]]
            });
          }
        }  */
  }
  // student 
  getStudentIDChars() {
    let val = this.StudentLabel.value;
    let displayed = (10 - val.id.length)
    //let currentVal = Math.abs(this.totalCharsAllowed - val.name.length)
    if (displayed == 0) {
      return "Zero Spaces: " + displayed;
    } else if (displayed < 0) {
      return "Remove: " + Math.abs(displayed) + " Numbers";
    }
    return (10 - val.id.length);
  }
  getStudentNameChars() {
    let val = this.StudentLabel.value;
    let displayed = (this.nameSize - val.name.length)
    //let currentVal = Math.abs(this.totalCharsAllowed - val.name.length)
    if (displayed == 0) {
      return "Zero Spaces: " + displayed;
    } else if (displayed < 0) {
      return "Remove: " + Math.abs(displayed) + " Letters";
    }
    return (this.nameSize - val.name.length);
  }
  getProgrammeChars() {
    let val = this.StudentLabel.value;
    let displayed = (this.totalCharsAllowed - val.programme.length)
    //let currentVal = Math.abs(this.totalCharsAllowed - val.name.length)
    if (displayed == 0) {
      return "Zero Spaces: " + displayed;
    } else if (displayed < 0) {
      return "Remove: " + Math.abs(displayed) + " letters";
    }
    return (this.totalCharsAllowed - val.programme.length);
  }
  getMajorChars() {
    let val = this.StudentLabel.value;
    let displayed = (this.majorSize - val.major.length)
    //let currentVal = Math.abs(this.totalCharsAllowed - val.name.length)
    if (displayed == 0) {
      return "Zero Spaces: " + displayed;
    } else if (displayed < 0) {
      return "Remove: " + Math.abs(displayed) + " letters";
    }
    return (this.majorSize - val.major.length);
  }
  // guest
  getGuestNameChars() {
    let val = this.GuestLabel.value;
    let displayed = (this.nameSize - val.name.length)
    //let currentVal = Math.abs(this.totalCharsAllowed - val.name.length)
    if (displayed == 0) {
      return "Zero Spaces: " + displayed;
    } else if (displayed < 0) {
      return "Remove: " + Math.abs(displayed) + " letters";
    }
    return (this.nameSize - val.name.length);
  }
  getDetailChars() {
    let val = this.GuestLabel.value;
    let displayed = (this.totalCharsAllowed - val.detail.length)
    //let currentVal = Math.abs(this.totalCharsAllowed - val.name.length)
    if (displayed == 0) {
      return "Zero Spaces: " + displayed;
    } else if (displayed < 0) {
      return "Remove: " + Math.abs(displayed) + " letters";
    }
    return (this.totalCharsAllowed - val.detail.length);
  }

  getEmployerNameChars() {
    let val = this.EmployerLabel.value;
    let displayed = (this.nameSize - val.name.length)
    //let currentVal = Math.abs(this.totalCharsAllowed - val.name.length)
    if (displayed == 0) {
      return "Zero Spaces: " + displayed;
    } else if (displayed < 0) {
      return "Remove: " + Math.abs(displayed) + " Letters";
    }
    return (this.nameSize - val.name.length);
  }
  getEmployerCompanyChars() {
    let val = this.EmployerLabel.value;
    let displayed = (this.totalCharsAllowed - val.company.length)
    //let currentVal = Math.abs(this.totalCharsAllowed - val.name.length)
    if (displayed == 0) {
      return "Zero Spaces: " + displayed;
    } else if (displayed < 0) {
      return "Remove: " + Math.abs(displayed) + " letters";
    }
    return (this.totalCharsAllowed - val.company.length);
  }
  getEmployerPositionChars() {
    let val = this.EmployerLabel.value;
    let displayed = (this.majorSize - val.position.length)
    //let currentVal = Math.abs(this.totalCharsAllowed - val.name.length)
    if (displayed == 0) {
      return "Zero Spaces: " + displayed;
    } else if (displayed < 0) {
      return "Remove: " + Math.abs(displayed) + " letters";
    }
    return (this.majorSize - val.position.length);
  }



  printEmployer(print) {
    let val = this.EmployerLabel.value;
    let labelType = 'employerLabel';
    /*  console.log("printStudent called\n"
        + " uid:" + this.user.uid + " eid: " + this.eid + " type: " + this.user.type
        + " lableType: " + labelType + " event_name: " + this.event_name + " name: " + val.name
        + " programme: " + val.programme + " major: " + val.major);  */
    this.printSub = this._http.post<Label>(`${environment.API_URL}/printlabel`, {
      rid: "", uid: this.user.uid, eid: this.eid, type: this.user.type, label_type: labelType,
      event_name: this.event_name, name: val.name,
      field1: val.company, field2: val.position
    })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(Object.keys(result).map(k => result[k]));
            //console.log("printLabel result: " + result['label']);
            this.local.storeLabel(result['label']);
            this.toast.tempSnackBar("Employer Label is Printing");
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error printEmployer ${err}`);
          }
        }
      );
  }

  printStudent(print) {
    let val = this.StudentLabel.value;
    let labelType = 'studentLabel';
    /*  console.log("printStudent called\n"
        + " uid:" + this.user.uid + " eid: " + this.eid + " type: " + this.user.type
        + " lableType: " + labelType + " event_name: " + this.event_name + " name: " + val.name
        + " programme: " + val.programme + " major: " + val.major);  */

    this.printSub = this._http.post<Label>(`${environment.API_URL}/printlabel`, {
      rid: "", uid: this.user.uid, eid: this.eid, type: this.user.type, label_type: labelType,
      event_name: this.event_name, name: val.name,
      field1: val.programme, field2: val.major
    })
      .subscribe(
        (result) => {
          if (result) {
            this.label = result['label'];
            //console.log(Object.keys(result).map(k => result[k]));
            //console.log("printLabel result: " + this.label['label']);
            this.local.storeLabel(result['label']);
            this.toast.tempSnackBar("Student Label is Printing");
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  printGuest(print) {
    let val = this.GuestLabel.value;
    let labelType = 'guestLabel';
    //console.log("printGuest called");

    this.printSub = this._http.post<Label>(`${environment.API_URL}/printguest`, {
      rid: "", uid: 0, eid: this.eid, type: "guest", label_type: labelType,
      event_name: this.event_name, name: val.name,
      field1: val.detail, field2: ""
    })
      .subscribe(
        (result) => {
          if (result) {
            //this.label = result['label'];
            //console.log(Object.keys(result).map(k => result[k]));
            //console.log("printLabel result: " + this.label['label']);
            //this.local.storeLabel(result['label']);
            this.toast.tempSnackBar("Guest Label is Printing");
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  ngOnDestroy(): void {
    if (this.printSub != null) {
      this.printSub.unsubscribe();
    }
    if(this.postSub){
      this.postSub.unsubscribe();
    }
  }

}