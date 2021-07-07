import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { environment } from '../../../environments/environment.prod';
import { Input, EventEmitter, Output, OnChanges, ElementRef, AfterViewInit, SimpleChanges } from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/switchMap';
import { ActivatedRoute } from '@angular/router';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { Subscription } from 'rxjs';
import { adapter } from 'webrtc-adapter';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-webrtc',
  templateUrl: './webrtc.component.html',
  styleUrls: ['./webrtc.component.css'],
})
export class WebrtcComponent implements OnInit, AfterViewInit {
  @Output() callStop = new EventEmitter();
  @Output() availableDevices = new EventEmitter();
  //@Output() videoRunning = new EventEmitter();
  //@Input('stream')
  //set streamState(val: string){
  //  this.stopStream();
  //}

  @Input('dev')
  set device(val: string) {
    //negotiate common devices
    if (val !== undefined) {
      this.currentArray = val.split('*');
      this.currentAgreedDevices = { audio: this.currentArray[1], video: this.currentArray[2] };
      this.userConstraints[this.currentArray[0]] = this.currentAgreedDevices;
      //console.log("webrtc input negotiated constrains set for "+this.name);
      if (!(this.currentArray[0] in this.userConstraints)) {
        this.userConstraints[this.currentArray[0]] = this.currentAgreedDevices;
        //console.log("rtc input userconstrains added length "+this.currentArray.length);
      }
    }
  }
  @Input('request')
  set value(val: string) {
    if (val !== undefined && val !== "NAME NOT SET") {
      console.log("webrtc INPUT To: " + val + " from: " + this.name);
      let initiator = val.substring(1, 2);
      let type = val.substring(3, 4);                  // V video or S sound
      this.To = val.substring(5, val.length);
      this.From = this.name;
      console.log("inside Input webrtc: " + this.name + " To: " + this.To + " From: " + this.From);
      if (initiator == 'I') {
        if (this.userConstraints[this.To] !== undefined) {
          this.constraints = this.userConstraints[this.To];
          //console.log("constraints set from peer "+this.To+ " for "+this.name);
        }
        if (type == 'V') {
          // set constraints
          this.constraints = this.AudioAndVideo;
          this.acceptChatCall(this.To, this.name);
        } else if (type == 'S') {
          // set constraints
          this.constraints = this.AudioOnly;
          this.acceptChatCall(this.To, this.name);
        }
        this.offers[0] = { user: `     ${this.From}`, to: this.To };
      } else {
        if (this.userConstraints[this.To] !== undefined) {
          this.constraints = this.userConstraints[this.To];
          //console.log("constraints set from peer "+this.To+ " for "+this.name);
        }
        if (type == 'V') {
          // set constraints
          this.constraints = this.AudioAndVideo;
        } else if (type == 'S') {
          // set constraints
          this.constraints = this.AudioOnly;

        }
        this.offers[0] = { user: `     ${this.From}`, from: this.To };
      }
    } else {
      console.log("webrtc RESET");
      this.draw = false;
      this.zindex = 3;
      this.showDnD = false;
      this.constraints = this.AudioAndVideo;
    }
  }

  @ViewChild('hardwareVideo', { static: true }) hardwareVideo: any;   //get the video element
  @ViewChild('localVideo', { static: true }) localVideo: any;
  @ViewChild('remoteAudio', { static: false }) remoteAudio: any;
  @ViewChild('dataChannelSend', { static: false }) dataSend: any;     //send data to peer
  @ViewChild('dataChannelReceive', { static: false }) dataReceive: any;  //receive data from peers
  @ViewChild('myCanvas', { static: true }) public myCanvas: ElementRef;     //canvas draw element

  _navigator = <any>navigator;    //pointer to media
  localStream;                     //pointer for peer tracks audio and video for stop
  sturn: string = 'turn:glenosborne.co:443';
  stun: string = 'stun:glenosborne.co:3478';
  coturn: string = 'turn:156.62.140.101:3478';

  turnServer = {
    iceServers: [
      {
        urls: 'stun:stun4.l.google.com:19302'
      },
      {
        urls: 'turn:glenosborne.co:443',
        credential: 'JBC404',
        username: 'JBCWEBRTC'
      },
      {
        urls: 'turn:glenosborne.co:3478',
        credential: 'JBC404',
        username: 'JBCWEBRTC'
      }

    ]
  };

  peerConnectionConfig = {
    iceServers: [
      {
        urls: 'stun:156.62.140.101:3478'
      },
      {
        urls: 'turn:156.62.140.101:3478',
        username: 'JBCWEBRTC',
        credential: 'JBC404'
      }
    ]
  }
  //config = { "iceServers": [{ "urls": `stun:${environment.STUN}` }] };
  connection = { 'optional': [{ 'DtlsSrtKeyAgreement': true }, { 'RtpDataChannels': true }] }
  dataChannelOptions = { reliable: true };       // data is sent reliable or fast
  islaptop: boolean = false;

  // state variables
  peerConnection;                  //webrtcpeerconnection
  hasVideo: boolean = false;        // harware video onboard
  hasAudio: boolean = false;        // hardware microphone onboard
  initiator;                       //the initiator of the call
  recipient;                       //the receiver of the call
  dataChannel;                     //datachannel
  To: string;                       //peer name
  From: string;                    //this users name
  candidate;                      //subscription to ice candidate
  videoOffer;                     //sdp offer subscription
  online;                         //subscription to end on destroy
  users = [];                     //online user names
  offer;                          //offer subscription
  offers = [];                    //calls on offer
  answer;                         //answer subscription
  answers = [];                    //answers received
  routeSub;                       // router subscription
  dev: boolean = false;            //display name input for non logged in users?
  number;                         // number of online users
  offerIsReady: boolean = false;          // is an offer waiting?
  video: any;                      //html video element
  audio: any;
  name: string = '';               //name of the dev input
  stream;                         //handle to the stream
  userCameraStreamClone;          // copy of the stream from camera
  candidateState = '';            //the state of the ice candidates
  onCall: boolean = false;         //is the user on a call
  onStop;                         //stop is called
  peer;                           //the name of the peer on call
  sendQueue = [];                 //temp testing queue messages
  answered;                       //call is answered
  iceQueue = [];                  //temp testing ice candidate queue
  streamEstablished: boolean = false;  // STREAM HAS BEEN RECEIVED
  P2PEstablished: boolean = false;     // peer has been made
  send: string = '';               //textarea input
  rec: string = '';                //textarea output
  showMuted: boolean = false;         //show the muted message
  muted: string = 'Audio is on mute'; // mute message
  acceptedCall;
  // file share variables
  transmitting: string = "";   //transmitting message
  file: File;                              //file to be transmitted
  BYTES_PER_CHUNK = 1200;            //chunck size to send
  currentChunk;                      //number of the chuck being sent
  fileReader: FileReader;             //read the file
  incomingFileInfo;                  //details of incoming file
  incomingFileData;                   //incoming file data
  bytesReceived;                     //number of bytes received
  bytesSent;
  downloadInProgress = false;        //downloader alerter
  filedescriptionName: string = '';   //file transfer name
  filedescriptionSize: number;        //file transfer size
  progress;                          //percent of file transferd
  fileTransferState = 'Drop file here';       //user progress box message
  estimatedProgress: number = 0;      // sender progress
  busy: boolean = false;              //is a send operation underway?
  ready;                             // subscription handle
  sending;                           // subscription handle
  sendingQueue = [];                 // queue file if busy
  sendOnce: boolean = false;          // only send ready call once
  stopOnce: boolean = false;          // only call stop once
  sizeofque: number = 0;              // number of files in queue
  numberToRecieve: number = 0;        // number of files to receive
  isBusy: boolean = true;                    // prevent the busy queue
  dropped: number = 0;

  // canvas variables
  canvas;                            // canvas handle
  context;                           // context handle
  cx: CanvasRenderingContext2D;      // live context for canvas
  CANVAS_HEIGHT: number = 800;        // height of canvas
  CANVAS_WIDTH: number = 800;         // width of canvas
  rect;                              // bounds of the canvas
  drawEvent: string = '0*0*0*0';      // not used
  showCanvas: boolean = false;        // show the canvas ?
  color = 'black';                   // start line color
  // adapter.js testing
  task: string = '';
  // webrtc testing
  connectionState;
  signalingState;
  iceConnectionState;
  iceGatheringState;
  peerIdentity;
  isCaller: boolean = false;
  currentAgreedDevices = { audio: false, video: true };
  currentArray = [];
  callArray = [];
  userConstraints = [];
  // UI controls
  isFocusedOn = "video";
  showDrawPad: boolean = false;
  audioInputSelect = [];
  audioOutputSelect = [];
  videoInputSelect = [];
  // rtc file share
  Offer;
  Answer;
  pendingFiles = [];
  isMobile: boolean = false;
  remoteWidth: number = 100;
  remoteHeight: number = 100;

  rWidth: string = "200px";
  rHeight: string = "200px";

  // view booleans
  PlayState: boolean = false;      //is the video call running
  dataEstablished: boolean = false;    //datachannel is open
  showDnD: boolean = false;           //show files
  draw: boolean = false;
  zindex: number = 3;
  deviceWidth: number = window.innerWidth;
  screenWidth: string = this.responsiveService.screenWidth;
  drawSub: Subscription;
  screenShare: boolean = false;
  devicesIds = [];

  constraints;  // changed later with AudioandVideo or Audio or video
  // desktop constraints
  AudioAndVideo = { video: true, audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } };
  AudioOnly = { video: false, audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } };
  VideoOnly = { video: true, audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 } };
  NoConstraints = { audio: false, video: false };
  constraintsScreenShare = {
    video: {
      cursor: "always"
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    }
  }
  ffconstraintsScreenShare = {
    video: {
      mediaSource: "screen"
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    }
  };
  front: boolean = true;
  cameraFacing = {
    video: {
      facingMode: (this.front ? "user" : "environment")
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    }
  };

  Appleconstraints = {
    audio: false,
    video: {
      facingMode: "user"
    }
  }

  //testconstraints = { audio: true, video: { width: 1280, height: 720 } };

  screenConstraints;
  fullscreen: boolean = true;
  startWidth: number;
  startHeight: number;
  messageaudio;                     // message sound
  filezindex: number = -1;
  deviceInfo;
  showShareButton: boolean = false;
  camSelect: boolean = false;
  hardwareDevices: MediaDeviceInfo[] = [];
  selectedCamera: MediaDeviceInfo;
  //audioContext: AudioContext;
  gainNode: any;
  showSlider: boolean = false;
  showStartVideo: boolean = false;
  isApple: boolean = false;

  // chat service http service, cdr detect changes and update
  constructor(private chatIO: ChatService, private cdr: ChangeDetectorRef,
    private route: ActivatedRoute, private responsiveService: ResponsiveService,
    private deviceService: DeviceDetectorService) {
    this.name = chatIO.getName();
    this.From = chatIO.getName();
    //console.log(this.configuration.iceServers);
    this.deviceInfo = this.deviceService.getDeviceInfo();
    if (this.deviceInfo.browser = 'Chrome') {
      this.screenConstraints = this.constraintsScreenShare;
      this.constraints =
        this.showShareButton = true;
    } else if (this.deviceInfo.browser = 'FireFox') {
      this.screenConstraints = this.ffconstraintsScreenShare;
      this.showShareButton = true;
    } else if (this.deviceInfo.browser = 'Safari') {
      this.isApple = true;
      this.showStartVideo = true;
    } else {
      this.screenConstraints = this.ffconstraintsScreenShare;
      this.showShareButton = true;
    }

  }

  handleSuccess(stream) {
    let local = this.localVideo.nativeElement;
    local.setAttribute('autoplay', '');
    local.setAttribute('muted', '');
    local.setAttribute('playsinline', '');
    local.srcObject = stream;
  }

  handleError(error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
      let v = this.constraints.video;
      alert(`The resolution is not supported by your device.`);
    } else if (error.name === 'PermissionDeniedError') {
      alert('Permissions have not been granted to use your camera and ' +
        'microphone, you need to allow the page access to your devices in ' +
        'order for the demo to work.');
    }
    alert(`getUserMedia error: ${error.name}`);
  }

  scrollTop() {
    window.scrollTo(0, 0);
  }

  toggleSlider() {
    this.showSlider = !this.showSlider;
  }

  fullScreen() {
    this.fullscreen = !this.fullscreen;
    if (!this.fullscreen) {
      this.draw = false;
      this.showDnD = false;
      this.filezindex = -1;
      this.zindex = 3;
    }
  }

  toggleCam() {
    this.front = !this.front;
    this.cameraFacing = {
      video: {
        facingMode: (this.front ? "user" : "environment")
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    };
    this._navigator.mediaDevices.getUserMedia(this.cameraFacing).then(
      (stream: MediaStream) => {
        this.peerConnection.getSenders().map(function (sender) {
          sender.replaceTrack(stream.getTracks().find(function (track) {
            return track.kind === sender.track.kind;
          }));
        });
      }).catch(function (error) {
        console.log("error getting other camera userMedia " + error);
      });
  }

  selectCam() {
    if (this.PlayState) {
      this.camSelect = !this.camSelect;
    }
    if (this.camSelect) {
      console.log("camera clicked");
      this.hardwareDevices = [];
      this.printMediaDevices();
      this.hardwareDevices.forEach(device => {
        console.log("cameras found on device " + device.deviceId);
      });
    }
  }

  printMediaDevices() {

    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.kind == "videoinput") {
            console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
            this.hardwareDevices.push(device);
          }
        })
      })
      .catch((err) => {
        console.log(err.name + ": " + err.message);
      });
  }

  changeSelectedCam(cameraID) {

    console.log("camera " + cameraID + " being added");
    this.camSelect = false;
    var constraints1 = {
      video: {
        deviceId: {
          exact: cameraID
        }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    };
    this._navigator.mediaDevices.getUserMedia(constraints1).then(

      (stream: MediaStream) => {
        this.peerConnection.getSenders().map(function (sender) {
          sender.replaceTrack(stream.getTracks().find(function (track) {
            return track.kind === sender.track.kind;
          }));
        });
      }).catch(function (error) {
        console.log("error getting other camera userMedia " + error);
      });
  }

  swapAnyTrack(stream, audiotrack) {

    // get audio track


    this.peerConnection.getSenders().map(function (sender) {
      sender.replaceTrack(stream.getTracks().find(function (track) {
        return track.kind === sender.track.kind;
      }));
      ///sender.replaceTrack(track);
    });

  }

  startScreenShare() {

    this.startCapture(this.constraintsScreenShare).then(
      (stream: MediaStream) => {
        this.peerConnection.getSenders().map(function (sender) {
          sender.replaceTrack(stream.getTracks().find(function (track) {
            return track.kind === sender.track.kind;
          }));
        });
      }).catch(function (error) {
        console.log("error getting ScreenShare userMedia " + error);
      });
  }

  stopCapture(stream) {

    let tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  }

  startVideo() {

    this._navigator.mediaDevices.getUserMedia(this.AudioAndVideo)
      .then((stream: MediaStream) => {
        this.peerConnection.getSenders().map(function (sender) {
          sender.replaceTrack(stream.getTracks().find(function (track) {
            return track.kind === sender.track.kind;
          }));
        });
      }).catch(function (error) {
        console.log("error getting ScreenShare userMedia " + error);
      });

  }

  switcthStreams() {
    if (this.PlayState) {
      this.screenShare = !this.screenShare;
      if (this.screenShare) {
        this.startScreenShare()
      } else {
        this.startVideo()
      }
    }
  }

  startCapture(displayMediaOptions) {
    return this._navigator.mediaDevices.getDisplayMedia(this.screenConstraints)
      .catch(err => { console.error("Error:" + err); return null; });
  }

  // canvas test code
  ngAfterViewInit(): void {
    this.rect = this.myCanvas.nativeElement.getBoundingClientRect();   // get bounding rectangle
    this.cx = this.myCanvas.nativeElement.getContext('2d');   // set the canvas context
    this.cx.lineWidth = 2;                                    // set the line width
    this.cx.lineCap = 'round';                                // set the ends to round
    this.cx.strokeStyle = '#000';                             // set the color to black to start
    this.rect = this.myCanvas.nativeElement.getBoundingClientRect();   // get bounding rectangle

    /*  if(this.isMobile){
        this.myCanvas.nativeElement.width = window.innerWidth - 80;
        this.myCanvas.nativeElement.height = window.innerHeight - 50;
      } else {
        this.myCanvas.nativeElement.width = 800;
        this.myCanvas.nativeElement.height = 500;
      }   */
  }

  getCardStyle() {
    let style = {};
    if (this.screenWidth == 'sm') {
      if (this.draw || this.showDnD) {
        style = {
          'width': `280px`
        }
      } else {
        style = {
          'width': `${this.deviceWidth - 36}px`
        }
      }

    } else if (this.screenWidth == 'md') {
      if (this.draw || this.showDnD) {
        style = {
          'width': `280px`
        }
      } else {
        style = {
          'width': `${this.deviceWidth - 80}px`
        }
      }

    } else if (this.screenWidth == 'lg') {
      if (this.draw || this.showDnD) {
        style = {
          'width': `280px`
        }
      } else {
        style = {
          'width': '800px'
        }
      }

    }
    return style;
  }


  // remote clear canvas
  clearThisCanvas() {
    this.cx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

  }
  // set the color for the line on canvas
  newColor(color) {
    this.color = color;
    this.cx.strokeStyle = this.color;        // set the color of the local line
  }
  // local clear canvas send to peer
  clearCanvas() {
    this.cx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);   // draw over the canvas
    this.dataChannel.send('*clear*0*0*black');                        // tell peer to clear canvas
  }

  //mouse down event triggered
  dragStart(event: MouseEvent) {
    console.log("dragstart X: " + event.clientX + " Y: " + event.clientY);
    if (this.dataEstablished) {                                          // if datachannel open
      this.rect = this.myCanvas.nativeElement.getBoundingClientRect(); // get canvas bounds start of draw
      this.localDrawOnCanvas('start', event.clientX, event.clientY);   // trigger draw start
    }
  }
  // mouse is down and mouse is moving
  drag(event: MouseEvent) {
    console.log("drag X: " + event.clientX + " Y: " + event.clientY);
    if (this.dataEstablished) {                             // if datachannel open
      if (event.buttons == 1) {                            // if left mouse is down
        this.localDrawOnCanvas('drag', event.clientX, event.clientY);     // trigger draw ongoing
      }
    }
  }
  // mouse has left the canvas or mouse up event
  dragEnd(event: MouseEvent) {
    console.log("dragend X: " + event.clientX + " Y: " + event.clientY);
    if (this.dataEstablished) {                                  // if datachannel open
      this.localDrawOnCanvas('end', event.clientX, event.clientY);       // trigger draw end
    }
  }

  //touch down event triggered
  dragTouchStart(event) {
    console.log("dragstart X: " + event.changedTouches[event.changedTouches.length - 1].pageX + " Y: " + event.changedTouches[event.changedTouches.length - 1].pageY);
    event.preventDefault();
    event.stopPropagation();
    if (this.dataEstablished) {                                          // if datachannel open
      this.rect = this.myCanvas.nativeElement.getBoundingClientRect(); // get canvas bounds start of draw
      this.localDrawOnCanvas('start', event.changedTouches[event.changedTouches.length - 1].pageX, event.changedTouches[event.changedTouches.length - 1].pageY);   // trigger draw start
    }
  }
  // touch is down and mouse is moving
  dragTouch(event) {
    console.log("drag X: " + event.changedTouches[event.changedTouches.length - 1].pageX + " Y: " + event.changedTouches[event.changedTouches.length - 1].pageY);
    event.preventDefault();
    event.stopPropagation();
    if (this.dataEstablished) {                             // if datachannel open
      this.localDrawOnCanvas('drag', event.changedTouches[event.changedTouches.length - 1].pageX, event.changedTouches[event.changedTouches.length - 1].pageY);     // trigger draw ongoing
    }
  }
  // touch has left the canvas or mouse up event
  dragTouchEnd(event) {
    console.log("dragend X: " + event.changedTouches[event.changedTouches.length - 1].pageX + " Y: " + event.changedTouches[event.changedTouches.length - 1].pageY);
    event.preventDefault();
    event.stopPropagation();
    if (this.dataEstablished) {                                  // if datachannel open
      this.localDrawOnCanvas('end', event.changedTouches[event.changedTouches.length - 1].pageX, event.changedTouches[event.changedTouches.length - 1].pageY);       // trigger draw end
    }
  }

  showDraw() {
    this.draw = !this.draw;
    this.showDnD = false;
    console.log("draw " + this.draw + " to " + this.To);
    if (this.draw) {
      this.zindex = -1;
      if (this.PlayState) {
        this.chatIO.drawState(this.To, "on");
      }
      this.showDnD = false;
      this.scrollTop();
      this.filezindex = -1;
      this.fullscreen = true;
    } else {
      this.zindex = 3;
      this.chatIO.drawState(this.To, "off");
    }
    if (this.PlayState) {
      this.shareCanvas();
    }
  }

  showFiles() {
    this.showDnD = !this.showDnD;
    this.draw = false;
    if (this.showDnD) {
      this.filezindex = 4;
      this.fullscreen = true;
    } else {
      this.filezindex = -1;
    }
  }

  /* start the canvas share */
  // start the local canvas contex
  shareCanvas() {
    this.startCanvas();                          //start the context ready for drawing
    this.dataChannel.send('*open*0*0*black');    // tell peer to ready canvas
  }
  // set up canvas
  startCanvas() {
    if (this.cx == null) {
      this.dataChannel.send('*open*0*0*black');    // tell peer to ready canvas
    }
    this.cx = this.myCanvas.nativeElement.getContext('2d');   // set the canvas context
    this.cx.lineWidth = 3;                                    // set the line width
    this.cx.lineCap = 'round';                                // set the ends to round
    this.cx.strokeStyle = '#000';                             // set the color to black to start
    this.rect = this.myCanvas.nativeElement.getBoundingClientRect();   // get bounding rectangle
  }

  private localDrawOnCanvas(type, x, y) {                    // draw on local canvas
    x = x - this.rect.left;
    y = y - this.rect.top;
    let points = this.scaleCoordinatesOut(x, y);             // use canvas scale factor
    this.dataChannel.send(`*${type}*${points.x}*${points.y}*${this.color}`);  // send to peer
    // incase the context is not set
    if (!this.cx) { return; }                                // if the context is not set break
    // start our drawing path
    this.cx.strokeStyle = this.color;                        // set line to locally selected color
    if (type == 'start') {                                     // start of a new path
      this.cx.beginPath();                                   // start drawing a path
      this.cx.moveTo(x, y);                                  // move to mousedown location
    } else if (type == 'drag') {                              // mouse is down and mouse is moving
      this.cx.lineTo(x, y);                                  // draw a line to x,y location
      this.cx.stroke();                                      // draw the stroke as it is drawn
    } else if (type == 'end') {                               // mouse up
      this.cx.closePath();                                   // close this path to end line drawn
    }
  }

  private remoteDrawOnCanvas(type, xx, yy, color) {         // include color from peer
    if (type == 'open') {                                     // open canvas signal from peer
    } else if (type == 'clear') {                            // signal is clear canvas from peer
      this.clearThisCanvas();                               // clear the local canvas without send
    } else {
      let points = this.scaleCoordinatesIn(xx, yy);         // scale incoming points to this cavas size
      let x = points.x;                                     // set the x after scale
      let y = points.y;                                     // set the y after scale
      if (!this.cx) { return; }                             // break if no context set
      // start our drawing path
      this.cx.strokeStyle = color;                          // set line color to peer selected color
      if (type == 'start') {                                  // mouse down
        this.cx.beginPath();                                // start a new path
        this.cx.moveTo(x, y);                               // move to mouse down location
      } else if (type == 'drag') {                           // mouse down and moving
        this.cx.lineTo(x, y);                               // draw a line to new location
        this.cx.stroke();                                   // draw line now
      } else if (type == 'end') {                            // mouse up end of line
        this.cx.closePath();                                // close path draw
      }
    }
  }
  public incomingPos(draw) {                                 // handle the incoming instructions string
    draw = draw.trim();                                     // remove trailing white space
    draw = draw.substring(1);                               // remove first char '*'
    var ind = draw.indexOf('*');                            // find first '*'
    if (ind !== -1) {                                        // if * is found in string
      let type = draw.substring(0, ind);                    // get type
      draw = draw.substring(ind + 1);                        // retain rest of string
      var ind = draw.indexOf('*');                          // get index of *
      if (ind !== -1) {                                      // if * is found
        let x = (parseInt(draw.substring(0, ind)));         // parse the x value to int
        draw = draw.substring(ind + 1);                     // retain the rest of the string
        var ind = draw.indexOf('*');                        // get index of *
        if (ind != -1) {                                      // if * is found
          let y = (parseInt(draw.substring(0, ind)));       // parse the y value to int
          let color = draw.substring(ind + 1);             // get the color from peer
          this.remoteDrawOnCanvas(type, x, y, color);       // draw the instruction from peer
        } else {
          console.log('incomingPos no color found');
        }
      } else {
        console.log('incomingPos no x y found');
      }
    } else {
      console.log('incomingPos no type found');
    }
  }
  // scale from display coordinates to model coordinates, out going
  scaleCoordinatesOut(x, y) {
    let modelX = Math.round(x * (this.cx.canvas.width / this.cx.canvas.offsetWidth));
    let modelY = Math.round(y * (this.cx.canvas.height / this.cx.canvas.offsetHeight));
    return { x: modelX, y: modelY }
  }
  // scale from model coordinates to display coordinates, in coming
  scaleCoordinatesIn(x, y) {
    let displayX = Math.round(x * (this.cx.canvas.offsetWidth / this.cx.canvas.width));
    let displayY = Math.round(y * (this.cx.canvas.offsetHeight / this.cx.canvas.height));
    return { x: displayX, y: displayY }
  }
  // end of canvas test code


  /*
  webRTC file exchanger
  */

  // click to select file mobile NOT USED YET
  handleFileInput(files: FileList) {      //got file start from file sector
    if (files.item.length > 0) {                 // if multipule files selected
      for (let i = 0; i < files.length; i++) {        // for each file
        this.sendingQueue.push(files.item(i));   // queue the files for send
        this.chatIO.offerSendFile(this.To, files.item(i).name, this.From);
      }
    }
  }

  gotAnswer(filename) {
    //console.log("rtc got answer filename: "+filename.name);
    this.file = filename;
    // console.log("rtc getanswer "+ this.file.name+" is being sent");
    this.readThis();
  }

  // set up the file reader to send chunks as reader finishes each chunck
  readThis(): void {                      //start process of file transfer
    this.busy = true;                     //prevent next send till ready
    this.chatIO.sending(this.To, (this.sendingQueue.length + 1));         // tell the peer im sending to you
    this.fileTransferState = 'Sending...';  // inform user file is sending
    this.sendOnce = true;                 // limit the file to send once
    this.fileReader = new FileReader();    //use filereader to get byte data
    this.fileReader.onloadend = e => {     // listen for a chunck to finish
      this.sendChunk(this.fileReader.result);  //send read chunck to sender
    }

    this.StartTransfer();                  //start chunking
  }
  // send details of file name/size over dataconnection
  StartTransfer() {
    this.currentChunk = 0;                   // reset chunck tracking
    this.progress = 0;                       // set file transfer to zero on start
    this.bytesSent = 0;                      // set the bytes transfered to zero
    this.filedescriptionName = this.file.name;  // set the name of the file sent
    this.filedescriptionSize = this.file.size;  // set the size in bytes of file sent
    this.dataChannel.send(JSON.stringify({   // send start to remote
      fileName: this.file.name,              // requires name to save for peer
      fileSize: this.file.size               // requires size to reconstruct for peer
    }));
    this.readNextChunk()                     // start chunking process
  }
  // looped chunker service
  readNextChunk() {                          //on finish of chunk event is fired in readThis
    //console.log(`reading chunck:${this.currentChunk}`);
    var start = this.BYTES_PER_CHUNK * this.currentChunk;  //find end of last chunck read
    var end = Math.min(this.file.size, start + this.BYTES_PER_CHUNK); // find end of current slice
    this.fileReader.readAsArrayBuffer(this.file.slice(start, end)); //read to end of chunk to trigger readthis event listner
  }
  // sends chuncks to peer
  sendChunk(result) {
    this.bytesSent += this.BYTES_PER_CHUNK;     // keep track of how many bytes have been sent
    //console.log("progress "+((this.bytesSent / this.filedescriptionSize) * 100).toFixed(0))
    this.progress = ((this.bytesSent / this.filedescriptionSize) * 100).toFixed(0); // change to percentage
    this.dataChannel.send(result);         //send chunck over datachannel
    this.cdr.detectChanges();              // update UI
    this.currentChunk++;                   // increment current chunk
    if (this.BYTES_PER_CHUNK * this.currentChunk < this.file.size) {   //if not complete
      this.readNextChunk();                // loop through chunking process again
    } else {
      this.filedescriptionName = '';       // reset these values after sending has ended
      this.filedescriptionSize = 0;
      this.fileTransferState = 'Ready...'; // set user message to ready
      this.progress = 0;
      this.cdr.detectChanges();           // update UI
    }
  }
  /*
    receiver peer download
  */
  // on file name/size received start RECEIVE file
  startDownload(data) {    // on first data channel message
    this.busy = true;                                       // queue files while busy
    this.fileTransferState = 'Receiving...';                // message to user in dnd box
    this.progress = 0;                                      // set progress bar to zero
    this.incomingFileInfo = JSON.parse(data.toString());    // get file details
    this.filedescriptionName = this.incomingFileInfo.fileName;  // set file name
    this.filedescriptionSize = this.incomingFileInfo.fileSize;  // set file size
    this.incomingFileData = [];                             // empty the array
    this.bytesReceived = 0;                                 // bytes received for this file
    this.downloadInProgress = true;                         // downloading boolean
  }
  // process the data into an array and calculate progress
  progressDownload(data) {  // after details received this will hadle the data arrays
    this.bytesReceived += data.byteLength;   // progress tracker
    this.incomingFileData.push(data);        // add chunck to recieve array
    this.progress = ((this.bytesReceived / this.incomingFileInfo.fileSize) * 100).toFixed(0);// % progress
    this.cdr.detectChanges();                // update UI
    if (this.bytesReceived === this.incomingFileInfo.fileSize) {    //when all bytes are recieved
      this.endDownload();                    //end download
    }
  }
  // create the file from the array of bytes and offer to peer
  endDownload() {
    this.downloadInProgress = false;                      // show finished
    let blob = new window.Blob(this.incomingFileData);  // create a blob of the data
    let anchor = document.createElement('a');             // create a link
    anchor.href = URL.createObjectURL(blob);              // set the link to point to the blob
    anchor.download = this.incomingFileInfo.fileName;     // name the blob
    anchor.textContent = 'XXXXXXXX';                      //text content is required to create a file
    // trigger file download from memory
    if (anchor.click) {
      anchor.click();
    } else {
      let evt = document.createEvent('MouseEvents');
      anchor.dispatchEvent(evt);
    }
    this.fileTransferState = 'Ready...';                  // reset the user message
    this.progress = 0;                                    // reset progress bar
    this.filedescriptionName = '';                        // reset filename
    this.filedescriptionSize = 0;                         // reset file size
    this.chatIO.ready(this.To);                           // tell peer to send if queued
    this.numberToRecieve--;
    this.busy = false;
    this.cdr.detectChanges();                             // update the UI
    this.playSound();
  }
  //dev testing set name if not logged on
  setName() {
    this.From = this.name.replace(/\s+/g, '-');             // remove spaces from user names
    //this.chatIO.sendUserName(this.From);                 // used for testing
  }

  /* get a list of online users to send video requests to,
  get a list of offers to video chat,
  get a list of answers and AcceptAnswer to set answer,
  get an ice candidate message when sent
  */

  onResize() {
    this.responsiveService.checkWidth();
  }

  ngOnInit() {

    //this.getAvailableDevices();
    this.responsiveService.getMobileStatus().subscribe(isMobile => {
      this.deviceWidth = window.innerWidth;
      this.screenWidth = this.responsiveService.screenWidth;
      if (isMobile) {
        //console.log('Mobile device detected')
        this.isMobile = true;
        this.remoteWidth = window.innerWidth - 25;
        this.remoteHeight = window.innerHeight - 200;
      }
      else {
        //console.log('Desktop detected')
        this.isMobile = false;
        this.remoteWidth = 800;
        this.remoteHeight = 400;
      }

    });
    this.onResize();
    //this.From = localStorage.getItem('name');
    this.name = this.chatIO.getName();
    //this.chatIO.sendUserName(this.name);
    //this.chatIO.requestUsers(this.name);
    // test user device for size, set screen size to suit
    if (/Android|iPhone|iPad|ipod|blackberry|IEMobile|Opera/i.test(this._navigator.userAgent)) {
      //this.constraints = this.mobileConstraints
      this.islaptop = false;
      //console.log('use mobile settings');
    } else {
      //this.constraints = this.desktopConstraints;
      this.islaptop = true;
      //console.log('use desktop settings');
    }
    //get online users to add to "users array"
    this.online = this.chatIO.getOnlineUsers().subscribe(onlineUsers => {
      var str: string = onlineUsers.toString();
      var strn = str.split(',');
      this.users = [];
      strn.forEach((item) => {
        this.users.push(item);
      });
      this.number = this.users.length;
    });
    //get requested calls "offers array"
    this.offer = this.chatIO.getRequestedCalls().subscribe(offercall => {
      //console.log("in webrtc in inint getrequestedCalls a call has come in");
      this.acceptedCall = offercall;
      //console.log("in webrtc in inint "+offercall);
      setTimeout(() => {
        this.offers.push(offercall);
      }, 2000);
    });
    //start negotiation process which sends to recieveVideoPeerOffer
    this.answered = this.chatIO.getAcceptedCalls().subscribe(acceptcall => {
      this.To = acceptcall.toString();
      console.log("webrtc getAccepted calls To: " + this.To);
      this.OfferVideoChat();
    });
    this.Offer = this.chatIO.getOfferSendfile().subscribe(offer => {
      //console.log("getOfferSendfile  got an offer");
      let filedesc = offer.toString().split('*');
      let to = filedesc[2];
      let filename = filedesc[1];
      this.pendingFiles.push(filename);      // get the File:fil
      this.showDnD = true;
      this.filezindex = 4;
      this.playSound();
    });
    this.Answer = this.chatIO.getAnswerSendfile().subscribe(answer => {
      // Start the file send with this filename
      //console.log("getAnswerSendfile  got an answer: "+answer);
      let AFile = answer.toString().split('*');
      let removefile;
      let from = AFile[2];
      let fileAuthorized = AFile[1];

      this.sendingQueue.forEach(file => {
        if (fileAuthorized == file.name) {
          //console.log("sending file:  "+fileAuthorized+" peer: "+from);
          this.gotAnswer(file);
        }
      });
    });
    this.drawSub = this.chatIO.getDraw().subscribe(state => {
      console.log("draw recived from peer");
      if (state == "on") {
        console.log("draw recived from peer is true");
        this.draw = true;
        this.zindex = -1;
        this.fullscreen = false;
        this.showDnD = false;
        this.cdr.detectChanges();
      } else if (state == "off") {
        console.log("draw recived from peer is false");
        this.draw = false;
        this.zindex = 3;
        this.cdr.detectChanges();
      }
    });
    //set the remote and local and send answer
    this.videoOffer = this.chatIO.receiveVideoPeerOffer().subscribe(offervideo => {
      this.Accept(offervideo);
    });
    //set answer to remote peer
    this.answer = this.chatIO.receiveVideoPeerAnswer().subscribe(acceptVideo => {
      this.AcceptAnswer(acceptVideo);
    });
    //ice candidates received
    this.candidate = this.chatIO.receiveIce().subscribe(ice => {
      if (ice !== null) {
        console.log("got peer ice");
        this.AddIceCandidate(ice);
      }
    });


    //stop call
    this.onStop = this.chatIO.callEnd().subscribe(end => {      // stop signal received
      if (this.PlayState) {                                       // if playing
        this.stopStream();                                      // stop
        this.PlayState = false;                                 // prevent ongoing stop
      }
    });
    // sending message received
    this.sending = this.chatIO.getSending().subscribe(send => {
      //this.busy = true;
      var str: string = send.toString();
      this.numberToRecieve = parseInt(str);
    });
    // ready message received
    this.ready = this.chatIO.getReady().subscribe(ready => {
      this.busy = false;
      if (this.sendingQueue.length > 0) {
        let index = this.sendingQueue.indexOf(this.file);
        if (index != -1) {
          //console.log("removing from sendingqueue "+this.file.name);
          this.sendingQueue.splice(index, 1);
        }
      }
    });
    //this.chatIO.requestUsers(this.name);
  }

  playSound() {
    if (this.messageaudio == null) {
      this.messageaudio = new Audio();
      this.messageaudio.src = "../../../assets/sounds/mess.mp3";
      this.messageaudio.load();
    }
    this.messageaudio.play();
  }

  onFilesChangeManual(event) {
    if (event.target.files && event.target.files.length) {
      let files: Array<File> = event.target.files;
      this.onFilesChange(files);
    }
  }

  // drag and drop file for desktop SENDER file
  onFilesChange(files: Array<File>) {         //event called onfilechange
    this.dropped++;
    let inQueue = false;
    if (files.length > 0) {
      if (files.length == 1) {
        this.sendingQueue.forEach(file => {
          if (file.name == files[0].name) {
            inQueue = true;
          }
        });
        if (!inQueue) {
          this.sendingQueue.push(files[0]);
          this.chatIO.offerSendFile(this.To, files[0].name, this.From);
        }
      }
      if (files.length > 1) {              // if more than one files
        let inqueue = false;
        files.forEach((file: File) => {
          this.sendingQueue.forEach(qued => {
            if (qued.name == file.name) {
              inqueue = true;
            }
          });
          if (!inqueue) {
            this.sendingQueue.push(file);    // queue the files
            this.chatIO.offerSendFile(this.To, file.name, this.From);
          }
        });
        //this.file = this.sendingQueue.shift();          // set current file and remove
      }
    }

    this.sizeofque = this.sendingQueue.length;      // size to user
  }

  allowFileForTransfer(fileNamed) {
    //console.log("file authorized "+fileNamed);
    if (!this.busy) {
      let index = this.pendingFiles.indexOf(fileNamed);
      if (index != -1) {
        this.pendingFiles.splice(index, 1);
        this.chatIO.answerSendFile(this.To, fileNamed, this.From);
      }
    } else {
      console.log("this file transfer failed the busy = true");
    }
  }
  /* set the name for a new video chat, create offer*/
  setPrivateName(name) {
    //console.log("Set Peer name "+name);
    this.To = name;
    this.chatIO.requestCall(name, this.name);
  }
  // return signal call has been answered by peer
  acceptCall(To, From) {
    //console.log("webrtc acceptcall From: "+From+" To: "+To);
    this.To = From;                    // set the recipiant name
    this.chatIO.acceptCall(From, To);  // send to peer accept call message
    //this.sendISRunning();
  }
  // chat has initiated a call to peer from this
  acceptChatCall(To, From) {
    console.log("rtc acceptcall to: " + To + " from: " + From);
    this.chatIO.acceptCall(To, From);
    //this.sendISRunning();
  }
  setDrawPad() {
    this.showDrawPad = !this.showDrawPad;
    this.cx = this.myCanvas.nativeElement.getContext('2d');
    this.cx.lineWidth = 3;                                    // set the line width
    this.cx.lineCap = 'round';                                // set the ends to round
    this.cx.strokeStyle = '#000';
    this.rect = this.myCanvas.nativeElement.getBoundingClientRect();
  }
  /* create a config and send an offer to a peer TO with the sdp and the
  from sender From the media ie get user media is required here to create the
  sdp to be able to negotiate the connection, the various browsers have different
  possable get user media options*/
  OfferVideoChat() {
    if (this.isApple) {
      this.constraints = this.Appleconstraints;
    }
    console.log("webrtc offerVideo to: " + this.To + " from: " + this.From);
    let local = this.localVideo.nativeElement;
    local.setAttribute('autoplay', '');
    local.setAttribute('muted', '');
    local.setAttribute('playsinline', '');
    if (this.peerConnection) {                    // test if call is already open
      alert("You cant start a call because you already hav one open");
    } else {                                    // not on call already
      this.stopOnce = true;                     // set the peer stop to once
      this.PlayState = true;                    // this video is playing
      this.setUpPeerConnection();               // set up RTCPeerConnection
      this.symetricalChannel();                 // open data channel
      this.peer = this.To;                      // set peer name for stop

      this._navigator.mediaDevices.getUserMedia(this.constraints)
        .then((stream) => {                                   //handle result stream
          this.stream = stream;                               //add stream handle
          local.srcObject = this.stream;                      // local vid stream
          //    this.peerConnection.addStream(stream);              //add stream to peerConnection
          this.stream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.stream)
          });
          return stream;
        })

        .then(() => {
          this.peerConnection.createOffer()                  //returns SDP pass to peer for streaming
            .then(sdp => {
              return this.peerConnection.setLocalDescription(sdp)
            })  //set this desc to sdp
            .then((localDes) => {
              this.chatIO.sendVideoPeerOffer(this.To, JSON.stringify(this.peerConnection.localDescription), this.From)  // socket the offer to peer
            })
        }).catch(this.handleGetUserMediaError);             //catch errors 
    }
  }

  /* the idea is the offer is set as local and also sent to the other client
  then the created sdp is set as the remote on the other client
  the other client then sends its sdp back and it is set as the remote to the initiator */
  Accept(message) {                //accept the offer onclick
    console.log("webrtc Accept To: " + this.To + " From: " + this.From);
    if (this.isApple) {
      this.constraints = this.Appleconstraints;
    }
    let local = this.localVideo.nativeElement;
    local.setAttribute('autoplay', '');
    local.setAttribute('muted', '');
    local.setAttribute('playsinline', '');
    this.onCall = true;                     //boolean show stop button
    this.PlayState = true;                  //set peer for stop
    this.stopOnce = true;                   // only send one stop signal
    this.setUpPeerConnection();             // start in peer connection
    const msg = JSON.parse(message);        // parse the message sent from peer
    //const sessionDesc = new RTCSessionDescription(msg);
    this.symetricalChannel();               // open data channel

    this._navigator.mediaDevices.getUserMedia(this.constraints)
      .then((stream) => {
        this.stream = stream;                               //add stream handle
        let local = this.localVideo.nativeElement;
        local.srcObject = this.stream;                      // local vid stream
        //  this.peerConnection.addStream(stream);
        this.stream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.stream)
        });
        return stream;
      })
      .then(() => {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg)) //set the sdp from the remote answer
          .then((result) => {
            return this.peerConnection.createAnswer()
              .then((sdp) => {
                return this.peerConnection.setLocalDescription(sdp)
              })
              .then((localdesc) => {
                this.chatIO.sendVideoAnswer(this.To, JSON.stringify(this.peerConnection.localDescription), this.From)  //socket the answer
              });
          })
      }).catch(this.handleGetUserMediaError);
    this.iceQueue.forEach(cand => {
      this.chatIO.sendIceCandidate(this.To, JSON.stringify(cand), this.From);
    });
    this.iceQueue = [];

  }


  AcceptAnswer(message) {                       //initiator to set recivers asnswer
    this.onCall = true;                         // set oncall to show the video and data channel
    const msg = JSON.parse(message);            // extract sdp for session
    // const sessionDesc = new RTCSessionDescription(msg);
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg))//set remote
      .then(() => {
        this.iceQueue.forEach(cand => {
          this.chatIO.sendIceCandidate(this.To, JSON.stringify(cand), this.From);
        });
        this.iceQueue = [];
      })
      .catch(this.handleGetUserMediaError);
  }


  getAvailableDevices() {                        // get an array of connected mics cameras
    if (this._navigator !== null) {
      if (!this._navigator.mediaDevices || !this._navigator.mediaDevices.enumerateDevices) {
        console.log("get available devices NO mediaDevices found!!!");
      } else {
        this._navigator.mediaDevices.enumerateDevices()
          .then((devices) => {
            //console.log(Object.keys(devices).map(k => devices[k]));
            devices.forEach((device) => {
              //console.log(device.kind);
              if (device.kind === 'videoinput') {
                let details = device.label || 'videoinput ' + (this.videoInputSelect.length + 1);
                this.videoInputSelect.push(details);
                this.hasVideo = true;
              } else if (device.kind === 'audioinput') {
                let details = device.label || 'MicroPhone ' + (this.audioInputSelect.length + 1);
                this.audioInputSelect.push(details);
                this.hasAudio = true;
              } else if (device.kind === 'audiooutput') {
                let details = device.label || 'Speaker ' + (this.audioInputSelect.length + 1);
                this.audioOutputSelect.push(details);
              }
            });
            if (this.hasVideo && this.hasAudio) {
              if (this.isApple) {
                this.constraints = this.Appleconstraints;
              } else {
                this.constraints = this.AudioAndVideo;
              }
              this.availableDevices.emit({ audio: true, video: true });
            } else if (this.hasAudio) {
              this.constraints = this.AudioOnly;
              this.availableDevices.emit({ audio: true, video: false });
            } else if (this.hasVideo) {
              this.constraints = this.VideoOnly;
              this.availableDevices.emit({ audio: false, video: true });
            } else {
              this.availableDevices.emit({ audio: false, video: false });
            }
          }).catch(function (err) {
            console.log(err.name + ": " + err.message);
          })
      }
    } else {
      console.log("get webrtc availableDevices _navigator is null");
    }
  }
  //set up RTCPeerConnection
  setUpPeerConnection() {
    this.getAvailableDevices();
    this.iceQueue = [];                                            // clear the ice queue
    this.video = this.hardwareVideo.nativeElement;                 //html video element
    this.audio = this.hardwareVideo.nativeElement;
    //    this.audioContext = new AudioContext();
    //    this.gainNode = this.audioContext.createGain();
    try {
      this.peerConnection = new RTCPeerConnection(this.turnServer);     //create connection object
      this.peerConnection.ontrack = (event) => {
        //console.log(event.streams.length);
        this.video.srcObject = event.streams[0];
        this.streamEstablished = true;
      }
      this.peerConnection.onicecandidate = e => {                   //if ice found send to peer
        if (e.candidate != null) {                                    //if ice event is candidate
          const candidate = new RTCIceCandidate(e.candidate);        //create the candidate
          //this.chatIO.sendIceCandidate(this.To, JSON.stringify(candidate), this.From);
          //console.log(this.name+ " is Sending ICECandidate From: "+this.From+" To: "+ this.To);
          var sd = this.peerConnection.currentRemoteDescription;
          if (sd) {
            this.chatIO.sendIceCandidate(this.To, JSON.stringify(candidate), this.From); // send ICE
          } else {
            this.iceQueue.push(candidate);
          }
        }
      }
      this.peerConnection.onaddstream = (event) => {
        this.video.srcObject = event.stream;
        this.streamEstablished = true;
      }
    } catch (error) {
      console.log("Failed to create PeerConnection " + error);
      console.log("config " + this.peerConnectionConfig.iceServers);
    }
    this.peerConnection.onconnectionstatechange = event => {
      switch (event) {
        case "connected":
          // The connection has become fully connected
          this.P2PEstablished = true;
          this.connectionState = 'Connected';
          break;
        case "disconnected":
        case "failed":
          // One or more transports has terminated unexpectedly or in an error
          this.connectionState = 'Disconnected or Error';
          break;
        case "closed":
          // The connection has been closed
          this.connectionState = 'Closed';
          break;
      }
    }

    /**
     * THIS IS FOR WHEN onaddstream IS DEPRESIATED
     */

    /*    this.peerConnection.onaddstream = (event) => {
          this.video.srcObject = event.stream;
          this.streamEstablished = true;
        }*/
    this.peerConnection.onremovestream = e => {      // stream has been removed trigger
      if (this.PlayState) {                            // if video is palying
        this.stopOnce = false;                       // prevent seending stop to peer
        this.stopStream();                           // stop this video
      }
    }
    this.peerConnection.oniceconnectionstatechange = e => {  // moniter ice state

      if (this.PlayState) {
        switch (this.peerConnection.iceConnectionState) {
          case "closed":
          case "failed":
          case "disconnected":
            console.log('ice connection state closed, failed or disconnected stop called');
            this.stopOnce = false;
            this.stopStream();
            break;
        }
      }
    }
    this.peerConnection.onsignalingstatechange = e => {   // moniter the signaling state of ICE
      if (this.PlayState) {
        switch (this.peerConnection.signalingState) {
          case "closed":
            console.log('signaling state closed stop called');
            this.stopOnce = false;
            this.stopStream();
            break;
        }
      }
    }
  }
  // set up the data channel
  symetricalChannel() {
    this.dataChannel = this.peerConnection.createDataChannel('chat', { negotiated: true, id: 0, ordered: true });
    this.dataChannel.onopen = event => {       // on data channel is open
      this.dataEstablished = true;             // show canvas and file transfer
      this.cdr.detectChanges();                // update UI
    }
    this.dataChannel.onmessage = event => {    // message over datachannel
      if (event.data[0] == '*') {                // if first char is *
        this.incomingPos(event.data);          // send to draw handler
      } else if (event.data[0] == '&') {
        // remove first char & to get gain value
        //console.log("volume change "+event.data);
        let value = event.data.substring(1);
        // change the local by the sound value you get
        this.changeMicrophoneLevel(value);
      }

      else {                                 // message is a file chunck
        if (this.downloadInProgress == false) { // if this is the first message
          this.startDownload(event.data);      // process reset/start
        } else {                               // this is not first message in sequence
          this.progressDownload(event.data);   // pass chunck for processing
        }
      }
    }
    this.dataChannel.onerror = error => {       // print error for data channel
      console.log(`local datachannel error: ${error}`);
    }
  }

  changeMicrophoneLevel(value) {
    console.log("changeMicrophoneLevel   peer changed this mic vol " + value);
    if (value && value >= 0 && value <= 2) {
      //this.gainNode.gain.value = value;
      this.hardwareVideo.nativeElement.volume = value;

    }
  }

  muteMic() {

    if (this.stream && this.PlayState) {
      this.toggleMic(this.stream);
      this.showMuted = !this.showMuted;
    }
  }

  toggleMic(stream) { // stream is your local WebRTC stream
    var audioTracks = this.stream.getAudioTracks();
    for (var i = 0, l = audioTracks.length; i < l; i++) {
      audioTracks[i].enabled = !audioTracks[i].enabled;
    }
  }

  changeMicrophoneLevelPeer(event) {
    let value = event.value;
    console.log("changeMicrophoneLevelPeer    changing peer mic vol " + value);

    if (value && value >= 0 && value <= 2) {
      if (this.PlayState) {

        this.dataChannel.send(`&${value}`);
      }
    }
  }

  getAudioStatus() {
    if (this.hasAudio) {
      return "green";
    } else {
      return "red";
    }
  }

  getVideoStatus() {
    if (this.hasVideo) {
      return "green";
    } else {
      return "red";
    }
  }

  getStreamStatus() {
    if (this.streamEstablished) {
      return "green";
    } else {
      return "red";
    }
  }
  getDataStatus() {
    if (this.dataEstablished) {
      return "green";
    } else {
      return "red";
    }
  }
  getP2PStatus() {
    if (this.busy) {
      return "green";
    } else {
      return "red";
    }
  }
  getStatus() {
    if (this.peerConnection) {
      if (this.peerConnection.signalingState === 'stable') {
        return "green";
      } else {
        return "red";
      }
    } else {
      return "red";
    }

  }
  getICEStatus() {
    if (this.peerConnection) {
      if (this.peerConnection.iceConnectionState === 'connected') {
        return "green";
      } else {
        return "red";
      }
    } else {
      return "red";
    }
  }

  getSocketStatus(){
    if(this.chatIO.isConnected){
      return "green";
    } else {
      return "red";
    }
  }

  // clear the message variable and pass to sender
  sendOverChannel() {
    const msg = this.send;
    this.send = "";
    this.sendMessage(msg);
  }
  // ensure the channel is open before sending, printing errors for channel
  sendMessage(msg) {
    switch (this.dataChannel.readyState) {
      case "connecting":
        console.log("Connection not open");
        break;
      case "open":
        console.log('open and SENDING');
        this.dataChannel.send(msg);
        break;
      case "closing":
        console.log("Attempted to send message while closing: " + msg);
        break;
      case "closed":
        console.log("Error! Attempt to send while connection closed.");
        break;
    }
  }
  // errors for getting the camera and microphone
  handleGetUserMediaError(error) {
    console.log("handlegetusermediaerror " + error.name);
    switch (error.name) {
      case "NotFoundError":
        alert("Unable to open your call because: Could NOT find camera and/or microphone");
        break;
      case "SecurityError":
        alert("handlegetusermediaerror security error " + error.name);
        break;
      case "PermissionDeniedError":
        alert("handlegetusermediaerror Permission Denied " + error.name);        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert("Error opening your camera and/or microphone: " + error.message);
        break;
    }
    this.stopStream();   //turn off for testing on one computer
    console.log("handlegetusermediaerror stop stream called " + error.name);
  }

  // ice candidate allow the peers to discover each other
  AddIceCandidate(ice) {
    console.log("ice peer added");
    const cand = JSON.parse(ice);                         //extract ice
    const candidate = new RTCIceCandidate(cand);          // create ICE
    if (candidate != null) {
      this.peerConnection.addIceCandidate(candidate)        // set ICE
        .catch((error) => {
          console.log("Add ice error " + error);
        });
    }
  }

  // close the stream and stop the video and audio tracks
  stopStream() {
    console.log("webrtc stopStream button click");
    //this.clearThisCanvas();
    //this.chatIO.requestUsers(this.From);
    this.callStop.emit("stop");                         // call stop to chat
    this.PlayState = false;                             // close playstate
    if (this.peerConnection) {                             // if this call is open

      //  this.peerConnection.getTransceivers().forEach((transceiver) => {
      //    transceiver.stop();
      //  });

      if (this.video.srcObject) {      //close this video element if in use
        this.video.srcObject = null;   //clear video
      }
      if (this.dataChannel) {
        this.dataChannel.close();               // close the data channel
        this.dataChannel = null;                // null the handle
      }
      if (this.stream != null) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null;
      }

      this.peerConnection.close();    //close peer connection
      this.peerConnection = null;     //ready for new connection
      this.iceQueue = [];             // reset the ice queue array
    }
    this.offers = [];                           //clear offers
    if (this.stopOnce) {                                    // if this is the stop peer
      this.stopOnce = false;                              // prevent resend
      this.chatIO.endCall(this.To);                       // send end call to peer
    }
    this.reset();
  }

  reset() {
    this.isCaller = false;
    this.pendingFiles = [];
    //this.To = null;                  //clear the to value ready for next call
    this.signalingState = '';
    this.connectionState = '';
    this.iceConnectionState = '';
    this.onCall = false;             // hide stats and stop button

    this.dataEstablished = false;                         // remove the file and canvas views
    this.task = '';
    this.streamEstablished = false;
    this.dataEstablished = false;
    this.hasAudio = false;
    this.hasVideo = false;
    this.showStartVideo = true;                         // apple start video button
  }
  // close socket.io subscriptions on leave to free up memory
  OnDestroy() {
    /*   if(this.peerConnection){
         this.chatIO.endCall(this.To);                       // send end call to peer
       }*/
    if (this.peerConnection) {
      this.online.unsubsribe();
      this.offer.unsubsribe();
      this.answered.unsubsribe();
      this.videoOffer.unsubscribe();
      this.answer.unsubsribe();
      this.candidate.unsubscribe();
      this.onStop.unsubscribe();
      this.ready.unsubscribe();
      this.sending.unsubscribe();
      this.drawSub.unsubscribe();
    }
  }
}
