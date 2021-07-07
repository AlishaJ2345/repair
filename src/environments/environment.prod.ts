/**
 *  SWAPS out environmnet depending on flags
 * production env>  ng build --prod -c prod        #for proction builds using environmnet.prod.ts
 * dev build env> ng build --prod                  #for dev builds using environmnet.dev.ts
 */


export const environment = {
  production: true,
  ENV:"(PROD)",

 

  // fix for exposing ports
  API_URL:"https://jbconnect.co/api",
  UPLOAD_URL:"https://jbconnect.co/",
  UPLOAD: "https://jbconnect.co",
  PUSH: "https://admin.jbconnect.co/push/subscription",
  CHAT: "https://jbconnect.co",
  STUN: "stun.l.google.com:19302"

  // DEVELOPMENT SETTINGS for local
  // UNCOMMENT FOR DEV

/*  API_URL:"https://localhost:3001/api",
  CHAT_URL:"https://localhost:3000/",
  UPLOAD_URL:"https://localhost:3003/",
  STUN:"localhost:3478",
  API: "localhost:3001",
  CHAT: "localhost:3000",
  UPLOAD: "https://localhost:3003"    */


};
