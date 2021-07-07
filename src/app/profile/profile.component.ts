import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../services/localStorage.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { sprofile } from '../models/event.model';
import { environment } from '../../environments/environment.prod';
import { Subscription } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { Router, RouterModule } from '@angular/router';
import { PictureService } from '../services/picture.service';
import { ResponsiveService } from '../services/responsive.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile:any;
  key:any;
  accId:any;
  email:any;
  student:Subscription;
  employer:Subscription;
  profileload:boolean = false;
  currentPIC:string;

  profilepicture:Subscription;
  uploadpic:Subscription;
  screenWidth:string = 'sm';
  selfieselected:boolean = false;
  picload:boolean = false;
  fileToUpload:File;
  showupload:boolean = false;
  deviceWidth:number = window.innerWidth;

  constructor(private local:LocalStorageService, private _http:HttpClient,
     private toast:ToastService, private router:Router, private picture:PictureService
     ,private responsiveService: ResponsiveService) { 

    if(local.retreiveAll() != undefined){
      this.key = local.retreiveAll();
      this.currentPIC = this.key.pic_url;
      this.profileload = true;
      if(this.key.type == 'user'){
        if(this.local.retreiveStudentProfile() != undefined){
          this.profile = this.local.retreiveStudentProfile();
        } else {
          this.getStudentProfile();
        }
      } else if (this.key.type == 'employer'){
        if(this.local.retreiveEmployerProfile() != undefined){
          this.profile = this.local.retreiveEmployerProfile();
        } else {
          this.getEmploymentProfile();
        }
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

  navToUpdate(){
    //console.log('updateprofile clicked');

    this.router.navigate(['updateprofile']);
  }

  setPicURL(event){
    //console.log("url from photo "+event);
    this.key.pic_url = event;
  }

  resetProfilePic(){
    if(this.key.pic_url != "../assets/pics/profile.jpg"){
      let deletePic = this.key.pic_url;
      this.key.pic_url ="../assets/pics/profile.jpg";
      this.local.UpdateUserPic(this.key);
      this.currentPIC = this.key.pic_url;
      const uid = this.key.uid;
      const type = this.key.type;
      const url = this.currentPIC;
      this.profilepicture = this._http.post(`${environment.API_URL}/profilepicture`,{ uid:uid, type:type, url:url })
      .subscribe(
        (result) => {
          if(result){
            //console.log('success storing the url');
            this.toast.tempSnackBar('account picture updated');
            this.picture.deletePic(uid, deletePic);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error saving profile pic url in profile ${err}`);
            this.toast.permSnackBar("picture save error "+err);
          }
        }
      );
    }
  }


  setURL(url){
    //console.log('in create selfie url'+url);
    this.currentPIC = url;
    this.saveUserProfilePicUrl();
    this.toast.tempSnackBar('account picture updated');
    this.key.pic_url = this.currentPIC;
    this.local.store(this.key);
    this.selfieselected = false;
  }

  saveUserProfilePicUrl(){
    const uid = this.key.uid;
    const type = this.key.type;
    const url = this.currentPIC;
    localStorage.setItem('pic', url);
    //console.log(`viewprofile save profile pic working url:${url}`);
    this.profilepicture = this._http.post(`${environment.API_URL}/profilepicture`,{ uid:uid, type:type, url:url })
      .subscribe(
        (result) => {
          if(result){
            //console.log('success storing the url');
            this.picload = false;
            this.toast.tempSnackBar('account picture updated');
            this.showupload = false;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error saving profile pic url in profile ${err}`);
          }
        }
      );
  }

  handleFileInput(files: FileList) {
    //console.log('file set');
    this.fileToUpload = files.item(0);
    this.picload = true;
    this.uploadEventPic();
  }


  uploadEventPic() {
    if (this.fileToUpload != null) {
      console.log("url for upload "+ `${environment.UPLOAD_URL}uploadpic`);
      const formData: FormData = new FormData();
      formData.append('photo', this.fileToUpload, this.fileToUpload.name);
      console.log
      this.uploadpic = this._http.post(`${environment.UPLOAD_URL}uploadpic`, formData)
        .subscribe(
          (result: Response) => {
            this.currentPIC = `${environment.UPLOAD_URL}${result['url']}`;
            this.key.pic_url = this.currentPIC;
            this.local.store(this.key);
            this.toast.tempSnackBar('Profile Pic Uploaded');
            this.saveUserProfilePicUrl();
            
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              console.log(`error uploading profile pic ${err}`);
              this.picload = false;
            }
          }
        )
    } else {
      alert('Please add a picture before submitting');
    }
  }

  getStudentProfile(){
    const uid = this.key.uid;
    const email = this.key.email;
    //console.log(`uid: ${uid} email: ${email}`);
    this.student = this._http.post<sprofile[]>(`${environment.API_URL}/getstudentprofile`,{ uid:uid, email:email })
    .subscribe(
      (result) => {
        if (result) {
          this.profile = result['profile'][0];                 //all posts retreived
          if(this.profile == undefined){
            this.router.navigate(['createprofile']);
          }else{
            this.profileload = false;
            this.local.storeStudentProfile(this.profile);
          }
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

  getEmploymentProfile(){
    const uid = this.key.uid;
    const email = this.key.email;
    //console.log(`uid: ${uid} email: ${email}`);
    this.employer = this._http.post<sprofile>(`${environment.API_URL}/getemployerprofile`,{ uid:uid, email:email })
    .subscribe(
      (result) => {
        if (result) {
          this.profile = result['profile'][0];   
          if(this.profile == undefined){
            this.router.navigate(['createprofile']);
          }else{
            this.profileload = false;
            this.local.storeEmployerProfile(this.profile);
          }
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
    this.student.unsubscribe();
    this.employer.unsubscribe();
    this.profilepicture.unsubscribe();
    this.uploadpic.unsubscribe();
  }

}
