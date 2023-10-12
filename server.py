import json
from flask import Flask, render_template, request, jsonify, render_template
from flask_socketio import SocketIO, emit, send, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins='*')

clients = {}
therapists = {}

@socketio.on("register")
def register(data):
   """event listener when client connects to the server"""
   if data["type"] == 'client':
         clients[data["id"]] = request.sid
   else:
         therapists[data["id"]] = {
            'id': request.sid,
            'isAvailable': True
         }
   print("client has connected")


@socketio.on("deregister")
def register(data):
   if data["type"] == 'client':
         del clients[data["id"]]
   else:
         del therapists[data["id"]]
   print("client has disconnected")


@app.route('/')
def index():
 return render_template('index.html')



@socketio.on('signal')
def handle_signal(data):
 # Broadcast the signaling data to all other clients
 print('received signal: ' + str(data))
 emit('signal', str(data), broadcast=True, include_self=False)

@socketio.on('sendToID')
def handle_send(data):
 user = json.loads(data)
 print('received signal: ' + str(data))
 emit('message', str(data), broadcast=True, include_self=False)


@app.route('/checkAvailability')
def therapistAvailability():
    return jsonify({'value':checkAvailability()})


@app.route('/chat')
def chat():
   return render_template('chatDisplay.html')


@app.route('/counsellingService')
def home():
   return render_template('counsellingService.html')


def checkAvailability():
    for therapist in therapists.values():
        if therapist['isAvailable']:
            return True
    return False



if __name__ == '__main__':
 socketio.run(app, host='127.0.0.1', debug=True, port=5000)