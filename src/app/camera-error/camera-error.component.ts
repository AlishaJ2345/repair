import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '../services/toast.service';
import { LocalStorageService } from '../services/localStorage.service';

@Component({
  selector: 'app-camera-error',
  templateUrl: './camera-error.component.html',
  styleUrls: ['./camera-error.component.css']
})
export class CameraErrorComponent implements OnInit {

  errorString:string = '';
  hasPermission: boolean = false;
  hasCamera: boolean = false;
  array:string[] = [];
  code:string = '';
  entryCode:string = '';
  attending:any;
  codeMatchError:string = '';

  constructor(private local:LocalStorageService, private toast:ToastService, public dialogRef: MatDialogRef<CameraErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      if(this.local.retreiveAttending() != null){
        this.attending = this.local.retreiveAttending();
        if(this.attending.event.subject != ''){
          this.entryCode = this.attending.event.subject;
        } else {
          this.toast.tempSnackBar("Entry code is empty");
        }
      } else {
        this.toast.tempSnackBar("no entry code found!");
      }
    }

  ngOnInit() {

  }

  agree(){
    if(this.code == this.entryCode){
      this.codeMatchError = '';
      this.toast.notifySnackBar("Code Accepted, Please Enter Your Details to Continue");
      this.dialogRef.close(this.code);
    } else {
      this.codeMatchError = 'Incorrect Code Entered!';
    }
  }

  decline(){
    this.toast.tempSnackBar("Allow camera to try again");
    this.dialogRef.close(false);
  }

  onNoClick(): void {
    this.toast.permSnackBar("You Have Not Been Signed Into the Event Yet!");
    this.dialogRef.close(false);
  }

}
