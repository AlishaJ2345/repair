import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";

@Injectable({
    providedIn: 'root'
})
export class ResponsiveService {

    private isMobile = new Subject();
    public screenWidth: string;
    public percentScreen: string = '100';
    public orientation: string = "landscape";

    constructor() {
        this.checkWidth();
    }


    onMobileChange(status: boolean) {
        this.isMobile.next(status);
    }

    getMobileStatus(): Observable<any> {
        return this.isMobile.asObservable();
    }

    public checkWidth() {
        var width = window.innerWidth;
        if (width < 350) {
            this.screenWidth = 'sm';
            this.percentScreen = '100';
            this.onMobileChange(true);
        } else if (width <= 768) {
            this.screenWidth = 'sm';
            this.percentScreen = '100';
            this.onMobileChange(true);
        } else if (width > 768 && width <= 992) {
            this.screenWidth = 'md';
            this.percentScreen = '100';
            this.onMobileChange(false);
        } else {
            this.screenWidth = 'lg';
            this.percentScreen = '90';
            this.onMobileChange(false);
        }
    }

}
