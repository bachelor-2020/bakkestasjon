FROM ros:melodic-perception

WORKDIR /usr/src/app

RUN apt update && \
	apt install -y ros-melodic-vision-msgs python-pip ros-melodic-mavros-msgs python-pip

COPY . .

RUN pip install -r requirements.txt
