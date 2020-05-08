FROM ros:melodic-perception

WORKDIR /usr/src/app

RUN apt update && \
	apt install -y ros-melodic-vision-msgs python-pip

COPY . .

RUN pip install -r requirements.txt

CMD [ "python", "-u", "print_to_gcs.py" ]
