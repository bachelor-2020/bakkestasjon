from flask import Flask, render_template, jsonify, request
import pymongo

myclient = pymongo.MongoClient("mongodb://mongo:27017/")
mydb = myclient["groundstation"]
drones = mydb["drone"]
drones.drop()

drone_1 = {
    "_id": 0,
    "name": "Drone 1",
    "position": {
        "latitude": 10,
        "longitude": 50,
        "altitude": 0
    },
    "mission": []
}

drones.insert_one(drone_1)

app = Flask(__name__, static_url_path='')

@app.route("/")
def index():
    return app.send_static_file("index.html")


# Hent nåværende mission for drone
@app.route("/api/drones/<drone_id>/mission")
def get_drone_mission(drone_id):
    return jsonify(
        drone_id = int(drone_id),
        mission = drones.find_one({"_id":int(drone_id)})["mission"],
    )

# Hent posisjon for drone
@app.route("/api/drones/<drone_id>/position")
def get_drone_pos(drone_id):
    return jsonify(
        drone_id = drone_id,
        position = drones.find_one({"_id":int(drone_id)})["position"],
    )

# Hent liste over droner
@app.route("/api/drones")
def get_drone_list():
    return jsonify(
        drones = list(drones.find())
    )

# Last opp ny mission til drone
@app.route("/api/drones/<drone_id>/mission", methods=["POST"])
def post_drone_mission(drone_id):
    drone = drones.find_one({"_id":int(drone_id)})
    drones.update_one({"_id":int(drone_id)}, {
        "$set": {"mission": request.json["mission"]}
    })
    return request.json

# Last opp ny mission
@app.route("/api/mission", methods=["POST"])
def post_mission():
    return request.json

# Hent mission
@app.route("/api/mission")
def get_mission():
    return jsonify(
        mission = []
    )

app.run(host="0.0.0.0")
