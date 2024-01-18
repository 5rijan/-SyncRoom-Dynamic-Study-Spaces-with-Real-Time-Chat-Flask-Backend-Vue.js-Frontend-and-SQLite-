/*
Multi-Feature-Study-Platform Room Script

This file, room.js, serves as the main script for the room page of our application. It handles user interactions within the room and updates the application's state accordingly.

Key Components:
- Variables 'username' and 'passcode' extracted from the welcome header on the page.
- A Socket.IO client that connects to the server and listens for 'join', 'connect', and 'new_request' events.
- To-Do Box: A feature that allows users to manage their tasks within the room.
- Audio Preview: An Audio object is created and an event listener is set up to change the audio source and volume based on user input.
- Alarm: A complex alarm system is set up with various functions to display the time, set the alarm, and trigger the alarm when the current time matches the set alarm time. The alarm system includes a mode switch between 24-hour and 12-hour formats, and a modal dialog that appears when the alarm is triggered.
- Chat Box: A feature that allows users to chat with other users in the room.
- Alarm Sound: An Audio object is created for the alarm sound, which is played when the alarm is triggered.

Purpose:
This file sets up the interactive features of the room page of the application, specifically the audio preview and alarm system. It plays a crucial role in the Multi-Feature-Study-Platform application, defining how the room page responds to user input and server events.

Author: Srijan Chaudhary (5rijan)
last modified: 5/1/21
*/



// Get the passcode from the H1 element
var welcomeHeader = document.querySelector('.welcome-header').textContent;
var username = welcomeHeader.split(' ')[1];
var passcode = welcomeHeader.split(' ')[2].replace(/\D/g, '');
console.log('Passcode:', passcode, 'Username:', username);

// Connect to the Socket.IO server
var socket = io.connect('http://127.0.0.1:5000/chat');

socket.on('join', function(data) {
  console.log('Received join event with data:', data);
});

socket.on('connect', function() {
  console.log('Connected to server');
});

socket.on('new_request', function(data) {
  console.log('Received new_request event', data);
  if (data.passcode === passcode) {
    var result = confirm(data.message + "\nDo you want to accept?");
    if (result) {
      console.log('Accepted');
      socket.emit('request_response', { user_email: data.email, passcode: data.passcode, session_id: data.session_id, accepted: true });
    } else {
      console.log('Declined');
      socket.emit('request_response', { user_email: data.email, passcode: data.passcode, session_id: data.session_id, accepted: false });
    }
  }
});

// Add event listener to the send button
document.querySelector('.chat-controls-btn.send').addEventListener('click', function(event) {
  event.preventDefault();

  var message = document.querySelector('.chat-controls-textarea').value;

  // Create the package
  var data = {
    username: username,
    passcode: passcode,
    message: message
  };

  // Emit the message event
  socket.emit('chat_handler', data);

  // Clear the textarea
  document.querySelector('.chat-controls-textarea').value = '';
});

socket.on('chat_broadcast', function(data) {
  if (data.passcode == passcode) {
    console.log('Received message:', data);

    // Create a new div for the message
    var messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    // Create a new span for the message text
    var messageText = document.createElement('span');
    messageText.classList.add('message-text');
    messageText.textContent = data.message;
    messageDiv.appendChild(messageText);

    // Create a new div for the username and timestamp
    var userDetailsDiv = document.createElement('div');
    userDetailsDiv.classList.add('user-details');

    // Create a new span for the username
    var messageUser = document.createElement('span');
    messageUser.classList.add('message-user');
    messageUser.textContent = data.username;
    userDetailsDiv.appendChild(messageUser);

    // Create a new span for the timestamp
    var timestamp = new Date();
    var messageTimestamp = document.createElement('span');
    messageTimestamp.classList.add('message-timestamp');
    messageTimestamp.textContent = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    userDetailsDiv.appendChild(messageTimestamp);

    // Append the user details div to the message div
    messageDiv.appendChild(userDetailsDiv);

    // Append the message div to the end of the chat history
    var chatHistory = document.querySelector('.chat-history');
    chatHistory.appendChild(messageDiv);

    // Scroll to the bottom of the chat history
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
});

// todo-list functionality vue.js
new Vue({
    el: '#app',
    data() {
      return {
        todoList: [
   
        ],
        new_todo: '',
        showComplete: false,
      };
    },
    computed: {},
    mounted() {
      this.getTodos();
    },
    watch: {
      todoList: {
        handler: function(updatedList) {
          localStorage.setItem('todo_list', JSON.stringify(updatedList));
        },
        deep: true
      }
    },
    computed:{
      pending: function() {
        return this.todoList.filter(function(item) {
          return !item.done;
        })
      },
      completed: function() {
        return this.todoList.filter(function(item) {
          return item.done;
        }); 
      },
      completedPercentage: function() {
        return (Math.floor((this.completed.length / this.todoList.length) * 100)) + "%";
      },
      today: function() {
        var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
  
        if(dd<10) {
            dd = '0'+dd
        } 
  
        if(mm<10) {
            mm = '0'+mm
        } 
  
        today = {
          day: weekday[today.getDay()],
          date:  mm + '-' + dd + '-' + yyyy,
        }
  
        return(today);
      }
    },
    methods: {
      // get all todos when loading the page
      getTodos() {
        if (localStorage.getItem('todo_list')) {
          this.todoList = JSON.parse(localStorage.getItem('todo_list'));
        }
      },
      // add a new item
      addItem() {
        // validation check
        if (this.new_todo) {
          this.todoList.unshift({
            id: this.todoList.length,
            title: this.new_todo,
            done: false,
          });
        }
        // reset new_todo
        this.new_todo = '';
        // save the new item in localstorage
        return true;
      },
      deleteItem(item) {
        this.todoList.splice(this.todoList.indexOf(item), 1);
      },
      toggleShowComplete() {
        this.showComplete = !this.showComplete;
      },
      clearAll() {
        this.todoList = [];
      }
    },
  });


  document.getElementById('chatbox').style.display = 'none';

//  tab functionality
// >>>to-do list
  document.getElementById('tab-03').addEventListener('change', function() {
    var todoBox = document.getElementById('todoBox');
    if (this.checked) {
        todoBox.style.display = 'block';
    } else {
        todoBox.style.display = 'none';
    }
});

// >>>chat-box
document.getElementById('tab-02').addEventListener('change', function() {
  var todoBox = document.getElementById('chatbox');
  if (this.checked) {
      todoBox.style.display = 'block';
  } else {
      todoBox.style.display = 'none';
  }
});


document.getElementById('todo_cancelButton').addEventListener('click', function() {
    document.getElementById('todoBox').style.display = 'none';
    document.getElementById('tab-03').checked = false;
});

document.getElementById('chat_cancelButton').addEventListener('click', function() {
  document.getElementById('chatbox').style.display = 'none';
  document.getElementById('tab-02').checked = false;
});


document.getElementById('timer-button').addEventListener('click', function() {
    var timerBox = document.getElementById('timerBox');
    if (timerBox.style.display === 'none' || timerBox.style.display === '') {
        timerBox.style.display = 'block';
        this.classList.add('active');
    } else {
        timerBox.style.display = 'none';
        this.classList.remove('active');
    }
});



// dragability physics of chatbox
var chatbox = document.getElementById('chatbox');
var handle = document.getElementById('chatbox-handle');

handle.onmousedown = function(event) {
  // Prevent default dragging of selected content
  event.preventDefault();

  var shiftX = 0; // keep the x-coordinate same
  var shiftY = -220; // top of the chatbox

  function moveAt(pageX, pageY) {
    chatbox.style.left = pageX - shiftX + 'px';
    chatbox.style.top = pageY - shiftY + 'px';
  }

  function onMouseMove(event) {
    moveAt(event.clientX, event.clientY);
  }

  // Move the chatbox on mousemove
  document.addEventListener('mousemove', onMouseMove);

  // Drop the chatbox, remove unneeded handlers
  document.onmouseup = function() {
    document.removeEventListener('mousemove', onMouseMove);
    document.onmouseup = null;
  };

  // Prevent default action on dragstart
  handle.ondragstart = function() {
    return false;
  };
};

chatbox.style.position = 'absolute';





//  timer functionality
var timerInput = document.getElementById('timerInput');
var startTimerButton = document.getElementById('startTimerButton');
var resetTimerButton = document.getElementById('resetTimerButton');

// Disable the buttons initially
startTimerButton.disabled = true;
resetTimerButton.disabled = true;

// Enable or disable the buttons based on the input value
timerInput.addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    if (e.target.value === '') {
        startTimerButton.disabled = true;
        resetTimerButton.disabled = true;
    } else {
        startTimerButton.disabled = false;
        resetTimerButton.disabled = false;
    }
});


var isTimerActive = false;
var timerInterval;

document.getElementById('timerInput').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

document.getElementById('timer_cancelButton').addEventListener('click', function() {
    document.getElementById('timerBox').style.display = 'none';

    // Only remove the 'active' class if the timer is not active
    if (!isTimerActive) {
        document.getElementById('timer-button').classList.remove('active');
    }
});


var time;
document.getElementById('startTimerButton').addEventListener('click', function() {
    var timerInput = document.getElementById('timerInput');
    var timerDisplay = document.getElementById('clock');
    time = parseInt(timerInput.value) * 60;
    isTimerActive = true;
    timerInput.value = '';  // Clear the input box
    document.getElementById('timer-button').classList.add('active');
    document.getElementById('timerBox').style.display = 'none';

    clearInterval(timerInterval);

    timerInterval = setInterval(function() {
        var hours = Math.floor(time / 3600);
        var minutes = Math.floor((time % 3600) / 60);
        var seconds = time % 60;
    
        timerDisplay.textContent = 
            (hours > 0 ? hours + ':' : '') + 
            (minutes < 10 ? '0' : '') + minutes + ':' + 
            (seconds < 10 ? '0' : '') + seconds;
        time--;
    
        if (time < 0) {
            clearInterval(timerInterval);
            timerFinished(); 
            var flashCount = 0;
            flashInterval = setInterval(function() {
                if (timerDisplay.textContent === '00:00') {
                    timerDisplay.textContent = '';
                } else {
                    timerDisplay.textContent = '00:00';
                }
                flashCount++;
                if (flashCount >= 6) {
                    clearInterval(flashInterval);
                    isTimerActive = false;
                    timerDisplay.textContent = '';
                    clock.tick();
                    document.getElementById('timer-button').classList.remove('active');
                }
            }, 650); // Flash every 650 milliseconds
        }
    }, 1100);
});


document.getElementById('resetTimerButton').addEventListener('click', function() {
    timerInput.value = ''; // Clear the input box
    document.getElementById('timerInput').value = '0'; // Simulate user input of '0'
    document.getElementById('startTimerButton').click(); // Simulate click on the start button
});

function timerFinished() {
    var selectedAudio = document.querySelector('input[name="audio"]:checked').value;
    var audioPath;
    switch(selectedAudio) {
        case 'audio1':
            audioPath = 'static/src/OH MY GOD - Sound Effect (HD).mp3';
            break;
        case 'audio2':
            audioPath = 'static/src/hahaha sound.mp3';
            break;
        default:
            // No audio selected
            return;
    }
    var timerSound = new Audio(audioPath);
    var volume = document.getElementById('volume').value; // Get the volume from the volume slider
    timerSound.volume = volume; // Set the audio's volume to the slider's value
    timerSound.play();
}

// Create the Audio object outside of the event listener
var audioPreview = new Audio();

document.getElementById('volume').addEventListener('input', function(e) {
    var selectedAudio = document.querySelector('input[name="audio"]:checked').value;

    var audioPath;
    switch(selectedAudio) {
        case 'audio1':
            audioPath = 'static/src/OH MY GOD - Sound Effect (HD).mp3';
            break;
        case 'audio2':
            audioPath = 'static/src/hahaha sound.mp3';
            break;
        default:
            // No audio selected
            return;
    }
    // Only change the audio source if it's different from the currently playing audio
    if (audioPreview.src !== audioPath) {
        audioPreview.src = audioPath;
        audioPreview.play();
    }
    audioPreview.volume = e.target.value; // Set the audio's volume to the slider's current value
});





// alarm
var modeFlag = true,
		alarmSetFlag = false,
    alarmData = {
      hrs: 0,
      mins: 0,
      alarmSet: false,
			pm: false
    };

// Functions
// display clock data
function display(hrs, mins) {
	console.log(alarmData);
	console.log('hrs = ' + hrs + ' / mins = ' + mins);
	if(alarmData.alarmSet && hrs === alarmData.hrs && mins === alarmData.mins) {
		alarmActive();
	}
	if (!modeFlag) {
		hrs = ampm(hrs);
	}
	hrs = zeroPrefixer(hrs);
	mins = zeroPrefixer(mins);
	$('.hrs').text(hrs);
	$('.mins').text(mins);
}

// Alarm trigger
function alarmActive() {
	$('.nums').addClass('alarm-flash');
	$('.alarm-display').text('alarm!');
  startAlarm();
}

// am pm mode function
function ampm(hour) {
	if (hour > 12) {
		alarmData.pm = true;
		$('.ampm-display').text('pm');
		return hour - 12;
	} else {
		alarmData.pm = false;
		$('.ampm-display').text('am');
		return hour;
	}
}

// Function to prefix a zero if less than ten
function zeroPrefixer(num) {
  return (num < 10 ? '0' : '') + num;
}

// get javascript time data
function setClock() {
	if(!alarmSetFlag){
		var hrs = new Date().getHours(),
				mins = new Date().getMinutes();
		display(hrs, mins);
	}
}

// record current time
function currentTime() {
  alarmData.hrs = Number($('.hrs').text());
  alarmData.mins = Number($('.mins').text());
	if (alarmData.pm && !modeFlag) {
		alarmData.hrs = alarmData.hrs + 12;
	}
}

// update values after clicking on controls
function alarmControl(val, sym) {
  sym === '+' ? alarmData[val]++ : alarmData[val]--;
  alarmLimiter(val);
}

// dont allow above or below 24hrs or 60 secs
function alarmLimiter(val) {
  if (val === 'mins' && alarmData.mins > 59) {
    alarmData.mins -= 60;
  } else if (val === 'mins' && alarmData.mins < 0) {
    alarmData.mins += 60;
  } else if (val === 'hrs' && alarmData.hrs > 23) {
    alarmData.hrs -= 24;
  } else if (val === 'hrs' && alarmData.hrs < 0) {
    alarmData.hrs += 24;
  }
  display(alarmData.hrs, alarmData.mins);
}

function setAlarm(toSet, text) {
	var $a = $('.alarm-display')
	alarmData.alarmSet = toSet;
	$('.alarm').text(text);
	toSet ? $a.text('alarm set for ' + alarmData.hrs + ':' + zeroPrefixer(alarmData.mins)) : $a.text('no alarm set');
}

// Set interval timer that checks every second.
setInterval(setClock, 1000);

// Click events
$('.mode').click(function() {
	modeFlag ? $('.mode-display').text('am/pm clock') : $('.mode-display').text('24hr clock');
	$('.ampm-display').toggleClass('handle');
	modeFlag = !modeFlag;
});

$('.alarm').click(function() {
	if (alarmData.alarmSet) {
		$('.nums').removeClass('alarm-flash');
		setAlarm(false, 'set alarm');
	} else {
		$('ul').toggleClass('handle');
		$('.nums').toggleClass('flash');
		alarmSetFlag ? setAlarm(true, 'cancel alarm') : currentTime();
		alarmSetFlag = !alarmSetFlag;
	}
});

$('.control-hrs li').each(function() {
  $(this).click(function(){
    alarmControl('hrs', $(this).text());
  });
});

$('.control-mins li').each(function() {
  $(this).click(function(){
    alarmControl('mins', $(this).text());
  });
});


document.getElementById('alarm-button').addEventListener('click', function() {
  var alarmClock = document.querySelector('.alarm-clock-wrap');
  var btnWrap = document.querySelector('.btn-wrap');
  var alarmButton = document.getElementById('alarm-button');

  if (alarmClock.style.display === 'none' || btnWrap.style.display === 'none') {
    alarmClock.style.display = 'block';
    btnWrap.style.display = 'flex';
    alarmButton.classList.add('active');
  } else {
    alarmClock.style.display = 'none';
    btnWrap.style.display = 'none';
    alarmButton.classList.remove('active');
  }
});


document.getElementById('close-alarm').addEventListener('click', function() {
  document.querySelector('.alarm-clock-wrap').style.display = 'none';
  document.querySelector('.btn-wrap').style.display = 'none';
  document.getElementById('alarm-button').classList.remove('active');
});




var alarmSound = new Audio('static/src/OH MY GOD - Sound Effect (HD).mp3');
function startAlarm() {
  // Get the alarm box and button wrap elements
  var alarmClock = document.querySelector('.alarm-clock-wrap');
  var btnWrap = document.querySelector('.btn-wrap');
  var alarmButton = document.getElementById('alarm-button');

  // Make the alarm box and button wrap visible
  alarmClock.style.display = 'block';
  btnWrap.style.display = 'flex';
  alarmButton.classList.add('active');

  // Play the alarm sound
  alarmSound.play();

  // Show a modal dialog with a button to cancel the alarm
  var modal = document.getElementById('myModal');
  var span = document.getElementsByClassName("close")[0];

  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal and stop the alarm
  span.onclick = function() {
    modal.style.display = "none";
    alarmSound.pause();
    alarmSound.currentTime = 0;
  }

  // When the user clicks anywhere outside of the modal, close it and stop the alarm
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
      alarmSound.pause();
      alarmSound.currentTime = 0;
    }
  }
}