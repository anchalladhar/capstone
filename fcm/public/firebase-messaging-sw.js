

importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyB8xMPCyes3GGvxz0-ig2jbwqdpBDKB1Rk",
    authDomain: "expensetracker-5501a.firebaseapp.com",
    projectId: "expensetracker-5501a",
    storageBucket: "expensetracker-5501a.appspot.com",
    messagingSenderId: "989666135103",
    appId: "1:989666135103:web:a69eef7ce191eb52dffc8a",
    measurementId: "G-YVP679EBHY"
  };

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});