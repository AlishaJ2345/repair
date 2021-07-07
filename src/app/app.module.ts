import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
// services 
import { NameService } from './services/name.service';
import { ChatService } from './services/chat.service';
import { ToastService } from './services/toast.service';
import { JwtModule } from '@auth0/angular-jwt';
import { LocalStorageService } from './services/localStorage.service';
import { ResponsiveService } from './services/responsive.service'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import {LocationStrategy, Location, PathLocationStrategy, HashLocationStrategy} from '@angular/common';
//import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
//import { NgxImgZoomModule } from 'ngx-img-zoom';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
// dev imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { LayoutModule } from '@angular/cdk/layout';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ParallaxDirective } from './parallax.directive';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DeviceDetectorModule } from 'ngx-device-detector';
// material design imports
import { MaterialModule } from './material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
//import { AmazingTimePickerModule } from 'amazing-time-picker';
import { WindowRef } from './services/window-ref.service';
//import { ScrollDispatchModule } from '@angular/cdk/scrolling';
// routing imports
import { AppRoutingModule } from './app.routing.module'
// dev components
import { EventComponent } from './event/event.component';
import { JwtInterceptor } from './services/jwt.interceptor';
import { ErrorInterceptor } from './services/error.interceptor';
import { AuthGuard } from './gaurds/auth.gaurds';
import { UsersapiService } from './services/api.services';
import { AuthService } from './services/auth.service';
import { MapsComponent } from './maps/maps.component';
import { ScanComponent } from './scan/scan.component';
//import { LandingComponent } from './landing/landing.component';
import { EventUserComponent } from './event-user/event-user.component';
import { TruncatePipe } from './pipes/TrucateText.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';
import { AttendingEventComponent } from './attending-event/attending-event.component';
import { ZoomMapComponent } from './zoom-map/zoom-map.component';
import { MakeLableComponent } from './make-lable/make-lable.component';
import { HealthSafteyComponent } from './health-saftey/health-saftey.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { SpeakersComponent } from './speakers/speakers.component';
import { JobsComponent } from './jobs/jobs.component';
import { MenuComponent } from './menu/menu.component';
import { EULAComponent } from './eula/eula.component';
import { ConfirmPrintComponent } from './confirm-print/confirm-print.component';
import { CameraErrorComponent } from './camera-error/camera-error.component';
import { FooterComponent } from './footer/footer.component';
import { BrowserComponent } from './browser/browser.component';
import { QrLoginComponent } from './qr-login/qr-login.component';
import { ServeyComponent } from './servey/servey.component';
import { ShareComponent } from './share/share.component';
import { FriendsComponent } from './friends/friends.component';
import { LoginComponent } from './login/login.component';
import { PasswordResetComponent } from './password-reset/password-reset.component'
import { ProfileComponent } from './profile/profile.component';
import { CreateProfileComponent } from './create-profile/create-profile.component'
import { PhotoUploadsComponent } from './photo-uploads/photo-uploads.component'
import { Profile2Component } from './profileupdate/profile.component';
import { SelfieComponent } from './selfie/selfie.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ScanNotesComponent } from './scan-notes/scan-notes.component';
import { RegisterAccountComponent } from './register-account/register-account.component'
import { PwaService } from './services/pwa.service';
import { ConfirmComponent } from './confirm/confirm.component';
import { SkillsComponent } from './skills/skills.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AgGridModule } from 'ag-grid-angular';



//JWT token factory
export function JwtModuleConfigFactory() {
  //const key = JSON.parse(localStorage.getItem('key'));
  ///const token = key.token;
  //console.log(token);
  //return token;
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    EventComponent,
    MapsComponent,
    ScanComponent,
    EventUserComponent,
    TruncatePipe,
    DateFormatPipe,
    ParallaxDirective,
    AttendingEventComponent,
    ZoomMapComponent,
    MakeLableComponent,
    HealthSafteyComponent,
    HomeComponent,
    HeaderComponent,
    ToolBarComponent,
    SpeakersComponent,
    JobsComponent,
    MenuComponent,
    EULAComponent,
    ConfirmPrintComponent,
    CameraErrorComponent,
    FooterComponent,
    BrowserComponent,
    QrLoginComponent,
    ServeyComponent,
    ShareComponent,
    FriendsComponent,
    LoginComponent,
    PasswordResetComponent,
    ProfileComponent,
    CreateProfileComponent,
    PhotoUploadsComponent,
    Profile2Component,
    SelfieComponent,
    ChangePasswordComponent,
    ScanNotesComponent,
    RegisterAccountComponent,
    ConfirmComponent,
    SkillsComponent

  ],
  imports: [
    BrowserModule,
    AgGridModule.withComponents([]),
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    DragDropModule,
    NgxQRCodeModule,
    //AmazingTimePickerModule,
    //NgxImgZoomModule,
    NgbDatepickerModule,
   // ScrollDispatchModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    //LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    ImageCropperModule,
    MatSnackBarModule,
    NgbModule.forRoot(),
    HttpClientModule,
    ZXingScannerModule,
    DeviceDetectorModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: JwtModuleConfigFactory,
        authScheme: 'JWT ',
        skipWhenExpired: true,
        whitelistedDomains: [`${environment}`, `${environment.CHAT}`, `${environment.UPLOAD}`]
      }
    })
  ],
  exports: [

  ],
  providers: [
    NameService,
    ChatService,
    ToastService,
    LocalStorageService,
    ResponsiveService,
    AuthGuard,
    AuthService,
    WindowRef,
    UsersapiService,
    Location, {provide: LocationStrategy, useClass: HashLocationStrategy},
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  entryComponents:[
    HealthSafteyComponent,
    EULAComponent,
    ConfirmPrintComponent,
    CameraErrorComponent,
    BrowserComponent,
    ServeyComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  /* constructor(private snack:ToastService){
     this.snack.tempSnackBar('welcome to Metible');
   } */
  constructor(private pwa:PwaService, private update: SwUpdate, private snackbar: MatSnackBar) {
    //           private update: SwUpdate, private snackbar: MatSnackBar
    update.available.subscribe(update => {
      const snack = this.snackbar.open('Update Available', 'Reload');
      snack.onAction()
        .subscribe(() => {
          this.update.activateUpdate()
            .then(() => { 
              window.location.reload();
            });
        });
    }); 
    //this.snackbar.tempSnackBar('welcome to JBConnect.co'); 
  }
}
