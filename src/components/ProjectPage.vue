<template>

    <div>
        <h1>Projects : </h1>
        <div v-if="liste" id="liste">
            <div v-for="project in projects" :key="project" id="project_element1">
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

</style>