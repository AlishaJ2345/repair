import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-eula',
  templateUrl: './eula.component.html',
  styleUrls: ['./eula.component.css']
})
export class EULAComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EULAComponent>,
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
