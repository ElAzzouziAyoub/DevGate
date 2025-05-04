<template>
    <div class="discussionDetail">
        <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
        <div class="discussion" v-if="discussion && Author">
            <div class="discussionView" v-if="!modificationMode">
                <div class="discussionShow">
                    <h2>{{ discussion.title }}</h2>
                    <div class="dateInfo">
                        Publiée le {{ discussion.createdAtDate }}
                    </div>
                    <div class="userInfo">
                        <div class="avatarContainer">
                            <img v-if="Author.profImage" :src="Author.profImage" alt="avatar">
                            <div v-else>?</div>
                        </div>
                        <p>{{ discussion.authorName }}</p>
                    </div>
                    <div class="optBtns">
                        <div class="options" v-if="user && DBUser">
                            <button @click="modificationMode=true" v-if="discussion.authorId === user.uid">Modifier</button>
                            <button @click="deletDisc" v-if="discussion.authorId === user.uid || DBUser?.priviliges === 'Admin' || DBUser?.priviliges === 'Moderator'">Supprimer</button>
                            <p v-if="discussion.reportedBy.includes(user.uid)">Signalé</p>
                            
                            <span  v-else><button @click="ReportDiscussion" v-if="(discussion.authorId !== user.uid)">Signaler</button> </span>
                        </div>
                        <div class="options" v-else>
                            <button @click="showPopUp(2, `Voulez-vous s'incrire?`, 0)">Signaler</button>
                        </div>
                    </div>
                    <div id="content" v-html="discussion.content"></div>
                    <div class="finalBtns">
                        <button @click="upvote" v-if="user"><i class="fa fa-arrow-circle-up" v-show="discussion.upvotors.includes(user.uid)"></i><i class="fa fa-arrow-circle-o-up" v-show="!discussion.upvotors.includes(user.uid)"></i>{{ discussion.upvotes }}</button>
                        <button @click="upvote" v-else><i class="fa fa-arrow-circle-o-up"></i>{{ discussion.upvotes }}</button>
                        <button @click="replyMode=true" v-if="user" v-show="!replyMode">Répondre</button>
                    </div>
                </div>
                <NewReponseForm v-if="user" :user="user" :replyMode="replyMode" :mssgID="discussionID" :inDiscussionID="discussionID" :inReplyOnUser="discussion.authorId" @cancelReply="replyMode=false"/>
                <div class="replies">
                    <ResponseList :mssgID="discussionID" :decal="decal" :decal_rate="decal_rate" :inDiscussionID="discussionID" :discAuthor="discussion.authorId" :style="'margin-left: ' + decal + 'px'"/>
                </div>
            </div>
            <div class="discussionModifier" v-else>
                <ModifyDiscussionForm :discussionID="discussionID" :discussion="discussion" @CancelModifyMode="modificationMode=false"/>
            </div>
        </div>
        <div v-else>
            Chargement...
        </div>
    </div>  
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted } from 'vue';
import { getDiscussionById, delDiscussion, modifyDiscussion, getUserById, addNewNotification, updateUserDoc, addNewActivity } from '@/composables/useFirestore';
import { auth } from '@/composables/useAuth';
import { onAuthStateChanged } from "firebase/auth";
import NewReponseForm from '@/components/NewReponseForm.vue';
import ResponseList from '@/components/ResponseList.vue';
import ModifyDiscussionForm from '@/components/ModifyDiscussionForm.vue';
import PopUp from '@/components/PopUp.vue';
import { useRouter } from 'vue-router';
import { hundlePopUp } from '@/composables/PopUpHundle';

const router = useRouter();

const user = ref(null),
DBUser = ref(null),
Author = ref(null);

const props = defineProps({
    discussionID: String,
});

const discussion = ref(null);

const replyMode = ref(false),
modificationMode = ref(false);

const decal = ref(20);
const decal_rate = ref(0.9);

onMounted(async () => {
    onAuthStateChanged(auth, async (currentUser) => {
            
        if (currentUser) {
            user.value = currentUser;

            let response = await getUserById(user.value.uid);
            if(response.status) {
                DBUser.value = response.user;
            } else {
                showPopUp(3, response.error, 3);
            }
        }
    });

    const response = await getDiscussionById(props.discussionID);
    if(response.status) {

        discussion.value = response.discussion;
    } else {
        showPopUp(3, response.error, 3);
    }

    let Uresponse = await getUserById(discussion.value.authorId);

    if(Uresponse.status) {
        Author.value = Uresponse.user;
    } else {
        console.log("aaa")
        showPopUp(3, Uresponse.error, 3);
    }
});

async function deletDisc(event) {
    event.preventDefault();

    showPopUp(2, "Voulez-vous supprimer cette discussion?", 13);
}

async function ReportDiscussion(event) {
    event.preventDefault();

    showPopUp(2, "Voulez-vous reportez cette discussion?", 14);
}

async function upvote(event) {
    event.preventDefault();

    if(user.value) {
        if(!discussion.value.upvotors.includes(user.value.uid)) {
            discussion.value.upvotors.push(user.value.uid);
            discussion.value.upvotes++;

            let response = await modifyDiscussion(props.discussionID, discussion.value);

            if(!response.status)  {
                showPopUp(3, response.error, 15);
            } else {
                let response = await getUserById(discussion.value.authorId);
                let resp1 = await updateUserDoc(discussion.value.authorId, {numUpvotes: response.user.numUpvotes + 1});

                if(!resp1.status)  {
                    showPopUp(3, response.error, 15);
                }
            }
        } else {
            discussion.value.upvotors.splice(discussion.value.upvotors.indexOf(user.value.uid), 1);
            discussion.value.upvotes--;

            let response = await modifyDiscussion(props.discussionID, discussion.value);
            
            if(!response.status)  {
                showPopUp(3, response.error, 15);
            } else {
                let response = await getUserById(discussion.value.authorId);
                let resp1 = await updateUserDoc(discussion.value.authorId, {numUpvotes: response.user.numUpvotes - 1});

                if(!resp1.status)  {
                    showPopUp(3, response.error, 15);
                }
            }
        }
    }
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
    if(confEvent == 0) {
        router.push('/Connexion');
    } else if(confEvent == 3) {
        router.back();
    } else if(confEvent == 13) {
        let response = await delDiscussion(props.discussionID);

        if(response.status) {
            let notiRes = await addNewNotification({
                onWhat: "Votre discussion a été supprimée",
                content: discussion.value.content.substring(0, 100) + (discussion.value.content.length > 100 ? "..." : "") ,
                visited: false,
                userUID: discussion.value.authorId,
                sendDate: new Date().getTime(),
                StringSendDate: getCurrentDate(),
                type: "Warning",
                link: "",
            });
            if(notiRes.status) {
                let activityRes = await addNewActivity({
                    userUID: user.value.uid,
                    activity: "Discussion supprimée",
                    content: discussion.value.content.substring(0, 100) + (discussion.value.content.length > 100 ? "..." : ""),
                    
                    atDate: new Date().getTime(),
                    StringDate: getCurrentDate()
                });
                if(activityRes.status) {
                    showPopUp(1, "Supprimée avec success.", 17);
                } else {
                    showPopUp(3, activityRes.error, 16);
                }
            } else {
                showPopUp(3, notiRes.error, 16);
            }
        } else {
            showPopUp(3, response.error, 16);
        }
    } else if (confEvent == 14) {
        if (discussion.value.reportedBy.includes(user.value.uid)) {
            return;
        }

        discussion.value.reportedBy.push(user.value.uid);
        discussion.value.reportTimes++;

        let response = await modifyDiscussion(props.discussionID, discussion.value);

        if(response.status) {
            let activityRes = await addNewActivity({
                userUID: user.value.uid,
                activity: "Discussion signalée",
                content: discussion.value.content.substring(0, 100) + (discussion.value.content.length > 100 ? "..." : ""),
                
                atDate: new Date().getTime(),
                StringDate: getCurrentDate()
            });
            if(activityRes.status) {
                showPopUp(1, "Signalée avec success.", 18);
            } else {
                showPopUp(3, activityRes.error, 16);
            }
        } else {
            showPopUp(3, response.error, 16);
        }
    } else if(confEvent == 16) {
        hidePopUp();
    } else if(confEvent == 17) {
        router.push("/");
        hidePopUp();
    } else if(confEvent == 18) {
        router.go();
        hidePopUp();
    }
}
</script>

<style scoped>
@import '@/assets/css/DiscussionDetail.css';
</style>