<template>

    <div>
        <label for="">Title :</label> <br>
        <input type="text" placeholder="title" v-model="project.title" > <br>
        <label for="">Description : </label> <br>
        <input type="text" placeholder="description" v-model="project.description" > <br>
        <div v-for="s in stacks_" :key="s">
            <label for=""> {{ s }} <input type="checkbox" :value="s"/></label>
            
        </div> <br>
        <label for="">Github Link :</label> <br>
        <input type="text" v-model="link_"> <br>

        <button @click="Save">Save</button>



    </div>

  
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted } from 'vue';
import { doc , updateDoc , getDoc } from 'firebase/firestore'
import { useRoute } from 'vue-router'
import { db } from "@/firebase"


const route = useRoute();
/*const title_ = ref(project.value.title);
const description_ = ref("");
const stacks_ = ref(["Fullstack","FrontEnd","BackEnd"]);
const stack_ = ref([]);
const link_ = ref("");*/
const project = ref({})
const id = ref(route.params.id)

async function fetchproject(){
    try{
        const docRef = doc(db, 'projects', id.value);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()){
            project.value = docSnap.data();
        }else{
            alert('unfound project!')
        }
    }
    catch(error) {
        alert('error while fetching :',error)
    }
}

onMounted( () => {
    fetchproject();
})




const Save = async () => {
    await updateDoc( doc(db ,'projects',`${route.params.id}`) , {
        title : project.title.value ,
        description : project.description_.value ,
        stack : project.stack.value,
        link : project.link.value
    })

}





</script>

<style>

</style>