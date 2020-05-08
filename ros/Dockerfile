FROM ros:melodic-perception

WORKDIR /usr/src/app

RUN apt update && \
	apt install -y ros-melodic-vision-msgs python-pip ros-melodic-mavros-msgs python-pip

ENV ROS_MASTER_URI http://192.168.5.1:11311

COPY . .

RUN pip install -r requirements.txt
