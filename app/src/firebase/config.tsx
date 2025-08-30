// Import the functions you need from the SDKs you need

import {getAuth} from "firebase/auth";
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGqBMIt8rHiLEK8seUBlT0qQ_sJOplQtM",
  authDomain: "bhakthi-salimath.firebaseapp.com",
  projectId: "bhakthi-salimath",
  storageBucket: "bhakthi-salimath.appspot.com",
  messagingSenderId: "563344983578",
  appId: "1:563344983578:web:47f8d1f314f1435a9bb3a3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); 
const auth = getAuth(app);

export{app,auth};