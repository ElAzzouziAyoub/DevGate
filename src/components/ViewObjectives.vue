<template>
  <div>
    <div class="profile-header" :style="{ backgroundColor: color }">
      <div class="color">
        <h2 class="profilename" :style="{ color: colorw }">
          {{ data?.name?.[0]?.toUpperCase() || "?" }}
        </h2>
        <input v-model="color" type="color" @change="changeColor" />
      </div>
    </div>
    <div class="profile-info">
      <h2>{{ data?.name || "Nom d'utilisateur" }}</h2>
      <p>Email: {{ user?.email || "Email non disponible" }}</p>
      <p>
        Account creation time :
        {{ auth.currentUser?.metadata?.creationTime || "Inconnu" }}
      </p>
    </div>
    <div class="view-objectif">
      <article
        v-for="(objectif, index) in mes_objectifs"
        :key="index"
        class="objective-card"
      >
        <header class="objective-header">
          <h2 class="objective-title">{{ objectif.title }}</h2>
          <div class="objective-meta">
            <span class="meta-item difficulty" :class="objectif.difficulte">
              {{ objectif.difficulte }}
            </span>
            <span class="meta-item duration"> {{ objectif.duree }} mins </span>
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
  </div>
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted } from "vue";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useRouter, useRoute } from "vue-router";

const auth = getAuth();
const db = getFirestore();
const user = auth.currentUser;
const data = ref(null);
const color = ref("#ffffff");
const colorw = ref("white");
const mes_objectifs = ref([]);
const router = useRouter();
onMounted(async () => {
  if (user) {
    await fetchUser();
    if (!user) {
      alert("user not authentified");
      return;
    }
    const objectifref = collection(db, "objectives");
    const q = query(objectifref, where("user_id", "==", user.uid));
    try {
      const querySnapshot = await getDocs(q);
      mes_objectifs.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      alert(error);
    }
  }
});

const fetchUser = async () => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      data.value = docSnap.data();
      color.value = data.value.color || "#ffffff";
    }
  }
};

const changeColor = async () => {
  if (!user) {
    alert("User not authenticated!");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  try {
    await updateDoc(userRef, { color: color.value });
  } catch (error) {
    alert("Error updating color: " + error.message);
  }
};

function formatDate(firebaseDate) {
  if (!firebaseDate) return "No date";

  try {
    const date = firebaseDate.toDate
      ? firebaseDate.toDate()
      : new Date(firebaseDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return "Invalid date";
  }
}

async function incrementer(index1, index2) {
  const objectif = mes_objectifs.value[index1];
  const subskill = objectif.subskills[index2];

  if (subskill.done === false) {
    subskill.done = true;
    objectif.progression += 1 / objectif.subskills.length;
  } else {
    subskill.done = false;
    objectif.progression -= 1 / objectif.subskills.length;
  }

  try {
    const objectifRef = doc(db, "objectives", objectif.id);
    await updateDoc(objectifRef, {
      progression: objectif.progression,
      subskills: objectif.subskills,
    });
    console.log("Mise à jour réussie dans Firestore");
  } catch (error) {
    console.error("Erreur lors de la mise à jour dans Firestore: ", error);
  }
}

async function supprimer(id, index) {
  try {
    await deleteDoc(doc(db, "objectives", id));
    mes_objectifs.value.splice(index, 1);
    alert("Document supprimé :" + id);
  } catch (e) {
    alert("Erreur lors de la suppression :" + e);
  }
}

function edit(id) {
  router.push(`/edit/${id}`);
}
</script>

<style>
.profile-page {
  padding: 40px 20px;
  background-color: #f8fbff;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #003366;
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

@media (max-width: 640px) {
  .objective-meta {
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  .objective-card {
    padding: 1.25rem;
  }
}
</style>
