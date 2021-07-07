import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-health-saftey',
  templateUrl: './health-saftey.component.html',
  styleUrls: ['./health-saftey.component.css']
})
export class HealthSafteyComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<HealthSafteyComponent>,
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
    this.dialogRef.close(false);
  }


}
