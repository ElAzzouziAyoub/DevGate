<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>
      
      <div class="input-group">
        <input v-model="email" type="email" placeholder="Email" class="auth-input" />
        <input v-model="password" type="password" placeholder="Mot de passe" class="auth-input" />

        <template v-if="!isLogin">
          <input v-model="firstName" type="text" placeholder="Prénom" class="auth-input" />
          <input v-model="lastName" type="text" placeholder="Nom" class="auth-input" />
        </template>
      </div>

      <button @click="handleSubmit" class="auth-button">
        {{ isLogin ? 'Se connecter' : 'S\'inscrire' }}
      </button>

      <p @click="toggleForm" class="auth-toggle">
        {{ isLogin ? 'Pas encore inscrit ? Créer un compte' : 'Déjà un compte ? Se connecter' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { login, signup } from "@/services/authservice";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const firstName = ref("");
const lastName = ref("");
const isLogin = ref(true);
const router = useRouter();

const handleSubmit = async () => {
  try {

    if (isLogin.value) {
      await login(email.value, password.value);
      alert("Connecté !");
      router.push("/objectives");
    } else {
      await signup(email.value, password.value, firstName.value, lastName.value);
      alert("Compte créé !");
      router.push("/home");
    }
  } catch (err) {
    alert(err.message);
  }
};

const toggleForm = () => {
  isLogin.value = !isLogin.value;
  firstName.value = "";
  lastName.value = "";
};
</script>

<style scoped>
/* Style du formulaire */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-title {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.auth-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.auth-input:focus {
  outline: none;
  border-color: #0079d3;
}

.auth-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #0079d3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-button:hover {
  background-color: #0064b7;
}

.auth-toggle {
  text-align: center;
  margin-top: 1rem;
  color: #0079d3;
  cursor: pointer;
  font-size: 0.9rem;
}

.auth-toggle:hover {
  text-decoration: underline;
}
</style>


/* */