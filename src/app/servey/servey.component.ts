import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResponsiveService } from '../services/responsive.service';

@Component({
  selector: 'app-servey',
  templateUrl: './servey.component.html',
  styleUrls: ['./servey.component.css']
})
export class ServeyComponent implements OnInit {

  modalWidth: number = 380;

  name:string = 'name';
  currentRate = 5;
  notes = '';
  EventFeedback = '';
  AppFeedback = '';
  appRate = 5;
  result = {};
  deviceWidth:number;
  percentWidth:string = '100';
  screenWidth:string = 'sm';
  cardStyle = {
    'width': '280px'
  }


  constructor(private responsiveService: ResponsiveService,public dialogRef: MatDialogRef<ServeyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = window.innerWidth;
      this.percentWidth = this.responsiveService.percentScreen;
      if (isMobile) {
        //console.log('Mobile device detected')
        this.screenWidth = this.responsiveService.screenWidth;
        this.modalWidth = (window.innerWidth -10)
      }
      else {
        //console.log('Desktop detected')
        this.screenWidth = this.responsiveService.screenWidth;
        this.modalWidth = (window.innerWidth -200)
      }
      this.getCardStyle();
    });
  }

  getCardStyle() {
    //let ans = (this.deviceWidth - 80);
    if (this.screenWidth == 'sm') {
      this.cardStyle = {
        'width': `${this.deviceWidth}px`
      }
    } else if (this.screenWidth == 'md') {
      this.cardStyle = {
        'width': `${this.deviceWidth - 36}px`
      }
    } else if (this.screenWidth == 'lg') {
      this.cardStyle = {
        'width': '900px'
      }
    }
    //return this.cardStyle;
  }

  agree(){
    this.result = { eventStars:`${this.currentRate}`, eventNotes:`${this.EventFeedback}`,
                    appStars:`${this.appRate}`, appNotes:`${this.AppFeedback}` };
    this.dialogRef.close(this.result);
  }

  decline(){
    this.dialogRef.close(false);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  autoGrowTextZone(e) {
    e.target.style.height = "0px";
    e.target.style.height = (e.target.scrollHeight + 25)+"px";
  }

}
