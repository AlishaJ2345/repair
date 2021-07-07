import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgModel } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LocalStorageService } from '../services/localStorage.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { ResponsiveService } from '../services/responsive.service';
import { Skill, User } from '../models/event.model';
import { environment } from 'src/environments/environment.prod';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit, OnDestroy {

  @ViewChild('filterInput',{ static: true }) filterInput: NgModel
  //@ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource; // = new UserDataSource(this.userService);
  displayedColumns: string[]= ['name', 'details', 'experience', 'stars'];
  SkillForm: FormGroup;
  skillLoad:boolean = false;
  deviceWidth: number;
  screenWidth: string = 'sm';
  skillSub:Subscription;
  user:User;
  uid:number = 0;

  constructor(private fb: FormBuilder, private _http: HttpClient,
    private local:LocalStorageService, private router: Router, 
    private toast:ToastService, private responsiveService: ResponsiveService) { 
      if(this.local.retreiveAll() != undefined){
        this.user = this.local.retreiveAll();
        this.uid = this.user.uid;
      }
      this.getSkill();
    }

  ngOnInit() {
    this.SkillForm = this.fb.group({
      name: ['',  [Validators.required, Validators.maxLength(50)]],
      details: ['',  [Validators.required, Validators.maxLength(500)]],
      experience: ['',  [Validators.required, Validators.maxLength(30)]],
      stars: ['',  [Validators.required, Validators.maxLength(2)]]
    });
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = window.innerWidth - 20;

      if (isMobile) {
        //console.log('Mobile device detected')
        this.screenWidth = this.responsiveService.screenWidth;
        //this.modalSize = (window.innerWidth - 10);
      }
      else {
        //console.log('Desktop detected')
        this.screenWidth = this.responsiveService.screenWidth;
        //this.modalSize = (window.innerWidth - 200);
      }
    });
    this.onResize();
  }

  onResize() {
    this.responsiveService.checkWidth();
  }

  get s(){
    return this.SkillForm.controls;
  }

  cancel(){
    this.router.navigate(['updateprofile']);
  }

  getCardStyle() {
    let style = {};
    if (this.screenWidth == 'sm') {
      style = {
        'width': `${this.deviceWidth - 20}px`
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'width': `${this.deviceWidth - 20}px`
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'width': '973px'
      }
    }
    return style;
  }

  getTableStyle(){
    let style = {};
    if (this.screenWidth == 'sm') {
      style = {
        'width': `${this.deviceWidth - 50}px`
      }
    } else if (this.screenWidth == 'md') {
      style = {
        'width': `${this.deviceWidth - 50}px`
      }
    } else if (this.screenWidth == 'lg') {
      style = {
        'width': '943px'
      }
    }
    return style;
  }

  storeSkill(){
    const val = this.SkillForm.value;
    this.skillSub = this._http.post<Skill[]>(`${environment.API_URL}/submitstudentskill`,
    { uid:this.uid, name:val.name, details:val.details, experience:val.experience, stars:val.stars })
    .subscribe(
      (result) => {
        if (result) {
          //this.profile = result['profile'][0];                 //all posts retreived
          this.toast.tempSnackBar("Skill saved");
          this.getSkill();
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

  getSkill(){
    const val = this.SkillForm.value;
    this.skillSub = this._http.post<Skill[]>(`${environment.API_URL}/getstudentskill`,
    { uid:this.uid })
    .subscribe(
      (result) => {
        if (result) {
          let skills = result['skills'];                 //all posts retreived
          this.dataSource = new MatTableDataSource(skills);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }
        console.log(Object.keys(result).map(k => result[k]));
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

  

  ngOnDestroy(): void {
    this.skillSub.unsubscribe();
  }

}
