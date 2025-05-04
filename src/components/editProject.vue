<template>
    <div class="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 class="text-2xl font-semibold text-center mb-4">Edit Project</h2>
  
      <!-- Title -->
      <div class="mb-4">
        <label for="title" class="block text-lg font-medium text-gray-700">Title:</label>
        <input
          type="text"
          id="title"
          placeholder="Title"
          v-model="project.title"
          class="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
  
      <!-- Description -->
      <div class="mb-4">
        <label for="description" class="block text-lg font-medium text-gray-700">Description:</label>
        <input
          type="text"
          id="description"
          placeholder="Description"
          v-model="project.description"
          class="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
  
      <!-- Stacks -->
      <div class="mb-4">
        <label class="block text-lg font-medium text-gray-700">Tech Stacks:</label>

        <input type="text" placeholder="add" v-model="stackinput_"
                class=" px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
        
        
        <button @click="addStack"
                class="border w-20 rounded-lg disabled:bg-gray-400 text-white bg-blue-600 ml-5 px-4 py-2"
                :disabled="!stackinput_"
            >
             Add
        </button>

        <div class="flex flex-row space-x-5">
            <div v-for="s in stacks_" :key="s">
                <div class="bg-blue-600 text-white p-3 rounded-lg h-9 text-[13px] mt-5 flex items-center space-x-5">
                    <div>{{ s }}</div>
                    <button @click="removeStack(s)">x</button>
                </div>
            </div>
        </div>
      </div>

      

      
  
      <!-- Github Link -->
      <div class="mb-4">
        <label for="github" class="block text-lg font-medium text-gray-700">Github Link:</label>
        <input
          type="text"
          id="github"
          v-model="link_"
          placeholder="Enter the Github link"
          class="w-full px-4 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
  
      <!-- Save Button -->
      <div class="flex justify-center mt-6">
        <button
          @click="Save"
          class="w-1/2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  /*eslint-disable*/
  import { ref, onMounted } from 'vue';
  import { doc, updateDoc, getDoc } from 'firebase/firestore';
  import { useRoute } from 'vue-router';
  import { db } from "@/firebase";
  
  const route = useRoute();
  const project = ref({ title: "", description: "", stack: [], link: "" });
  const stacks_ = ref([]);
  const link_ = ref("");
  const id = ref(route.params.id);
  const stackinput_ = ref("");



  const addStack = () => {
    if (stackinput_.value){
        stacks_.value.push(stackinput_.value)
        stackinput_.value = "";
    }
  }

  const removeStack = (s) => {
    stacks_.value.splice(s,1);

  }
  
  // Fetch the project data when the component is mounted
  onMounted(async () => {
    const docRef = doc(db, 'projects', id.value);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      project.value = docSnap.data();
    }
    stacks_.value = project.value.stack;
  });
  
  const Save = async () => {
    console.log(project.value.title);
    console.log(project.value.description);
    console.log(stacks_.value);
    console.log(link_.value);
    console.log(id.value);
    try {
        await updateDoc(doc(db, 'projects', id.value), {
            title: project.value.title,
            description: project.value.description,
            stack: stacks_.value,
            link: link_.value,
            modifiedAt: new Date().toLocaleString()
        });
    }
    catch(error){
        console.log("error bro");
    }
  }
  </script>
  
  <style scoped>
  /* Add any custom styles here */
  </style>
  