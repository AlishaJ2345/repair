import { Injectable } from '@angular/core';
 
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

    // token, uid: user.uid, name: user.name, email: user.email, type: user.type, verifyed: user.verifyed, pic_url: user.pic_url
    myObj = { access_token: 'test', jbuid: 'id', name: 'testname', email: 'test@test.com',
    type: 'user', verifyed: 'true', pic: 'https://pic.com'}
  constructor() { }

  store(obj){
      localStorage.setItem('key', JSON.stringify(obj));
  }
  retreiveAll(){
      return JSON.parse(localStorage.getItem('key'));
  }
  retreiveToken(){
      if(localStorage.getItem('key') !== null){
        const Obj = JSON.parse(localStorage.getItem('key'));
        const token = Obj.token;
        return token;
      }
      return '';
  }
  clear(){
    if((localStorage.getItem('key') !== null)){
      const Obj = JSON.parse(localStorage.getItem('key'));
      Obj.token = '';
      localStorage.setItem('key', JSON.stringify(Obj));
    }
  }

  UpdateUserPic(obj){
    localStorage.removeItem("key");
    localStorage.setItem("key", JSON.stringify(obj));
  }

  storeEvent(obj){
    localStorage.setItem('event', JSON.stringify(obj));
  }

  retreiveEvent(){
    return JSON.parse(localStorage.getItem('event'));
  }

  storeEventArray(obj){
    if(localStorage.getItem("eventarray") == undefined){
      localStorage.setItem("eventarray", JSON.stringify(obj));
    }else{
      localStorage.removeItem("eventarray");
      localStorage.setItem("eventarray", JSON.stringify(obj));
    }
  }

  retreiveEventArray(){
    return JSON.parse(localStorage.getItem('eventarray'));
  }

  clearEvent(){
    localStorage.removeItem('eventarray');
  }

  storeAttending(obj){
    if(localStorage.getItem("attending") == undefined){
      localStorage.setItem("attending", JSON.stringify(obj));
    }else{
      localStorage.removeItem("attending");
      localStorage.setItem("attending", JSON.stringify(obj));
    }
  }

  retreiveAttending(){
    return JSON.parse(localStorage.getItem('attending'));
  }

  clearAttending(){
    localStorage.removeItem('attending');
  }

  clearQR(){
    localStorage.removeItem('qrcode');
  }

  storeQR(qr){
    this.clearQR();
    localStorage.setItem('qrcode', qr);
  }

  retreiveQR() {
    return localStorage.getItem('qrcode');
  }

  storeEventID(id){
    localStorage.setItem('eid', id);
  }

  retreiveEventID(){
    return localStorage.getItem('eid');
  }

  clearEventID(){
    localStorage.removeItem('eid');
  }

  clearEventTitle(){
    localStorage.removeItem('eventTitle');
  }

  storeEventTitle(title){
    this.clearEventTitle();
    localStorage.setItem('eventTitle', title);
  }

  retreiveEventTitle(){
    return localStorage.getItem('eventTitle');
  }

  storeStudentProfile(profile){
    localStorage.setItem('sprofile', JSON.stringify(profile));
  }
  retreiveStudentProfile(){
    return JSON.parse(localStorage.getItem('sprofile'));
  }

  storeEmployerProfile(profile){
    localStorage.setItem('eprofile', JSON.stringify(profile));
  }
  retreiveEmployerProfile(){
    return JSON.parse(localStorage.getItem('eprofile'));
  }

  storeCompany(company){
    localStorage.setItem('company', JSON.stringify(company));
  }

  getCompany(){
    return JSON.parse(localStorage.getItem('company'));
  }

  storeLabel(label){
    localStorage.setItem('label', JSON.stringify(label));
  }

  retreiveLabel(){
    return JSON.parse(localStorage.getItem('label'));
  }

  isLabelPrinted(){
    return (localStorage.getItem('label') != undefined);
  }

  storeScan(student){
    localStorage.setItem('scan', JSON.stringify(student))
  }

  retreiveScan(){
    return JSON.parse((localStorage.getItem('scan')));
  }

  clearScan(){
    localStorage.removeItem('scan');
  }
}