<template>
    <div>
        <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
        <div v-if="DBUser">
            <div class="addAdmin">
                <div class="searchingUser">
                    <label for="selUser">Chercher un utilisateur: </label>
                    <input name="selUser" type="text" v-model="userName" @keyup="fetchUsers">
                </div>
                <div class="UsersList" v-if="UsersList.length > 0">
                    <div v-for="user in UsersList" :key="user.userUID">
                        {{ user.name }} <button @click="AddAdmin(user.userUID, user.name, $event)">Add as Admin</button>
                    </div>
                </div>
            </div>
            <div class="listAdmins">
                <div v-for="user in currentAdmins" :key="user.userUID">
                    {{ user.name }} <button @click="RemoveAdmin(user.userUID, user.name, $event)" v-if="DBUser.priviliges === 'Admin' && user.priviliges === 'Moderator'">Remove Moderator</button>
                </div>
            </div>
        </div>
        <div v-else>
            Loading...
        </div>
    </div>
</template>

<script setup>
/*eslint-disable*/
import { auth } from '@/composables/useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, computed, onMounted } from 'vue';
import { queryingUsersByName, usersColl, getUserById, updateUserDoc, addNewNotification, addNewActivity } from '@/composables/useFirestore';
import { and, where, orderBy, query, or, onSnapshot } from 'firebase/firestore';
import PopUp from '@/components/PopUp.vue';
import { hundlePopUp } from '@/composables/PopUpHundle';
import { useRouter } from 'vue-router';

const user = ref(null);
const DBUser = ref(null);

onMounted(async () => {
    onAuthStateChanged(auth, async (currentUser) => {
        if(currentUser) {
            user.value = currentUser;

            const res = await getUserById(user.value.uid);

            if(res.status) {
                DBUser.value = res.user;
            } else {
                showPopUp(4, res.error);
            }

            const usersQuery = query(
                usersColl,
                and(
                    where("userUID", "!=", user.value.uid),
                    or(
                        where("priviliges", "==", "Moderator"),
                        where("priviliges", "==", "Admin")
                    )
                ),
                orderBy("name")
            );

            onSnapshot(usersQuery, (querySnapshot) => {
                currentAdmins.value = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            });
        }
    });
    
});

const userName = ref("");

const Users = ref([]),
UsersList = computed(() => Users.value.filter((user) => (user.priviliges !== "Admin" && user.priviliges !== "Moderator"))),
currentAdmins = ref([]);

async function fetchUsers(event) {
    event.preventDefault();

    Users.value = await queryingUsersByName(userName.value, user.value.uid);
}

async function AddAdmin(useruid, userName, event) {
    event.preventDefault();
    userToAdd.value = useruid;
    showPopUp(2, `Voulez-vous ajouter ${userName} comme modérateur?`, 2);
}

const userToAdd = ref(""),
userToRemove = ref("");

async function RemoveAdmin(useruid, userName, event) {
    event.preventDefault();

    userToRemove.value = useruid;
    showPopUp(2, `Voulez-vous supprimer ${userName} du modérateur?`, 3);
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
    if(confEvent == 1) {
        Users.value = await queryingUsersByName(userName.value, user.value.uid);
        hidePopUp();
    } else if(confEvent == 2) {
        let res0 = await getUserById(userToAdd.value);
        if(res0.status) {
            let res1 = await updateUserDoc(userToAdd.value, {priviliges: "Moderator"});
            if (res1.status){
                let notiRes = await addNewNotification({
                    onWhat: "Administration",
                    content: "You were selected as Admin",
                    visited: false,
                    userUID: userToAdd.value,
                    sendDate: new Date().getTime(),
                    StringSendDate: getCurrentDate(),
                    type: "Info",
                    link: "/Administration",
                });
                if(notiRes.status) {
                    let activityRes = await addNewActivity({
                        userUID: userToAdd.value,
                        activity: "Administration",
                        content: "You were added as an admin",
                        
                        atDate: new Date().getTime(),
                        StringDate: getCurrentDate()
                    });
                    if(activityRes.status) {
                        showPopUp(1, "Ajouté avec Success", 1);
                    } else {
                        showPopUp(4, activityRes.error);
                    }
                } else {
                    showPopUp(4, notiRes.error);
                }
            } else {
                showPopUp(4, res1.error);
            }
        } else {
            showPopUp(4, res0.error);
        }
    } else if(confEvent == 3) {
        let res0 = await getUserById(userToRemove.value);
        if(res0.status) {
            let res1 = await updateUserDoc(userToRemove.value, {priviliges: ""});
            if (res1.status){
                let notiRes = await addNewNotification({
                    onWhat: "Administration",
                    content: "You were Removed from Admin",
                    visited: false,
                    userUID: userToRemove.value,
                    sendDate: new Date().getTime(),
                    StringSendDate: getCurrentDate(),
                    type: "Warning",
                    link: "",
                });
                if(notiRes.status) {
                    let activityRes = await addNewActivity({
                        userUID: userToRemove.value,
                        activity: "Administration",
                        content: "You were removed from Admin",
                        
                        atDate: new Date().getTime(),
                        StringDate: getCurrentDate()
                    });
                    if(activityRes.status) {
                        showPopUp(1, "Supprimé avec Success", 1);
                    } else {
                        showPopUp(4, activityRes.error);
                    }
                } else {
                    showPopUp(4, notiRes.error);
                }
            } else {
                showPopUp(4, res1.error);
            }
        } else {
            showPopUp(4, res0.error);
        }
    } else if(confEvent == 4) {
        hidePopUp();
    }
}
</script>

<style scoped>
@import '@/assets/css/AdminPanel.css';
</style>