#! /usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import print_function

import rospy
import requests
from sensor_msgs.msg import NavSatFix


class Print_gps:
    def __init__(self):
        rospy.init_node("print_gps")

        sub_gps = rospy.Subscriber(
            "mavros/global_position/global", NavSatFix, self.print_gps, queue_size=1
        )  # Fra Ardupilot

        # sub_gps = rospy.Subscriber(
        #     "gps/fix", NavSatFix, self.print_gps, queue_size=1
        # )  # FakeGPS

        self.rate = rospy.Rate(2)

    def print_gps(self, msg_gps):
        if msg_gps.status.status >= 0:
            requests.post("http://app:5000/api/drones/0/position", json={"latitude": msg_gps.latitude, "longitude": msg_gps.longitude, "altitude": msg_gps.altitude})


if __name__ == "__main__":
    try:
        p = Print_gps()
        while not rospy.is_shutdown():
            p.rate.sleep()

    except rospy.ROSInterruptException:
        pass
