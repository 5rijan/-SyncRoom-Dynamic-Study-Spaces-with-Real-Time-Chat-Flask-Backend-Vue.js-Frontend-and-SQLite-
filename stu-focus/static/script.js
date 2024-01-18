/*
Multi-Feature-Study-Platform Main Script

This file, script.js, serves as the main script for our application. It handles user interactions and updates the application's state accordingly.

Key Components:
- Swiper instance for enabling a carousel-like navigation between different study materials.
- Event listener for the 'slideChangeTransitionEnd' event, which updates the selected image ID when the user navigates to a new slide.
- A variable 'socket' which will likely be used for real-time, bidirectional communication between the client and the server.
- An event listener for the 'DOMContentLoaded' event, which runs a function when the initial HTML document has been completely loaded and parsed.
- An event listener for the 'submit' event, which runs a function when the user submits the form.

Purpose:
This file sets up the interactive features of the application. It plays a crucial role in the Multi-Feature-Study-Platform application, defining how the application responds to user input.

Author: Srijan Chaudhary (5rijan)
last modified: 5/1/21
*/


var socket;
// Add an event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Creating socket connection...');
  socket = io.connect('http://127.0.0.1:5000/chat');
  var joinRoomForm = document.getElementById('myForm');
  var passcode;

  socket.on('no_room_found', function(data) {
    alert(data.message);
  });

  socket.on('request_sent', function(data) {
    alert(data.message);
  });

  socket.on('request_response_result', function(data) {
    alert(data.message);
    // If the request was accepted, redirect to the submit page with the passcode and username as query parameters
    if (data.message === 'Request accepted') {
        var passcode = data.passcode;
        var name = data.name;
        console.log('Passcode:', passcode, 'Name:', name);  
        window.location.href = '/submit?passcode=' + passcode + '&username=' + name;
    }
});
  // Add an event listener for when the form is submitted
  joinRoomForm.addEventListener('submit', function(event) {
    event.preventDefault();

    var email = joinRoomForm.elements['logemail'].value;
    passcode = joinRoomForm.elements['logpass'].value;

    console.log('Email:', email, 'Passcode:', passcode);
    // If the email and passcode are valid, emit a 'join' event to the server with the email and passcode as data
    if (email && passcode && email !== 'null' && passcode !== 'null' && passcode.length === 5) {
      socket.emit('join', {'email': email, 'passcode': passcode});
    } 
  });

});



// theme swiper physics
var swiper = new Swiper('.swiper-container', {
  slidesPerView: 2,  // Adjust this value as needed
  spaceBetween: 20,
  effect: 'fade',
  loop: true,
  speed: 300,
  mousewheel: {
      invert: false,
  },
  pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true
  },
  // Navigation arrows
  navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
  }
});

swiper.on('slideChangeTransitionEnd', function () {
  var activeSlide = $('.swiper-slide-active');
  var selectedImageId = activeSlide.data('container-id');
  console.log("Active card:", selectedImageId);
  $('#selectedImageId').val(selectedImageId);
});


