/*eslint-disable*/
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Fonction pour l'inscription
export const signup = async (email, password, firstName, lastName) => {
  try {
    // Création de l'utilisateur via Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Mise à jour du nom de l'utilisateur dans Firebase Auth
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}` // Mettre à jour le nom de l'utilisateur
    });

    // Ajouter l'utilisateur dans Firestore (collection "users")
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    // Si l'utilisateur n'existe pas encore dans Firestore, on l'ajoute
    if (!docSnap.exists()) {
      // Ajouter les données de l'utilisateur dans Firestore
      await setDoc(userRef, {
        admin: false,  // Valeur par défaut pour admin
        color: "#ffffff",  // Valeur par défaut pour color
        first_name: firstName || "Prénom non défini", // Assurez-vous de ne pas envoyer undefined
        last_name: lastName || "Nom non défini",  // Assurez-vous de ne pas envoyer undefined
        globale_score: 0,  // Valeur par défaut pour globale_score
        name: `${firstName} ${lastName}`,  // Le nom complet de l'utilisateur
        userUID: user.uid,  // UID de l'utilisateur provenant de Firebase
        following : [],
        followings : []
      });
    }

    return userCredential;
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    throw error;  // Relancer l'erreur si nécessaire
  }
};

// Fonction pour la connexion
export const login = async (email, password) => {
  try {
    // Connexion de l'utilisateur via Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Si l'utilisateur est connecté avec succès, on retourne l'objet userCredential
    return userCredential;
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    throw error;  // Relancer l'erreur si nécessaire
  }
};