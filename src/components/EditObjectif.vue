<template>
  <div class="createobjectf">
    <h1>creer votre objectf</h1>
    <form class="objectf-form">
      <label>Title: </label>
      <input
        type="text"
        v-model="objectif.titre"
        placeholder="Enter title"
        required
      />
      <label>Description: </label>
      <textarea
        v-model="objectif.description"
        placeholder="Enter descrviewobjectivesiption"
        required
      ></textarea>
      <label>Estimated duration: </label>
      <input
        type="number"
        v-model="objectif.estimatedDuration"
        placeholder="Enter estimated duration"
        required
      />
      <h3>Subskills:</h3>
      <div v-for="(subskill, index) in objectif.subskills" :key="index">
        <input
          type="text"
          v-model="subskill.text"
          placeholder="Enter subskill "
          required
        />
        <button @click.prevent="Delete(index)">Delete subskill</button>
      </div>
      <button @click.prevent="AjouterSubskill">+ Ajouter subskill</button>
      <button @click.prevent="handleSubmit">Save changes</button>
    </form>
  </div>
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { doc, addDoc, collection, getDoc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const auth = getAuth();
const user = ref(auth.currentUser);
const router = useRouter();
const db = getFirestore();
const route = useRoute();
const id = ref(route.params.id);
const objectif = ref([{}]);

function createsubskill() {
  return {text:"",done:false};
}

function AjouterSubskill(){
  for(const element of objectif.value.subskills){
    if (element.text.trim()===''){
      alert("you cannot add a new subskill");
      return;
    }
  } 
  
    const subskill=createsubskill();
    objectif.value.subskills.push(subskill);
  
  
}
onMounted(() => {
  auth.onAuthStateChanged((u) => {
    user.value = u;
  });
  fetchobjectif();
});
async function Delete(index) {
if (!objectif.value) {
  console.error("Objectif non défini");
  return;
}

// Supprimer la sous-compétence
const subskill = objectif.value.subskills[index];  // Sous-compétence à supprimer
if (!subskill) {
  console.error("Sous-compétence non trouvée");
  return;
}

// Si la sous-compétence est marquée comme "done", ajuster la progression
if (subskill.done) {
  subskill.done = false;  // Mettre à jour l'état "done"
  objectif.value.progression -= 1 / objectif.value.subskills.length;  // Décrémente la progression
}

// Supprimer la sous-compétence de la liste
objectif.value.subskills.splice(index, 1);

// Recalculer la progression en fonction des sous-compétences restantes
objectif.value.progression = objectif.value.subskills.filter(sub => sub.done).length / objectif.value.subskills.length;

// Mettre à jour Firestore avec la nouvelle progression et les sous-compétences
try {
  const objectifRef = doc(db, "objectives", objectif.value.id); // Référence du document de l'objectif
  await updateDoc(objectifRef, {
    progression: objectif.value.progression,
    subskills: objectif.value.subskills, // Met à jour l'ensemble des sous-compétences
  });
  console.log("Mise à jour réussie dans Firestore");
} catch (error) {
  console.error("Erreur lors de la mise à jour dans Firestore: ", error);
}
}


async function fetchobjectif() {
  try {
    const docRef = doc(db, "objectives", id.value);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      objectif.value = docSnap.data();
    } else {
      alert("unfound objectif!");
    }
  } catch (error) {
    alert("error");
  }
}


const handleSubmit= async () => {
  await updateDoc(doc(db, "objectives", id.value), {
    titre: objectif.value.titre,
    description: objectif.value.description,
    estimatedDuration: objectif.value.estimatedDuration,
    subskills: objectif.value.subskills,
    created_at:new Date(),

  });
  router.push("/viewobjectives")
};
</script>
<style scoped>
.createobjectf {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.createobjectf h1 {
  text-align: center;
  margin-bottom: 1.8rem;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.objectf-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.objectf-form label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.95rem;
  margin-bottom: -0.5rem;
}

.objectf-form input[type="text"],
.objectf-form input[type="number"],
.objectf-form textarea,
.objectf-form select {
  padding: 0.8rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.25s ease;
  background-color: #f8fafc;
}

.objectf-form textarea {
  min-height: 100px;
  resize: vertical;
}

.objectf-form input:hover,
.objectf-form textarea:hover,
.objectf-form select:hover {
  border-color: #cbd5e0;
}

.objectf-form input:focus,
.objectf-form textarea:focus,
.objectf-form select:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  background-color: #ffffff;
  outline: none;
}

.objectf-form h3 {
  margin: 1.5rem 0 0.5rem;
  color: #4a5568;
  font-size: 1.1rem;
}

.objectf-form button {
  padding: 0.8rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.objectf-form button[type="submit"] {
  background: #4299e1;
  color: white;
  margin-top: 1rem;
}

.objectf-form button[type="button"] {
  background: #48bb78;
  color: white;
}

.objectf-form button:hover {
  transform: translateY(-1px);
}

.objectf-form button[type="submit"]:hover {
  background: #3182ce;
  box-shadow: 0 2px 8px rgba(49, 130, 206, 0.3);
}

.objectf-form button[type="button"]:hover {
  background: #38a169;
  box-shadow: 0 2px 8px rgba(56, 161, 105, 0.3);
}

/* Animation for form */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.createobjectf {
  animation: fadeIn 0.4s ease-out forwards;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .createobjectf {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>