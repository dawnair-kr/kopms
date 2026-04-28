#!/usr/bin/sh

LANG=ko_KR; export LANG
#. /produ/.profile

echo ""
echo ""
echo "BREN kopms API Shutdown Process ... "

out=`curl -s -o /dev/null -I -w "%{http_code}" http://192.168.0.23:9040/actuator`
if [[ $out -eq 200 ]];then
	echo ""
	echo ""
	out=`curl -X POST http://192.168.0.23:9040/actuator/shutdown`
	echo ""
	echo $out
	echo ""
	echo " BREN kopms API Server Shutdown...Bye"
	echo ""
	echo ""
else 
	echo ""
	echo "BREN kopms API Server Not Running...."
	echo ""
	exit
fi





