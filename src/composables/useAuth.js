// src/services/authService.js
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
  } from "firebase/auth";
  import { app } from "../firebase";
  import { getAuth } from "firebase/auth";

  
  export const auth = getAuth(app);
  
  export const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };
  
  export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  