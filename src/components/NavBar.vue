<template>
    <div class="header">
      <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
      <div class="Logo">
        <i class="fa navIcon" :class="[hiddenMenu ? ' fa-navicon' : ' fa-close']" @click="toggleShowMenu"></i>
      <h3>DevForum</h3>
      </div>
      <div v-if="DBUser" class="navigationBar" :class="[hiddenMenu ? ' hiddenBlock' : ' showedBlock']">
        <button @click="router.push('/home')">Home</button>
        <button @click="goToCreateDisc">Créer une Discussion</button>
        <button @click="router.push('/home')">DevGate</button>
        <button v-if="DBUser?.priviliges === 'Admin' || DBUser?.priviliges === 'Moderator'" @click="router.push('/Administration')">Administration</button>
      </div>
      <div v-else class="navigationBar" :class="[hiddenMenu ? ' hiddenBlock' : ' showedBlock']">
        <button @click="router.push('/home')">Home</button>
        <button @click="goToCreateDisc">Créer une Discussion</button>
        <button @click="router.push('/home')">DevGate</button>
        
      </div>
      <div class="user">
        <div class="ForUnsignedUsers">
          <button @click="router.push('/')" v-if="!user">Log in</button>
        </div>
        <div class="ForSignedUsers" v-if="user">
          <div class="notif" @click="router.push('/notification')">
            <div class="notifNum" v-show="notificationRef">{{ notificationRef }}</div>
            <div><i class="fa-solid fa-bell"></i></div>
          </div>
          <div class="profile" @click="toggleShowUserMenu">
            <i class="fa-solid fa-user"></i>
            <div class="userList" v-show="!hiddenUserMenu">
              <div @click="router.push('/profile')">Profile</div>
              <div @click="router.push('/')">S'inscrire</div>
              <div @click="signOut">Se déconnecter</div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
/*eslint-disable*/
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { auth } from "@/composables/useAuth";
  import { onAuthStateChanged } from "firebase/auth";
  import { getUserById, getNumOfNotifications } from "@/composables/useFirestore";
  import { hundlePopUp } from "@/composables/PopUpHundle";
  import PopUp from "@/components/PopUp.vue";
  import { signOut as firebaseSignOut } from 'firebase/auth';

  const router = useRouter();
  const user = ref(null);
  const DBUser = ref(null);

  const notificationRef = ref(0);

  const hiddenMenu = ref(true);
  const hiddenUserMenu = ref(true);

  onMounted(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if(currentUser) {
        user.value = currentUser;

        let response = await getUserById(user.value.uid);

        if(response.status) {
          DBUser.value = response.user;
        }

        getNumOfNotifications(user.value.uid, notificationRef);
      }
    });

  });

  
  // Déconnexion de l'utilisateur
  const signOut = async () => {
      try {
        await firebaseSignOut(auth);
        router.push("/Connexion");
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
      }
  };
  

  function toggleShowMenu(event) {
    event.preventDefault();

    if(hiddenMenu.value) {
      hiddenMenu.value = false;
    } else {
      hiddenMenu.value = true;
    }
  }

  function toggleShowUserMenu(event) {
    event.preventDefault();

    if(hiddenUserMenu.value) {
      hiddenUserMenu.value = false;
    } else {
      hiddenUserMenu.value = true;
    }
  }

  function goToCreateDisc(event) {
    event.preventDefault();

    if(user.value !== null) {
      router.push('/Discussion/0')
    } else {
      showPopUp(2, "Voulez-vous s'incsrire?", 78);
    }
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
    if(confEvent == 78) {
      router.push('/Connexion');
    }
}
  
</script>

<style scoped>
@import '@/assets/css/NavBar.css';
</style>