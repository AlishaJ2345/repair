import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.css']
})
export class BrowserComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<BrowserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  agree(){
    this.dialogRef.close(true);
  }

  decline(){
    this.dialogRef.close(false);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
