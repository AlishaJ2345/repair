import { Component, OnInit } from '@angular/core';
import { UsersapiService } from '../services/api.services';
import { ActivatedRoute } from "@angular/router";
import { Router } from '@angular/router';
//import { JWT } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { User } from '../models/event.model';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { LocalStorageService } from '../services/localStorage.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent implements OnInit {

  isChecking:boolean = true;
  jwt:any;
  message:string = 'Confirming Account ';
  constructor(private _http: HttpClient,
              private route: ActivatedRoute,
              private router: Router,
              private authService:UsersapiService,
              private local:LocalStorageService) { }

  ngOnInit() {
    this.route.params.subscribe(values => {
      this.jwt = values.jwt;
      // console.log(this.jwt);
      this.register(this.jwt);
    });
  }
  register(confirmjwt) {
    this.message += '....';
    //console.log(`inside register ${confirmjwt}`);
    this._http.get<User>(`${environment.API_URL}/auth/confirmation/${confirmjwt}`)
    .subscribe(
      (result:User) => {
        if (result) {
          this.isChecking = false;
          let user = result['user'];
          this.message += user.email;
          this.local.store(user);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
        console.log(`confirm status: ${err.status} message: ${err.statusText}`);
        }
      },
      () => {
        this.message += ' Success!';
        setTimeout(()=>{
          this.router.navigate(['profile']);
        },2000);
      }
    );
  }
}
