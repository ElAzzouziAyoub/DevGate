<template>
  <div class="container mx-auto p-6">
      <!-- Toggle Switch -->
      <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-gray-800">Competences</h1>
          <label class="flex items-center cursor-pointer">
              <div class="mr-3 text-gray-700 font-medium">
                  {{ liste ? 'List View' : 'Gallery View' }}
              </div>
              <div class="relative">
                  <input type="checkbox" v-model="liste" class="sr-only">
                  <div class="block bg-gray-300 w-14 h-8 rounded-full"></div>
                  <div class="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform"
                      :class="{'translate-x-6 bg-blue-500': liste}"></div>
              </div>
          </label>
      </div>

      <!-- List View -->
      <div v-if="liste" class="space-y-4 max-w-2xl mx-auto">
          <div v-for="competence in competences" :key="competence.id" 
               class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start">
                  <div>
                      <h3 class="text-xl font-semibold text-gray-800">{{ competence.name }}</h3>
                      <p class="text-gray-600 mt-1">{{ competence.level }}</p>
                  </div>
                  <div class="flex space-x-2">
                      <RouterLink 
                          :to="{ name: 'editCompetencePage', params: { id: competence.id } }"
                          class="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition">
                          Edit
                      </RouterLink>
                      <button 
                          @click="removeCompetence(competence.id)"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition">
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <!-- Gallery View -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div v-for="competence in competences" :key="competence.id" 
               class="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">{{ competence.name }}</h3>
              <p class="text-gray-600 mb-4">{{ competence.level }}</p>
              <div class="flex space-x-2 mt-auto">
                  <RouterLink 
                      :to="{ name: 'editCompetencePage', params: { id: competence.id } }"
                      class="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition text-sm">
                      Edit
                  </RouterLink>
                  <button 
                      @click="removeCompetence(competence.id)"
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
              Temp_competences.push({
                  id: doc.id,
                  level: doc.data().level,
                  name: doc.data().name,
                  UserUID: doc.data().UserUID
              });
          }
      });
      competences.value = Temp_competences;
  })
}

//Function to delete project
const removeCompetence = async (competenceID) => {
  await deleteDoc(doc(db, 'competences', competenceID))
}

onMounted(() => {
  fetchCompetences();
})
</script>

<style scoped>
/* Custom toggle switch styling */
.dot {
  transition: all 0.3s ease-in-out;
}
</style>