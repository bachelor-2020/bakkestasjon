FROM ros:melodic-ros-core

WORKDIR /usr/src/app
RUN apt update && apt install -y ros-melodic-mavros-msgs python-pip

COPY . .
RUN pip install -r requirements.txt

CMD [ "python", "-u", "push_mission/src/call_mavros_mission_push.py" ]
