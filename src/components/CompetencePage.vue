<template>

    <div>
        <label class="switch">
            <input type="checkbox" v-model="liste">
            <span class="slider round"></span>
        </label>
        <h1>Competences : </h1>
        <div v-if="liste" id="liste">
            <div v-for="competence in competences" :key="competence" id="competence_element1">
                <div>{{ competence.name }}</div>
                <div id="description">{{ competence.level }}</div>
                <div><button @click="removeCompetence(competence.id)">Delete</button></div>
                <div><RouterLink id="link" :to="{ name: 'editCompetencePage', params: { id: competence.id } }">Edit Project</RouterLink></div>
            </div>

        </div>
        <div v-else id="gallery">
            <div v-for="competence in competences" :key="competence" id="competence_element2">
                <div>{{ competence.name }}</div>
                <div id="description">{{ competence.level }}</div>
                <div><button @click="removeCompetence(competence.id)">Delete</button></div>
                <div><RouterLink id="link" :to="{ name: 'editCompetencePage', params: { id: competence.id } }">Edit Project</RouterLink></div>
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
#competence_element1{
    font-size: 26px;
    border : 1px solid black;
    text-align: left;
    width : 300px;
    margin : auto;
    padding : 10px;

}
#competence_element2{
    font-size: 26px;
    border : 1px solid black;
    text-align: center;
    width : 200px;
    height:200px;
    margin : auto;
    padding : 10px;

}
#gallery{
    display:flex;
    flex-wrap: wrap;
    width : 900px;
    margin : auto;
    gap: 10px;
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