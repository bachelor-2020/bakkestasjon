#! /usr/bin/env python
# coding=utf-8
from __future__ import print_function

import rospy
import message_filters
import requests
import json

from sensor_msgs.msg import NavSatFix
from vision_msgs.msg import Detection2DArray


class Print_to_gcs:
    def __init__(self):
        rospy.init_node("print_to_gcs")

        sub_object_detection = message_filters.Subscriber(
            "/objects", Detection2DArray, queue_size=1
        )

        sub_gps = message_filters.Subscriber("/mavros/global_position/global", NavSatFix, queue_size=10) # Fra Ardupilot
        #sub_gps = message_filters.Subscriber(
        #    "/gps/fix", NavSatFix, queue_size=1
        #)  # FakeGPS

        msg_sync = message_filters.ApproximateTimeSynchronizer(
            [sub_object_detection, sub_gps], 10, 0.1
        )
        msg_sync.registerCallback(self.print_to_gcs)

        self.rate = rospy.Rate(2)

    def print_to_gcs(self, msg_obj, msg_gps):
        print("\nGPS data:")
        print("\tTidsstempel:")
        print("\t\tsekunder:", msg_gps.header.stamp.secs)
        print("\t\tnanosekunder:", msg_gps.header.stamp.nsecs)
        print(
            "\tbreddegrad:", msg_gps.latitude
        )  # Positivt tall er nord for ekvator, negativt er sør
        print(
            "\tlengdegrad:", msg_gps.longitude
        )  # Positivt tall er øst for Greenwich, negativt vest
        print(
            "\thøyde:".decode("utf-8"), msg_gps.altitude
        )  #  NaN hvis ingen høyde er tilgjengelig
        print("\tstatus gps:", msg_gps.status.status, end="")
        if msg_gps.status.status >= 0:
            print(" -- OK")
        else:
            print(" -- ikke fått gps fix".decode("utf-8"))

        if len(msg_obj.detections) > 0:
            print("\nAntall objekter funnet: ", len(msg_obj.detections))
            for i in range(len(msg_obj.detections)):
                print("\tObjekt: ", i, ": ")
                # for j in range(len(msg.detections[i].results)): # I test er len alltid 1
                print("\t\tid: ", msg_obj.detections[i].results[0].id)

                if msg_obj.detections[i].results[0].id == 1:
                    print("\t\t** Person funnet! **")
                    requests.post("http://app:5000/api/drones/0/findings",
                                  json={
                                      "finding": "person",
                                      "latitude": msg_gps.latitude,
                                      "longitude": msg_gps.longitude
                                  })

        else:
            print("\nIngen objekter funnet")


if __name__ == "__main__":
    try:
        p = Print_to_gcs()
        while not rospy.is_shutdown():
            p.rate.sleep()

    except rospy.ROSInterruptException:
        pass