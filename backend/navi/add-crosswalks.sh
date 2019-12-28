for username in slon myval liska jelen panda opice;
do
  
  for photo in {41..50};
  do
     curl --header "Content-Type: application/json" --request PUT --data '{
           "naviterierId": 100'$photo',
           "crossWalkType": null,
           "imageName": "crosswalk'$photo'.jpg",
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
       }' http://localhost:8090/api/crosswalk/-1/$username
  done 	
done