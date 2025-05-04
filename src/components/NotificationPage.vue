<template>
    <div class="notifications-page bg-white text-gray-800 p-8 max-w-4xl mx-auto">
      <div class="header text-center mb-8">
        <h1 class="text-3xl font-semibold text-indigo-600">Your Notifications</h1>
      </div>
  
      <div v-if="loading" class="loading-spinner text-center">
        <span class="text-xl text-gray-500">Loading...</span>
      </div>
  
      <div v-if="notifications.length === 0" class="no-notifications text-center">
        <p class="text-lg text-gray-400">No new notifications.</p>
      </div>
  
      <div
        v-for="(notification, index) in notifications"
        :key="index"
        class="notification-card bg-white shadow-lg rounded-lg p-6 mb-6 transition-transform transform hover:scale-105"
      >
        <div class="notification-header flex justify-between mb-4">
          <h3 class="text-xl font-semibold text-indigo-600">
            {{ notification.sender }} {{ notification.message }}
          </h3>
          <span class="notification-time text-sm text-gray-500">{{ formatTime(notification.date) }}</span>
        </div>
        <p class="notification-message text-base text-gray-700">{{ notification.message }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { collection, query, where, getDocs } from 'firebase/firestore'
  import { getAuth } from 'firebase/auth'
  import { db } from '../firebase'  // Adjust the import path based on your setup
  
  const auth = getAuth()
  const notifications = ref([])  // Array to store notifications
  const loading = ref(true)
  
  onMounted(async () => {
    await fetchNotifications()
  })
  
  const fetchNotifications = async () => {
    try {
      const currentUserUid = auth.currentUser?.uid
      if (!currentUserUid) return
  
      // Reference to Firestore collection
      const notificationsRef = collection(db, 'notifications')
  
      // Query where receiver UID is equal to current user's UID
      const q = query(notificationsRef, where('receiver', '==', currentUserUid))
  
      // Fetch the data
      const querySnapshot = await getDocs(q)
  
      // Iterate over documents and store them in notifications
      notifications.value = []
      querySnapshot.forEach(doc => {
        const notification = doc.data()
        notifications.value.push({
          sender: notification.sender,
          date: notification.date,  // Firebase timestamp is in seconds
          message: notification.message
        })
      })
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Function to format timestamp to a readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString()  // Format as local date and time
  }
  </script>
  
  <style scoped>
  /* All styling is done using Tailwind CSS */
  .notifications-page {
    max-width: 600px;
    margin: 0 auto;
  }
  .notification-card {
    width: 100%;
  }
  </style>
  