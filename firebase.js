// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlVKzXNhDMdDXZxSMErc1dZXVxGNkYPQE",
  authDomain: "inventory-management-39103.firebaseapp.com",
  projectId: "inventory-management-39103",
  storageBucket: "inventory-management-39103.appspot.com",
  messagingSenderId: "16435608",
  appId: "1:16435608:web:490f2a4853170920b8c3ed",
  measurementId: "G-F3VCYPSTQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app)

export {firestore}