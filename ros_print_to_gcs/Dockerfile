FROM ros:melodic-perception

WORKDIR /usr/src/app

RUN apt update && \
	apt install -y ros-melodic-vision-msgs python-pip

COPY . .

RUN pip install -r requirements.txt

#CMD [ "roslaunch", "print_to_gcs", "print_to_gcs.launch" ]
CMD [ "python", "-u", "print_to_gcs/src/print_to_gcs.py" ]
