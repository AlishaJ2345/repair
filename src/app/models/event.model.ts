export class Events {
    eid:number;
    eventname:string;
    eventlocation:string;
    eventhost:string;
    contact:string;
    picurl:string;
    dateofevent:string;
    isvisable:boolean;
};

export interface Posts {
  eid:number,
  type:string,
  event_name:string,
  company:string,
  duration:string,
  subject:string,
  start_date:string,
  event_time:string,
  picurl:string,
  location:string,
  contact_email:string,
  contact_name:string,
  content:string,
  pay_rate:string,
  skills:string,
  phone:string,
  address:string,
  likes:number,
  isvisable:boolean,
  speakers:string
}

export class Uniquenumber{
    uniquenumber:number;
};
export class LoginUser {
    token:string;
    uid:number;
    email:string;
    type:string;
    sid:number;
    company:string;
    verifyed:boolean;
    sign_up_date;
    iscurrent:boolean;
};
export interface User {
  token: string,
  uid: number,
  sid: string;
  name:string,
  email: string,
  type: string,
  exp: string,
  verifyed: boolean,
  pic_url:string
}
export interface Messages {
  user: string,
  msg: string,
  from: string
}

export interface sprofile{
  spid:string,
  uid:string,
  uni:string,
  qual:string,
  push_sub:boolean,
  major:string,
  year:string,
  location:string,
  sign_up:string,
  cv_url:string
  share:boolean
}

export interface promoted {
  uid:number,
  name:string,
  email:string,
  uni:string,
  qual:string,
  major:string,
  location:string,
  pic_url:string,
  cv_url:string
}

export interface eprofile{
  pid:string,
  uid:string,
  company:string,
  position:string,
  address:string,
  location:string,
  sign_up:string
}

export interface Skill {
  skill_id :number,
  uid :number,
  name :string,
  details :string,
  experience :string,
  stars :number
}
export interface UserSearch {
  name: string,
  email: string,
  phone: string,
  company: {
      name: string
  }
}

export interface maps {
  mid:number,
  eid:number,
  location:string,
  map_url:string,
  map_number:number
}

export interface candidate {
  eid:string,
  sid:string,
  company:string,
  scanner:string,
  email:string,
  name:string,
  picture:string,
  stars:string,
  notes:string,
  tag:string,
  major:string,
  degree:string,
  uni:string,
  year:string,
  location:string,
  interviewed:boolean,
  position:string,
  start_date:string,
  finish_date:string,
  saved:string
}

export interface Scans {
  event_name: string,
  sid: number,
  name: string,
  stars: number,
  notes: string,
  tag: string,
  picture: string,
  share:  boolean

}

export class LoginModel {
  email:string;
  password:String;
}

export class RegisterModel {
  name:string;
  email:string;
  password:string;
}

export class ChangePasswordModel {
  cPassword:string;
  c2Password:string;
}

export class ResetPasswordModel {
  email:string;
}

export class Friend {
  id:number;
  uid:number;
  friend:string;
  sign_up_date:string;
}

export class Speakers {
  speaker_id:number;
  eid:number;
  name:string;
  company:string;
  job_title:string;
  profile:string;
  link:string;
  logo_url:string;
  building:string;
  level:string;
  room:string;
  start_time:string;
}

export class Label {
  event_name:string;
  name:string;
  field1:string;
  field2:string;
  lableType:string;
}

export interface Company {
  cid:number;
  org_name:string;
  contact_name:string;
  position_title:string;
  contact_work_number:string;
  mobile_number:string;
  contact_email:string;
  org_facebook:string;
  org_linkedin:string;
  org_twitter:string;
  org_instagram:string;
  media_manager:string;
  graduate_url:string;
  recruit_url:string;
  logo_url:string;
  jobs_url:string;
  description:string;
  booth_number:string;
  building_level:string;
}

export interface Staff {
  hrid:number;
  cid:number;
  name:string;
  position:string;
  contact_email:string;
  location:string;
  profile_source:string;
  profile_url:string;

}

export interface event_company {
  ecid:number;
  eid:string; 
  cid:string;
  company_name:string;
}

export interface device {

  browser:string;
  os:string;
  device:string;
  userAgent:string;
  os_version:string;
}

export interface servey {
  eid:string;
  event_stars:number;
  event_notes: string;
  app_stars: number;
  app_notes: string;
}