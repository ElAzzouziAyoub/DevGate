<template>

    <div>
        <h1>Add Competence</h1>
        <label for="">Name :</label> <br>
        <input type="text" placeholder="title" v-model="name_"> <br>
        <label for="">Level :</label> <br>
        <select name="" id="" v-model="level_">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
        </select> <br> <br>

        <button @click="addCompetence">Ajouter</button>



    </div>

  
</template>

<script setup>
/*eslint:disable*/
import { ref } from 'vue';
import {collection , addDoc} from 'firebase/firestore'
import { db , auth } from '@/firebase'


const name_ = ref("");
const level_ = ref("");
const time = new Date();

const addCompetence = async () =>{
    await addDoc( collection(db , "competences") , {
        name : name_.value,
        level : level_.value,
        Date : time.toLocaleDateString(),
        UserUID : auth.currentUser.uid
    } )
    name_.value = "";
    level_.value = "";
}




</script>

<style>

</style>