<template>
    <div class="discussionViewport">
        <NavBar />
        <div v-if="route.params.id == 0">
            <NewDiscussion />
        </div>
        <div v-else>
            <DiscussionDetail :discussionID="route.params.id"/>
        </div>
    </div>
</template>

<script setup>
/*eslint-disable*/
import NewDiscussion from '@/components/NewDiscussionForm.vue';
import DiscussionDetail from '@/components/DiscussionDetail.vue';
import NavBar from '@/components/NavBar.vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
</script>