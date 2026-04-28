#!/usr/bin/sh

LANG=ko_KR; export LANG
#. /produ/.profile

echo ""
echo ""
echo "BREN kopms API Start Process ... "

out=`curl -s -o /dev/null -I -w "%{http_code}" http://192.168.0.23:9040/actuator`
if [[ $out -eq 200 ]];then
	echo ""
	echo "BREN kopms API Server Aleady Running...."
	echo ""
	exit
fi

nohup java -jar -Dspring.profiles.active=test -Dfile.encoding=UTF-8 -XX:MaxMetaspaceSize=4096m -XX:MetaspaceSize=2048m -XX:+DisableExplicitGC ./bin/kopms-api-0.0.1-SNAPSHOT.jar > /dev/null 2>&1 &

echo ""
for var in 10 9 8 7 6 5 4 3 2 1 0
do
	sleep 1
	echo BREN kopms API Server Start After $var Seconds......
done

sleep 1
retry=0
while true
do
	if [[ $retry -eq 1 ]];then
		echo "Check your server env or process use ps -ef"
		echo ""
		echo ""
		exit
	fi
    
	out=`curl -s -o /dev/null -I -w "%{http_code}" http://192.168.0.23:9040/actuator`

	if [[ $out -eq 200 ]];then
		echo ""
		out=`curl http://192.168.0.23:9040/actuator`
		echo $out
		echo ""
		echo "BREN kopms API Server Started......"
		echo ""
		echo ""
   		exit
	fi
	echo ""
	echo "BREN kopms API Server Not Started. Please Wait More......"
	echo ""
	retry=$((retry+1))
	echo Retry $retry times.....
	sleep 2
done

