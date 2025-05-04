<template>
  <div class="addReply" v-show="replyMode">
      <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
      <form action="">
          <textarea class="NewReplyArea" name="" id="" v-model="newReplyContent"></textarea>
          <div class="Errors">
              {{ replyErr }}
          </div>
          <div class="btns">
              <button @click="cancelReply">Cancel</button>
              <button @click="AddReply">Reply</button>
          </div>
      </form>
  </div>
</template>

<script setup>
/*eslint-disable*/
import { ref } from 'vue';
import { addNewReply, addNewNotification, addNewActivity } from '@/composables/useFirestore';
import { useRouter } from 'vue-router';
import PopUp from '@/components/PopUp.vue';
import { hundlePopUp } from '@/composables/PopUpHundle';

const router = useRouter();

const props = defineProps({
  user: Object,
  replyMode: Boolean,
  mssgID: String,
  inDiscussionID: String,
  inReplyOnUser: String,
});

const emit = defineEmits(["cancelReply"]);

const newReplyContent = ref(""),
replyErr = ref("");

function cancelReply(event) {
  event.preventDefault();
  newReplyContent.value = "";
  emit("cancelReply");
}

async function AddReply(event) {
  event.preventDefault();

  if (newReplyContent.value === "") {
      replyErr.value = "Empty Reply.";
      return;
  }

  replyErr.value = "";

  const newReply = {
      authorId: props.user.uid,
      authorName: props.user.displayName,
      replyToID: props.mssgID,
      content: newReplyContent.value,
      createdAt: getCurrentDate(),
      reportedBy: [],
      reportTimes: 0,
      upvotes: 0,
      upvotors: [],
  };

  let response = await addNewReply(newReply);

  if(response.status) {
    if(props.user.uid !== props.inReplyOnUser) {
      let notiRes = await addNewNotification({
        onWhat: "Vous a Répondu.",
        content: newReplyContent.value.substring(0, 40) + (newReplyContent.value.length > 40 ? "..." : ""),
        visited: false,
        userUID: props.inReplyOnUser,
        sendDate: new Date().getTime(),
        StringSendDate: getCurrentDate(),
        type: "Info",
        link: "/Discussion/" + props.inDiscussionID,
      });

      if(notiRes.status){
        let activityRes = await addNewActivity({
          userUID: props.user.uid,
          activity: "Reponse Ajoutée",
          content: newReplyContent.value.substring(0, 40) + (newReplyContent.value.length > 40 ? "..." : ""),
          
          atDate: new Date().getTime(),
          StringDate: getCurrentDate()
        });
        if(activityRes.status) {
          showPopUp(1, "Reponse Ajoutée.", 23);
        } else {
          showPopUp(3, activityRes.error, 24);
        }
      } else {
        showPopUp(3, notiRes.error, 24);
      }
    } else {
      let activityRes = await addNewActivity({
        userUID: props.user.uid,
        activity: "Reponse Ajoutée",
        content: newReplyContent.value.substring(0, 40) + (newReplyContent.value.length > 40 ? "..." : ""),
        
        atDate: new Date().getTime(),
        StringDate: getCurrentDate()
      });
      if(activityRes.status) {
        showPopUp(1, "Reponse Ajoutée.", 23);
      } else {
        showPopUp(3, activityRes.error, 24);
      }
    }
  } else {
      showPopUp(3, response.error, 24);
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
      return "0" + String(num)
  }
  return num
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
    if(confEvent == 23) {
      router.go();
      newReplyContent.value = "";
      hidePopUp();
    } else if(confEvent == 24) {
        hidePopUp();
    }
}
</script>

<style scoped>
@import '@/assets/css/NewResponse.css';
</style>