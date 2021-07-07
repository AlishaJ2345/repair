run a local server to test pwa from inside the dist folder

http-server -o

# get the values from a HTTP call
console.log(Object.keys(result).map(k => result[k]));

# build cmds for angular

#add to json file under Scripts
    "ng-high-memory": "node --max_old_space_size=8000 ./node_modules/@angular/cli/bin/ng build --prod",
# to get project to compile after
sudo npm run ng-build-prod
npm run ng-serve-prod

# tail the logs to screen
docker-compose logs -f -t

run the careers connect as a build
sudo docker build -t devopswjm2202/ict:latest .

# run the container
docker run devopswjm2202/ict:latest

# then commit the container
docker commit b3f35f5d4db5 devopswjm2202/ict:latest

# push container to registry
docker push devopswjm2202/ict:latest

# AUT host server r510
ssh glen@156.62.140.101

# install coturn
sudo apt-get install coturn
# run the coturn
sudo turnserver -a -o -v -n  --no-dtls --no-tls -u JBCWEBRTC:JBC404 -r "someRealm"

    -a - Use long-term credentials mechanism
    -o - Run server process as daemon
    -v - 'Moderate' verbose mode.
    -n - no configuration file
    --no-dtls - Do not start DTLS listeners
    --no-tls - Do not start TLS listeners
    -u - user credentials to be used
    -r - default realm to be used, need for TURN REST API

var peerConnectionConfig = {
  iceServers: [{
    urls: 156.62.140.101:3478,
    username: 'JBCWEBRTC',
    password: 'JBC404'
  }]
}

# docker new container rolling update
docker-compose pull --parallel
docker-compose up --force-recreate --no-deps <specific-service-name1>


- /docker-volumes/etc/letsencrypt/live/jbconnect.co/fullchain.pem:/etc/letsencrypt/live/jbconnect.co/fullchain.pem
- /docker-volumes/etc/letsencrypt/live/jbconnect.co/privkey.pem:/etc/letsencrypt/live/jbconnect.co/privkey.pem
# where the certs are now
/docker-volumes/etc/letsencrypt/live/jbconnect.co
/docker-volumes/etc/letsencrypt/live/jbconnect.co

# where nginx gets them from
docker-volumes/etc/letsencrypt/live/jbconnect.co

# where i need to put them
/docker-volumes/etc/letsencrypt/keys
/docker-volumes/etc/letsencrypt/keys

0 23 * * * docker run --rm -it --name certbot -v "docker-volumes/etc/letsencrypt/live/jbconnect.co:/etc/letsencrypt" -v "/docker-volumes/var/lib/letsencrypt:/var/lib/letsencrypt" -v "/docker-volumes/data/letsencrypt:/data/letsencrypt" -v "/docker-volumes/var/log/letsencrypt:/var/log/letsencrypt" certbot/certbot renew --webroot -w /data/letsencrypt --quiet && docker kill --signal=HUP production-nginx-container

####    Instructions     ####
https://www.humankode.com/ssl/how-to-set-up-free-ssl-certificates-from-lets-encrypt-using-docker-and-nginx

# production

sudo docker run -it --rm \
-v /docker-volumes/etc/letsencrypt:/etc/letsencrypt \
-v /docker-volumes/var/lib/letsencrypt:/var/lib/letsencrypt \
-v /docker/letsencrypt-docker-nginx/src/letsencrypt/letsencrypt-site:/data/letsencrypt \
-v "/docker-volumes/var/log/letsencrypt:/var/log/letsencrypt" \
certbot/certbot \
certonly --webroot \
--email gd.osborne@outlook.com --agree-tos --no-eff-email \
--webroot-path=/data/letsencrypt \
-d jbconnect.co -d www.jbconnect.co

# staging will test to see if working

sudo docker run -it --rm \
-v /docker-volumes/etc/letsencrypt:/etc/letsencrypt \
-v /docker-volumes/var/lib/letsencrypt:/var/lib/letsencrypt \
-v /docker/letsencrypt-docker-nginx/src/letsencrypt/letsencrypt-site:/data/letsencrypt \
-v "/docker-volumes/var/log/letsencrypt:/var/log/letsencrypt" \
certbot/certbot \
certonly --webroot \
--register-unsafely-without-email --agree-tos \
--webroot-path=/data/letsencrypt \
--staging \
-d jbconnect.co -d www.jbconnect.co

/usr/local/bin/docker-compose

sudo curl -L https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# block this address
47.254.147.224

/usr/share/nginx/html

# server address
159.89.7.87/.well-known/acme-challenge/
http://www.jbconnect.co/.well-known/acme-challenge/