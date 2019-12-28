HTTP backend:
```
/home/riganmic/navi
$ nohup java -jar navi.jar --spring.profiles.active=prod &
http://147.32.81.90:8090/actuator/health
```
HTTPS backend:
```
/home/riganmic/navi
 $ cp navi.jar navi-https.jar
 $ nohup java -jar navi-https.jar --spring.profiles.active=https &
 https://147.32.81.90:8444/actuator/health
 ```
 
 HTTP static server:
 ```
 /home/riganmic/navi
 $ nohup java -jar static-server.jar --spring.profiles.active=default  &
 http://147.32.81.90:8080/actuator/health
 ```
 
HTTPS static server:
```
/home/riganmic/navi/assets
 pm2 start http-serve --name static-file-server -- -p 8443 --ssl --cert /home/riganmic/navi/assets/cert.pem
https://147.32.81.90:8443/
```

HTTPS web crowdsourcer:
```
/home/riganmic/navi/web/crowdsourcer_app_map/www
pm2 start http-serve --name crowdsourcer-web-https -- -p 8095 --ssl --cert /home/riganmic/navi/web/crowdsourcer/web-https/cert.pem
https://147.32.81.90:8095/
```

List of services:
```
pm2 list
```

Swagger UI available 

@ http://localhost:8090/swagger-ui.html

@ http://147.32.81.90:8090/swagger-ui.html

psql10:

username: riganmic

password: ****

db: navi

host:147.32.81.90

port: 5432


prod startup script:
```
nohup java -jar navi.jar --spring.profiles.active=prod &
nohup java -jar static-server.jar --spring.profiles.active=default  &
```


**HEALTH:**

Static resource server:

http://147.32.81.90:8080/actuator/health

Navi backend:

http://147.32.81.90:8090/actuator/health


Adding new corner:

```
PUT 147.32.81.90:8090/api/corner/-1/P1

  {
            "businessKey": 99,
            "imageName": "corner99.jpg",
            "mapped": false
        }
 ```
 
 Adding new crosswalk:
 ```
 PUT  147.32.81.90:8090/api/crosswalk/-1/P1
 {
            "naviterierId": 99,
            "crossWalkType": null,
            "imageName": "crosswalk99.jpg",
            "startPlatform": {
                "mapped": false
            },
            "endPlatform": {
                "mapped": false
            },
            "zebra": {
                "mapped": false
            },
            "mapped": false
        }
 ```
 
 Adding a new sidewalk:
 
 ```
PUT 147.32.81.90:8090/api/sidewalk/-1/P1
{
           
            "naviterierId": 99,
            "imageName": "sidewalk99.jpg",  
            "mapped": false
}
 ```
 
 Adding a new audit log:
 ```
 PUT 147.32.81.90:8090/api/audit/add

 {
 "username": "P1",
 "auditString": "This is the site I have visited"
 }
 ```

Cronjob:

```
sudo crontab -l
*/5 * * * * sh /home/riganmic/navi/monitor.sh
*/5 * * * * sh /home/riganmic/navi/monitor-static.sh
```
