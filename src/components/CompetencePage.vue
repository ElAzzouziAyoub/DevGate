<template>

    <div>
        <h1>Competences : </h1>
        <div v-if="liste" id="liste">
            <div v-for="competence in competences" :key="competence" id="project_element1">
                <div>{{ competence.name }}</div>
                <div id="description">{{ competence.level }}</div>
                <div><button @click="removeCompetence(competence.id)">Delete</button></div>
                <div><RouterLink id="link" :to="{ name: 'editProject', params: { id: competence.id } }">Edit Project</RouterLink></div>
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
const competences = ref([]);


//Function that fetches projects
const fetchCompetences = async () => {
    onSnapshot(collection(db, "competences"), (querySnapshot) => {
    const Temp_competences = [];
    querySnapshot.forEach((doc) => {
    if (doc.data().UserUID == auth.currentUser.uid ) {
        Temp_competences.push( {
            id : doc.id,
            level : doc.data().level,
            name : doc.data().name,
            UserUID : doc.data().UserUID
        });
    }
  });
  competences.value = Temp_competences;
})
}

//Function to delete project
const removeCompetence = async (competenceID) => {
    await deleteDoc( (doc(db,'competences',competenceID)))
}

onMounted( () => {
    fetchCompetences();
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