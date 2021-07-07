import { Component, OnInit } from '@angular/core';
import { HealthSafteyComponent } from '../health-saftey/health-saftey.component';
import { MatDialog } from '@angular/material/dialog';
import { ResponsiveService } from '../services/responsive.service';
import { EULAComponent } from '../eula/eula.component';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  deviceWidth: number = 380;
  screenWidth: string = 'sm';
  modalWidth: number = 380;

  constructor(public dialog: MatDialog, private toast:ToastService, private responsiveService: ResponsiveService) { }

  ngOnInit() {
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = window.innerWidth;

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
    });
    this.onResize();
  }

  onResize() {
    this.responsiveService.checkWidth();
  }

  openHSDialog(): void {
    const dialogRef = this.dialog.open(HealthSafteyComponent, {
      width: `${this.modalWidth}px`
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed '+result);
      if (result) {
        //this.openPrintDialog();
      } else {
        //his.toast.notifySnackBar("You May Not Enter the Event!");
      }

    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(EULAComponent, {
      width: `${this.modalWidth}px`
    });

    dialogRef.afterClosed().subscribe(result => {

      this.toast.notifySnackBar("You have agreed to the Conditions in the E.U.L.A");
      //setTimeout(() => this.router.navigate(['print']), 10);

    });
  }

}
