<template>
    <div class="addReply">
        <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
        <form action="">
            <textarea class="NewReplyArea" name="" id="" v-model="ReplyContent"></textarea>
            <div class="Errors">
                {{ replyErr }}
            </div>
            <div class="btns">
                <button @click="emit('cancelEdit')">Cancel</button>
                <button @click="editReply">Modifier la réponse</button>
            </div>
        </form>
    </div>
</template>

<script setup>
/*eslint-disable*/
import { ref } from 'vue';
import { modifyReply, addNewActivity } from '@/composables/useFirestore';
import { useRouter } from 'vue-router';
import PopUp from '@/components/PopUp.vue';
import { hundlePopUp } from '@/composables/PopUpHundle';

const router = useRouter();

const props = defineProps({
    reply: Object,
});

const emit = defineEmits(["cancelEdit"]);

const ReplyContent = ref(props.reply.content),
replyErr = ref("");

async function editReply(event) {
    event.preventDefault();

    if (ReplyContent.value === "") {
        replyErr.value = "Empty Reply.";
        return;
    }

    replyErr.value = "";

    showPopUp(2, "Voulez-vous modifier cette reponse?", 22);
}

function getCurrentDate() {
    let currDate = new Date();
    return zeroPad(currDate.getDate()) + "/" +
            zeroPad(currDate.getMonth()) + "/" +
            zeroPad(currDate.getFullYear()) + " " +
            zeroPad(currDate.getHours()) + ":" +
            zeroPad(currDate.getMinutes()) + ":" +
            zeroPad(currDate.getSeconds());
}

function zeroPad(num) {
    if(num <= 9 && 0 <= num) {
        return "0" + String(num);
    }
    return num;
}


const popUpMode = ref(false),
popUpContent = ref(""),
PopUpType = ref("Warning"),
effectColor = ref(''),
ConfRef = ref(null);

function showPopUp(mode, content, eventConf=null) {
    hundlePopUp(mode, content, eventConf, popUpMode, popUpContent, PopUpType, effectColor, ConfRef);
}

function hidePopUp() {
    hundlePopUp(0, '', null, popUpMode, popUpContent, PopUpType, effectColor, ConfRef);
}

async function ContinueOp(confEvent) {
    if(confEvent == 22) {
        const newReply = {
            content: ReplyContent.value,
        };

        let response = await modifyReply(props.reply.id, newReply);

        if(response.status) {
            let activityRes = await addNewActivity({
                userUID: props.reply.authorId,
                activity: "Réponse modifiée",
                content: ReplyContent.value.substring(0, 40) + (ReplyContent.value.length > 40 ? "..." : ""),
                
                atDate: new Date().getTime(),
                StringDate: getCurrentDate()
            });
            if(activityRes.status) {
                showPopUp(1, "Reponse modifiée successivement.", 27);
            } else {
                showPopUp(3, activityRes.error, 28);
            }
        } else {
            showPopUp(3, response.error, 28);
        }
    } else if(confEvent == 27) {
        router.go();
        hidePopUp();
    } else if(confEvent == 28) {
        hidePopUp();
    }
}
</script>


<style scoped>
@import '@/assets/css/NewResponse.css';
</style>