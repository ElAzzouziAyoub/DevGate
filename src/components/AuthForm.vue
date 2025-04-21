<template>
    <div class="auth-wrapper">
      <div class="auth-card">
        <h2>{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>
  
        <!-- Common Fields -->
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Mot de passe" />
  
        <!-- Additional Fields for Signup -->
        <template v-if="!isLogin">
          <input v-model="firstName" type="text" placeholder="Prénom" />
          <input v-model="lastName" type="text" placeholder="Nom" />
        </template>
  
        <button @click="handleSubmit" class="submit-btn">
          {{ isLogin ? 'Se connecter' : 'S\'inscrire' }}
        </button>
  
        <p @click="toggleForm" class="toggle-form">
          {{ isLogin ? 'Pas encore inscrit ? Créez un compte' : 'Déjà un compte ? Connectez-vous' }}
        </p>
      </div>
    </div>
  </template>
  
  
  <script setup> 
  import { ref } from 'vue'
  import { login, signup } from '@/services/authService'
  import { updateProfile } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  import { setDoc , doc } from 'firebase/firestore'
  import { db } from '@/firebase'
  import {auth} from '@/firebase'
  
  const email = ref('')
  const password = ref('')
  const firstName = ref('')
  const lastName = ref('')
  const isLogin = ref(true)
  const router = useRouter()
  
  const handleSubmit = async () => {
    try {
      if (isLogin.value) {
        // Login with email and password
        await login(email.value, password.value)
      } else {
        // Sign up with email, password, first name, and last name
        const userCredential = await signup(email.value, password.value)
        // Update profile with full name
        await updateProfile(userCredential.user, {
          displayName: `${firstName.value} ${lastName.value}`
        })
        
  
        
        await setDoc(doc(db, "users", auth.currentUser.uid),
        {
          name: `${firstName.value} ${lastName.value}`,
          first_name : `${firstName.value}`,
          userUID : auth.currentUser.uid,
          globale_score: 0,
          color : '#ffffff',
          admin : false
  
        });
      }
      
      router.push('/home')
    } catch (err) {
      alert(err.message)
    }
  }
  
  const toggleForm = () => {
    isLogin.value = !isLogin.value
    // Reset additional fields when toggling
    firstName.value = ''
    lastName.value = ''
  }
  </script>
  
  <style scoped>
  .auth-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2c3e50, #3498db);
    padding: 1rem;
  }
  
  .auth-card {
    background-color: #fff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: fadeIn 0.5s ease;
  }
  
  .auth-card h2 {
    text-align: center;
    font-size: 2rem;
    color: #2c3e50;
    margin-bottom: 1rem;
  }
  
  .auth-card input {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 1rem;
    transition: border-color 0.3s;
  }
  
  .auth-card input:focus {
    outline: none;
    border-color: #3498db;
  }
  
  .submit-btn {
    padding: 0.75rem;
    background-color: #3498db;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .submit-btn:hover {
    background-color: #2980b9;
  }
  
  .toggle-form {
    text-align: center;
    font-size: 0.95rem;
    color: #3498db;
    cursor: pointer;
    transition: color 0.3s ease;
  }
  
  .toggle-form:hover {
    color: #2c3e50;
  }
  
  @media (max-width: 480px) {
    .auth-card {
      padding: 1.5rem;
    }
  
    .auth-card h2 {
      font-size: 1.6rem;
    }
  
    .submit-btn {
      font-size: 1rem;
    }
  }
  
  /* Fade-in animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
  
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>