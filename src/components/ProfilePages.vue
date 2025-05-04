<template>
    <div class="profile-container" v-if="!loading">
      <!-- Entête du profil -->
      <div class="profile-header">
        <div class="avatar-container">
          <img
            v-if="userData?.profImage"
            :src="userData.profImage"
            alt="Photo de profil"
            class="profile-avatar"
          />
          <div v-else class="default-avatar">
            ?
          </div>
        </div>
        <h1>{{ userData?.name || "Utilisateur" }}</h1>
        <p class="email">{{ userData?.email }}</p>
        <p class="member-since">Membre depuis {{ userData?.JoinDate }}</p>
      </div>
  
      <!-- Statistiques utilisateur -->
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-value">
            {{ numDiscussions }}
          </span>
          <span class="stat-label">Discussions</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ numReplies }}</span>
          <span class="stat-label">Réponses</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userData?.numUpvotes || 0 }}</span>
          <span class="stat-label">Upvotes</span>
        </div>
      </div>
  
      <!-- Activité récente -->
      <div class="activity-section">
        <h2>Activité récente</h2>
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
        <h2>Mes discussions</h2>
        <div v-if="myDiscussions.length">
          <DiscussionItem v-for="discussion in myDiscussions" :key="discussion.id" :discussion="discussion" />
        </div>
        <p v-else>Aucune discussion publiée.</p>
      </div>
    </div>
    <div v-else>
      <p>Chargement du profil …</p>
    </div>
  </template>
  
  <script setup>
  /*eslint-disable*/
  /*eslint-disable vue/multi-word-component-names*/
  import { ref, onMounted, computed } from "vue";
  import { useRouter } from "vue-router";
  import { onAuthStateChanged } from "firebase/auth";
  import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
  } from "firebase/firestore";
  import { auth } from "@/composables/useAuth";
  import { db } from "@/composables/useFirestore";
  import DiscussionItem from "@/components/DiscussionItem.vue";

  const props = defineProps({
    userUID: String,
  });
  
  // Références réactives
  const router = useRouter();
  const userData = ref(null);
  const numDiscussions = ref(0);
  const numReplies = ref(0);
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
    } finally {
      loading.value = false;
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
  
  // Écouter l'état d'authentification et charger les données correspondantes
  onMounted(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        loadProfileData(props.userUID);
        loadMyDiscussions(props.userUID);
        loadNumDiscussions(props.userUID);
        loadNumReplies(props.userUID);
      } else {
        router.push("/");
      }
    });
  });
  </script>

  
<style scoped>
.profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}
.profile-header {
  text-align: center;
  margin-bottom: 2rem;
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
h1 {
  margin: 0.5rem 0;
  font-size: 1.8rem;
}
.email {
  color: #666;
  margin: 0.25rem 0;
}
.member-since {
  color: #888;
  font-size: 0.9rem;
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
.dateInfo {
  font-size: 0.8rem;
  color: #666;
}
</style>
