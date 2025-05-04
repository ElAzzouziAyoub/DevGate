<template>
    <div v-if="userFetched">
        <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
        <NavBar />
        <div class="adminBar">
            <button @click="adminUseMode=false" :class="[!adminUseMode ? 'ModeSelected' : 'ModeNotSelected']">Ajouter un modérateur</button>
            <button @click="adminUseMode=true" :class="[adminUseMode ? 'ModeSelected' : 'ModeNotSelected']">Gérer le contenu signalé</button>
        </div>
        <AdminPanel v-show="!adminUseMode"/>
        <ReportsAdmin v-show="adminUseMode"/>
    </div>
    <div v-else>
        Loading...
    </div>
</template>

<script setup>
import ReportsAdmin from '@/components/ReportsAdmin.vue';
import AdminPanel from '@/components/AdminPanel.vue';
import NavBar from '@/components/NavBar.vue';
import { onAuthStateChanged } from 'firebase/auth';
import { onMounted, ref } from 'vue';
import { auth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';
import { getUserById } from '@/composables/useFirestore';
import PopUp from '@/components/PopUp.vue';
import { hundlePopUp } from '@/composables/PopUpHundle';

const router = useRouter();
const userFetched = ref(false);
const adminUseMode = ref(false);

onMounted(() => {
    onAuthStateChanged(auth, async (currentUser) => {
        if(!currentUser) {
            router.push('/');
        } else {
            const res = await getUserById(currentUser.uid);

            if(res) {
                userFetched.value = true;
                if(res.user.priviliges !== "Admin" && res.user.priviliges !== "Moderator") {
                    showPopUp(3, "Vous n'avez pas les droits de modérateur.", 45);
                }
            }
        }
    });
});


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

function ContinueOp(confEvent) {
    if(confEvent == 45) {
        router.push('/');
        hidePopUp();
    }
}
</script>

<style scoped>
.adminBar {
    margin: 10px;
    border-bottom: 1px solid gray;
}

.ModeSelected {
    background-color: rgb(0, 0, 255);
    color: white;
}

.ModeSelected:hover {
    color: white;
    background-color: rgb(84, 84, 255);
}

.adminBar button{
    padding: 5px;
    border: 1px solid transparent;
}

.ModeNotSelected {
    background-color: white;
    color: black;
}

.ModeNotSelected:hover {
    color: blue;
    border-color: blue;
}

.ModeNotSelected:active {
    color: white;
    background-color: blue;
}
</style>