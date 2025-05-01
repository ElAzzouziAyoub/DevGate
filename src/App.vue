<template>
  <div class="home">
    <div class="header" v-if="user">
      <h2>DevGate</h2>
      <router-link to="/home"><h4 style="cursor: pointer">Home</h4></router-link>
      <router-link to="/questions"><h4 style="cursor: pointer">Questions</h4></router-link>
      <input class="filter" placeholder="Search for projects" v-model="input" />
      <div class="notification">
        <button @click="notif"><i class="fa-solid fa-bell"></i></button>
      </div>
      <div class="profile">
        <button @click="gotoprofile"><i class="fa-solid fa-user"></i></button>
      </div>
      <div class="signout">
        <button @click="signOutUser"><i class="fa-solid fa-right-from-bracket"></i></button>
      </div>
    </div>
  
    </div>

  <router-view />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged , signOut} from 'firebase/auth'

const auth = getAuth()
const router = useRouter()
const user = ref(null)


const signOutUser = async () => {
  try {
    await signOut(auth)
    router.push('/') // Send back to login/landing page
  } catch (err) {
    console.error("Sign-out error:", err)
  }
}


onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    user.value = u

    if (u) {
      if (router.currentRoute.value.path === '/') {
        router.push('/home')
      }
    } else {
      if (router.currentRoute.value.path !== '/') {
        router.push('/')
      }
    }
  })
})

const notif = () => {
  // your notif function
}

const gotoprofile = () => {
  router.push('/profile') // or wherever
}

const input = ref('')
</script>

<style scoped>
.home {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.signout button {
  background: none;
  border: none;
  cursor: pointer;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.signout i.fa-right-from-bracket {
  font-size: 1.3rem;
  color: #4a5568;
  transition: all 0.2s ease;
}

.signout:hover i.fa-right-from-bracket {
  color: #e53e3e;
  transform: scale(1.1);
}


.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 30px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header h2 {
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(to right, #0079d3, #00c6fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header a {
  text-decoration: none;
  color: #4a5568;
  transition: all 0.2s ease;
}

.header a:hover h4 {
  color: #0079d3;
  transform: translateY(-1px);
}

.header a h4 {
  margin: 0 15px;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.filter {
  padding: 10px 20px;
  width: 350px;
  border: 1px solid #e2e8f0;
  border-radius: 25px;
  outline: none;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  background-color: #f8fafc;
}

.filter:focus {
  border-color: #0079d3;
  box-shadow: 0 0 0 3px rgba(0, 121, 211, 0.1);
  background-color: white;
}

.filter::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.notification button,
.profile button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  transition: all 0.2s ease;
  background-color: #f8fafc;
}

.notification i.fa-bell,
.profile i.fa-user {
  font-size: 1.3rem;
  color: #4a5568;
  transition: all 0.2s ease;
}

.notification:hover i.fa-bell,
.profile:hover i.fa-user {
  color: #0079d3;
  transform: scale(1.1);
}

.notification button:hover,
.profile button:hover {
  background-color: #e6f2ff;
}

.notification button:active,
.profile button:active {
  transform: scale(0.95);
}

.notification {
  position: relative;
  margin-left: 15px;
}

.notification::after {
  content: "";
  position: absolute;
  top: 5px;
  right: 5px;
  width: 10px;
  height: 10px;
  background-color: #ff4500;
  border-radius: 50%;
  border: 2px solid white;
  display: none;
}
</style>
