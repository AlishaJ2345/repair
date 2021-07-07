import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { ResponsiveService } from '../services/responsive.service'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  deviceWidth = window.innerWidth;
  isMobile: boolean = true;
  screenWidth: string = 'sm';
  home: boolean = true;
  styles: any;
  path: string = '/';
  percentWidth: string = '100';

  constructor(private responsiveService: ResponsiveService,
    private cd: ChangeDetectorRef) {

  }

  AfterViewInit() {
    this.cd.detectChanges();
  }

  ngOnInit() {
    this.responsiveService.getMobileStatus().subscribe(isMobile => {

      this.isMobile = true;
      this.screenWidth = this.responsiveService.screenWidth;
      this.deviceWidth = window.innerWidth;
      this.percentWidth = this.responsiveService.percentScreen;

    });
    this.onResize();
  }

  onResize() {
    this.responsiveService.checkWidth();
    this.deviceWidth = window.innerWidth;
  }

  getWidthStyle() {
    let style = {};
    if (this.screenWidth == 'sm') {
      style = {
        'width': `${this.percentWidth}%`
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'width': '100%'
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'width': '90%'
      }
    }
    return style;
  }

  getHeaderStyle() {
    let style = {};
    if (this.screenWidth == 'sm') {
      if(this.deviceWidth < 350){
        style = {
          'padding-bottom': '50%',
          'background-image': 'url(../../assets/brand/banners/mobile-header-sm1v2.png)',
        }
        //console.log("header is sm  < 350");
      } else {
        style = {
          'padding-bottom': '52%',
          'background-image': 'url(../../assets/brand/banners/mobile-header-sm2v2.png)',
        }
        //console.log("header is sm > 350");
      }
    } else if (this.screenWidth == 'md') {
      if(this.deviceWidth < 879){
        style = {
          'padding-bottom': '32%',
          'background-image': 'url(../../assets/brand/banners/mobile-header-md1v2.png)',
        }
        //console.log("header is md <  875");
      } else {
        style = {
          'padding-bottom': '32%',
          'background-image': 'url(../../assets/brand/banners/mobile-header-md2v2.png)',
        }
        //console.log("header is md > 875");
      }
    } else if (this.screenWidth == 'lg') {
      if(this.deviceWidth < 1100){
        style = {
          'padding-bottom': '32%',
          'background-image': 'url(../../assets/brand/banners/mobile-header-lg1v2.png)',
        }
        //console.log("header is lg < 1100");
      } else {
        style = {
          'padding-bottom': '32%',
          'background-image': 'url(../../assets/brand/banners/mobile-header-lg2v2.png)',
        }
        //console.log("header is lg > 1100");
      }
    }
    return style;
  }
}
