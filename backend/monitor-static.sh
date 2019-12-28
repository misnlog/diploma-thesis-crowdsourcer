status=$(curl --silent --fail localhost:8080/actuator/health)
if [ -z "$status" ]
then
	echo "server is DOWN"
	echo $status | mail -s "[STATIC-DOWN] Server 147.32.81.90:8080/actuator/health is DOWN" respectx@gmail.com

else
	echo "server is UP"
	echo $status | mail -s "[STATIC-UP] Server 147.32.81.90:8080/actuator/health is up" respectx@gmail.com
fi
