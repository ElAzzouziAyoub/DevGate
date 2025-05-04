<template>
    <div class="auth-container ForEdit" v-if="!isLoading">
        <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
        <div class="auth-card">
            <h2 class="auth-title">Modification du profile</h2>
            
            <div class="input-group">
                <div class="img-input-group">
                    <button @click="removeImage" class="img-remove-btn">&times;</button>
                    <div class="img-container">
                        <img v-if="imgSrc" :src="imgSrc" alt="" @click="triggerFileDialog">
                        <div v-else @click="triggerFileDialog">?</div>
                    </div>
                    <p>Clicker ici pour telecharger une photo</p>
                    <input ref="FileInput" type="file" name="profileImage" accept="image/*" @change="updateProfileImage" hidden>
                </div>
                
                    <input v-model="firstName" type="text" placeholder="Prénom" class="auth-input" />
                    <input v-model="lastName" type="text" placeholder="Nom" class="auth-input" />
                
                <button @click="toggleShowPassFields" class="togglePassField">{{ showPassFields ? 'Ne modifier pas' : 'Modifier' }} le mot de pass</button>
                <div class="password-div" v-show="showPassFields">
                    
                        <input v-model="oldPassword" :type="oldPassType" autocomplete="new-password" placeholder="Mot de passe" class="auth-input" />
                        <button @click="toggleShowPassword('old', $event)" class="toggle-show-pass-btn"><i class="fa fa-eye-slash" v-show="oldPassType === 'password'"></i><i class="fa fa-eye" v-show="oldPassType === 'text'"></i></button>
                        <br>
                        <input v-model="newPassword" :type="newPassType" autocomplete="new-password" placeholder="Nouveau Mot de passe" class="auth-input" />
                        <button @click="toggleShowPassword('new', $event)" class="toggle-show-pass-btn secondOne"><i class="fa fa-eye-slash" v-show="newPassType === 'password'"></i><i class="fa fa-eye" v-show="newPassType === 'text'"></i></button>
                    
                </div>
            </div>
            
            <button @click="router.back()" class="cancelEditBtn">
                <i class="fa fa-arrow-left"></i> Annuler
            </button>
            <button @click="modifyUserProfile" class="auth-button">
                Modifier
            </button>
        </div>
    </div>
    <div v-else>
        <p>Chargement du profil …</p>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import { auth, login } from '@/composables/useAuth';
import { onAuthStateChanged, updatePassword, updateProfile, getAuth } from 'firebase/auth';
import { getUserById, updateUserDoc, addNewActivity } from '@/composables/useFirestore';
import PopUp from '@/components/PopUp.vue';
import { hundlePopUp } from '@/composables/PopUpHundle';
import { uploadImage } from '@/composables/useCloudinary';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(true);
const user = ref(null),
DBUser = ref(null);

const firstName = ref(null);
const lastName = ref(null);

const oldPassword = ref("");
const oldPassType = ref("password");
const newPassword = ref("");
const newPassType = ref("password");

const showPassFields = ref(false);

const profileImage = ref(null);
const imgSrc = ref(null);

const FileInput = ref(null);


function triggerFileDialog(event) {
  event.preventDefault();
  FileInput.value.click();
}

onMounted(() => {
    onAuthStateChanged(auth, async (currentUser) => {
        if(currentUser) {
            user.value = currentUser;

            let response = await getUserById(user.value.uid);

            if(response.status) {
                DBUser.value = response.user;
                imgSrc.value = DBUser.value.profImage;
                let name = DBUser.value.name.split(' ');
                firstName.value = name[0];
                lastName.value = name[1];
                isLoading.value = false;
            } else {
                showPopUp(4, response.error);
            }
        }
    });
});

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


async function modifyUserProfile(event) {
    event.preventDefault();
    try {

        await updateProfile(user.value, {displayName: `${firstName.value} ${lastName.value}`});

        DBUser.value.name = `${firstName.value} ${lastName.value}`;

        const uploadedImage = await uploadImage(profileImage.value);

        DBUser.value.profImage = uploadedImage;
        let response = await updateUserDoc(DBUser.value.userUID, DBUser.value);
        if(!response.status) {
            throw response.error;
        }

        if(showPassFields.value) {
            if(oldPassword.value !== null && oldPassword.value !== "" && newPassword.value !== null && newPassword.value !== "") {
                const USER = await login(user.value.email, oldPassword.value);
                
                const authentic = getAuth();
                await updatePassword(authentic.currentUser, newPassword.value);
            } else {
                throw "Mot de pass vide";
            }
        }
        
        let activRes = await addNewActivity({
            userUID: DBUser.value.userUID,
            activity: "Profile",
            content: "Profile modifié",
            atDate: new Date().getTime(),
            StringDate: getCurrentDate()
        });

        if(!activRes.status) {
            throw activRes.error;
        }

        showPopUp(1, "Profile Modifié", 103);
    } catch(error) {
        showPopUp(4, "Quelque chose n'a pas marchée:\n" + error);
    }
}

function toggleShowPassword(passTypeRef, event) {
  event.preventDefault();
  if(passTypeRef === 'old') {
    if(oldPassType.value === "password") {
        oldPassType.value = "text";
    } else {
        oldPassType.value = "password";
    }
  } else if(passTypeRef === 'new') {
    if(newPassType.value === "password") {
        newPassType.value = "text";
    } else {
        newPassType.value = "password";
    }
  }
}

function toggleShowPassFields(event) {
    event.preventDefault();

    if(showPassFields.value) {
        showPassFields.value = false;
    } else {
        showPassFields.value = true;
    }
}

function updateProfileImage(event) {
  event.preventDefault();
  let image = event.target.files || event.dataTransfer.files;

  if(!image.length) return;

  profileImage.value = image[0];
  imgSrc.value = URL.createObjectURL(image[0]);
}

function removeImage(event) {
  event.preventDefault();

  imgSrc.value = null;
  profileImage.value = null;
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

function ContinueOp(confEvent) {
    if(confEvent == 103) {
        router.push('/profile');
        hidePopUp();
    }
}
</script>

<style scoped>
@import '@/assets/css/EditProfile.css';
</style>