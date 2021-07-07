import { Directive, Input, ElementRef, HostListener, OnDestroy} from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/fromEvent';

@Directive({
  selector: '[appParallax]'
})
export class ParallaxDirective implements OnDestroy{

  private $scrollEvent;

  @Input('ratio') parallaxRatio: number = 1
  initialTop: number = 0

  constructor(private eleRef: ElementRef) {
    this.initialTop = this.eleRef.nativeElement.getBoundingClientRect().top;
    this.$scrollEvent = Observable.fromEvent(this.eleRef.nativeElement,
      'scroll').subscribe((e:any) => {
        this.eleRef.nativeElement.style.top = (this.initialTop - (window.scrollY * this.parallaxRatio)) + 'px'
      });
  }

  
  ngOnDestroy(): void {
    this.$scrollEvent.unsubscribe();
  }



/*  @HostListener('scroll') onWindowScroll($event:Event) {
    console.log('scroll in parallaxdirective');
    this.eleRef.nativeElement.style.top = (this.initialTop - (window.scrollY * this.parallaxRatio)) + 'px'
  } */
 /* @HostListener('mouseenter') menter() {
    console.log("enter");
  }  */


/*  @HostListener('onscroll') onScroll() {
    console.log("scroll");
  } */

}
