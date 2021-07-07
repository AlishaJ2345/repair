import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import * as FileSaver from 'file-saver';
import { LocalStorageService } from '../services/localStorage.service';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-photo-uploads',
  templateUrl: './photo-uploads.component.html',
  styleUrls: ['./photo-uploads.component.css']
})
export class PhotoUploadsComponent implements OnInit {

  @Output() valueChange = new EventEmitter<string>();

  imageChangedEvent: any = '';
  imgFile: any;
  croppedImage = new Blob();
  fileName: any = 'testcropped';
  crop: File;
  fileInput:boolean = false;
  showUpLoadButton: boolean = false;
  Image: any;
  source: string = '';
  key:any;
  profilepicture:Subscription;
  uploadpic:Subscription;
  currentPIC:string;
  profileload:boolean = false;
  complete:boolean = true;
  cropFileLoading:boolean = false;

  constructor(private local:LocalStorageService, private _http:HttpClient, private toast:ToastService) {
    this.key = this.local.retreiveAll();
    if(this.key.pic_url == '' || this.key.pic_url == undefined){
      this.key.pic_url = "../../assets/pics/profile.jpg";
    }
  }


  saveUserProfilePicUrl(url){
    const uid = this.key.uid;
    const type = this.key.type;
    localStorage.setItem('pic', url);
    //console.log(`viewprofile save profile pic working url:${url}`);
    this.profilepicture = this._http.post(`${environment.API_URL}/profilepicture`,{ uid:uid, type:type, url:url })
      .subscribe(
        (result) => {
          if(result){
            //console.log('success storing the url');
            //this.picload = false;
            this.profileload = false;
            this.toast.tempSnackBar('account picture updated');
            this.complete = false;
            this.valueChange.emit(this.currentPIC);
            //this.showupload = false;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            this.profileload = false;
            console.log(`error saving profile pic url in profile ${err}`);
          }
        }
      );
  }

  uploadEventPic() {
    //console.log("upload event pic called");
    this.source = '';
    if (this.crop != null) {
      this.profileload = true;
      const formData: FormData = new FormData();
      formData.append('photo', this.crop, this.crop.name);
      this.uploadpic = this._http.post(`${environment.UPLOAD_URL}uploadpic`, formData)
        .subscribe(
          (result: Response) => {
            this.currentPIC = `${environment.UPLOAD_URL}${result['url']}`;
            this.key.pic_url = this.currentPIC;
            this.local.store(this.key);
            //this.toast.tempSnackBar('Profile Pic Uploaded');
            this.saveUserProfilePicUrl(this.currentPIC);
            this.source = '';
            
            
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              console.log(`error uploading profile pic ${err}`);
              this.source = '';
              //this.picload = false;
            }
          }
        )
    } else {
      alert('Please add a picture before submitting');
    }
  }

  setSelfieFile(file:File): void {
    //console.log("photo recieved emit from selfie");
    // this.fileChangeEvent(file);
    //console.log(Object.keys(file).map(k => file[k]));
    //this.source = 'file';
    this.imageChangedEvent = null;
    this.imgFile = file;
    this.source = 'file';
    
  }

  resetSelfie(){
    this.fileInput = false;
    this.complete = true;
    this.imageChangedEvent == null;
    this.imgFile = null;
    this.showUpLoadButton = false;
  }

  resetFile(){
    this.fileInput = true;
    this.complete = true;
    this.imageChangedEvent == null;
    this.imgFile = null;
    this.showUpLoadButton = false;
  }

  fileChangeEvent(event: any): void {

    this.source = 'file';
    //console.log(Object.keys(event).map(k => event[k]));
    //console.log("selfie file received");
    this.imageChangedEvent = event;
    this.cropFileLoading = true;
    this.complete = true;
    //this.imgFile = this.imageChangedEvent;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.Image = event.base64;
    this.croppedImage = event.file;
    this.crop = this.blobToFile(this.croppedImage, "my-image.png");
    if (this.crop.size != undefined) {
      this.showUpLoadButton = true;
    }
    //this.cx.drawImage(this.Image, 0, 0, this.width, this.height);
  }

  blobToFile = (theBlob: Blob, fileName: string): File => {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;
    //Cast to a File() type
    return <File>theBlob;
  }

  imageLoaded() {
    this.cropFileLoading = false;
  }
  loadImageFailed() {
    // show message
  }

  ngOnInit() {
  }

  ngOnDestroy(){
    if(this.profilepicture){
      this.profilepicture.unsubscribe();
    }
  }

}
