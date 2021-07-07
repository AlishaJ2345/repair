import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ChatService } from '../../services/chat.service';
//import { forEach } from '@angular/router/src/utils/collection';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { Messages, User } from '../../models/event.model';

import { filter } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { Subscription, Observable } from 'rxjs';
//import { UsersapiService } from '../services/usersapi.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
  selected: string = 'CHAT';
  open: boolean = true;
  state: string = '';               //animation trigger
  started: boolean = false;        //chat is started
  window: string = '';             //title of chat
  use = [];                       //online users names
  users = [];                     //online user names
  messages = [];                  //open messages
  pMessages = [];                 //private messages
  busyList = [];                  // names on calls
  showAsBusy;                     // subscribe to busy list
  room;                           //subscription handle
  rooms = [];                     // rooms array for select box
  privateMsg;                     //private message body
  isonline;
  connection;                     //subscription to messages api
  online;                         //subscription to users list
  message;                        //subscription to open mesages
  declined;                        //subscription to declined calls
  offerDevices;                    // subscription to device offers
  replyDevices;                    // subscription to device replys
  dissconSub: Subscription;
  loginMessage: string = '';       //login warning
  senderror: string = '';          //error if string is empty
  number: number = 0;              //number of users online
  numberOfPM: number = 0;          //number of pms
  msgTo: string = '';              // receiver name
  name: string = '';               //sender name
  privateChat: boolean = false;    //switch to/from private chat
  dev: boolean = false;            //show dev name input form
  loggedIn: boolean = false;       // stop open button showing
  //rooms = ['Lobby','Events','Employment','Engineering', 'Computer Science', 'Mathmatical Science'];                     // select room drop down
  currentRoom: string = 'Lobby';            // the chat room im in now
  callerState: string = 'F';
  uid: any;
  friends = [];
  testing: boolean = true;
  showFavourites: boolean = true;
  showing: string = 'Room';
  makerequest: string;                   // input to webrtc
  negotiatedDevices;                    // devices negotiated input webrtc
  videoIsOn: boolean = false;
  availableDevices = { audio: false, video: false };
  devicesChecked = [];
  call;
  picURL;
  key: User;
  streamState: number = 0;
  value: number = 1;
  tabSelected: number = 0;
  ringaudio;                        // call sound
  SLEEP_THRESHOLD:number = 1000;

  constructor(private chatService: ChatService, private router: Router,
    private _http: HttpClient, private _route: ActivatedRoute,
    private local: LocalStorageService) {

    if (this.local.retreiveAll() != undefined) {
      this.key = this.local.retreiveAll();
      this.name = this.key.name.replace(/\s+/g, '-');
      this.picURL = this.key.pic_url;
      this.uid = this.key.uid;
      this.chatService.setUserName(this.name);
    }

    console.log("chat component constructor name: " + this.name);
    localStorage.debug = 'socket.io-client:socket';
  }

  // scroll the chat window to the bottom on new messages
  scrollChatWindow() {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  radioChange(selected) {
    //console.log("selected"+ selected.value);
    if (selected.value == 1) {
      this.selected = "CHAT";
    } else if (selected.value == 2) {
      this.selected = "PHONEBOOK";
    } else if (selected.value == 3) {
      this.selected = "CALLS";
    }
  }

  sendVid(to) {
    this.chatService.sendPrivateMessage(to, "V", this.name);
    this.pMessages.push({ user: this.name, msg: "Call requested ->", from: to });
    this.tabSelected = 2;
  }

  videoState(isrunning) {
    if (isrunning) {
      this.tabSelected = 2;
    } else {
      this.tabSelected = 0;
    }
  }

  public onValChange(val: string) {
    this.selected = val;
  }

  isBusyOnCall(friend) {
    if (friend in this.busyList) {
      return true;
    } else {
      return false;
    }
  }
  showLocalAvailabledeviceAudio() {
    if (this.availableDevices.audio) {
      return true;
    } else {
      return false;
    }
  }
  showLocalAvailabledeviceVideo() {
    if (this.availableDevices.video) {
      return true;
    } else {
      return false;
    }
  }
  removeMsg(msg) {
    let index = this.pMessages.indexOf(msg);
    if (index != -1) {
      this.pMessages.splice(index, 1);
    }
  }
  setAvailableDevices(event) {
    this.availableDevices = event;
  }
  decline(msg) {
    this.videoIsOn = false;
    //this.pMessages.unshift({user:this.msgTo, msg:"Call Declined", from:from });
    let index = this.pMessages.indexOf(msg, 0);
    if (index > -1) {
      this.pMessages.splice(index, 1);
    }
    //console.log("decline from recipient user "+msg.user+" from "+msg.from);
    this.chatService.declineCall(msg.from, msg.user);
  }

  setCallState(event) {
    this.videoIsOn = false;
    this.makerequest = "NAME NOT SET";           // reset video
    this.tabSelected = 0;
    this.privateChat = false;
    this.scrollTop();
  }

  toggleFavourites() {
    //console.log("toggle room/friends");
    this.showFavourites = !this.showFavourites;
    if (this.showFavourites == true) {
      this.showing = 'Friends';
    } else {
      let friends = "";
      this.showing = 'Room';
      this.friends.forEach(fnd => {
        friends += `${fnd.name},`;
      });
      //console.log("chat toggleFavourites to: "+this.name+" friends: "+friends);
      this.chatService.getOnlineFromFriends(this.name, friends);
    }
  }

  playRing() {
    if (this.ringaudio == null) {
      this.ringaudio = new Audio();
      this.ringaudio.src = "../../../assets/sounds/phone.mp3";
      this.ringaudio.load();
    }
    this.ringaudio.play();
  }

  videoRequest(name, type) {
    let conn = this.chatService.isConnected();
    if (!conn) {
      this.chatService.reConnect();
    }
    // type is 'V' video call or 'S' voice call
    console.log("chat.component print V: video or S: sound " + type + " name: " + name);
    this.name = this.chatService.getName();
    this.chatService.sendPrivateMessage(this.msgTo, type, this.name);
    this.pMessages.unshift({ user: this.msgTo, msg: type, from: this.name });
    this.makerequest = undefined;
    if (type == 'V') {
      this.makerequest = `*A*V*${this.msgTo}`;
    } else if (type == 'S') {
      this.makerequest = `*A*S*${this.msgTo}`;
    }
    this.videoIsOn = true;
    this.tabSelected = 2;
    this.scrollTop();
    this.value = 3;
  }
  startVideoChat(from, type) {
    let conn = this.chatService.isConnected();
    if (!conn) {
      this.chatService.reConnect();
    }
    console.log(this.name + " ANSWER: chat startVideoChat from: " + from + " type " + type);
    this.callerState = 'I';
    this.makerequest = undefined;
    if (type == 'V') {
      this.makerequest = `*I*V*${from}`;     // from the name of the person offering
    } else if (type == 'S') {
      this.makerequest = `*I*S*${from}`;     // from the name of the person offering
    }
    this.videoIsOn = true;
    this.tabSelected = 2;
    this.value = 3;
    this.scrollTop();
  }

  getDevices(user) {
    //console.log(" room user hovered "+user);
    if (!(user in this.devicesChecked)) {
      this.users.forEach(element => {
        if (user === element.name) {
          if (element.deviceCheck === false) {
            let userToGet = user;
            this.getDevicesAvailable(userToGet);
          }
        }
      });
    }
  }

  getDevicesAvailable(user) {
    // t*t    audio: true, video: true
    let audio = false;
    let video = false;
    let msg = "";
    this.devicesChecked.push(user);
    if ((this.availableDevices.audio === true) && (this.availableDevices.video === true)) {
      msg = `${user}*t*t*${this.name}`;
    } else if (this.availableDevices.audio === true) {
      msg = `${user}*t*f*${this.name}`;
    } else if (this.availableDevices.video === true) {
      msg = `${user}*f*t*${this.name}`;
    } else {
      msg = `${user}*f*f*${this.name}`;
    }
    this.chatService.sendDevices(msg);
  }



  /* Remove for production */
  setName() {
    this.name = this.name.replace(/ /g, "_");
    localStorage.setItem("name", this.name);
    this.testing = false;

  }
  onSelectRoom(event: any) {
    console.log(`room changed ${event.target.value}`);
    this.currentRoom = event.target.value;
    this.chatService.switchRoom(this.currentRoom);
  }
  /*
  Retreive private messages sent to this user while they were offline
  */
  retreivePrivateMsg() {
    this._http.post<Messages>(`${environment.API_URL}/privatechat`, { to: this.name })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(result['messages']);

            const privateMessages = result['messages'];
            privateMessages.forEach(element => {
              const mess = { user: element.to_user, msg: element.message, from: element.from_user };
              this.pMessages.push(mess);
            });
            this.privateChat = true;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`update password status: ${err.status} message: ${err.statusText}`);
          }
        }
      );
  }

  getFriends() {
    //console.log("url "+`${environment.API_URL}/getfriends`);
    this._http.post(`${environment.API_URL}/getfriends`, { uid: this.uid })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(Object.keys(result).map(k => result[k]));
            let array = result['friends'];
            array.forEach(element => {
              this.friends.push({ name: element.friend, audio: false, video: false, deviceCheck: false, online: false })
            });
          }
        },
        (err: HttpErrorResponse) => {
          console.log("getfriends " + err.error);
          if (err.error instanceof Error) {
            console.log(`get freinds: ${err.status} message: ${err.statusText}`);
          }
        }
      );
  }

  makeFriend() {
    this._http.post(`${environment.API_URL}/makefriends`,
      { uid: this.uid, friend: this.msgTo })
      .subscribe(
        (result) => {
          if (result) {
            this.friends = result['friends'];
            //console.log(`${this.friends[0].friend}`);
            //console.log(Object.keys(result).map(k => result[k]));
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`get freinds: ${err.status} message: ${err.statusText}`);
          }
        }
      );
  }

  /* remove private messages from pannel, reset the number of pms */
  clearPrivate() {
    this.pMessages = [];
    this.numberOfPM = 0;
  }
  /* place chat on main window */
  fullScreen() {
    this.router.navigate(['chat']);
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }
  /* switch to private chat */
  allPrivateChat() {
    this.privateChat = true;
    this.scrollTop();
  }
  /* test to see if this message is mine and should be orange */
  isMyMessage(msg) {    //set class based on message name before :
    if (msg === this.name) {
      return true;
    } else {
      return false;
    }
  }
  /* on clicking a message or user set the msgTo variable to new value */
  swapPrivateRecipiant(from) {
    this.msgTo = from;
  }
  /* test to see if the private message was sent by me */
  isMyPMessage(name) {
    if (name === this.name) {
      return true;
    } else {
      return false;
    }
  }
  /* send a non-private message to server */
  sendMessage() {
    if (!this.chatService.isConnected()) {
      this.chatService.reConnect();
    }
    if (this.message != undefined) {
      this.senderror = '';
      const mess = `${this.name}: ${this.message}`;
      this.chatService.sendMessage(mess);
      this.message = '';
      this.scrollTop();
    } else {
      this.senderror = 'Cant post empty message!';
    }
  }
  /* send a private message to server */
  sendPrivateMessage() {
    if (this.message != undefined) {
      this.senderror = '';
      this.chatService.sendPrivateMessage(this.msgTo, this.message, this.name);
      this.pMessages.push({ user: this.msgTo, msg: this.message, from: this.name });
      this.scrollChatWindow();
      this.message = '';
      this.scrollTop();
    } else {
      this.senderror = 'cant post empty  message!';
    }
  }
  /* set the name for a new private message, open private chat window */
  setPrivateName(name) {
    this.msgTo = name;
    this.privateChat = true;
    this.scrollTop();
  }
  /* close private messages and return to open messaging clearing variables */
  toNonPrivate() {
    this.msgTo = '';
    this.message = '';
    this.privateChat = false;
    this.scrollTop();
  }

  getRooms() {
    this._http.get(`${environment.API_URL}/getrooms`)
      .subscribe(
        (result) => {
          if (result) {
            console.log(Object.keys(result).map(k => result[k]));
            const newrooms = result['rooms'];                 //all posts retreived
            newrooms.forEach(element => {
              console.log(`room:${element.event_name}`);
              this.chatService.updateRooms(element.event_name);
            });
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }
  /*
  open the chat window and connect sockets to server to retreive messages currently being sent
  */
  sendName() {
    this.chatService.sendUserName();
  }

  startChat() {
    this.started = true;

    this.name = this.chatService.getName();

    this.chatService.reConnect();

    this.chatService.requestUsers(this.name);
    this.chatService.requestRooms(this.name);
    this.chatService.getOnlineUsers();

    if (this.name !== null) {  //change to !== fro production
      if (this.uid !== null) {
        this.getFriends();
      }
    }
  }

  ngAfterViewInit(): void {
    //this.chatService.requestRooms(this.name);
    //this.chatService.sendUserName(this.name);
  }

  /* connect to socker server for the number of online users */
  ngOnInit() {
    this.tabSelected = 0;
    //let st = this.chatService.initSocket();
    this.startChat();
    this.online = this.chatService.getOnlineUsers().subscribe(onlineUsers => {
      //console.log("chat init getOnlineUsers listen"+ onlineUsers.toString());
      var str: string = onlineUsers.toString();
      var strn = str.split(',');
      this.users = [];
      strn.forEach((item) => {
        this.users.push({ name: item, audio: false, video: false, deviceCheck: false, online: false });
      });
      this.number = this.users.length;
    });
    //  this.chatService.callEnd().subscribe(end =>{
    //    this.selected = "CHAT";
    // reset the webrtc component
    //    this.streamState = Math.floor(Math.random()*2100);
    //  });
    //  this.dissconSub = this.chatService.disconnected().subscribe(event =>{
    //    this.chatService.reConnect();
    //  });

    this.connection = this.chatService.getMessages().subscribe(message => {
      console.log("message format " + message);
      this.messages.push(message);
      this.scrollChatWindow();
    });
    this.privateMsg = this.chatService.getPrivateMessages().subscribe((pmsg: Messages) => {
      this.pMessages.push(pmsg);
      this.numberOfPM = this.pMessages.length;
      this.scrollChatWindow();
      if (pmsg.msg == 'V' || pmsg.msg == 'S') {
        this.privateChat = true;
        this.playRing();
        this.scrollTop();
      }
    });
    this.room = this.chatService.getRooms().subscribe(currRooms => { // dropdown room list
      var str: string = currRooms.toString();
      var strn = str.split(',');
      console.log(currRooms.toString());
      this.rooms = strn;
    });
    this.declined = this.chatService.getDecline().subscribe(dec => {
      //console.log(dec+" has declined your call "+ this.name);
      this.pMessages.unshift({ user: this.name, msg: "has declined your Call", from: dec });
      this.videoIsOn = false;
    });
    this.isonline = this.chatService.friendsOnline().subscribe(listfrn => {
      let list = listfrn.toString().split(',');
      this.friends.forEach(frd => {
        list.forEach(frnonline => {
          if (frnonline == frd.name) {
            frd.online = true;
            //console.log("friend set to true "+frd.name+" online: "+frd.online);
          }
        });
      });
    });
    // get the list of people who are on calls
    this.showAsBusy = this.chatService.getBusy().subscribe(busy => {
      var str: string = busy.toString();
      var strn = str.split(',');
      this.busyList = [];
      strn.forEach((item) => {
        this.busyList.push(item);
      });
    });
    this.offerDevices = this.chatService.getSentDevices().subscribe(dev => {
      //console.log(" chat getsentdevices "+dev);
      let devices = dev.toString().split('*');
      if ((devices[1] === 't' && this.availableDevices.audio) && (devices[2] === 't' && this.availableDevices.video)) {
        this.chatService.replyDevices(`${devices[3]}*t*t*${this.name}`);
        this.negotiatedDevices = `${devices[0]}*t*t`;
        this.users.forEach(user => {
          if (user.name == devices[0]) {
            user.audio = true;
            user.video = true;
            user.deviceCheck = true;
          }
        });
      } else if (devices[1] === 't' && this.availableDevices.audio) {
        this.chatService.replyDevices(`${devices[3]}*t*f*${this.name}`);
        this.negotiatedDevices = `${devices[0]}*t*f`;
        this.users.forEach(user => {
          if (user.name == devices[0]) {
            user.audio = true;
            user.deviceCheck = true;
          }
        });
      } else if (devices[2] === 't' && this.availableDevices.video) {
        this.chatService.replyDevices(`${devices[3]}*f*t*${this.name}`);
        this.negotiatedDevices = `${devices[0]}*f*t`;
        this.users.forEach(user => {
          if (user.name == devices[0]) {
            user.video = true;
            user.deviceCheck = true;
          }
        });
      } else {
        this.chatService.replyDevices(`${devices[3]}*f*f*${this.name}`);
        this.negotiatedDevices = `${devices[0]}*f*f`;
        this.users.forEach(user => {
          if (user.name == devices[0]) {
            user.deviceCheck = true;
          }
        });
      }
    });
    this.replyDevices = this.chatService.getReplyDevices().subscribe(dev => {
      //console.log(" chat getReplyDevices "+dev);
      let devices = dev.toString().split('*');
      if ((devices[1] === 't') && (devices[2]) === 't') {
        this.negotiatedDevices = `${devices[0]}*t*t`;
        this.users.forEach(element => {
          if (devices[3] === element.name) {
            element.audio = true;
            element.video = true;
            element.deviceCheck = true;
          }
        });
      } else if (devices[1] === 't') {
        this.negotiatedDevices = `${devices[0]}*t*f`;
        this.users.forEach(element => {
          if (devices[3] === element.name) {
            element.audio = true;
            element.deviceCheck = true;
          }
        });
      } else if (devices[2] === 't') {
        this.negotiatedDevices = `${devices[0]}*f*t`;
        this.users.forEach(element => {
          if (devices[3] === element.name) {
            element.video = true;
            element.deviceCheck = true;
          }
        });
      } else {
        this.negotiatedDevices = `${devices[0]}*f*f`;
        this.users.forEach(element => {
          if (devices[3] === element.name) {
            element.deviceCheck = true;
          }
        });
      }
    });
    // set a timer to detect if the browser has woken from sleep
    Observable.timer(0, 1000).timeInterval().subscribe(timer => {
      if (timer.interval > (1000 + this.SLEEP_THRESHOLD)) {
        // make sure connection is working
        this.chatService.reConnect();
        console.log('wake-up from sleep detected');
      }
    });
  }
  /* close the subscriptions to prevent memory leaks */
  ngOnDestroy() {
    console.log("ondestroy called");
    //this.chatService.dissconnect();
    this.connection.unsubscribe();
    this.online.unsubscribe();
    this.isonline.unsubscribe();
    this.privateMsg.unsubscribe();
    this.room.unsubscribe();
    this.declined.unsubscribe();
    this.showAsBusy.unsubscribe();
    this.offerDevices.unsubscribe();
    this.replyDevices.unsubscribe();
  }
}
