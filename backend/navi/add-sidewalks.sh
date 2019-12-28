for username in slon myval liska jelen panda opice;
do
  
  for photo in {30..35};
  do
     curl --header "Content-Type: application/json" --request PUT --data '{
          
           "naviterierId": 100'$photo',
           "imageName": "sidewalk'$photo'.jpg",  
           "mapped": false
}' http://localhost:8090/api/sidewalk/-1/$username
  done 	
done