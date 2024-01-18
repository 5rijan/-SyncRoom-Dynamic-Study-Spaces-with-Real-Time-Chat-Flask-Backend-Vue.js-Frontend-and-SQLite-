# Stu-Focus-Dynamic-Study-Spaces-with-Real-Time-Chat-Flask-Backend-Frontend-and-SQLite-database-Multi-Feature-Study-Platform


This project serves as a comprehensive virtual study platform, providing users with an immersive study environment and collaborative tools. Users can create unique study rooms, invite others using passcodes, and benefit from features like to-do lists, alarms, timers, music streaming, and real-time chat.

## Tech Stack

- **Backend:** Flask (Flask-SocketIO, Flask-SQLAlchemy)
- **Frontend:** JavaScript, HTML, CSS (Vue.js for frontend components)
- **Real-Time Communication:** Socket.IO
- **Database:** SQLite (configured via SQLAlchemy)
- **Authentication:** Custom authentication mechanism
- **Spotify Integration:** Spotify API for music streaming.
- **Additional Libraries:** Flask-Migrate for database migrations, Flask-CORS for handling CORS.


## Project Overview

This file, `app.py`, acts as the central hub for our Flask application, responsible for configuring the application, initializing the database, and defining routes and Socket.IO events. Key components include:

- Flask application for handling HTTP requests and rendering templates.
- Flask-SocketIO for enabling real-time bidirectional communication.
- SQLAlchemy for defining and interacting with database models (Room, User, Request).
- CORS for handling Cross-Origin Resource Sharing.

## How to Run

1. Install dependencies: `pip install -r requirements.txt`
2. Run the application: `python app.py`
3. Access the application in your browser: [http://localhost:5000/](http://localhost:5000/)

**Project Structure:**

- **stu-focus/**: Main project directory
  - **instance/**: Instance directory with rooms.db
    - rooms.db: SQLite database file
  - **migrations/**: Database migrations directory
    - pycache/: Python cache files
    - version/: Migration version files
  - **static/**: Static files (CSS, JS, images)
    - room.css: CSS styles for the room
    - room.js: JavaScript logic for the room
    - script.js: Other JavaScript logic
    - style.css: General CSS styles
    - **src/**: Image sources directory
      - ...: Other image files
  - **templates/**: HTML templates
    - index.html: Main page template
    - room.html: Study room template
  - app.py: Main entry point for the Flask application
  - requirements.txt: List of project dependencies
  - test.py: Test script
- README.md: Project documentation



**Screenshots:**

1. **Joining a Room (index.html):**

   ![Joining a Room](https://github.com/5rijan/Stu-Focus-Dynamic-Study-Spaces-with-Real-Time-Chat-Flask-Backend-Frontend-and-SQLite-database/assets/87299199/2253b0f7-76f9-410b-9e71-2d79ce4dffb9)
   *-User joining a virtual study room.*



2. **Real-Time Chat Application (room.html):**

   ![Chat Application](https://github.com/5rijan/Stu-Focus-Dynamic-Study-Spaces-with-Real-Time-Chat-Flask-Backend-Frontend-and-SQLite-database/assets/87299199/fc69f4fe-7fe9-458d-91d7-f73513a55704)
   *-Real-time communication with other members in the study room.*



3. **To-Do Box in Use (room.html):**

   ![To-Do Box](https://github.com/5rijan/Stu-Focus-Dynamic-Study-Spaces-with-Real-Time-Chat-Flask-Backend-Frontend-and-SQLite-database/assets/87299199/0d92264e-fb0e-4ffd-8dc0-c9f35cd83e35)
   *-Managing tasks and to-dos within the study room.*



## Future Enhancements

- Video calling functionality.
- Theme customization options.
- User profiles for personalized study experiences.
- Collaborative task management features.

## Contributions

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## Author

- Srijan Chaudhary ([GitHub](https://github.com/5rijan))

## License

This project is licensed under the [MIT License](LICENSE).





