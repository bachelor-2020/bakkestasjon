#!/usr/bin/env python

# Fake GPS

import rospy

from sensor_msgs.msg import NavSatFix, NavSatStatus
from std_msgs.msg import Header


class GpsNode:
    def __init__(self):
        rospy.init_node("gps_node")
        self.publisher = rospy.Publisher("gps/fix", NavSatFix, queue_size=10)
        self.timer = rospy.Timer(rospy.Duration(0.005), self.timer_callback)

        self.rate = rospy.Rate(200)

    def timer_callback(self, event):
        msg = NavSatFix()
        msg.header = Header()
        msg.header.stamp = rospy.Time.now()
        msg.header.frame_id = "gps"

        msg.status.status = NavSatStatus.STATUS_FIX
        msg.status.service = NavSatStatus.SERVICE_GPS

        # Position in degrees.
        msg.latitude = 59.172728
        msg.longitude = 10.29502696

        # Altitude in metres.
        msg.altitude = 3.25

        msg.position_covariance[0] = 0
        msg.position_covariance[4] = 0
        msg.position_covariance[8] = 0
        msg.position_covariance_type = NavSatFix.COVARIANCE_TYPE_DIAGONAL_KNOWN

        self.publisher.publish(msg)
        self.best_pos_a = None


if __name__ == "__main__":
    try:
        gps_node = GpsNode()
        while not rospy.is_shutdown():
            gps_node.rate.sleep()

    except rospy.ROSInterruptException:
        pass
