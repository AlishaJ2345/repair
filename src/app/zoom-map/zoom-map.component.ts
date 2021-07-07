import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../services/localStorage.service';
import { ToastService } from '../services/toast.service';
import { ResponsiveService } from '../services/responsive.service';

@Component({
  selector: 'app-zoom-map',
  templateUrl: './zoom-map.component.html',
  styleUrls: ['./zoom-map.component.css']
})
export class ZoomMapComponent implements OnInit {

  myFullresImage:string = 'https://jbconnect.co:3003/uploads/photo-1543907854968.png';
  screenWidth:string = 'sm';
  height:string = '250';
  width:string = '250';

  constructor(private route:ActivatedRoute, private toast:ToastService
    ,private responsiveService: ResponsiveService) { }

  ngOnInit() {
    let url = this.route.snapshot.paramMap.get('url');
    //console.log("url from zoom "+url);
    if(url != undefined){
      this.myFullresImage = url;
      this.toast.tempSnackBar("Tap Map to Magnify");
    }
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      if (isMobile) {
        //console.log('Mobile device detected')
        this.screenWidth = this.responsiveService.screenWidth;
      }
      else {
        //console.log('Desktop detected')
        this.screenWidth = this.responsiveService.screenWidth;
      }
      this.getCardStyle();
    });
    this.onResize();
  }

  onResize() {
    this.responsiveService.checkWidth();
  }

  getCardStyle(){
    let style = {};
    if (this.screenWidth == 'sm') {
      style = {
        'width': '280px',
        'height': '600px'
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'width': '400px',
        'height': '800px'
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'width': '500px',
        'height': '1000px'
      }
    }
    return style;
  }

  getZoomStyle(){
    let style = '';
    if (this.screenWidth == 'sm') {

      this.width = '250';
      this.height = '250';
      style = `width:${this.width}px; height:${this.height}px; bottom:0;  left:0;  right:0;  top:300px;  margin:0 auto; border:1px solid #dcdcdc; position:relitive`;
      
    } else if (this.screenWidth == 'md') {

      this.width = '380';
      this.height = '380';
      style = `width:${this.width}px; height:${this.height}px; bottom:0;  left:0;  right:0;  top:300px;  margin:0 auto; border:1px solid #dcdcdc; position:relitive`;

    } else if (this.screenWidth == 'lg') {

      this.width = '480';
      this.height = '480';
      style = `width:${this.width}px; height:${this.height}px; bottom:0;  left:0;  right:0;  top:300px;  margin:0 auto; border:1px solid #dcdcdc; position:relitive`;

    }
    return style;
  }

  getResultStyle(){
    let style = '';
    if (this.screenWidth == 'sm') {

      this.width = '250';
      this.height = '250';
      style = `width:${this.width}px; height:${this.height}px; background-repeat: no-repeat; z-index: 2; position:relitive;`+
      `-webkit-box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);`+
      `box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); top: 0;left:0;right:0;`;
      
    } else if (this.screenWidth == 'md') {

      this.width = '380';
      this.height = '380';
      style = `width:${this.width}px; height:${this.height}px; background-repeat: no-repeat; z-index: 2; position:relitive;`+
      `-webkit-box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);`+
      `box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); top: 0;left:0;right:0;`;

    } else if (this.screenWidth == 'lg') {

      this.width = '480';
      this.height = '480';
      style =       style = `width:${this.width}px; height:${this.height}px; background-repeat: no-repeat; z-index: 2; position:relitive;`+
      `-webkit-box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);`+
      `box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); top: 0;left:0;right:0;`;

    }
    return style;
  }

}
