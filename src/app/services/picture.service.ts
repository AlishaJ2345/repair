import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Observable, Subscription } from 'rxjs';
import { LocalStorageService } from './localStorage.service';

@Injectable({
  providedIn: 'root'
})
export class PictureService {
  picsub:Subscription;

  constructor(private _http:HttpClient) {

   }

   deletePic(id, filenameWhole){
     let filename = filenameWhole.substring(34);
    console.log('deletePic picture.service id: '+id+" filename: "+filename);
    this.picsub = this._http.post(`${environment.UPLOAD_URL}deletepic`, { id:id, filename:filename })
    .subscribe(
      (result) => {
        if (result) {
          console.log("file deleted "+filename);
          

        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log(`error getting posts in landing ${err}`);
        }
      }
    );
  }

  ngOnDestroy() {
    this.picsub.unsubscribe();
  }

   
}
