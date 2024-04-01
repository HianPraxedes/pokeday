// src/firebase.js

import firebase from 'firebase/app';
import 'firebase/database';

// Configure o Firebase com suas credenciais
const firebaseConfig = {
    apiKey: "AIzaSyD7dfS8sMmblgpC29lp0yzhMM-qbPFe19U",
    authDomain: "pokeday-95320.firebaseapp.com",
    databaseURL: "https://pokeday-95320-default-rtdb.firebaseio.com",
    projectId: "pokeday-95320",
    storageBucket: "pokeday-95320.appspot.com",
    messagingSenderId: "1083376538339",
    appId: "1:1083376538339:web:71a8706a9e072a65ed6bd6",
    measurementId: "G-4HP8CJ7Z17"
  };

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
