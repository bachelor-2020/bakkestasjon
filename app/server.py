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
        "latitude": 59.3687,
        "longitude": 10.442,
        "altitude": 0
    },
    "trail": [],
    "mission": []
}

drones.insert_one(drone_1)

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

app.run(host="0.0.0.0")
