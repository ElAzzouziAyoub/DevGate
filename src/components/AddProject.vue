<template>

    <div>
        <label for="">Title :</label> <br>
        <input type="text" placeholder="title" v-model="title"> <br>
        <label for="">Description : </label> <br>
        <input type="text" placeholder="description" v-model="description"> <br>
        <div v-for="s in stacks" :key="s">
            <label for=""> {{ s }} <input type="checkbox" :value="s" v-model="stack" @click="console.log(stack)"/></label>
            
        </div> <br>
        <label for="">Github Link :</label> <br>
        <input type="text" v-model="link"> <br>

        <button @click="addProject">Ajouter</button>



    </div>

  
</template>

<script setup>
/*eslint:disable*/
import { ref } from 'vue';
import {collection , addDoc} from 'firebase/firestore'
import { db , auth } from '@/firebase'


const title = ref("");
const description = ref("");
const stacks = ref(["Fullstack","FrontEnd","BackEnd"]);
const stack = ref([]);
const link = ref("");

const addProject = async () =>{
    await addDoc( collection(db , "projects") , {
        title : title,
        description : description,
        stack : stack ,
        link : link ,
        UserUID : auth.currentUser.uid
    } )
}




</script>

<style>

</style>