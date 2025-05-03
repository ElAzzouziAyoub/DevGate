<template>
  <div class="home">
    <div class="explore-section">
      <h1>Explore Projects</h1>
      <p>Discover and manage your projects effectively.</p>
    </div>

    


    <div class="projects-grid">
      <div v-for="(project, index) in projects" :key="index" class="project-card">
        <div class="card-image">
          <img src="https://wallpaperaccess.com/full/5137774.jpg" alt="Project Image" />
        </div>
        <div class="card-content">
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <p class="if-like">Tech stack: 
            <span v-for="(tech, idx) in project.stack" :key="idx">{{ tech }}</span>
          </p>
        <h3>{{ project.views }} Reads</h3>

          <a class="project-link" :href="project.link" target="_blank"  @click.prevent="updateview(project.id)">View Project →</a>
        </div>
      </div>
    </div>
  </div>
</template>


  <script setup>
  /*eslint-disable*/
  import {ref,onMounted} from "vue";
  import { collection, getDocs, getFirestore, doc, updateDoc, increment, onSnapshot } from "firebase/firestore";
  import {db} from "../firebase"
  import { useRouter } from "vue-router"
  const router = useRouter();
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

  function gotoprofile() {
      router.push('/viewobjectives')
  }
  onMounted(()=>{
  fetchprojects();
  });


  </script>
<style scoped>
.home {
font-family: 'Inter', sans-serif;
background-color: #f9fafb;
min-height: 100vh;
}

.header {
display: flex;
align-items: center;
justify-content: space-between;
padding: 15px 30px;
background-color: white;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
position: sticky;
top: 0;
z-index: 10;
}

.nav-links {
display: flex;
gap: 20px;
}

.nav-links h4 {
cursor: pointer;
font-size: 16px;
font-weight: 500;
}

.filter {
padding: 8px 16px;
border: 1px solid #e2e8f0;
border-radius: 20px;
width: 300px;
background-color: #f1f5f9;
font-size: 14px;
}

.explore-section {
padding: 40px 30px 10px;
text-align: center;
}

.explore-section h1 {
font-size: 32px;
font-weight: bold;
color: #1a202c;
}

.explore-section p {
color: #4a5568;
margin-top: 8px;
}

.projects-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 30px;
padding: 40px;
}

.project-card {
background: white;
border: 1px solid #e2e8f0;
border-radius: 16px;
overflow: hidden;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
transition: all 0.3s ease;
display: flex;
flex-direction: column;
text-align: center;
}

.project-card:hover {
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
transform: translateY(-5px);
}

.card-image img {
width: 100%;
height: 150px;
object-fit: cover;
background-color: #f6f9fc;
}

.card-content {
padding: 20px;
}

.card-content h3 {
font-size: 20px;
font-weight: bold;
color: #2d3748;
margin-bottom: 10px;
}

.card-content p {
font-size: 14px;
color: #4a5568;
margin-bottom: 10px;
}

.if-like {
font-weight: bold;
color: #2b6cb0;
margin-bottom: 10px;
}

.if-like span {
background-color: #e2e8f0;
border-radius: 9999px;
padding: 4px 8px;
margin-right: 5px;
font-size: 12px;
}

.project-link {
display: inline-block;
margin-top: 10px;
font-weight: 600;
color: #3182ce;
text-decoration: none;
font-size: 14px;
}
.header h2 {
font-weight: bold;
font-size: 24px;
background: linear-gradient(to right, #0079d3, #00c6fb);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
}
</style>