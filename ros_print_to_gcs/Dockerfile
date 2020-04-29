FROM ros:melodic-perception

WORKDIR /usr/src/app

RUN apt update
RUN apt install ros-melodic-vision-msgs
COPY . .

#CMD [ "roslaunch", "print_to_gcs", "print_to_gcs.launch" ]
CMD [ "print_to_gcs/src/print_to_gcs.py" ]
