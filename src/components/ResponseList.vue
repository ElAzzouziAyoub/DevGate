<template>
    <div class="replyList">
        <ResponseItem v-for="(reply, idx) in replies" :key="idx" :decal="decal * decal_rate" :decal_rate="decal_rate" :reply="reply" :inDiscussionID="inDiscussionID" :discAuthor="discAuthor"/>
    </div>
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted } from 'vue';
import ResponseItem from '@/components/ResponseItem.vue';
import { queriyngRepliesForMssg } from '@/composables/useFirestore';


const emit = defineEmits(["sendReplyCount", "showPopUp"]);

const props = defineProps({
    mssgID: String,
    decal: Number,
    decal_rate: Number,
    inDiscussionID: String,
    discAuthor: String,
});

const replies = ref([]);

onMounted(async() => {
    replies.value = await queriyngRepliesForMssg(props.mssgID);
    emit("sendReplyCount", replies.value.length);
});
</script>