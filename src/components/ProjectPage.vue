<template>

    <div>
        <label for=""> Gallery</label>
        <label class="switch">
            <input type="checkbox" v-model="liste">
            <span class="slider round"></span>
        </label>
        <label for=""> List</label>
        <h1>Projects : </h1>
        <div v-if="liste" id="liste">
            <div v-for="project in projects" :key="project" id="project_element1">
                <div>{{ project.title }}</div>
                <div id="description">{{ project.description }}</div>
                <div><button @click="removeProject(project.id)">Delete</button></div>
                <div><RouterLink id="link" :to="{ name: 'editProject', params: { id: project.id } }">Edit Project</RouterLink></div>
            </div>

        </div>
        <div v-else id="gallery">
            <div v-for="project in projects" :key="project" id="project_element2">
                <div>{{ project.title }}</div>
                <div id="description">{{ project.description }}</div>
                <div><button @click="removeProject(project.id)">Delete</button></div>
                <div><RouterLink id="link" :to="{ name: 'editProject', params: { id: project.id } }">Edit Project</RouterLink></div>
            </div>

        </div>

    </div>

  
</template>

<script setup>
/*eslint-disable*/
import { ref , onMounted } from 'vue'
import { collection , onSnapshot , doc , deleteDoc} from 'firebase/firestore'
import { db , auth} from '@/firebase'

const liste = ref(true);
const projects = ref([]);


//Function that fetches projects
const fetchProjects = async () => {
    onSnapshot(collection(db, "projects"), (querySnapshot) => {
    const Temp_projects = [];
    querySnapshot.forEach((doc) => {
    if (doc.data().UserUID == auth.currentUser.uid ) {
        Temp_projects.push( {
            id : doc.id,
            description : doc.data().description ,
            title : doc.data().title,
            UserUID : doc.data().UserUID
        });
    }
  });
  projects.value = Temp_projects;
  console.log(projects.value);
})
}

//Function to delete project
const removeProject = async (projectID) => {
    await deleteDoc( (doc(db,'projects',projectID)))
}

onMounted( () => {
    fetchProjects();
})








</script>

<style scoped>
#description{
    font-size :14px; 
}
#liste{
    display:flex;
    flex-direction: column;
    gap : 10px;
    align-content: center;
}
#project_element1{
    font-size: 26px;
    border : 1px solid black;
    text-align: left;
    width : 300px;
    margin : auto;
    padding : 10px;



}
#gallery{
    display:flex;
    flex-wrap: wrap;
    width : 900px;
    margin : auto;
    gap: 15px;
    justify-content: flex-start;
}

#project_element2{
    font-size: 26px;
    border : 1px solid black;
    text-align: center;
    width : 200px;
    height:200px;
    padding : 10px;

}


 /* The switch - the box around the slider */
 .switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
} 

</style>