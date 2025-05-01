<template>
  <div class="container mx-auto p-6">
      <!-- View Toggle -->
      <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-gray-800">Projects</h1>
          <div class="flex items-center space-x-4">
              <span class="text-gray-700 font-medium" :class="{'text-blue-600': !liste}">Gallery</span>
              <label class="flex items-center cursor-pointer">
                  <div class="relative">
                      <input type="checkbox" v-model="liste" class="sr-only">
                      <div class="block bg-gray-300 w-14 h-8 rounded-full"></div>
                      <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform"
                          :class="{'translate-x-6 bg-blue-500': liste}"></div>
                  </div>
              </label>
              <span class="text-gray-700 font-medium" :class="{'text-blue-600': liste}">List</span>
          </div>
      </div>

      <!-- List View -->
      <div v-if="liste" class="space-y-4 max-w-4xl mx-auto">
          <div v-for="project in projects" :key="project.id" 
               class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                  <div>
                      <h3 class="text-xl font-semibold text-gray-800">{{ project.title }}</h3>
                      <p class="text-gray-600 mt-2">{{ project.description }}</p>
                      <p class="text-gray-600 mb-4 flex-grow">Last Modification : {{ project.modifiedAt }}</p>
                  </div>
                  <div class="flex space-x-2">
                      <RouterLink 
                          :to="{ name: 'editProject', params: { id: project.id } }"
                          class="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition">
                          Edit
                      </RouterLink>
                      <button 
                          @click="removeProject(project.id)"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition">
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <!-- Gallery View -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="project in projects" :key="project.id" 
               class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col h-full">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ project.title }}</h3>
              <p class="text-gray-600 mb-4 flex-grow">{{ project.description }}</p>
              <p class="text-gray-600 mb-4 flex-grow"> Last Modification : {{ project.modifiedAt }}</p>
              <div class="flex space-x-2 mt-auto">
                  <RouterLink 
                      :to="{ name: 'editProject', params: { id: project.id } }"
                      class="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition text-sm">
                      Edit
                  </RouterLink>
                  <button 
                      @click="removeProject(project.id)"
                      class="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition text-sm">
                      Delete
                  </button>
              </div>
          </div>
      </div>
  </div>
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted } from 'vue'
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase'

const liste = ref(true);
const projects = ref([]);

// Function that fetches projects
const fetchProjects = async () => {
  onSnapshot(collection(db, "projects"), (querySnapshot) => {
      const Temp_projects = [];
      querySnapshot.forEach((doc) => {
          if (doc.data().UserUID == auth.currentUser.uid) {
              Temp_projects.push({
                  id: doc.id,
                  description: doc.data().description,
                  title: doc.data().title,
                  UserUID: doc.data().UserUID,
                  createdAt : doc.data().createdAt ,
                  modifiedAt : doc.data().modifiedAt
              });
          }
      });
      projects.value = Temp_projects;
  })
}

// Function to delete project
const removeProject = async (projectID) => {
  await deleteDoc(doc(db, 'projects', projectID))
}

onMounted(() => {
  fetchProjects();
})
</script>

<style scoped>
/* Custom toggle switch styling */
.dot {
  transition: all 0.3s ease-in-out;
}
</style>