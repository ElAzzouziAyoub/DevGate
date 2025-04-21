<template>

    <div>
        <label for="">Title :</label> <br>
        <input type="text" placeholder="title" v-model="title_"> <br>
        <label for="">Description : </label> <br>
        <input type="text" placeholder="description" v-model="description_"> <br>
        <div v-for="s in stacks_" :key="s">
            <label for=""> {{ s }} <input type="checkbox" :value="s" v-model="stack_"/></label>
            
        </div> <br>
        <label for="">Github Link :</label> <br>
        <input type="text" v-model="link_"> <br>

        <button @click="Save">Save</button>



    </div>

  
</template>

<script setup>
/*eslint-disable*/
import { ref } from 'vue';
import { doc , updateDoc} from 'firebase/firestore'
import { useRoute } from 'vue-router'
import { db } from "@/firebase"


const route = useRoute();
const title_ = ref("");
const description_ = ref("");
const stacks_ = ref(["Fullstack","FrontEnd","BackEnd"]);
const stack_ = ref([]);
const link_ = ref("");

const Save = async () => {
    await updateDoc( doc(db ,'projects',`${route.params.id}`) , {
        title : title_.value ,
        description : description_.value ,
        stack : stack_.value,
        link : link_.value
    })

}





</script>

<style>

</style>