<template>
    <div class="Reply">
        <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
        <div class="replyModifier" v-if="editMode">
            <ModifyResponseForm :reply="reply" :editMode="editMode" @cancelEdit="editMode=false"/>
        </div>
        <div class="replyView" v-else>
            <div class="replyShow" >
                <h2>{{ reply.title }}</h2>
                <div class="userInfo">
                    <div class="avatarContainer">
                            <img v-if="Author?.profImage" :src="Author.profImage" alt="avatar">
                            <div v-else>?</div>
                        </div>
                        <p>{{ reply.authorName }}</p>
                </div>
                <div class="optBtns">
                    <div class="options" v-if="user">
                        <button @click="editMode=true" v-if="reply.authorId === user.uid">Modifier</button>
                        <button @click="deletRep" v-if="reply.authorId === user.uid || DBUser?.priviliges === 'Admin' || DBUser?.priviliges === 'Moderator'">Supprimer</button>
                        <p v-if="reply.reportedBy.includes(user.uid)">Signalé</p>
                        
                        <span  v-else><button  @click="ReportReply" v-if="(reply.authorId !== user.uid)">Signaler</button> </span>
                    </div>
                    <div class="options" v-else>
                        <button @click="showPopUp(2, `Voulez-vous s'incrire?`, 0)">Signaler</button>
                    </div>
                </div>
                <div class="dateInfo">
                    Publiée le {{ reply.createdAt }}
                </div>
                <div id="content" v-html="reply.content"></div>
                <div class="finalBtns">
                    <button @click="upvote" v-if="user"><i class="fa fa-arrow-circle-up" v-show="reply.upvotors.includes(user.uid)"></i><i class="fa fa-arrow-circle-o-up" v-show="!reply.upvotors.includes(user.uid)"></i>{{ reply.upvotes }}</button>
                    <button @click="upvote" v-else><i class="fa fa-arrow-circle-o-up"></i>{{ reply.upvotes }}</button>
                    <button @click="replyMode=true" v-if="user" v-show="!replyMode">Répondre</button>
                </div>
            </div>
            <NewReponseForm v-if="user" :user="user" :replyMode="replyMode" :mssgID="reply.id" :inDiscussionID="inDiscussionID" :inReplyOnUser="reply.authorId" @cancelReply="replyMode=false"/>
            <div v-if="repliesCount > 0">
                <button class="ShowReplies" @click="toggleShow">{{show_replies ? 'Cacher les réponses' : 'Affichier les réponses'}}</button>
            </div>
            <div class="replies" v-show="show_replies">
                <ResponseList :mssgID="reply.id" :decal="decal" :decal_rate="decal_rate" :inDiscussionID="inDiscussionID" :discAuthor="discAuthor" :style="'margin-left: ' + decal + 'px'" @sendReplyCount="setRepliesCount"/>
            </div>
        </div>
    </div>  
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted } from 'vue';
import { auth } from '@/composables/useAuth';
import { onAuthStateChanged } from "firebase/auth";
import NewReponseForm from '@/components/NewReponseForm.vue';
import ResponseList from '@/components/ResponseList.vue';
import ModifyResponseForm from '@/components/ModifyResponseForm.vue';
import PopUp from '@/components/PopUp.vue';
import { useRouter } from 'vue-router';
import { delReply, modifyReply, getUserById, addNewNotification, updateUserDoc, addNewActivity } from '@/composables/useFirestore';
import { hundlePopUp } from '@/composables/PopUpHundle';

const router = useRouter();

const emit = defineEmits(["showPopUp"]);

const user = ref(null),
DBUser = ref(null),
Author = ref(null);

const props = defineProps({
    reply: Object,
    decal: Number,
    decal_rate: Number,
    inDiscussionID: String,
    discAuthor: String,
});

const replyMode = ref(false),
show_replies = ref(false),
repliesCount = ref(false),
editMode = ref(false);

onMounted(async () => {
    onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            user.value = currentUser;
            
            let response = await getUserById(user.value.uid);
            if(response.status) {
                DBUser.value = response.user;
            } else {
                showPopUp(4, response.error, 0);
            }
        }
    });

    let Uresponse = await getUserById(props.reply.authorId);

    if(Uresponse.status) {
        Author.value = Uresponse.user;
    } else {
        showPopUp(3, Uresponse.error, 3);
    }
});

function toggleShow() {
    if(show_replies.value) {
        show_replies.value = false;
    } else {
        show_replies.value = true;
    }
}

function setRepliesCount(RepCount) {
    repliesCount.value = RepCount;
}

function deletRep(event) {
    event.preventDefault();
    if(DBUser.value.priviliges === 'Admin' || DBUser.value.priviliges === 'Moderator') {
        showPopUp(2, "Voulez-vous supprimer cette reponse tant que modérateur?", 10);
    } else {
        showPopUp(2, "Voulez-vous supprimer cette reponse?", 10);
    }
}

function ReportReply(event) {
    event.preventDefault();

    showPopUp(2, "Voulez-vous signaler cette reponse?", 11);
}

async function upvote(event) {
    event.preventDefault();

    if(!props.reply.upvotors.includes(user.value.uid)) {
        console.log("jnvf");
        props.reply.upvotors.push(user.value.uid);
        props.reply.upvotes++;

        let response = await modifyReply(props.reply.id, props.reply);

        if(!response.status)  {
            showPopUp(3, response.error, 15);
        } else {
            let response = await getUserById(props.discAuthor);
            let resp1 = await updateUserDoc(props.discAuthor, {numUpvotes: response.user.numUpvotes + 1});

            if(!resp1.status)  {
                showPopUp(3, response.error, 15);
            }
        }
    } else {
        props.reply.upvotors.splice(props.reply.upvotors.indexOf(user.value.uid), 1);
        props.reply.upvotes--;

        let response = await modifyReply(props.reply.id, props.reply);
        
        if(!response.status)  {
            showPopUp(3, response.error, 15);
        } else {
            let response = await getUserById(props.discAuthor);
            let resp1 = await updateUserDoc(props.discAuthor, {numUpvotes: response.user.numUpvotes - 1});

            if(!resp1.status) {
                showPopUp(3, response.error, 15);
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
    } else if(confEvent == 10) {
        let response = await delReply(props.reply.id);

        if(response.status) {
            if((DBUser.value.priviliges === 'Admin' || DBUser.value.priviliges === 'Moderator') && DBUser.userUID !== props.reply.authorId) {
                let notiRes = await addNewNotification({
                    onWhat: "Votre réponse a été supprimée",
                    content: props.reply.content.substring(0, 40) + (props.reply.content.length > 40 ? "..." : "") ,
                    visited: false,
                    userUID: props.reply.authorId,
                    sendDate: new Date().getTime(),
                    StringSendDate: getCurrentDate(),
                    type: "Warning",
                    link: "",
                });
                if(notiRes.status) {
                    let activityRes = await addNewActivity({
                        userUID: user.value.uid,
                        activity: "Réponse supprimée",
                        content: props.reply.content.substring(0, 40) + (props.reply.content.length > 40 ? "..." : ""),
                        
                        atDate: new Date().getTime(),
                        StringDate: getCurrentDate()
                    });
                    if(activityRes.status) {
                        showPopUp(1, "Supprimée avec success.", 89);
                    } else {
                        showPopUp(3, activityRes.error, 15);
                    }
                } else {
                    showPopUp(3, notiRes.error, 15);
                }
            } else {
                let activityRes = await addNewActivity({
                    userUID: user.value.uid,
                    activity: "Réponse supprimée",
                    content: props.reply.content.substring(0, 40) + (props.reply.content.length > 40 ? "..." : ""),
                    
                    atDate: new Date().getTime(),
                    StringDate: getCurrentDate()
                });
                if(activityRes.status) {
                    showPopUp(1, "Supprimée avec success.", 89);
                } else {
                    showPopUp(3, activityRes.error, 15);
                }
            }
        } else {
            showPopUp(3, response.error, 15);
        }
    } else if(confEvent == 11) {
        if (props.reply.reportedBy.includes(user.value.uid)) {
            return;
        }

        props.reply.reportedBy.push(user.value.uid);
        props.reply.reportTimes++;

        let response = await modifyReply(props.reply.id, props.reply);

        if(response.status) {
            let activityRes = await addNewActivity({
                userUID: user.value.uid,
                activity: "Réponse Signalée",
                content: props.reply.content.substring(0, 40) + (props.reply.content.length > 40 ? "..." : ""),
                atDate: new Date().getTime(),
                StringDate: getCurrentDate()
            });
            if(activityRes.status) {
                showPopUp(1, "Signalée avec success.", 15);
            } else {
                showPopUp(3, activityRes.error, 15);
            }
        } else {
            showPopUp(3, response.error, 15);
        }
    } else if(confEvent == 15) {
        hidePopUp();
    } else if(confEvent == 89) {
        router.go();
        hidePopUp();
    }
}
</script>