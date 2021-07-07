import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { LocalStorageService } from '../../services/localStorage.service';
import { ActivatedRoute } from '@angular/router';
import { Scans, promoted, Skill } from '../../models/event.model';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';


@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[]= ['name', 'stars', 'email', 'tag', 'notes', 'Actions'];
  searchKey:string;
  user:any = [];
  eventName:any;
  events:any;
  selected:any;
  profile:any;
  uid:any;
  post:any;
  date:any;
  location:any;
  email:any;
  scans:any;
  viewPic:any;
  company:string;
  //subscriptions
  scanbyemail:Subscription;
  getstudentprofile:Subscription;
  eventbyname:Subscription;
  eventbyemail:Subscription;
  bycompanySub:Subscription;
  studentprofileSub:Subscription;
  getprofilepicture:Subscription;

  scanaction:boolean = false;
  profilePic:string;
  eProfile:any;
  position:string ="";
  index:number = 0;
  toBeDeleted:Skill;

  constructor(private _http:HttpClient, private local:LocalStorageService,
    private route:ActivatedRoute, private toast:ToastService) {
    this.user = local.retreiveAll();

    if(this.local.retreiveEmployerProfile() != undefined){
      this.eProfile = this.local.retreiveEmployerProfile();
      this.company = this.eProfile.company;
    }

    console.log('company: '+this.company);
   }

  ngOnInit() {
    if (this.company != undefined){
      this.getScansByCompany();
    }
  }

  onSearchClear(){
    this.searchKey = '';
    this.applyFilter();
  }

  applyFilter(){
    this.dataSource.filter = this.searchKey.trim().toLowerCase();
  }

  onChange(selectedValue: string) {
    //console.log("Selection changed", selectedValue);
    this.eventName = selectedValue;
    //this.getScansByEmail();
  }

  //eid, sid, company, scanner_email, email, name, picture, stars, notes, tag, major, degree, uni, location, interviewed, position
  storeCandidate(){
    let candy = this.dataSource.data[this.index];
    this.bycompanySub = this._http.post(`${environment.API_URL}/createcandidate`, 
    { eid:this.eProfile.pid, sid:candy.sid, company:this.company, scanner_email:this.user.email,
       email:candy.email, name:candy.name, picture:this.profilePic, stars:candy.stars, notes:candy.notes,
      tag:candy.tag, major:this.profile[0].major, degree:this.profile[0].qual, uni:this.profile[0].uni,
      location:'NZ', interviewed:false, position:this.position })
    .subscribe(
      (result) => {
        this.events = result;
        this.toast.tempSnackBar(candy.name+ " Added to Candidates");
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

// returns the scans from this email
  getScansByCompany(){
    this.bycompanySub = this._http.post<Scans[]>(`${environment.API_URL}/scanbycompany`, { company:this.company })
    .subscribe(
      (result) => {
        this.events = result;
        //console.log(result);
        this.dataSource = new MatTableDataSource(result);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.scanaction = false;
        console.log(Object.keys(result).map(k => result[k]));
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

  getPic() {
    //console.log('sid in getpic:' + this.uid);
    this.getprofilepicture = this._http.post(`${environment.API_URL}/getprofilepicture`, {
      sid: this.uid
    })
      .subscribe(
        (result) => {
          if (result) {
            this.profilePic = result['pic'].pic_url;
            //console.log(`profilePic:${this.profilePic}`);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error posting scan ${err}`);
          }
        }
      );
  }

// return the profile of this account index 
  inspect2(index){
    this.index = index;
    this.selected = this.events[index];
    this.profilePic = this.selected.picture;
    this.uid = this.selected.sid;

    this.studentprofileSub = this._http.post(`${environment.API_URL}/getstudentprofile`, { uid: this.uid })
    .subscribe(
      (result) => {
        if (result) {
          this.profile = result['profile'];                 //all posts retreived
          //console.log(Object.keys(result).map(k => result[k]));
          //this.profilePic = result['profile'][0].pic_url;
          //this.getPic();
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

  inspect(index){
    this.selected = this.events[index];
    this.profilePic = this.selected.picture;
    this.uid = this.selected.sid;
    this._http.post<promoted>(`${environment.API_URL}/getpromotedstudent`, { uid:this.uid })
    .subscribe(
      (result) => {
        //this.events = result;
        //console.log(result);
        this.profile = result['profile'];
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

// for table by email and event name
  getEventDetails(){
    //console.log('eventname '+this.eventName);
    this.eventbyname = this._http.post(`${environment.API_URL}/eventbyname`, { eventName: this.eventName })
    .subscribe(
      (result) => {
        if (result) {
          //console.log(Object.keys(result).map(k => result[k]));
          this.post = result['post'];
          this.eventName = this.post.event_name;
          this.date = this.post.start_date;
          this.location = this.post.location;
          //this.getScansByEmail();
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting post in events ${err}`);
        }
      }
    );
  }
//  for select drop down
  getEvents(){
    this.eventbyemail = this._http.post(`${environment.API_URL}/eventbyemail`, { email: this.user.email })
    .subscribe(
      (result) => {
        if (result) {
          this.events = result['events'];                 //all posts retreived
          //console.log(Object.keys(result).map(k => result[k]));
          this.dataSource = new MatTableDataSource(this.events);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.scanaction = false;
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

  delete(index){
    let deleted = this.dataSource.data[index];
    // this.toBeDeleted.scan_id
  }

  OnDestroy(){
    if(this.scanbyemail != undefined){
      this.scanbyemail.unsubscribe();
    }
    if(this.getstudentprofile != undefined){
      this.getstudentprofile.unsubscribe();
    }
    if(this.eventbyname != undefined){
      this.eventbyname.unsubscribe();
    }
    if(this.eventbyemail != undefined){
      this.eventbyemail.unsubscribe();
    }
    if(this.bycompanySub != undefined){
      this.bycompanySub.unsubscribe();
    }
    if(this.studentprofileSub != undefined){
      this.studentprofileSub.unsubscribe();
    }
    if(this.getprofilepicture != undefined){
      this.getprofilepicture.unsubscribe();
    }
    
  }

}
