<template>
  <div class="users-page">
    <h1>Réseau d'utilisateurs</h1>

    <!-- Barre de recherche et switch amis/tous -->
    <div class="controls">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un utilisateur..."
        class="search-bar"
      />
      <button @click="showFriends = !showFriends" class="toggle-view">
        {{ showFriends ? 'Voir tous les utilisateurs' : 'Voir mes amis' }}
      </button>
    </div>

    <!-- Grille d'utilisateurs -->
    <div class="users-grid">
      <div v-for="u in filteredUsers" :key="u.id" class="user-card">
        <div class="card-header">
          <div class="avatar" :style="{ backgroundColor: u.color || '#4299e1' }">
            {{ u.name?.[0]?.toUpperCase() || '?' }}
          </div>
          <div class="info">
            <h2>{{ u.name }}</h2>
            <div class="connection-status">
              <span v-if="isFriend(u.id)" class="friend-badge">Ami↔</span>
              <span v-else-if="isFollowing(u.id)" class="following-badge">Abonné →</span>
              <span v-else-if="isFollower(u.id)" class="follower-badge">← Abonné</span>
            </div>
          </div>
        </div>

        <div class="stats">
          <span>{{ u.objectivesCount }} objectifs</span>
          <span>{{ u.projectsCount }} projets</span>
          <span>{{ u.skillsCount }} compétences</span>
        </div>

        <div class="actions">
          <button
            @click="toggleFollow(u)"
            :class="isFollowing(u.id) ? 'unfollow-btn' : 'follow-btn'"
          >
            {{ isFollowing(u.id) ? 'Se désabonner' : 'Suivre' }}
          </button>
          <button
            @click="viewProfile(u)"
            class="view-btn"
            :disabled="!isFriend(u.id)"
          >
            Voir profil
          </button>
        </div>
      </div>
    </div>

    <!-- Modal profil -->
    <div
      v-if="selectedUser"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal">
        <header
          class="modal-header"
          :style="{ backgroundColor: selectedUser.color || '#4299e1' }"
        >
          <div class="avatar-large">
            {{ selectedUser.name?.[0]?.toUpperCase() }}
          </div>
          <h2>{{ selectedUser.name }}</h2>
          <p>{{ selectedUser.email }}</p>
          <div class="friend-status">
            <span class="friend-badge">Ami↔</span>
          </div>
        </header>

        <div class="modal-body">
          <!-- Graphique de progression -->
          <div class="chart-container">
            <h3>Progression globale</h3>
            <canvas ref="progressChart"></canvas>
          </div>

          <!-- Sections récentes -->
          <div class="section">
            <h3>Objectifs récents</h3>
            <ul>
              <li v-for="o in selectedUser.objectives.slice(0,3)" :key="o.id">
                {{ o.titre }} — {{ (o.progression*100).toFixed(0) }}%
              </li>
            </ul>
            <p v-if="!selectedUser.objectives.length">Aucun objectif</p>
          </div>

          <div class="section">
            <h3>Projets récents</h3>
            <ul>
              <li v-for="p in selectedUser.projects.slice(0,3)" :key="p.id">
                {{ p.title }} — {{ p.status }}
              </li>
            </ul>
            <p v-if="!selectedUser.projects.length">Aucun projet</p>
          </div>

          <div class="section">
            <h3>Compétences récentes</h3>
            <ul>
              <li v-for="s in selectedUser.skills.slice(0,3)" :key="s.id">
                {{ s.name }} — {{ s.level }}%
              </li>
            </ul>
            <p v-if="!selectedUser.skills.length">Aucune compétence</p>
          </div>
        </div>

        <button class="modal-close" @click="closeModal">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
/*eslint-disable*/
import { ref, computed, onMounted, nextTick } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  writeBatch,
  addDoc
} from 'firebase/firestore'
import Chart from 'chart.js/auto'

const auth = getAuth()
const db = getFirestore()

// Utilisateur courant et son profil Firestore
const currentUser    = ref(null)
const currentProfile = ref({})

// Liste des autres utilisateurs
const users        = ref([])
const searchQuery  = ref('')
const showFriends  = ref(false)
const selectedUser = ref(null)

// Réf pour le chart
const progressChart         = ref(null)
let progressChartInstance   = null

// Charger Auth + profil + utilisateurs
onMounted(() => {
  onAuthStateChanged(auth, async u => {
    if (!u) return
    currentUser.value    = u
    // Charger les données Firestore du current
    const snap = await getDoc(doc(db, 'users', u.uid))
    currentProfile.value = snap.exists() ? snap.data() : {}
    await loadUsers()
  })
})

// Récupérer tous les users sauf current + leurs items + followings
async function loadUsers() {
  const snaps = await getDocs(collection(db, 'users'))
  const all   = snaps.docs.map(d => ({ id: d.id, ...d.data() }))
                 .filter(u => u.id !== currentUser.value.uid)

  users.value = await Promise.all(all.map(async u => {
    const data = { ...u, followings: u.followings || [] }

    // Charger items
    const [oSnap, pSnap, sSnap] = await Promise.all([
      getDocs(query(collection(db, 'objectives'), where('UserUID', '==', u.id))),
      getDocs(query(collection(db, 'projects'),   where('UserUID', '==', u.id))),
      getDocs(query(collection(db, 'competences'),     where('UserUID', '==', u.id)))
    ])

    return {
      ...data,
      objectives: oSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      projects:   pSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      skills:     sSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      objectivesCount: oSnap.size,
      projectsCount:   pSnap.size,
      skillsCount:     sSnap.size
    }
  }))
}

// Filtrage selon recherche et amis seulement
const filteredUsers = computed(() => {
  let list = users.value
  if (showFriends.value) {
    list = list.filter(u => isFriend(u.id))
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(u =>
      u.name.toLowerCase().includes(q)
    )
  }
  return list
})

// Helpers de relation
function isFollowing(id) {
  return (currentProfile.value.followings || []).includes(id)
}

function isFollower(id) {
  const other = users.value.find(u => u.id === id)
  return (other?.followings || []).includes(currentUser.value.uid)
}

function isFriend(id) {
  return isFollowing(id) && isFollower(id)
}

// Suivre / se désabonner
async function toggleFollow(u) {
  const meRef = doc(db, 'users', currentUser.value.uid)
  const arr   = (currentProfile.value.followings || []).slice()
  const idx   = arr.indexOf(u.id)

  if (idx === -1) {
    arr.push(u.id) // Follow the user
    // Create a follow notification
    await createFollowNotification(u)
  } else {
    arr.splice(idx, 1) // Unfollow the user
    // Create an unfollow notification
    await createUnfollowNotification(u)
  }

  await updateDoc(meRef, { followings: arr })
  // Update local profile
  currentProfile.value.followings = arr
}

// Function to create a notification for unfollowing a user
async function createUnfollowNotification(u) {
  const notificationsRef = collection(db, 'notifications')
  const notification = {
    sender: currentProfile.value.name,
    receiver: u.id,
    date: new Date().toISOString(), // Current timestamp
    message : 'has unfollowed you !'
  }

  // Add the notification to Firestore
  await addDoc(notificationsRef, notification)
}



// Fonction pour créer une notification de suivi
async function createFollowNotification(u) {
  const notificationsRef = collection(db, 'notifications')
  const notification = {
    sender: currentProfile.value.name,
    receiver: u.id,
    date: new Date().toISOString(), // Current timestamp
    message : 'is following you now !'
  }

  // Ajouter la notification à Firestore
  await addDoc(notificationsRef, notification)
}

// Accepter mutuellement (invitations)
async function acceptInvitation(u) {
  const meRef  = doc(db, 'users', currentUser.value.uid)
  const youRef = doc(db, 'users', u.id)

  const myArr  = [...(currentProfile.value.followings || [])]
  const yourArr = [...(u.followings || [])]

  myArr.push(u.id)
  yourArr.push(currentUser.value.uid)

  const batch = writeBatch(db)
  batch.update(meRef, { followings: myArr })
  batch.update(youRef, { followings: yourArr })

  await batch.commit()
}

// View user profile in modal
function viewProfile(u) {
  selectedUser.value = u
  nextTick(() => {
    if (progressChart.value && !progressChartInstance) {
      progressChartInstance = new Chart(progressChart.value, {
        type: 'bar',
        data: {
          labels: ['Objectifs', 'Projets', 'Compétences'],
          datasets: [{
            label: 'Progression',
            data: [
              u.objectivesCount,
              u.projectsCount,
              u.skillsCount
            ],
            backgroundColor: '#38b2ac',
            borderColor: '#38b2ac',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
  })
}

// Fermer modal
function closeModal() {
  selectedUser.value = null
}
</script>

<style scoped>
  .users-page {
    max-width: 1200px; margin: auto; padding: 2rem;
    font-family: 'Segoe UI', sans-serif; color: #1a202c;
  }
  h1 { text-align:center; margin-bottom:1.5rem; }
  .controls {
    display:flex; gap:1rem; margin-bottom:1.5rem;
    flex-wrap:wrap; justify-content:space-between;
  }
  .search-bar {
    flex:1; min-width:200px; padding:.75rem;
    border:1px solid #cbd5e0; border-radius:8px;
  }
  .toggle-view {
    padding:.75rem 1.5rem; background:#4299e1;
    color:#fff; border:none; border-radius:8px;
    cursor:pointer; transition:background .2s;
  }
  .toggle-view:hover { background:#3182ce; }
  .users-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
    gap:1.5rem;
  }
  .user-card {
    background:#fff; border-radius:12px;
    box-shadow:0 2px 10px rgba(0,0,0,0.08);
    padding:1.25rem; transition:transform .2s,box-shadow .2s;
  }
  .user-card:hover {
    transform:translateY(-2px);
    box-shadow:0 4px 12px rgba(0,0,0,0.12);
  }
  .card-header {
    display:flex; align-items:center; gap:1rem; margin-bottom:1rem;
  }
  .avatar {
    width:50px;height:50px;border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-weight:600; font-size:1.25rem;
  }
  .info h2 { margin:0; font-size:1.1rem; }
  .info p { margin:.25rem 0 0; font-size:.85rem; color:#718096; }
  .connection-status span {
    display:inline-block; padding:.25rem .5rem;
    border-radius:12px; font-size:.75rem; font-weight:500;
  }
  .friend-badge { background:#48bb78; color:#fff; }
  .following-badge { background:#4299e1; color:#fff; }
  .follower-badge  { background:#a0aec0; color:#fff; }
  .stats {
    display:flex; justify-content:space-between;
    margin:1rem 0; padding:.75rem 0;
    border-top:1px solid #edf2f7; border-bottom:1px solid #edf2f7;
    font-size:.85rem; color:#4a5568;
  }
  .actions { display:flex; gap:.5rem; }
  .follow-btn, .unfollow-btn, .view-btn {
    flex:1; padding:.5rem; border:none; border-radius:6px;
    font-weight:500; cursor:pointer; transition:background .2s;
  }
  .follow-btn { background:#4299e1; color:#fff; }
  .follow-btn:hover { background:#3182ce; }
  .unfollow-btn { background:#e53e3e; color:#fff; }
  .unfollow-btn:hover { background:#c53030; }
  .view-btn { background:#edf2f7; color:#4a5568; }
  .view-btn:hover { background:#e2e8f0; }
  .view-btn:disabled { opacity:.5; cursor:not-allowed; }
  
  /* Modal */
  .modal-overlay {
    position:fixed; inset:0;
    background:rgba(0,0,0,0.5);
    display:flex; align-items:center; justify-content:center;
    z-index:1000;
  }
  .modal {
    background:#fff; border-radius:12px;
    width:90%; max-width:700px; max-height:90vh;
    overflow-y:auto; position:relative;
    box-shadow:0 10px 25px rgba(0,0,0,0.2);
  }
  .modal-header {
    padding:2rem; color:#fff; text-align:center;
    border-top-left-radius:12px; border-top-right-radius:12px;
  }
  .avatar-large {
    width:80px;height:80px;border-radius:50%;
    background:rgba(255,255,255,0.3);
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 1rem; font-size:2rem; font-weight:bold;
  }
  .modal-body { padding:1.5rem; }
  .chart-container { margin-bottom:2rem; }
  .section { margin-bottom:1.5rem; }
  .section h3 { margin-bottom:.5rem; color:#2d3748; }
  .section ul { list-style:none; padding:0; margin:0; }
  .section li {
    padding:.75rem; border-bottom:1px solid #edf2f7;
    display:flex; justify-content:space-between;
  }
  .modal-close {
    position:absolute; top:1rem; right:1rem;
    background:none; border:none; font-size:1.5rem;
    cursor:pointer; color:#fff;
  }
  @media(max-width:768px){
    .controls { flex-direction:column; }
    .search-bar { width:100%; }
    .users-grid { grid-template-columns:1fr; }
  }
</style>
