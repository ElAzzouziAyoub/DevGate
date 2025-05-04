<template>
    <div>
        <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
        
        <div class="adminBar">
            <button @click="DiscOrRepl=false" :class="[!DiscOrRepl ? 'ModeSelected' : 'ModeNotSelected']">Discussions Signalées</button>
            <button @click="DiscOrRepl=true" :class="[DiscOrRepl ? 'ModeSelected' : 'ModeNotSelected']">Réponses Signalées</button>
        </div>
        <div class="reportedDiscussions" v-show="!DiscOrRepl">
            <div v-for="content in repDiscussions" :key=content>
                <p>{{ content.authorName }}</p>
                <p class="pubDate">Publiée le {{ content.createdAtDate }}</p>
                <h3>{{ content.title }}</h3>
                <p>{{ content.content.substring(0, 100) + (content.content.length > 100 ? "..." : "") }}</p>
                <p class="ReportNum">Signalée {{ content.reportTimes }} fois</p>
                <button @click="router.push('/Discussion/' + content.id)">Visiter</button>
            </div>
        </div>
        <div class="reportedReplies" v-show="DiscOrRepl">
            <div v-for="(content, idx) in repReplies" :key=content>
                <p>{{ content.authorName }}</p>
                <div v-if="RepliesReducedShowMode[idx]">{{ content.content.substring(0, 40) + (content.content.length > 40 ? "..." : "") }}</div>
                <div v-else>
                    <p class="pubDate">Publiée le {{ content.createdAt }}</p>
                    <p>{{ content.content }}</p>
                    <p class="ReportNum">Signalée {{ content.reportTimes }} fois</p>
                </div>
                <div class="RepBtns">
                    <button @click="RepliesReducedShowMode[idx] ? RepliesReducedShowMode[idx]=false : RepliesReducedShowMode[idx]=true">
                        {{ RepliesReducedShowMode[idx] ? 'Maximiser' : 'Minimiser'}}
                    </button>
                    <button @click="deletRep(content, $event)" v-show="!RepliesReducedShowMode[idx]">Supprimer</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/*eslint-disable*/
import { fetchReportedDiscussion, fetchReportedReplies, addNewNotification } from '@/composables/useFirestore';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PopUp from '@/components/PopUp.vue';
import { hundlePopUp } from '@/composables/PopUpHundle';
import { delReply } from '@/composables/useFirestore';

const router = useRouter();

const repDiscussions = ref([]);
const repReplies = ref([]);

const RepliesReducedShowMode = ref([]);

const DiscOrRepl = ref(false);

onMounted(async () => {
    repDiscussions.value = await fetchReportedDiscussion(0);
    repReplies.value = await fetchReportedReplies(0);
    for (let i = 0; i < repReplies.value.length; i++) {
        RepliesReducedShowMode.value.push(true);
    }
});

const replyToDel = ref("");

async function deletRep(reply, event) {
    event.preventDefault();
    replyToDel.value = reply;
    showPopUp(2, "Voulez-vous supprimer cette réponse tant que modérateur?", 37);
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
    if(confEvent == 37) {

        let response = await delReply(replyToDel.value.id);

        if(response.status) {
            let notiRes = await addNewNotification({
                onWhat: "Votre réponse a été suprimée",
                content: replyToDel.value.content.substring(0, 100) + (replyToDel.value.content.length > 100 ? "..." : "") ,
                visited: false,
                userUID: replyToDel.value.authorId,
                sendDate: new Date().getTime(),
                StringSendDate: getCurrentDate(),
                type: "Warning",
                link: "",
            });
            if(notiRes.status) {
                showPopUp(1, "Supprimée avec success.", 40);
            } else {
                showPopUp(3, notiRes.error, 43);
            }
        } else {
            showPopUp(3, response.error, 43);
        }
    } else if(confEvent == 40) {
        router.go();
        hidePopUp();
    } else if(confEvent == 43) {
        hidePopUp();
    }
}
</script>

<style scoped>
@import '@/assets/css/ReportContent.css';
</style>