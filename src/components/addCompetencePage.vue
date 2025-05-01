<template>
    <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <!-- Header -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-800 mb-2">Add Competence</h1>
            <p class="text-gray-600">Fill in your skill details below</p>
        </div>

        <!-- Form -->
        <div class="space-y-4">
            <!-- Name Input -->
            <div>
                <label class="block text-gray-700 font-medium mb-1">Name</label>
                <input 
                    type="text" 
                    placeholder="e.g. JavaScript, UX Design" 
                    v-model="name_"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
            </div>
            
            <!-- Level Select -->
            <div>
                <label class="block text-gray-700 font-medium mb-1">Level</label>
                <select 
                    v-model="level_"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="" disabled selected>Select your skill level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                </select>
            </div>
            
            <!-- Submit Button -->
            <button 
                @click="addCompetence"
                :disabled="!name_ || !level_"
                class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Add Competence
            </button>
        </div>
    </div>
</template>

<script setup>
/*eslint-disable*/
import { ref } from 'vue';
import {collection, addDoc} from 'firebase/firestore'
import { db, auth } from '@/firebase'

const name_ = ref("");
const level_ = ref("");
const time = new Date();

const addCompetence = async () => {
    await addDoc(collection(db, "competences"), {
        name: name_.value,
        level: level_.value,
        Date: time.toLocaleDateString(),
        UserUID: auth.currentUser.uid
    });
    name_.value = "";
    level_.value = "";
}
</script>