import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';
import { ToastService } from '../services/toast.service';
import { LocalStorageService } from '../services/localStorage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.css']
})
export class CreateProfileComponent implements OnInit {

  Sprofileform: FormGroup;
  Eprofileform: FormGroup;
  fileToUpload: File = null;                        // pic to upload server
  currentPIC;
  user:any;
  uploadpic:Subscription;
  profilepicture:Subscription;
  studentprofile:Subscription;
  employerprofile:Subscription;

  picload:boolean = false;
  profileLoad:boolean = false;
  selfieselected:boolean = false;

  constructor(private fb: FormBuilder, private _http: HttpClient,
     private local:LocalStorageService, private router: Router, 
     private toast:ToastService) { 
      this.user = local.retreiveAll();

     }

  ngOnInit() {
    this.Sprofileform = this.fb.group({
      uni: ['',  [Validators.required, Validators.maxLength(128)]],
      qual: ['',  [Validators.required, Validators.maxLength(128)]],
      major: ['',  [Validators.required, Validators.maxLength(128)]],
      year: ['',  ],
      location: ['',  [Validators.required, Validators.maxLength(128)]]
    });

    this.Eprofileform = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      company: ['', [Validators.required, Validators.maxLength(128)]],
      position: ['', [Validators.required, Validators.maxLength(128)]],
      address: ['', [Validators.required, Validators.maxLength(128)]],
      location: ['', [Validators.required, Validators.maxLength(128)]]
    });
  }

  get s(){
    return this.Sprofileform.controls;
  }

  get e(){
    return this.Eprofileform.controls;
  }

  setPicURL(event){
    //console.log("url from photo "+event);
    this.user.pic_url = event;
  }

  setURL(url){
    //console.log('in create selfie url'+url);
    this.currentPIC = url;
    this.saveUserProfilePicUrl();
    this.picload = false;
    this.toast.tempSnackBar('account picture updated');
    this.user.pic_url = this.currentPIC;
    this.local.store(this.user);
    this.selfieselected = false;
  }

  handleFileInput(files: FileList) {
    //console.log('file set');
    this.fileToUpload = files.item(0);
    this.picload = true;
    this.uploadEventPic();
  }

  uploadEventPic() {
    if (this.fileToUpload != null) {
      const formData: FormData = new FormData();
      formData.append('photo', this.fileToUpload, this.fileToUpload.name);
      this.uploadpic = this._http.post(`${environment.UPLOAD_URL}uploadpic`, formData)
        .subscribe(
          (result: Response) => {
            this.currentPIC = `${environment.UPLOAD_URL}${result['url']}`;
            this.user.pic_url = this.currentPIC;
            this.local.store(this.user);
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

  saveUserProfilePicUrl(){
    const uid = this.user.uid;
    const type = this.user.type;
    const url = this.currentPIC;
    localStorage.setItem('pic', url);
    //console.log(`viewprofile save profile pic working url:${url}`);
    this.profilepicture = this._http.post(`${environment.API_URL}/profilepicture`,{ uid:uid, type:type, url:url })
      .subscribe(
        (result) => {
          if(result){
            console.log('success storing the url');
            this.picload = false;
            this.toast.tempSnackBar('account picture updated');
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error saving profile pic url in profile ${err}`);
          }
        }
      );
  }

  storeStudent(){
    let val = this.Sprofileform.value;
    this.profileLoad = true;
    //console.log('store student');
    this.studentprofile = this._http.post(`${environment.API_URL}/studentprofile`,
    {uid:this.user.uid, pic_url:this.currentPIC, uni:val.uni, qual:val.qual, major:val.major, year:val.year, location:val.location})
    .subscribe(
      (result) => {
        this.toast.tempSnackBar('Confirmation Email Sent');
        this.local.storeStudentProfile(result);
        this.profileLoad = false;
        setTimeout(()=>{
          this.router.navigate(['home']);
        },2000);
      }
    )
  }

  storeEmployer(){
    this.profileLoad = true;
    let val = this.Eprofileform.value;
    const uid = this.user.uid;
    this.employerprofile = this._http.post(`${environment.API_URL}/employerprofile`,
    {uid, company:val.company, position:val.position, address:val.address, location:val.location })
    .subscribe(
      (result) => {
        this.toast.tempSnackBar('Profile Saved');
        this.local.storeEmployerProfile(result);
        this.profileLoad = false;
        setTimeout(()=>{
          this.router.navigate(['home']);
        },2000);
      }
    )
  }

  OnDestroy(){
    this.uploadpic.unsubscribe();
    this.profilepicture.unsubscribe();
    this.studentprofile.unsubscribe();
    this.employerprofile.unsubscribe();
  }

}
