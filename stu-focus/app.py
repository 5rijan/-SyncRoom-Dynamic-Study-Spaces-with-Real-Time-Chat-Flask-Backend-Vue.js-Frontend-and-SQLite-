"""
Multi-Feature-Study-Platform Main Application

This file, app.py, serves as the central hub for our Flask application, responsible for 
configuring the application, initializing the database, and defining routes and Socket.IO events.

Key Components:
- Flask application for handling HTTP requests and rendering templates.
- Flask-SocketIO for enabling real-time bidirectional communication.
- SQLAlchemy for defining and interacting with database models (Room, User, Request).
- CORS for handling Cross-Origin Resource Sharing.

Routes:
- "/" renders the main page of the application.
- "/submit" handles the creation and joining of study rooms.

Socket.IO Events:
- 'connect', 'join', 'disconnect', 'request_response', and others for real-time communication.

Purpose:
This file sets up the Flask application and its extensions, defines database models, 
and specifies routes and Socket.IO events. It plays a central role in the Multi-Feature-Study-Platform 
application, serving as the core component.


Author: Srijan Chaudhary (5rijan)
last modified: 5/1/21
"""


from flask import Flask, render_template, request, session, jsonify, make_response, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, backref
from flask_socketio import SocketIO, join_room, leave_room, disconnect, emit
from flask_cors import CORS
import os
import random
from time import sleep





# Initialize Flask application
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rooms.db'
app.config['SECRET_KEY'] = 'your-secret-key' 


# Initialize SQLAlchemy and Migrate
db = SQLAlchemy()
db.init_app(app)
migrate = Migrate(app, db)

# Initialize SocketIO and CORS
socketio = SocketIO(app)
CORS(app)

# Define SQLAlchemy models
class Room(db.Model):
    __tablename__ = 'room'
    id = Column(Integer, primary_key=True)
    theme = Column(String)
    passcode = Column(String, unique=True)
    user_count = Column(Integer)
    users = relationship('User', backref='room')

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    room_passcode = db.Column(db.String(80), db.ForeignKey('room.passcode'), nullable=True)
    session_id = db.Column(db.String(80), unique=False, nullable=True)    

class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(120), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'))
    status = db.Column(db.String(10), default='pending')




@app.route("/")
def home():
    return render_template('index.html')

@socketio.on('connect')
def on_connect():
    print(f"Connected, sid: {request.sid}")
    session['sid'] = request.sid

@app.route('/submit', methods=['GET', 'POST'])
def submit():
    if request.method == 'POST':
        form_data = request.form.to_dict(flat=False)

        if 'logname' in form_data and 'selectedImageId' in form_data:
            # Create action
            user_full_name = form_data.get('logname', [''])[0]
            selected_theme = form_data.get('selectedImageId', [''])[0]

            passcode = session.get(f'passcode_{user_full_name}') or request.cookies.get(f'passcode_{user_full_name}')  # Get the passcode from the session or the cookie
            if not passcode or Room.query.filter_by(passcode=passcode).first() is not None:  # If no passcode exists in the session or the cookie or it's not unique, generate a new one
                passcode = str(random.randint(10000, 99999))  # Generate a random 5 digit passcode
                while Room.query.filter_by(passcode=passcode).first() is not None:
                    passcode = str(random.randint(10000, 99999))  # Make sure random 5 digit passcode is unique  

            new_user = User(username=user_full_name, room_passcode=passcode)
            db.session.add(new_user)
            db.session.flush()  # This will assign an ID to new_user, but won't commit the transaction yet
            # Now create Room
            new_room = Room(theme=selected_theme, passcode=passcode, user_count=1, users=[new_user])
            db.session.add(new_room)
            db.session.commit()
            # Store the room_id in the session
            session['room_id'] = new_room.id

            # Add the room_id to the rooms dictionary
            room_id_str = str(new_room.id)
            if room_id_str not in rooms:
                rooms[room_id_str] = []

            print(f"Create Action - Room Passcode: {passcode}, Name: {user_full_name}, Theme: {selected_theme}")
            return redirect(url_for('submit', passcode=passcode, username=user_full_name))
        
    elif request.method == 'GET':
        passcode = request.args.get('passcode')
        user_full_name = request.args.get('username')
        if passcode:
            return render_template("room.html", passcode=passcode, name=user_full_name)
        else:
            return "No passcode provided."

    return "Invalid form data."
rooms = {}
clients = {}





@socketio.on('connect', namespace='/chat')
def on_connect(*args):
    # Handle client connection
    room_id_str = str(session.get('room_id'))
    if room_id_str not in rooms:
        rooms[room_id_str] = []
    rooms[room_id_str].append(request.sid)

    # Update the user's session ID in the database
    user_id = session.get('user_id')
    if user_id:
        user = User.query.filter_by(id=user_id).first()


@socketio.on('join', namespace='/chat')
def on_join(data):
    """
    Handle client joining a room.

    Args:
        data (dict): Dictionary containing email and passcode.

    Returns:
        None
    """

    email = data.get('email')
    passcode = data.get('passcode')
    print('Received join event with data:', passcode)
    room = Room.query.filter_by(passcode=passcode).first()
    if room is None:
        print(f"Error: No room found with passcode {passcode}")
        emit('no_room_found', {'message': f"No room found with passcode {passcode}"}, room=request.sid)
        return
    user_session_id = request.sid  # Get the session ID of the client
    valid_request(email, passcode, user_session_id)


@socketio.on('disconnect', namespace='/chat')
def on_disconnect():
    """
    Handle client disconnection.

    Args:
        None

    Returns:
        None
    """
    room_id = str(session.get('room_id'))
    room = Room.query.get(room_id)
    if room:
        room.user_count -= 1
        if room.user_count == 0:
            print(f"The room with passcode: {room.passcode} is getting deleted")
            db.session.delete(room) # Delete the room from the database
        db.session.commit() # Commit the changes to the database
        print(f"User disconnected from the room with the passcode: {room.passcode}, Users: {room.user_count}")
    else:
        print("No room found")


def valid_request(user_email, passcode, user_session_id):
    """
    Handle a valid request from a user to join a room.

    Args:
        user_email (str): The email of the user making the request.
        passcode (str): The passcode of the room the user wants to join.
        user_session_id (str): The session ID of the user making the request.

    Returns:
        None
    """

    emit('request_sent', {'message': "Your request has been sent. Please wait for confirmation.", 'session_id': user_session_id}, room=request.sid)
    emit('new_request', {'message': f"{user_email} has sent a request to join this room.", 'email': user_email, 'passcode': passcode, 'session_id': user_session_id}, broadcast=True)


@socketio.on('request_response', namespace='/chat')
def on_request_response(data):
    """
    Handle the response to a join room request.

    Args:
        data (dict): Dictionary containing the user's email, room passcode, session ID, and whether the request was accepted.

    Returns:
        None
    """
    email = data.get('user_email')
    passcode = data.get('passcode')
    session_id = data.get('session_id')
    accepted = data.get('accepted')
    print(f'Received request response: email={email}, passcode={passcode}, accepted={accepted}')
    room = Room.query.filter_by(passcode=passcode).first()
    if room is None:
        print(f"Error: No room found with passcode {passcode}")
        emit('request_response_result', {'message': f"No room found with passcode {passcode}"}, room=session_id)
        return

    if accepted:
        # If the request was accepted, create a new user and associate it with the room
        print(email, room.passcode)
        new_user = User(username=email, room_passcode=room.passcode, session_id=session_id)
        db.session.add(new_user)
        room.user_count += 1
        db.session.commit()

        # Send the URL of the room back to the client
        emit('request_response_result', {'passcode': passcode, 'message': 'Request accepted', 'name':email}, room=session_id)
        print("yayyyy")

    else:
        # If the request was declined, just send a message back to the client
        emit('request_response_result', {'passcode': passcode, 'message': 'Request declined'}, room=session_id)
        print("nayyyy")


@socketio.on('chat_handler', namespace='/chat')
def handle_chat(data):
    emit('chat_broadcast', data, broadcast=True)
    

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Room': Room, 'Request': Request}



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0', debug=True)