<template>
    <div>
        <NavBar />
        <div class="notifications">
            <div v-for="(notification, idx) in notificationRef" :key="idx" @click="redirectToNotification(notification, $event)">
                <div class="notificationInfo">
                    <h4>{{ notification.onWhat }}</h4>
                    <p>{{ notification.StringSendDate }}</p>
                    <div>{{ notification.content }}</div>
                </div>
                <div class="notifIndecator" v-show="!notification.visited"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getNotifications, updateNotification } from '@/composables/useFirestore';
import { ref, onMounted } from 'vue';
import { auth } from '@/composables/useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'vue-router';
import NavBar from '@/components/NavBar.vue';

const notificationRef = ref(null);
const user = ref(null);
const router = useRouter();

onMounted(() => {
    onAuthStateChanged(auth, async (currentUser) => {
        if(currentUser) {
            user.value = currentUser;

            await getNotifications(user.value.uid, notificationRef);
        } else {
            router.push('/Connexion');
        }
    });
});

async function redirectToNotification(notification, event) {
    event.preventDefault();

    await updateNotification(notification.id, {visited: true});

    if(notificationRef.value.type === "Type") {
        router.push(notificationRef.value.link);
    }
}
</script>

<style scoped>
@import '@/assets/css/Notifications.css';
</style>