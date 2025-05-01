<template>
    <div class="max-w-md mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
        <!-- Header -->
        <div class="bg-blue-600 text-white p-6 rounded-t-lg mb-6">
            <h1 class="text-2xl md:text-3xl font-bold">Project Submission</h1>
            <p class="mt-2 opacity-90">Add your project details below</p>
        </div>
        
        <!-- Form -->
        <div class="space-y-4">
            <!-- Title -->
            <div>
                <label class="block text-gray-700 font-medium mb-1">Title</label>
                <input 
                    type="text" 
                    placeholder="Project title" 
                    v-model="title_"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
            </div>
            
            <!-- Description -->
            <div>
                <label class="block text-gray-700 font-medium mb-1">Description</label>
                <textarea name="" id=""
                placeholder="Project description" 
                    v-model="description_"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">

                </textarea>
            </div>


            <div>
                <label class="block text-gray-700 font-medium mb-2">Tech Stack</label>
                <input type="text" placeholder="add" v-model="stackinput_ "
                class=" px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <button @click="addStack"
                        class="border w-20 rounded-lg disabled:bg-gray-400 text-white bg-blue-600 ml-5 px-4 py-2"
                        :disabled="!stackinput_"
                >
                    Add
                </button>
                <div class="space-y-2 flex flex-row space-x-2" >
                    <div v-for="s in stack_" :key="s" class="bg-blue-600 text-white p-3 rounded-lg h-9 text-[13px] mt-5 flex items-center space-x-5">
                        <div>
                            {{ s }}
                        </div>
                        <button @click="removeStack(s)">x</button>
                    </div>
                </div>
            </div>
            
            <!-- Github Link -->
            <div>
                <label class="block text-gray-700 font-medium mb-1">GitHub Link</label>
                <input 
                    type="text" 
                    v-model="link_"
                    placeholder="https://github.com/your-project"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
            </div>
            
            
            <button 
                @click="addProject"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:bg-gray-400"
                :disabled="!title_ || !description_ || !stack_ || !link_"

                >
                Add Project
            </button>
        </div>
    </div>
</template>

<script setup>
/*eslint-disable*/
import { ref } from 'vue';
import {collection , addDoc , query, where , getDocs } from 'firebase/firestore'
import { db , auth } from '@/firebase'

const title_ = ref("");
const description_ = ref("");
const stack_ = ref([]);
const stackinput_ = ref("");
const link_ = ref("");

const AdminUsername = ref("");

const fetchAdminUsername = async() => {
    const users = collection(db,'users');
    const q = query(users,where("userUID","==",auth.currentUser.uid));
    console.log(q);

    const querySnapshot = await getDocs(q)

    AdminUsername.value = querySnapshot.docs.map( (doc) => ({
        username : doc.data().name
    }))

    console.log(AdminUsername.value[0].username);
}

const addProject = async () => {

    await fetchAdminUsername();

    await addDoc(collection(db, "projects"), {
        title: title_.value,
        description: description_.value,
        stack: stack_.value,
        link: link_.value,
        UserUID: auth.currentUser.uid,
        createdAt : new Date().toLocaleString(),
        modifiedAt : '',
        AdminUsername : AdminUsername.value[0].username,
        views : 0 ,
        likes : 0 ,

    });
    title_.value = "";
    description_.value = "";
    stack_.value = [];
    link_.value = "";
}

const addStack = () => {
    stack_.value.push(stackinput_.value);

}
const removeStack = (s) => {
    stack_.value.splice(s,1);
}
</script>