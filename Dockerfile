FROM httpd:2.4
#COPY --from=node /app/dist/ /usr/local/apache2/htdocs
COPY ./dist/ /usr/local/apache2/htdocs/
COPY ./.htaccess /usr/local/apache2/htdocs/
COPY ./servername.conf /etc/apache2/conf-available/
COPY ./httpd.conf /usr/local/apache2/conf

#EXPOSE 80
#COPY ./src/assets/manifest.json /usr/local/apache2/htdocs