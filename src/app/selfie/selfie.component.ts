import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-selfie',
  templateUrl: './selfie.component.html',
  styleUrls: ['./selfie.component.css']
})
export class SelfieComponent implements OnInit {

  @ViewChild("video", { static: true })
  public video: ElementRef;

  @ViewChild("canvas", { static: false })
  public canvas: ElementRef;

  public captures: Array<Blob>;
  fileArray: File[] = [];

  fileToUpload: File = null;
  uploadpic: Subscription;
  currentPIC: any;
  url: string;
  selfieload: boolean = false;
  getUserMedia: any;
  startcam: boolean = false;
  errorMsg: string;
  stream: any;

  constraints = {
    video: { facingMode: "user" }
  }

  @Output() emiturl = new EventEmitter<any>();

  constructor(private _http: HttpClient) {
    this.captures = [];
  }

  ngOnInit() {
    //document.querySelector('#showVideo').addEventListener('click', e => this.init(e));
  }

  init(e) {
    try {
      this.startcam = true;
      navigator.mediaDevices.getUserMedia(this.constraints).then(
        (stream) => {
          this.handleSuccess(stream)
          this.stream = stream;

        }
      )
      //const stream = await navigator.mediaDevices.getUserMedia(this.constraints);
      //this.handleSuccess(stream);
      e.target.disabled = true;
    } catch (e) {
      this.handleError(e);
    }
  }

  handleSuccess(stream) {
    const video = document.querySelector('video');
    const videoTracks = stream.getVideoTracks();
    //console.log('Got stream with constraints:', this.constraints);
    //console.log(`Using video device: ${videoTracks[0].label}`);
    //window.stream = stream; // make variable available to browser console
    video.srcObject = stream;
  }

  handleError(error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
      let v = this.constraints.video;
      alert(`The resolution is not supported by your device.`);
    } else if (error.name === 'PermissionDeniedError') {
      alert('Permissions have not been granted to use your camera and ' +
        'microphone, you need to allow the page access to your devices in ' +
        'order for the demo to work.');
    }
    alert(`getUserMedia error: ${error.name}`);
  }

  setSelfie(index: number) {
    //console.log("setselfie called");
    //this.selfieload = true;
    let file: File = this.b64ToFile(this.captures[index]);
    //this.uploadSelfiePic(file);
    
    //console.log("file size "+file.size);
    this.stream.getVideoTracks().forEach(function (track) {
      track.stop();
    });
    this.emiturl.emit(file);
  }

  b64ToFile(dataURI): File {
    // convert the data URL to a byte string
    const byteString = atob(dataURI.split(',')[1]);

    // pull out the mime type from the data URL
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // Convert to byte array
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Create a blob that looks like a file.
    const blob = new Blob([ab], { 'type': mimeString });
    blob['lastModifiedDate'] = (new Date()).toISOString();
    blob['name'] = 'selfie';

    // Figure out what extension the file should have
    switch (blob.type) {
      case 'image/jpeg':
        blob['name'] += '.jpg';
        break;
      case 'image/png':
        blob['name'] += '.png';
        break;
    }
    // cast to a File
    return <File>blob;
  }



  uploadSelfiePic(file: File) {
    //console.log('in upload');
    if (file instanceof File) {
      //console.log("this.is a file");
    }
    if (file != null) {
      //console.log('in upload file not null');
      const formData: FormData = new FormData();
      formData.append('photo', file, file.name);
      this.uploadpic = this._http.post(`${environment.UPLOAD_URL}uploadpic`, formData)
        .subscribe(
          (result: Response) => {
            this.currentPIC = `${environment.UPLOAD_URL}${result['url']}`;
            //console.log(this.currentPIC);
            this.emiturl.emit(this.currentPIC);
            this.selfieload = false;
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              console.log(`error uploading profile pic selfie ${err}`);
            }
          }
        )
    }
  }

  startAppleWebcam() {
    //console.log('start cam');
    var v = document.querySelector('video');
    var start = () => navigator.mediaDevices.getUserMedia(this.constraints)
      .then(stream => v.srcObject = stream)
      .then(() => new Promise(resolve => v.onloadedmetadata = resolve))
      .then(() => console.log("Success: " + v.videoWidth + "x" + v.videoHeight))
      .catch((err) => {
        alert('Error with camera is ' + err);
        if (err.name == "NotFoundError" || err.name == "DevicesNotFoundError") {
          //required track is missing
          alert('required track is missing');
        } else if (err.name == "NotReadableError" || err.name == "TrackStartError") {
          //webcam or mic are already in use
          alert('webcam or mic are already in use');
        } else if (err.name == "OverconstrainedError" || err.name == "ConstraintNotSatisfiedError") {
          //constraints can not be satisfied by avb. devices
          alert('constraints can not be satisfied by devices');
        } else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
          //permission denied in browser
          alert('permission denied in browser');
        } else if (err.name == "TypeError" || err.name == "TypeError") {
          //empty constraints object    
          alert('empty constraints object');
        } else {
          alert('error is not specific to getusermedia or devices');
        }
      });
  }

  test() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      //(<any> navigator.mediaDevices).getUserMedia(this.constraints).then(stream => {
      navigator.mediaDevices.getUserMedia(this.constraints).then(stream => {
        //    if("scrObject" in  this.video.nativeElement){
        //      this.video.nativeElement.srcObject = stream//window.URL.createObjectURL(stream);
        //      alert('scrObject');
        //    } else {
        var video = document.querySelector('video');
        if ("srcObject" in video) {
          video.srcObject = stream;
        } else {
          // Avoid using this in new browsers, as it is going away.
          this.video.nativeElement.src = window.URL.createObjectURL(stream);
        }
        //this.video.nativeElement.src = window.URL.createObjectURL(stream);
        //      alert('scr');
        //   }
        //this.video.nativeElement.play();
        video.onloadedmetadata = function (e) {
          video.play();
        };
      }).catch((err) => {
        alert('Error with camera is ' + err);
        if (err.name == "NotFoundError" || err.name == "DevicesNotFoundError") {
          //required track is missing
          alert('required track is missing');
        } else if (err.name == "NotReadableError" || err.name == "TrackStartError") {
          //webcam or mic are already in use
          alert('webcam or mic are already in use');
        } else if (err.name == "OverconstrainedError" || err.name == "ConstraintNotSatisfiedError") {
          //constraints can not be satisfied by avb. devices
          alert('constraints can not be satisfied by devices');
        } else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
          //permission denied in browser
          alert('permission denied in browser');
        } else if (err.name == "TypeError" || err.name == "TypeError") {
          //empty constraints object    
          alert('empty constraints object');
        } else {
          alert('error is not specific to getusermedia or devices');
        }
      })
    }
  }

  public ngAfterViewInit() {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      let devices = navigator.mediaDevices.enumerateDevices()
        .then((dev) => {
          dev.forEach(element => {
            //console.log(element);
          });
        });
    }
    //navigator.mediaDevices.enumerateDevices()
  }

  public capture() {
    var context = this.canvas.nativeElement.getContext("2d").drawImage(this.video.nativeElement, 0, 0, 640, 480);
    if (this.captures.length > 2) {
      this.captures.shift();
    }
    this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));
  }

  OnDestroy() {
    this.stream.getVideoTracks().forEach(function (track) {
      track.stop();
    });
  }

}
