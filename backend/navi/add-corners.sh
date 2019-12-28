for username in slon myval liska jelen panda opice;
do
  
  for photo in {15..27};
  do
     curl --header "Content-Type: application/json" --request PUT --data '{
              "businessKey": 100'$photo',
              "imageName": "corner'$photo'.jpg",
              "mapped": false
          }' http://localhost:8090/api/corner/-1/$username
  done 	
done