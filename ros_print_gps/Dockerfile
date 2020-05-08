FROM ros:melodic-perception

WORKDIR /usr/src/app

RUN apt update && \
	apt install -y ros-melodic-vision-msgs python-pip

COPY . .

RUN pip install -r requirements.txt
RUN echo 192.168.5.1 navio >> /etc/hosts

CMD [ "python", "-u", "print_gps/src/print_gps.py" ]
