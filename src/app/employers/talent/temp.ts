/*
constructor(private _http: HttpClient, private local: LocalStorageService,
    private chatService: ChatService, private route: ActivatedRoute) {
    if (this.local.retreiveAll() != undefined) {
      this.key = this.local.retreiveAll();
      this.attending = this.local.retreiveAttending();
      this.eventName = this.attending.event.event_name;
      this.date = this.attending.event.start_date;
      this.location = this.attending.event.location;
      this.email = this.key.email;
      this.getEventDetails();
    }
    this.getposts();
  }

  <mat-form-field>
  <label>Select Event</label>
  <mat-select [(value)]="selectedEvent" (selectionChange)='changeEvent()'>
    <mat-option>{{ eventName }}</mat-option>
    <mat-option *ngFor="let post of allPosts" value="{{post.event_name}}">{{post.event_name}}</mat-option>
  </mat-select>
</mat-form-field>


changeEvent(){
    this.eventName = this.selectedEvent;
    this.getEventDetails();
  }

  getEventDetails() {
    console.log('eventname ' + this.eventName);
    this._http.post(`${environment.API_URL}/eventbyname`, { eventName: this.eventName })
      .subscribe(
        (result) => {
          if (result) {
            //console.log(Object.keys(result).map(k => result[k]));
            this.post = result['post'];
            this.eventName = this.post.event_name;
            this.date = this.post.start_date;
            this.location = this.post.location;
            this.scanByEmail();
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting post in events ${err}`);
          }
        }
      );
  }

  getposts() {
    this._http.get<Posts[]>(`${environment.API_URL}/posts`)
      .subscribe(
        (result) => {
          if (result) {
            this.allPosts = result['posts'];                 //all posts retreived
            //console.log(this.allPosts);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log(`error getting posts in landing ${err}`);
          }
        }
      );
  }
  */

