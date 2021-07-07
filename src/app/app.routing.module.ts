import {NgModule}  from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventComponent } from './event/event.component';
import { AuthGuard } from './gaurds/auth.gaurds';
import { ScanComponent } from './scan/scan.component';
import { MapsComponent } from './maps/maps.component';
import { AttendingEventComponent } from './attending-event/attending-event.component';
import { ZoomMapComponent } from './zoom-map/zoom-map.component';
import { MakeLableComponent } from './make-lable/make-lable.component';
import { HomeComponent } from './home/home.component';
import { SpeakersComponent } from './speakers/speakers.component';
import { JobsComponent } from './jobs/jobs.component';
import { QrLoginComponent } from './qr-login/qr-login.component';
import { FriendsComponent } from './friends/friends.component';
import { ShareComponent } from './share/share.component';
import { LoginComponent } from './login/login.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ProfileComponent } from './profile/profile.component';
import { CreateProfileComponent } from './create-profile/create-profile.component';
import { Profile2Component } from './profileupdate/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ScanNotesComponent } from './scan-notes/scan-notes.component';
import { RegisterAccountComponent } from './register-account/register-account.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { WebrtcComponent } from './comunictions/webrtc/webrtc.component';
import { SkillsComponent } from './skills/skills.component';


const appRoutes: Routes = [
  // Public routes
  {path: 'login', component: LoginComponent },
  {path: 'register', component: RegisterAccountComponent },
  {path: 'home', component: HomeComponent },
  {path: 'maps', component: MapsComponent},
  {path: 'speakers', component: SpeakersComponent},
  {path: 'jobs', component: JobsComponent},
  {path: 'events', component: EventComponent },
  {path: 'signin', component: QrLoginComponent},
  {path: 'event', component: AttendingEventComponent },
  {path: 'print', component: MakeLableComponent },

  //  Module routing private
  {path: 'chat', loadChildren: './comunictions/comunictions.module#ComunictionsModule',canActivate: [AuthGuard] },
  {path: 'employer', loadChildren: './employers/employers.module#EmployersModule',canActivate: [AuthGuard] },

  // private routes
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {path: 'createprofile', component: CreateProfileComponent, canActivate: [AuthGuard]  },
  {path: 'skill', component: SkillsComponent, canActivate: [AuthGuard] },
  {path: 'updateprofile', component: Profile2Component, canActivate: [AuthGuard] },
  {path: 'scan', component: ScanComponent , canActivate: [AuthGuard]},
  {path: 'notes/:data', component: ScanNotesComponent, canActivate: [AuthGuard]},
  {path: 'notes', component: ScanNotesComponent, canActivate: [AuthGuard]},
  {path: 'share', component: ShareComponent , canActivate: [AuthGuard]},
  {path: 'friends', component: FriendsComponent , canActivate: [AuthGuard]},
  {path: 'changepassword', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  // email routes
  { path: 'confirm/:jwt', component: ConfirmComponent },
  { path: 'passwordreset/:jwt', component: PasswordResetComponent },
  // last route
  {path: '', redirectTo: '/home', pathMatch: 'full' }
  
  ];

@NgModule({

  imports: [
    RouterModule.forRoot(appRoutes, { useHash: true, scrollPositionRestoration: 'enabled' })
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }