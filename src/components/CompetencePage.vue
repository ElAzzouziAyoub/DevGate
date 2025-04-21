<template>

    <div>
        <h1>Add Competence</h1>
        <label for="">Name :</label> <br>
        <input type="text" placeholder="title" v-model="name_"> <br>
        <label for="">Level :</label>
        <select name="" id="">
            <option value="">Beginner</option>
            <option value="">Intermediaire</option>
            <option value="">Expert</option>
        </select>

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
    await addDoc( collection(db , "projects") , {
        name : name_.value,
        level : level_.value,
        Date : time.toLocaleDateString(),
        UserUID : auth.currentUser.uid
    } )
    name_.value = "";
    label_.value = "";
}




</script>

<style>

</style>