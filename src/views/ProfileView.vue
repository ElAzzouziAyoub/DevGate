<template>
  <div >
    <NavBar />
    <Profile :userUID="user ? (route.params.userUID ? route.params.userUID : user.uid) : route.params.userUID "/>
    <!-- Boutons d'action -->
    <div class="action-buttons" v-if="!route.params.userUID ||route.params.userUID === user?.uid">
        <button @click="editProfile" class="btn-edit">
        <i class="fas fa-edit"></i> Edit profil
        </button>
        <button @click="signOut" class="btn-logout">
        <i class="fas fa-sign-out-alt"></i> Log out
        </button>
    </div>
  </div>
</template>

<script setup>
import Profile from '@/components/ProfilePages.vue';
import NavBar from '@/components/NavBar.vue';
import { useRouter, useRoute } from 'vue-router';
import { auth } from '@/composables/useAuth';
import { onMounted, ref } from 'vue';
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";

const router = useRouter(),
route = useRoute();

const user = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (currUser) => {
    if(currUser) {
      user.value = currUser;
    }
  });
});

// Déconnexion de l'utilisateur
const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/Connexion");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
};
  
// Navigation vers la page d'édition du profil
const editProfile = () => {
    router.push("/edit-profile");
};
</script>

<style scoped>

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}
.btn-edit,
.btn-logout {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-edit {
  background-color: #0079d3;
  color: white;
}
.btn-logout {
  background-color: #f0f0f0;
  color: #333;
}
.btn-edit:hover {
  background-color: #0064b7;
}
.btn-logout:hover {
  background-color: #e0e0e0;
}
</style>