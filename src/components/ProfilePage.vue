<template>
  <DevGateNavBar ></DevGateNavBar>
  
    <div class="profile-page">
      <div class="avatar-container">
          <img
            v-if="data?.profImage"
            :src="data.profImage"
            alt="Photo de profil"
            class="profile-avatar"
          />
          <div v-else class="default-avatar">
            ?
          </div>
        </div>
  
      <div class="profile-info">
        <h2>{{ data?.name || "Nom d'utilisateur" }}</h2>
        <p>Email: {{ user?.email || "Email non disponible" }}</p>
        <p>Created at: {{ formatDate(user?.metadata?.creationTime) }}</p>
      </div>
  
      <div class="stats-contain">
        <div class="stats">
          <h3>Objectives</h3>
          <p>{{ mes_objectifs.length }}</p>
        </div>
        <div class="stats">
          <h3>Projects</h3>
          <p>{{ mes_projets.length }}</p>
        </div>
        <div class="stats">
          <h3>Compétences</h3>
          <p>{{ mes_competences.length }}</p>
        </div>
        <div class="stats">
          <h3>Friends</h3>
          <p>{{ followingsCount }}</p>
        </div>
      </div>
  
      <div class="charts-container">
        <div class="chart-card">
          <h3>Objectives Progression</h3>
          <canvas ref="objectivesChart"></canvas>
        </div>
        <div class="chart-card">
          <h3>Competence Repartitions</h3>
          <canvas ref="skillsChart"></canvas>
        </div>
      </div>
  
      <div class="tabs">
        <button
          @click="activeTab = 'objectives'"
          :class="{ active: activeTab === 'objectives' }"
        >
          Objectifs
        </button>
        <button
          @click="activeTab = 'projects'"
          :class="{ active: activeTab === 'projects' }"
        >
          Projets
        </button>
        <button
          @click="activeTab = 'skills'"
          :class="{ active: activeTab === 'skills' }"
        >
          Compétences
        </button>
        <button
          @click="activeTab = 'discussions'"
          :class="{ active: activeTab === 'discussions' }"
        >
          Discussions
        </button>

      </div>
  
      <div class="view-objectif" v-if="activeTab === 'objectives'">
        <article
          v-for="(objectif, index) in mes_objectifs"
          :key="index"
          class="objective-card"
        >
          <header class="objective-header">
            <h2 class="objective-title">{{ objectif.title }}</h2>
            <div class="objective-meta">
              <span
                class="meta-item difficulty"
                :class="objectif.difficulte"
              >
                {{ objectif.difficulte }}
              </span>
              <span class="meta-item duration">
                {{ objectif.duree }} mins
              </span>
              <span class="meta-item progress">
                {{ (objectif.progression * 100).toFixed(1) }}% complete
              </span>
              <time class="meta-item date">
                {{ formatDate(objectif.created_at) }}
              </time>
            </div>
          </header>
  
          <p class="objective-description">
            {{ objectif.description }}
          </p>
  
          <div class="subskills-container">
            <h3 class="subskills-title">Subskills</h3>
            <ul class="subskills-list">
              <li
                v-for="(element, sbindex) in objectif.subskills"
                :key="sbindex"
                class="subskill-item"
              >
                <label class="subskill-label">
                  <input
                    type="checkbox"
                    class="subskill-checkbox"
                    v-model="objectif.subskills[sbindex].done"
                    @click="incrementer(index, sbindex)"
                  />
                  <span class="subskill-text">{{ element.text }}</span>
                </label>
              </li>
            </ul>
          </div>
          <div>
            <button @click="edit(objectif.id)">Edit</button>
            <button @click="supprimer(objectif.id, index)">Delete</button>
          </div>
        </article>
      </div>
  
      <div class="view-projects" v-if="activeTab === 'projects'">
        <router-link to="/project">View my projects</router-link>
        <article
          v-for="(project, index) in mes_projets"
          :key="index"
          class="project-card"
        >
          <header class="project-header">
            <h2 class="project-title">{{ project.title }}</h2>
            <div class="project-meta">
              <span class="meta-item status" :class="project.status">
                {{ project.status }}
              </span>
              <time class="meta-item date">
                {{ formatDate(project.created_at) }}
              </time>
            </div>
          </header>
  
          <p class="project-description">
            {{ project.description }}
          </p>
  
          <div v-if="project.tasks && project.tasks.length" class="tasks-container">
            <h3 class="tasks-title">Tasks</h3>
            <ul class="tasks-list">
              <li
                v-for="(task, taskIndex) in project.tasks"
                :key="taskIndex"
                class="task-item"
                :class="{ completed: task.completed }"
              >
                {{ task.name }}
              </li>
            </ul>
          </div>
        </article>

      </div>
  
      <div class="view-skills" v-if="activeTab === 'skills'">
        <router-link to="/competence">View my competences</router-link>
        <div class="skills-grid">
          <div
            v-for="(skill, index) in mes_competences"
            :key="index"
            class="skill-card"
          >
            <h3>{{ skill.name }}</h3>
            <div class="skill-level">
              <div class="level-bar" :style="{ width: skill.level + '%' }"></div>
              <span>{{ skill.level }}%</span>
            </div>
            <p>{{ skill.description }}</p>
          </div>
        </div>
      </div>

      <div class="view-discussion" v-if="activeTab === 'discussions'">
          <div class="stats-container">
          <div class="stat-item">
            <span class="stat-value">
              {{ numDiscussions }}
            </span>
            <span class="stat-label">Discussions</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ numReplies }}</span>
            <span class="stat-label">Replies</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ data?.numUpvotes || 0 }}</span>
            <span class="stat-label">Upvotes</span>
          </div>
        </div>
  
      <!-- Activité récente -->
      <div class="activity-section">
        <h2>Recent Activity</h2>
        <div v-if="recentActivity.length">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-item"
          >
            <p class="activity-type">
              {{ activity.activity }}
            </p>
            <p class="activity-title">{{ activity.content }}</p>
            <p class="activity-date">{{ activity.StringDate }}</p>
          </div>
        </div>
        <p v-else class="no-activity">Aucune activité récente</p>
      </div>
  
      <!-- Section Mes discussions -->
      <div class="my-discussions-section">
        <h2>My discussions</h2>
        <div v-if="myDiscussions.length">
          <DiscussionItem v-for="discussion in myDiscussions" :key="discussion.id" :discussion="discussion" />
        </div>
        <p v-else>Aucune discussion publiée.</p>
      </div>


      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, nextTick, computed } from 'vue'
  import {useRouter } from 'vue-router'
  import Chart from 'chart.js/auto'
  import { getAuth, onAuthStateChanged } from 'firebase/auth'
  import DiscussionItem from './DiscussionItem.vue'
  import DevGateNavBar from './DevGateNavBar.vue'
  import {
    getFirestore,
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    deleteDoc
  } from 'firebase/firestore'
  
  // --- Références Firebase ---
  const auth = getAuth()
  const db = getFirestore()
  
  // --- State réactif ---
  const router = useRouter();
  const activeTab = ref("objectives")
  const user = ref(null)
  const data = ref({})
  const mes_objectifs = ref([])
  const mes_projets = ref([])
  const mes_competences = ref([])
  const followings = ref([])
  const followingsCount = ref(0)
  const numDiscussions = ref(0)
  const numReplies = ref(0)
  
  // --- Chart refs ---
  const objectivesChart = ref(null)
  const skillsChart = ref(null)
  let objectivesChartInstance = null
  let skillsChartInstance = null
  const loading = ref(true);


  const recentActivity = ref([]);
  const myDiscussions = ref([]);
  
  // Charger les données de profil (informations, stats, activité)
  const loadProfileData = async (uid) => {
    try {
  
      // Récupérer l'activité récente (discussions et réponses) de l'utilisateur
      const activityQuery = query(
        collection(db, "Activities"),
        where("userUID", "==", uid),
        orderBy("atDate", "desc"),
        limit(5)
      );
      const activitySnapshot = await getDocs(activityQuery);
      recentActivity.value = activitySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
    } 
  };
  
  // Charger les discussions créées par l'utilisateur
  const loadMyDiscussions = async (uid) => {
    try {
      const discussionsQuery = query(
        collection(db, "Discussions"),
        where("authorId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(10),
      );
      const discussionsSnapshot = await getDocs(discussionsQuery);
      myDiscussions.value = discussionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Erreur lors du chargement des discussions:", error);
    }
  };
  
  const loadNumDiscussions = async (uid) => {
    try {
      const discussionsQuery = query(
        collection(db, "Discussions"),
        where("authorId", "==", uid),
      );
  
      const discussionsSnapshot = await getDocs(discussionsQuery);
      numDiscussions.value = discussionsSnapshot.size;
    } catch (error) {
      console.error("Erreur lors du chargement des discussions:", error);
    }
  };
  
  const loadNumReplies = async (uid) => {
    try {
      const repliesQuery = query(
        collection(db, "Replies"),
        where("authorId", "==", uid),
      );
      
      const repliesSnapshot = await getDocs(repliesQuery);
      numReplies.value = repliesSnapshot.size;
    } catch (error) {
      console.error("Erreur lors du chargement des discussions:", error);
    }
  };
  
  
  // --- Computed pour avatar et contraste ---
  const userInitial = computed(() => data.value.name?.[0]?.toUpperCase() || '?')
  const contrastColor = computed(() => {
    const hex = color.value.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  })



  const edit = (id) => {
    router.push(`/editobjectives/${id}` )

  }
  
  // --- Au montage, on récupère l'utilisateur et les données ---
  onMounted(() => {
    onAuthStateChanged(auth, async u => {
      if (!u) return
      user.value = u
      await fetchProfile()
      await Promise.all([
        fetchObjectives(),
        fetchProjects(),
        fetchSkills(),
        fetchFollowings(),
        loadNumDiscussions(),
        loadMyDiscussions(),
        loadNumReplies(),
        loadProfileData()
        
      ])
    })
  })
  
  // --- Fonctions de fetch Firestore ---
  async function fetchProfile() {
    try {
      const snap = await getDoc(doc(db, 'users', user.value.uid))
      if (!snap.exists()) return
      data.value = snap.data()
      followingsCount.value = data.value.followings?.length || 0
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
    }
  }
  
  async function fetchObjectives() {
    try {
      const q = query(
        collection(db, 'objectives'),
        where('UserUID', '==', user.value.uid)
      )
      const snap = await getDocs(q)
      mes_objectifs.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      initObjectivesChart()
    } catch (error) {
      console.error("Erreur lors de la récupération des objectifs:", error)
    }
  }
  
  async function fetchProjects() {
    try {
      const q = query(
        collection(db, 'projects'),
        where('UserUID', '==', user.value.uid)
      )
      const snap = await getDocs(q)
      mes_projets.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error)
    }
  }
  
  async function fetchSkills() {
    try {
      const q = query(
        collection(db, 'competences'),
        where('UserUID', '==', user.value.uid)
      )
      const snap = await getDocs(q)
      mes_competences.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      initSkillsChart()
    } catch (error) {
      console.error("Erreur lors de la récupération des compétences:", error)
    }
  }
  
  async function fetchFollowings() {
    try {
      const list = data.value.followings || []
      const snaps = await Promise.all(
        list.map(uid => getDoc(doc(db, 'users', uid)))
      )
      followings.value = snaps
        .filter(s => s.exists())
        .map(s => ({ id: s.id, ...s.data() }))
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnements:", error)
    }
  }
  
  // --- Formatage de date ---
  function formatDate(d) {
    if (!d) return 'Inconnu'
    try {
      const dt = d.toDate ? d.toDate() : new Date(d)
      return dt.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Date invalide'
    }
  }
  
  // --- Changement de couleur profil ---
  async function changeColor() {
    try {
      await updateDoc(doc(db, 'users', user.value.uid), { color: color.value })
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la couleur:", error)
    }
  }

  async function supprimer(id, index) {
  try {
    await deleteDoc(doc(db, "objectives", id));
    mes_objectifs.value.splice(index, 1);
    router.push("/profile")
  } catch (e) {
    alert("Erreur lors de la suppression :" + e);
  }
}
  
  // --- Lorsque l'on coche une subskill ---
  async function incrementer(objIdx, subIdx) {
    try {
      const obj = mes_objectifs.value[objIdx]
      const sub = obj.subskills[subIdx]
      sub.done = !sub.done
  
      // recalcul progression
      const doneCount = obj.subskills.filter(s => s.done).length
      obj.progression = doneCount / obj.subskills.length
  
      // maj Firestore
      await updateDoc(doc(db, 'objectives', obj.id), {
        progression: obj.progression,
        subskills: obj.subskills
      })
  
      // mise à jour immédiate du chart
      updateObjectivesChart()
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la subskill:", error)
    }
  }
  
  // --- Initialisation des charts ---
  function initObjectivesChart() {
    if (!objectivesChart.value || !mes_objectifs.value.length) return
    objectivesChartInstance?.destroy()
    const ctx = objectivesChart.value.getContext('2d')
    objectivesChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: mes_objectifs.value.map(o => o.titre),
        datasets: [{
          label: 'Progression (%)',
          data: mes_objectifs.value.map(o => Math.round(o.progression * 100)),
          backgroundColor: '#3a86ff',
          borderColor: '#2667cc',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: v => v + '%' }
          }
        }
      }
    })
  }
  
  function initSkillsChart() {
    if (!skillsChart.value || !mes_competences.value.length) return
    skillsChartInstance?.destroy()
    const ctx = skillsChart.value.getContext('2d')
    skillsChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: mes_competences.value.map(s => s.name),
        datasets: [{
          data: mes_competences.value.map(s => s.level),
          backgroundColor: ['#3a86ff','#ff006e','#8338ec','#fb5607','#ffbe0b'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right' } }
      }
    })
  }
  
  function updateObjectivesChart() {
    if (!objectivesChartInstance) return
    objectivesChartInstance.data.datasets[0].data = mes_objectifs.value.map(o =>
      Math.round(o.progression * 100)
    )
    objectivesChartInstance.update()
  }
  
  // --- Watchers pour rafraîchir les charts automatiquement ---
  watch(
    mes_objectifs,
    () => nextTick(initObjectivesChart),
    { deep: true }
  )
  watch(
    mes_competences,
    () => nextTick(initSkillsChart),
    { deep: true }
  )
  </script>
  
  <style scoped>
  /* ... (tes styles existants) ... */
  .chart-card {
    position: relative;
    height: 250px;
  }
  </style>
  
  <style>
  
  .profile-page {
    padding: 40px 20px;
    background-color: #f8fbff;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    color: #003366;
    max-width: 1200px;
    margin: 0 auto;

  }
  
  .profile-header {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-top:60px;
  }
  
  .profilename {
    font-size: 60px;
    font-weight: bold;
    color: white;
    margin: 0;
  }
  
  .color {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 15px;
  }
  
  .color input {
    width: 35px;
    height: 35px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 0 2px #005a9c;
    background-color: white;
    margin-top: 10px;
    transition: box-shadow 0.2s ease;
  }
  
  .color input:hover {
    box-shadow: 0 0 0 3px #007acc;
  }
  
  .profile-info {
    text-align: center;
    margin-top: 25px;
  }
  
  .profile-info h2 {
    font-size: 26px;
    color: #003366;
    margin-bottom: 5px;
  }
  
  .profile-info p {
    font-size: 18px;
    color: #555;
  }
  
  /* Stats container */
  .stats-contain {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }
  
  .stats {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .stats h3 {
    font-size: 1rem;
    color: #4a5568;
    margin: 0 0 0.5rem 0;
  }
  
  .stats p {
    font-size: 1.8rem;
    font-weight: bold;
    color: #2d3748;
    margin: 0;
  }
  
  /* Charts container */
  .charts-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin: 2rem 0;
  }
  
  .chart-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .chart-card h3 {
    font-size: 1.1rem;
    color: #2d3748;
    margin: 0 0 1rem 0;
    text-align: center;
  }
  
  /* Tabs */
  .tabs {
    display: flex;
    justify-content: center;
    margin: 2rem 0 1rem;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .tabs button {
    padding: 0.75rem 1.5rem;
    margin: 0 0.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    font-size: 1rem;
    color: #4a5568;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .tabs button:hover {
    color: #2d3748;
  }
  
  .tabs button.active {
    color: #4299e1;
    border-bottom-color: #4299e1;
    font-weight: 600;
  }
  
  /* Objectives view (existing styles) */
  .view-objectif {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
    display: grid;
    gap: 1.5rem;
  }
  
  .objective-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .objective-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  .objective-header {
    margin-bottom: 1rem;
  }
  
  .objective-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 0.5rem 0;
  }
  
  .objective-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #4a5568;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
  }
  
  .meta-item::before {
    content: "•";
    margin-right: 0.5rem;
    color: #cbd5e0;
  }
  
  .meta-item:first-child::before {
    content: none;
  }
  
  .difficulty {
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .difficulty.facile {
    background-color: #f0fff4;
    color: #38a169;
  }
  
  .difficulty.moyen {
    background-color: #fffaf0;
    color: #dd6b20;
  }
  
  .difficulty.difficile {
    background-color: #fff5f5;
    color: #e53e3e;
  }
  
  .objective-description {
    color: #4a5568;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
  }
  
  .subskills-container {
    border-top: 1px solid #edf2f7;
    padding-top: 1rem;
  }
  
  .subskills-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 0.75rem 0;
  }
  
  .subskills-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }
  
  .subskill-item {
    display: flex;
    align-items: center;
  }
  
  .subskill-label {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background-color 0.2s ease;
    cursor: pointer;
  }
  
  .subskill-label:hover {
    background-color: #f7fafc;
  }
  
  .subskill-checkbox {
    margin-right: 0.75rem;
    width: 1.1rem;
    height: 1.1rem;
    accent-color: #4299e1;
  }
  
  .subskill-text {
    color: #4a5568;
    font-size: 0.95rem;
  }
  
  /* Projects view */
  .view-projects {
    max-width: 800px;}
  /* Conteneur principal */
.view-projects, .view-skills, .view-followings {
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* --- Projets --- */

.project-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease;
}
.project-card:hover {
  transform: translateY(-4px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.project-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a202c;
  margin: 0;
}

.project-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #718096;
}

.meta-item {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.status {
  text-transform: capitalize;
  font-weight: bold;
}

.status.pending {
  background-color: #fefcbf;
  color: #b7791f;
}

.status.completed {
  background-color: #c6f6d5;
  color: #2f855a;
}

.status.in_progress {
  background-color: #bee3f8;
  color: #3182ce;
}

.project-description {
  color: #4a5568;
  margin: 1rem 0;
}

/* Tasks */

.tasks-container {
  margin-top: 1rem;
}

.tasks-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.tasks-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  padding: 0.5rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  background-color: #edf2f7;
  color: #2d3748;
  transition: background-color 0.2s;
}

.task-item.completed {
  background-color: #d4f5dc;
  color: #2f855a;
  text-decoration: line-through;
}

/* --- Compétences --- */

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.skill-card h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2d3748;
}

.skill-level {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  gap: 0.5rem;
}

.level-bar {
  height: 8px;
  background-color: #3182ce;
  border-radius: 4px;
  flex-grow: 1;
  transition: width 0.3s;
}

.skill-card p {
  font-size: 0.9rem;
  color: #4a5568;
}

/* --- Followings --- */

.empty-state {
  text-align: center;
  font-size: 1rem;
  color: #718096;
}

.followings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.following-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.following-avatar {
  width: 50px;
  height: 50px;
  margin: 0 auto 0.5rem;
  font-size: 1.5rem;
  color: white;
  background-color: #718096;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.following-card h3 {
  margin: 0.5rem 0 0.25rem;
  font-size: 1rem;
  color: #2d3748;
}

.following-card p {
  font-size: 0.85rem;
  color: #4a5568;
}

.avatar-container {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.default-avatar {
  font-size: 3rem;
  font-weight: bold;
  color: #666;
}
.stats-container {
  display: flex;
  justify-content: space-around;
  margin: 2rem 0;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}
.stat-item {
  text-align: center;
}
.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #0079d3;
}
.stat-label {
  font-size: 0.9rem;
  color: #666;
}
.activity-section {
  margin: 2rem 0;
}
.activity-section h2 {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.activity-item {
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
  background-color: #f9f9f9;
}
.activity-type {
  font-size: 0.8rem;
  color: #0079d3;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}
.activity-title {
  font-weight: 500;
  margin: 0.25rem 0;
}
.activity-date {
  font-size: 0.8rem;
  color: #666;
}
.no-activity {
  color: #666;
  font-style: italic;
  text-align: center;
}
.my-discussions-section {
  margin: 2rem 0;
}
.my-discussions-section h2 {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.discussion-item {
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 4px;
  background-color: #f0f8ff;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.discussion-item:hover {
  background-color: #e6f2ff;
}

  
    </style>