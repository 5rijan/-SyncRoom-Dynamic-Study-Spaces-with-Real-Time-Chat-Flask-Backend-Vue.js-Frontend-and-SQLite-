"""
>>>This script is used to fetch and display data about a specific chat room in the application.
The script prompts the user to enter a room passcode. It then queries the database for a room with that passcode and prints out the room's ID, theme, and user count. 
If a room with the entered passcode is found, the script also queries the database for all users in that room and prints out each user's ID, username, and session ID.
This script is useful for testing and debugging purposes, as it allows you to quickly and easily view the data associated with a specific room.

>>>To stop the script, the user can enter 'exit' when prompted for a passcode.

Author: Srijan Chaudhary (5rijan)
last modified: 5/1/21
"""


from app import app, db, Room, User
def get_room_data():
    with app.app_context():
        while True:
            passcode = input("Enter the room passcode (or 'exit' to quit): ")
            if passcode.lower() == 'exit':
                break

            room = Room.query.filter_by(passcode=passcode).first()
            if room:
                print(f"Room ID: {room.id}")
                print(f"Room Theme: {room.theme}")
                print(f"User Count: {room.user_count}")

                users = User.query.filter_by(room_passcode=passcode).all()
                for user in users:
                    print(f"User ID: {user.id}, Username: {user.username}, session ID: {user.session_id}")
            else:
                print(f"No room found with passcode: {passcode}")

if __name__ == "__main__":
    get_room_data()