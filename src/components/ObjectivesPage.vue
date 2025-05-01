<template>
  <div class="createobjectf">
    <h1>creer votre objectf</h1>
    <form @submit.prevent="handleSubmit" class="objectf-form">
      <label>Titre: </label>
      <input
        type="text"
        v-model="title"
        placeholder="Entrer votre objectif"
        required
      />
      <label>Choisir la difficulte de cet objectif</label>
      <select v-model="difficulte">
        <option value="difficile">difficile</option>
        <option value="moyen">moyen</option>
        <option value="facile">facile</option>
      </select>
      <label>Description: </label>
      <textarea
        v-model="description"
        placeholder="Enter description"
        required
      ></textarea>
      <label>Estimated duration: </label>
      <input
        type="number"
        v-model="estimatedDuration"
        placeholder="Enter estimated duration"
        required
      />
      <h3>Subskills:</h3>
      <div v-for="(subskill, index) in subskills" :key="index">
        <input
          type="text"
          v-model="subskills[index].text"
          placeholder="Enter subskill "
          required
        />
      </div>
      <button type="button" @click.prevent="AjouterSubskill">
        + Ajouter subskill
      </button>
      <button type="submit">Submit Objectif</button>
    </form>
  </div>
  <button @click="profile">Voir mes objectifs</button>
</template>

<script setup>
/*eslint-disable*/
import { ref } from "vue";
import { useRouter } from "vue-router";
import { collection, addDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getAuth,onAuthStateChanged } from "firebase/auth";
const title = ref("");
const description = ref("");
const estimatedDuration = ref(0);
const subskills = ref([createsubskill()]);
const router = useRouter();
const db=getFirestore();
const user_id=ref(null);
const auth=getAuth();
const difficulte=ref("");
function createsubskill(){
  return {text:"",done:false};
}
onAuthStateChanged(auth, (user) => {
  if (user) {
    user_id.value = user.uid;
  } else {
    alert("Veuillez vous connecter pour ajouter un projet");
  }
});
function AjouterSubskill(){
  for(const element of subskills.value){
    if (element.text.trim()===''){
      alert("you cannot add a new subskill");
      return;
    }
  } 
  
    const subskill=createsubskill();
    subskills.value.push(subskill);
  
  
}
async function handleSubmit() {
  await addDoc(collection(db,"objectives"),{
    user_id:user_id.value,
    titre:title.value,
    description:description.value,
    subskills:subskills.value,
    estimatedDuration:estimatedDuration.value,
    progression:0,
    difficulte:difficulte.value,
    created_at:new Date(),
  })
  if (validform()){
    resetform();
  }
  else{
    validform();
  }
}
function resetform(){
  title.value='';
  description.value='';
  estimatedDuration.value=0;
  subskills.value=[createsubskill()];
  difficulte.value="";
}
function validform(){
  if (!title.value || !description.value || estimatedDuration.value==0 || !difficulte.value){
    alert("Veuillez remplir tous les champs obligatoires1");
    return false;
  }
  for(const element of subskills.value){
    if (!element.text){
      alert("Veuillez remplir tous les champs obligatoires2");
      return false;
    }
  }
  return true;
}
function profile(){
  router.push("/viewobjectives");
}

</script>
<style>
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