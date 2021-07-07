import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment.prod';

@Injectable()
export class ChatService {
  private url = environment.CHAT;
  private socket;
  name:string = 'NAME NOT SET';

  connectionOptions =  {
    "force new connection" : true,
    "reconnection": true,
    "reconnectionDelay": 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
    "reconnectionDelayMax" : 60000,             //1 minute maximum delay between connections
    "reconnectionAttempts": "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
    "timeout" : 10000,                           //before connect_error and connect_timeout are emitted.
    "transports" : ["websocket"],                //forces the transport to be only websocket. Server needs to be setup as well/
    "path" : '/chat/socket.io',
    "secure" : true
  }

  constructor() {
    
  }

  setUserName(name){
    this.name = name;
  }
  getName(){
    return this.name;
  }

  initSocket(): void {
    this.socket = io.connect(this.url, this.connectionOptions);  
    this.sendUserName();
  } 

  dissconnect(){
    //this.socket.disconnect();
    const self = this;
    if(self.socket){
      self.socket.close();
      delete self.socket;
      self.socket = null;
    }
  }
  
  isConnected(){
    return this.socket.connected;
  }

  reConnect(){
    
    const self = this;
    if(self.socket){
      self.socket.close();
      delete self.socket;
      self.socket = null;
    }
    this.socket = io.connect(this.url, this.connectionOptions );
    this.sendUserName();
  }
  


  sendMessage(message){
    this.socket.emit('add-message', message);
  }

  sendUserName() {
    console.log("send user name "+this.name)
    this.socket.emit('new-user', this.name);
  }
  sendDevices(devices) {
    this.socket.emit('send-devices', devices);
  }

  replyDevices(devices) {
    this.socket.emit('reply-devices', devices);
  }

  offerSendFile(To, message, From) {
    var msg = `${To}*${message}*${From}`;
    console.log("offer file "+msg);
    this.socket.emit('offer-sendfile', msg);
  }
  answerSendFile(To, message, From) {
    var msg = `${To}*${message}*${From}`;
    //console.log("answer file "+msg);
    this.socket.emit('answer-sendfile', msg);
  }
  sendPrivateMessage(To, message, From) {
    var msg = `/w ${To} ${message}:${From}`;
    this.socket.emit('add-message', msg);
  }
//offer a video connection
  sendVideoPeerOffer(To, sdp, From){
    var msg = `${To}|${sdp}|${From}`;
    console.log(`offer from: ${From}`);
    this.socket.emit('offer', msg);
  }
//accept a peer connection
  sendVideoAnswer(To, sdp, From){
    var msg = `${To}|${sdp}|${From}`;
    console.log(`answer from: ${From}`);
    this.socket.emit('answer', msg);
  }

  sendIceCandidate(To, sdp, From){
    var msg = `${To}*${sdp}*${From}`;
    this.socket.emit('ice', msg);
  }

  endCall(To){
    const endCallTo = `${To}`;
    console.log(`ending call to:${endCallTo}`);
    this.socket.emit('stop', To);
  }

  requestCall(To, From){
    const rc = `${To}*${From}`;
    console.log(`CALLING ${To} From: ${From}`);
    this.socket.emit('request-call', rc);
  }

  acceptCall(To, From){
    const ac = `${To}*${From}`;
    //console.log(`acceptCall from ${From} to ${To}` );
    this.socket.emit('accept-call', ac);
  }

  sending(To, numberOfFiles) {
    let msg = `${To}*${numberOfFiles}`;
    this.socket.emit('sending', msg);
  }

  ready(To) {
    this.socket.emit('ready', To);
  }

  switchRoom(room){
    this.socket.emit('switchRoom', room);
  }
  // get the names of the rooms to display in drop down
  requestRooms(From){
    console.log("requestRooms called");
    this.socket.emit('getRooms', From);
  }
  updateRooms(rooms){
    //console.log('chatservice update rooms');
    this.socket.emit('updateRooms', rooms);
  }
  getOnlineFromFriends(from, friends){
    let msg = `${from}*${friends}`;
    //console.log("getOnlineFromFriends "+msg);
    this.socket.emit('friends-online', msg);
  }
  declineCall(to, from){
    console.log('Decline call to '+ to);
    let msg = {to: to, from: from};
    this.socket.emit('decline', msg);
  }
  // get the users list
  requestUsers(from){
    if(from != undefined){
      this.socket.emit('refresh', from);
    } else {
      console.log(`requestUsers in chat.service from is undefined submitter:${from}`);
    }
  }

  drawState(to, state){
    console.log('Draw state to '+ state+ " to: "+to);
    let msg = { to: to, state: state };
    this.socket.emit('draw', msg);
  }

  getDraw(){
    let observable = new Observable(observer => {
      this.socket.on('draw', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getDecline(){
    let observable = new Observable(observer => {
      this.socket.on('decline', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getOfferSendfile(){
    let observable = new Observable(observer => {
      this.socket.on('offer-sendfile', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getAnswerSendfile(){
    let observable = new Observable(observer => {
      this.socket.on('answer-sendfile', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getBusy(){
    let observable = new Observable(observer => {
      this.socket.on('busy', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getRooms(){
    let observable = new Observable(observer => {
      this.socket.on('getRooms', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getReady(){
    let observable = new Observable(observer => {
      this.socket.on('ready', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getSending(){
    let observable = new Observable(observer => {
      this.socket.on('sending', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getAcceptedCalls(){
    let observable = new Observable(observer => {
      this.socket.on('accept-call', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getRequestedCalls() {
    let observable = new Observable(observer => {
      this.socket.on('request-call', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  callEnd() {
    let observable = new Observable(observer => {
      this.socket.on('stop', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  receiveIce() {
    let observable = new Observable(observer => {
      this.socket.on('ice', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  receiveVideoPeerOffer() {
    let observable = new Observable(observer => {
      this.socket.on('offer', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  receiveVideoPeerAnswer() {
    let observable = new Observable(observer => {
      this.socket.on('answer', (data) => {      //change to responce
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getMessages() {
    let observable = new Observable(observer => {
      this.socket.on('new-message', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getPrivateMessages() {
    let observable = new Observable(observer => {
      this.socket.on('private-message', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getOnlineUsers() {
    let observable = new Observable(observer => {
      this.socket.on('usernames', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getSentDevices() {
    let observable = new Observable(observer => {
      this.socket.on('send-devices', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getReplyDevices() {
    let observable = new Observable(observer => {
      this.socket.on('reply-devices', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  getAllOnlineUsers() {
    let observable = new Observable(observer => {
      this.socket.on('online', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  friendsOnline() {
    let observable = new Observable(observer => {
      this.socket.on('friends-online', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

  disconnected() {
    let observable = new Observable(observer => {
      this.socket.on('disconnect', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

}
