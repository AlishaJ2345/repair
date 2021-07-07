import { Component, OnChanges, OnInit, Input, EventEmitter, Output, ViewChild, ViewChildren } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Posts, sprofile, eprofile } from '../models/event.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { LocalStorageService } from '../services/localStorage.service';
import { Router } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { timeInterval, debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import "rxjs/add/operator/debounceTime";
import { distinctUntilChanged } from 'rxjs/operators';
//import * as moment from 'moment';
import * as moment from 'moment-mini-ts'

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnChanges, OnInit {
  @Input() filterBy?: string = 'all';
  @ViewChild('input', { static: false }) input;

  profilePic: any;
  posts: Posts[];
  deleted: Posts[];
  allPosts: Posts[];
  showPosts: boolean = false;
  show: boolean = false;
  post: Posts[];
  singlePost: any;
  key: any;
  postSub: Subscription;
  student: Subscription;
  employer: Subscription;
  searchKey: string = '';
  // material slider
  SProfile: sprofile;
  EProfile: eprofile;
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = false;
  value = 0;
  vertical = false;
  isSearching: boolean = true;

  eventload: boolean = false;
  startsWith: boolean = true;
  contains: boolean = false;
  showPic: boolean = false;

  constructor(private _http: HttpClient, private local: LocalStorageService,
    private router: Router) {
    this.deleted = [];
    this.key = local.retreiveAll();
    if (this.key != undefined) {
      this.profilePic = `${environment.UPLOAD_URL}${this.key.pic_url}`;
      console.log(this.key.type);
      if (this.key.type == 'user') {
        this.getStudentProfile();
      } else if (this.key.type == 'employer') {
        this.getEmploymentProfile();
      } else {
        console.log("type check failed");
      }
      this.getposts();
    } else {                          // not loggedin user
      this.getposts();
      this.profilePic = '../../assets/pics/profile.jpg';
    }
  }

  gotoPrint(eid, ename) {
    this.router.navigate(['print', eid, ename]); // add eid to params 
  }

  toggeShowPic(index) {
    this.posts[index].isvisable = !this.posts[index].isvisable;
    //console.log("toggle pic " + index);
    //this.posts[index].speakers = 'open';
    //console.log("before index " + index);
    //if (this.posts[index].isvisable = false) {
      //this.posts[index].isvisable = 'open';
      //console.log("change open index " + index + " state " + this.posts[index].speakers);
    //}
  }

  //  returns boolean is before number of hours
  withinHours(start) {
    var startDate = moment(start);
    var m1 = startDate.subtract(1, 'h');
    var m2 = startDate.subtract(1, 'd');

    // Default results
    //console.log(m1.fromNow());
    //console.log(m2.fromNow());

    if(m1.isSame(moment(), 'hour')){
      //console.log("green");
      return "Green";
    }else if(m2.isSame(moment(), 'day')){
      //console.log("orange");
      return "Orange";
    }else {
      //console.log("grey");
      return "#D3D3D3";
    }
    


    //return moment(start).isSame(moment(), 'day');
    //   testing   //
  }

  fromNow(start) {
    let time = Date.now();
    const now = moment(time);
    const expiration = moment(start);

    // get the difference between the moments
    const diff = expiration.diff(now);
    //express as a duration
    const diffDuration = moment.duration(diff);
    return "Starts: " + (diffDuration.days()) + " Days " + diffDuration.hours() + " Hours " + diffDuration.minutes() + " Mins ";
  }

  filterFunction(posts): any[] {
    this.posts = this.allPosts;
    if (this.posts != undefined) {
      this.posts = this.posts.filter(i => i.event_name.toLocaleLowerCase().includes(this.searchKey.toLocaleLowerCase()))
    }
    return this.posts;
  }


  onSearchClear() {
    this.posts = this.allPosts;
    this.searchKey = '';
    this.filterFunction("");
  }

  ngOnInit(): void {

    this.eventload = true;


  }

  onInputChange(event: any) {
    //console.log("This is emitted as the thumb slides" + event.value);
  }

  gotoMaps(eventID) {
    //console.log('gotomaps event: ' + eventID);
    this.router.navigate(['maps'], { queryParams: { eventID } });
  }

  moreInfo(eid, name) {
    //this.router.navigate(['event'], { queryParams: { eid }});
    this.router.navigate(['event', eid, name])
  }

  sortByDate() {
    this.allPosts.sort((a: any, b: any) => {
      let left = Number(new Date(a.start_date));
      let right = Number(new Date(b.start_date));
      return left - right;
    });
    return this.allPosts;
    /*
    this.allPosts = this.allPosts.sort((a: any, b: any) =>
    a.start_date - b.start_date
    ); */
  }

  getposts() {
    this.postSub = this._http.get<Posts[]>(`${environment.API_URL}/posts`)
      .subscribe(
        (result) => {
          if (result) {
            this.allPosts = result['posts'];                 //all posts retreived
            //console.log(this.allPosts);
            this.sortByDate();
            this.posts = this.allPosts.slice(0);             //make copy of posts to display
            this.eventload = false;
            this.local.storeEventArray(this.allPosts);
            this.posts.forEach((post) => {
              post.isvisable = true;
            });
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
            this.eventload = true;
          }
        }
      );
  }

  getStudentProfile() {
    const uid = this.key.uid;
    const email = this.key.email;
    //console.log(`uid: ${uid} email: ${email}`);
    this.student = this._http.post<sprofile[]>(`${environment.API_URL}/getstudentprofile`, { uid: uid, email: email })
      .subscribe(
        (result) => {
          if (result) {
            this.SProfile = result['profile'][0];                 //all posts retreived
            this.local.storeStudentProfile(this.SProfile);
            console.log("store sprofile");
            //console.log(Object.keys(result).map(k => result[k]));
            //localStorage.setItem('sprofile', JSON.stringify(this.profile[0]));
            //console.log(this.profile);
            //this.loginaction = false;
            //setTimeout(() => this.router.navigate(['events']), 1000);
            //this.router.navigate(['events']);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  getEmploymentProfile() {
    const uid = this.key.uid;
    const email = this.key.email;
    //console.log(`uid: ${uid} email: ${email}`);
    this.employer = this._http.post<sprofile>(`${environment.API_URL}/getemployerprofile`, { uid: uid, email: email })
      .subscribe(
        (result) => {
          if (result) {
            this.EProfile = result['profile'][0];                 //all posts retreived
            this.local.storeEmployerProfile(this.EProfile);
            console.log("store eprofile");
            //console.log(Object.keys(result).map(k => result[k]));
            //localStorage.setItem('sprofile', JSON.stringify(this.profile[0]));
            //console.log(this.profile);                                                                             
            //this.loginaction = false;
            //setTimeout(() => this.router.navigate(['events']), 1000);
            //this.router.navigate(['events']);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }

  ngOnChanges() {
    this.posts = this.allPosts;
  }

  getPost(id: number) {
    return this.posts.slice(0).find(image => image.eid == id);
  }

  drop(event: CdkDragDrop<Posts[]>) {
    moveItemInArray(this.posts, event.previousIndex, event.currentIndex);
  }

  remove(index) {
    this.posts.splice(index, 1);
  }

  attend(index) {
    this.router.navigate(['scan']);
  }

  OnDestroy() {
    this.postSub.unsubscribe();
  }

}
