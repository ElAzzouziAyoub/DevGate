<template>
  <div class="home">
    <div class="display">
      <div class="column">
        <div
          v-for="(project, index) in projects"
          :key="index"
          class="project"
          v-show="project.title.toString().startsWith(input)"
        >
          <h3>{{ project.title }}</h3>

          <h3>
            <a :href="project.link" @click.prevent="updateview(project.id)">{{
              project.link
            }}</a>
          </h3>

          <h3>{{ project.AdminUsername }}</h3>
          <h3>{{ project.views }} Reads</h3>
          <h3
            class="notification"
            style="display: flex; justify-content: center"
          >
            <button @click="incrementlike(project.id)" :disabled="clicked">
              <i class="fa-solid fa-thumbs-up"></i>{{ project.likes }}
            </button>
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/*eslint-disable*/
import {ref,onMounted} from "vue";
import { collection ,increment,doc,updateDoc, onSnapshot} from "firebase/firestore";
import {db} from "../firebase"
const input=ref("");
const projects=ref([]);
const clicked=ref(false);
function fetchprojects() {
  const querySnapshot = onSnapshot(collection(db, "projects"), (data) => {
    projects.value = []; // Important: réinitialiser pour éviter les doublons
    data.forEach((docSnap) => {
      const data = docSnap.data();
      data.id = docSnap.id; // 👈 Ajouter l'ID ici
      projects.value.push(data);
    });
  });
}

async function updateview(projectID) {
  const projectref = doc(db, "projects", projectID);
  try {
    await updateDoc(projectref, {
      views: increment(1),
      
    });
    const project = projects.value.find(p => p.id === projectID);
    if (project) {
      window.open(project.link, '_blank'); // open in new tab
    }

  } catch (error) {
    alert("Error updating views: " + error.message);
  }
}

async function incrementlike(likeid){
  const likeref=doc(db,"projects",likeid);
  try{
    await updateDoc(likeref,{
      likes:increment(1)
    })
    clicked.value=true;
  }
  catch(error){
    alert("An error has occured");
  }
}
onMounted(()=>{
  fetchprojects();
});
</script>
<style scoped>
.home {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
  content: '';
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

.display {
  display: flex;
  justify-content: center;
  gap: 25px;
  padding: 30px;
  background-color: #f8fafc;
  min-height: calc(100vh - 70px);
}

.column {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
  max-width: 1200px;
}

.project {
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  width: 100%;
  padding: 25px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-align: center;
}

.project:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e0;
}

.project h3 {
  margin: 5px 0;
  color: #2d3748;
  font-weight: 500;
}

.project h3:first-child {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 10px;
}

.project h3:nth-child(2) {
  color: #0079d3;
  font-size: 1rem;
  word-break: break-all;
}

.project h3:last-child {
  color: #4a5568;
  line-height: 1.5;
  margin-top: 15px;
}
</style>