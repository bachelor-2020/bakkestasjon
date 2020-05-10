#! /usr/bin/env python
from __future__ import print_function
import rospy
from mavros_msgs.srv import WaypointPush
from mavros_msgs.msg import Waypoint
import requests
import json
import time


def mission_push_client(start_index, waypoints):
    rospy.wait_for_service("mavros/mission/push")

    try:
        mission_service = rospy.ServiceProxy("mavros/mission/push", WaypointPush)
        mission_response = mission_service(start_index, waypoints)
        return mission_response.success, mission_response.wp_transfered

    except rospy.ServiceException as e:
        print("Service call failed: ", e)
        pass

def push_mission(mission):
    takeoff = Waypoint(
        frame=3, command=22, is_current=True, autocontinue=True, z_alt=10
    )  # Takeoff, 10 meters, make current wp

    waypoints = [takeoff]

    for wp in mission:
        waypoints.append(
            Waypoint(
                frame=3,
                command=16,
                is_current=False,
                autocontinue=True,
                x_lat=wp["latitude"],
                y_long=wp["longitude"],
                z_alt=0
        ))

    return_to_launch = Waypoint(
        frame=3, command=20, is_current=False, autocontinue=True
    )  # Return to launch point

    land = Waypoint(
        frame=3,
        command=21,
        is_current=False,
        autocontinue=True,
        x_lat=mission[0]["latitude"],
        y_long=mission[0]["longitude"],
        z_alt=0,
    )  # Land at same coordinates as wp_1

    waypoints.append(return_to_launch)
    waypoints.append(land)

    mission_service_object = mission_push_client(
        0, waypoints
    )  # Full waypoint update with waypoints in mission_wp
    print("Sent mission to vehicle: ", mission_service_object)

if __name__ == "__main__":

    rospy.init_node('push_mission', anonymous=True)

    mission = json.loads(requests.get("http://app:5000/api/drones/0/area").text)["waypoints"]
    while 1:
        last_mission = mission
        mission = json.loads(requests.get("http://app:5000/api/drones/0/area").text)["waypoints"]

        if len(mission)>0 and mission!=last_mission:
            print("pushing new mission")
            push_mission(mission)
        time.sleep(1)
