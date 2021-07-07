import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HealthSafteyComponent } from '../health-saftey/health-saftey.component';
import { LocalStorageService } from '../services/localStorage.service';

@Component({
  selector: 'app-confirm-print',
  templateUrl: './confirm-print.component.html',
  styleUrls: ['./confirm-print.component.css']
})
export class ConfirmPrintComponent implements OnInit {

  printerLocation:string = '';
  attending:any;

  constructor(private local:LocalStorageService, public dialogRef: MatDialogRef<ConfirmPrintComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 

    }

  ngOnInit() {
    this.attending = this.local.retreiveAttending();
    this.printerLocation = this.attending.event.company;
  }

  agree(){
    this.dialogRef.close(true);
  }

  account(){
    this.dialogRef.close('account');
  }

  decline(){
    this.dialogRef.close(false);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
