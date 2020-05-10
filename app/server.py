from flask import Flask, render_template, jsonify, request
import pymongo
from math import sqrt

myclient = pymongo.MongoClient("mongodb://mongo:27017/")
mydb = myclient["groundstation"]
drones = mydb["drone"]
drones.drop()

drones.insert_many(
[{
    "_id": 0,
    "name": "Drone 0",
    "position": {
        "latitude": 59.3687,
        "longitude": 10.442,
        "altitude": 0
    },
    "trail": [],
    "area_id": ""
},
{
    "_id": 1,
    "name": "Drone 1",
    "position": {
        "latitude": 59.3687,
        "longitude": 10.442,
        "altitude": 0
    },
    "trail": [],
    "area_id": ""
},
{
    "_id": 2,
    "name": "Drone 2",
    "position": {
        "latitude": 59.3687,
        "longitude": 10.442,
        "altitude": 0
    },
    "trail": [],
    "area_id": ""
},
{
    "_id": 3,
    "name": "Drone 3",
    "position": {
        "latitude": 59.3687,
        "longitude": 10.442,
        "altitude": 0
    },
    "trail": [],
    "area_id": ""
},
{
    "_id": 4,
    "name": "Drone 4",
    "position": {
        "latitude": 59.3687,
        "longitude": 10.442,
        "altitude": 0
    },
    "trail": [],
    "area_id": ""
}])


clients = mydb["clients"]
clients.drop()

client_1 = {
    "_id": 0,
    "name": "Bakkestasjon",
    "position": {
        "latitude": 59.3687,
        "longitude": 10.442
    }
}

clients.insert_one(client_1)

findings = mydb["findings"]
findings.drop()

mission = mydb["mission"]

areas = mydb["areas"]


app = Flask(__name__, static_url_path='')

@app.route("/")
def index():
    return app.send_static_file("index.html")



# Hent posisjon for drone
@app.route("/api/drones/<drone_id>/position")
def get_drone_pos(drone_id):
    return jsonify(
        drone_id = drone_id,
        position = drones.find_one({"_id":int(drone_id)})["position"],
    )


# Hent mission for drone
@app.route("/api/drones/<drone_id>/area")
def get_drone_mission(drone_id):
    try:
        area_id = drones.find_one({"_id":int(drone_id)})["area_id"]
        current_mission = areas.find_one({"_id": area_id})
        done = current_mission["done"]
    except:
        area_id = ""
        done = ""

    # Hent lagret mission
    if area_id != "" and not done:
        return jsonify({
            "_id":area_id,
            "points": current_mission["points"],
            "taken": 1,
            "done": 0,
            "waypoints": current_mission["waypoints"]
        })


    # Eller start på en ny mission
    else:
        try:
            pos = drones.find_one({"_id":int(drone_id)})["position"]
            new_mission = get_closest_area(pos)
            areas.update_one(
                {"_id": new_mission["_id"]},
                {"$set": {"taken": 1}}
            )
            drones.update_one(
                {"_id": int(drone_id)},
                {"$set": {"area_id": new_mission["_id"]}}
            )
            return jsonify(new_mission)
        except:
            return jsonify({
                "points": [],
                "waypoints": [],
                "taken": 0,
                "done": 0
            })


def distance(pos1,pos2):
    return sqrt((pos1["latitude"]-pos2[0])**2 + (pos1["longitude"]-pos2[1])**2)


def get_closest_area(pos):
    unsearched_areas = areas.find({"taken":0,"done":0})
    try:
        closest = unsearched_areas[0]
    except:
        return None
    shortest = distance(pos,unsearched_areas[0]["waypoints"][0])
    for a in unsearched_areas:
        dist = distance(pos,a["waypoints"][0])
        if dist < shortest:
            shortest = dist
            closest = a
    return closest


# Hent droneinfo
@app.route("/api/drones/<drone_id>")
def get_drone(drone_id):
    return jsonify(
        drones.find_one({"_id":int(drone_id)}),
    )


# Post droneposisjon
@app.route("/api/drones/<drone_id>/position", methods=["POST"])
def post_drone_pos(drone_id):
    position = request.json
    drones.update_one(
        {"_id": int(drone_id)},
        {"$set": {"position": position} }
    )
    drones.update_one(
        {"_id": int(drone_id)},
        {"$push": {"trail": {"position": position} }}
    )
    return request.json



# Hent info om alle droner
@app.route("/api/drones")
def get_drones():
    return jsonify(
        list(drones.find())
    )


# Hent liste over alle droner (kun id)
@app.route("/api/drones/list")
def get_drone_list():
    return jsonify(
        list(drones.find({},{"_id":1}))
    )


# Hent alle droners posisjon
@app.route("/api/drones/position")
def get_drone_positions():
    return jsonify(
        list(drones.find({},{"position":1}))
    )


# Hent områder
@app.route("/api/areas")
def get_areas():
    return jsonify(
        list(areas.find({},{"_id":False}))
    )



# Hent nåværende mission
@app.route("/api/mission")
def get_mission():
    try:
        return jsonify({
            "points": mission.find_one({"_id":0})["points"],
            "areas": list(areas.find({},{"_id":False}))
        })
    except:
        return jsonify({"points":[]})


# Last opp ny mission
@app.route("/api/mission", methods=["POST"])
def post_mission():
    mission.drop() # Dropp forrige mission
    areas.drop()

    drones.update_many({}, {"$set": {"area_id": "", "trail": []}})
    mission.insert_one({
        "_id": 0,
        "points": request.json["points"]
    })
    areas.insert_many(request.json["areas"])
    return request.json



@app.route("/api/areas/<area_id>/reached", methods=["POST"])
def post_reached_waypoint(area_id):
    areas.update_one({"_id":int(area_id)},{
        "$push": {"wp_reached": request.json["index"]}
    })
    this_area = areas.find_one({"_id":int(area_id)})
    if request.json["index"] >= len(this_area["waypoints"]):
        areas.update_one({"_id":int(area_id)},{
            "$set": {"done": 1}
        })
    return request.json



@app.route("/api/clients/<client_id>/position")
def get_client_pos(client_id):
    return jsonify(
        client_id = client_id,
        position = clients.find_one({"_id":int(client_id)})["position"]
    )



@app.route("/api/clients/<client_id>/position", methods=["POST"])
def post_client_pos(client_id):
    clients.update_one({"_id":int(client_id)}, {
        "$set": {"position": request.json["position"]}
    })
    return request.json



# Hent hele sporet etter drone. (full posisjonshistorikk)
@app.route("/api/drones/<drone_id>/trail")
def get_full_trail(drone_id):
    return jsonify(
        trail = drones.find_one({"_id":int(drone_id)})["trail"]
    )



# Hent enden av sporet etter drone. (delvis posisjonshistorikk fra index)
@app.route("/api/drones/<drone_id>/trail/<index>")
def get_partial_trail(drone_id, index):
    return jsonify(
        list(drones.aggregate([
            {"$match": {"_id": int(drone_id)} },
            {"$project": {"trail": { "$slice": ["$trail", int(index), 1000] }, "_id":0}}
        ])
    )[0])



# Post funn
@app.route("/api/findings", methods=["POST"])
def post_finding():
    findings.insert_one(request_json)
    return request.json



# Hent alle funn
@app.route("/api/findings")
def get_full_findings():
    return jsonify(
        findings = list(findings.find({}))
    )


app.run(host="0.0.0.0")
