import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  SERVER_URL = environment.PUSH;

  constructor(private http: HttpClient) {

   }

   public sendSubscriptionToTheServer(subscription: PushSubscription) {
    return this.http.post(this.SERVER_URL, subscription);
  }

}
