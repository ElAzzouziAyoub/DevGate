<template>

    <div>
        <label for="">Name :  :</label> <br>
        <input type="text" placeholder="name" v-model="competence.name" > <br>
        <label for="">Level : </label> <br>
        <label for="">Beginner</label><input type="radio" value="Beginner" name="level" v-model="competence.level"> <br>
       <label for="">Intermediate :</label> <input type="radio" value="Intermediate"  name="level"  v-model="competence.level"> <br>
        <label for="">Expert :</label><input type="radio" value="Expert"  name="level"  v-model="competence.level"> <br>
        <br>
        <div> {{ competence.level }}</div>

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

const competence = ref({});
const id = ref(route.params.id);

async function fetchcompetence(){
    try{
        const docRef = doc(db, 'competences', id.value);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()){
            competence.value = docSnap.data();
        }else{
            alert('unfound competence!')
        }
    }
    catch(error) {
        alert('error while fetching :',error)
    }
}

onMounted( () => {
    fetchcompetence();
})




const Save = async () => {
    await updateDoc( doc(db ,'competences',`${route.params.id}`) , {
        name : competence.name.value ,
        level : competence.level.value ,
        UserUID : competence.UserUID.value,
        date : competence.date.value
    })

}





</script>

<style>

</style>