<template>
    <div class="auth-container">
      <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
      <div class="auth-card">
        <h2 class="auth-title">{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>
        
        <div class="input-group">
          <div v-if="!isLogin" class="img-input-group">
            <button @click="removeImage" class="img-remove-btn">&times;</button>
            <div class="img-container">
              <img v-if="imgSrc" :src="imgSrc" alt="" @click="triggerFileDialog">
              <div v-else @click="triggerFileDialog">?</div>
            </div>
            <p>Clicker ici pour telecharger une photo</p>
            <input ref="FileInput" type="file" name="profileImage" accept="image/*" @change="updateProfileImage" hidden>
          </div>
          <input v-model="email" type="email" placeholder="Email" class="auth-input" />
          <div class="password-div">
            <input v-model="password" :type="passwordType" placeholder="Mot de passe" class="auth-input pass-input" />
            <button @click="toggleShowPassword" class="toggle-show-pass-btn"><i class="fa fa-eye-slash" v-show="passwordType === 'password'"></i><i class="fa fa-eye" v-show="passwordType === 'text'"></i></button>
          </div>
          <template v-if="!isLogin">
            <input v-model="firstName" type="text" placeholder="Prénom" class="auth-input" />
            <input v-model="lastName" type="text" placeholder="Nom" class="auth-input" />
          </template>
        </div>
        
        <button @click="handleSubmit" class="auth-button">
          {{ isLogin ? 'Se connecter' : 'S\'inscrire' }}
        </button>
        
        <p @click="toggleForm" class="auth-toggle">
          {{ isLogin ? 'Pas encore inscrit ? Créer un compte' : 'Déjà un compte ? Se connecter' }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  /*eslint-disable*/
  import { ref } from 'vue'
  import { login, signup } from '@/composables/useAuth'
  import { updateProfile } from 'firebase/auth'
  import { useRouter } from 'vue-router'
  import { addNewUser } from '@/composables/useFirestore'
  import { auth } from '@/composables/useAuth'
  import PopUp from '@/components/PopUp.vue'
  import { hundlePopUp } from '@/composables/PopUpHundle'
  import { uploadImage } from '@/composables/useCloudinary'
  
  
  const email = ref('')
  const password = ref('')
  const firstName = ref('')
  const lastName = ref('')
  const isLogin = ref(true)
  const profileImage = ref(null);
  const imgSrc = ref(null);
  const router = useRouter();
  const passwordType = ref("password");
  
  const FileInput = ref(null);
  
  function getCurrentDate() {
      return new Date().toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long"
      });
  }
  
  function triggerFileDialog(event) {
    event.preventDefault();
    FileInput.value.click();
  }
  
  const handleSubmit = async () => {
    try {
      if (isLogin.value) {
        await login(email.value, password.value);
      } else {
        const userCredential = await signup(email.value, password.value)
        await updateProfile(userCredential.user, {
          displayName: `${firstName.value} ${lastName.value}`
        })
  
        const uploadedImage = await uploadImage(profileImage.value);
  
        const newUser = {
          name: `${firstName.value} ${lastName.value}`,
          userUID: auth.currentUser.uid,
          priviliges: "",
          numUpvotes: 0,
          JoinDate: getCurrentDate(),
          email: email.value,
          profImage: uploadedImage,
          admin: false,  
          first_name: firstName.value || "Undefined", 
          last_name: lastName.value || "Undefined", 
          following : [],
          followings : []
        }
        
        await addNewUser(auth.currentUser.uid, newUser);
      }
      showPopUp(1, "Connecté avec success!", 0);
    } catch (err) {
      console.log(err);
      showPopUp(4, "Faild Connexion: Cridentials Error");
    }
  }
  
  const toggleForm = () => {
    isLogin.value = !isLogin.value
    firstName.value = ''
    lastName.value = ''
  }
  
  function toggleShowPassword(event) {
    event.preventDefault();
    if(passwordType.value === "password") {
      passwordType.value = "text";
    } else {
      passwordType.value = "password";
    }
  }
  
  function updateProfileImage(event) {
    event.preventDefault();
    let image = event.target.files || event.dataTransfer.files;
  
    if(!image.length) return;
  
    profileImage.value =image[0];
    imgSrc.value = URL.createObjectURL(image[0]);
  }
  
  function removeImage(event) {
    event.preventDefault();
  
    imgSrc.value = null;
    profileImage.value = null;
  }
  
  
  const popUpMode = ref(false),
  popUpContent = ref(""),
  PopUpType = ref("Warining"),
  effectColor = ref(''),
  ConfRef = ref(null);
  
  function showPopUp(mode, content, eventConf=null) {
      hundlePopUp(mode, content, eventConf, popUpMode, popUpContent, PopUpType, effectColor, ConfRef);
  }
  
  function hidePopUp() {
      hundlePopUp(0, '', null, popUpMode, popUpContent, PopUpType, effectColor, ConfRef);
  }
  
  function ContinueOp(confEvent) {
    console.log(confEvent);
      if(confEvent == 0) {
          router.push('/');
      }
  }
  </script>
  
  
  <style scoped>
  @import '@/assets/css/Authentication.css';
  </style>