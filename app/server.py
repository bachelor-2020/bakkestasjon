from flask import Flask, render_template, jsonify, request

app = Flask(__name__, static_url_path='')

@app.route("/")
def index():
    return app.send_static_file("index.html")


# Hent nåværende mission for drone
@app.route("/api/drones/<drone_id>/mission")
def get_drone_mission(drone_id):
    return jsonify(
        drone_id = drone_id,
        mission = [],
        searched = []
    )

# Hent posisjon for drone
@app.route("/api/drones/<drone_id>/position")
def get_drone_pos(drone_id):
    return jsonify(
        drone_id = drone_id,
        pos = [10,50]
    )

# Last opp ny mission til drone
@app.route("/api/drones/<drone_id>/mission", methods=["POST"])
def post_drone_mission(drone_id):
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
