<template>
    <div class="form-container">
      <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
      <form @submit.prevent="editDiscussion" class="discussion-form">
        <button @click="emit('CancelModifyMode')" class="cancel-button">
          <i class="fas fa-arrow-left"></i> Annuler
        </button>
        
        <div class="form-group">
          <label>Titre:</label>
          <input type="text" v-model="title" class="form-input" placeholder="Titre de la discussion">
        </div>
        
        <div class="form-group">
          <label>Contenu:</label>
          <textarea v-model="content" class="form-textarea" placeholder="Contenu de la discussion"></textarea>
        </div>
        
        <div class="categories-section">
          <h3>Catégories</h3>
          
          <div class="category-input">
            <input type="text" v-model="categorie" class="form-input" placeholder="Ajouter une catégorie">
            <div class="category-buttons">
              <button @click="changeMode" :class="['mode-button', catMode ? 'active' : '']">
                {{ catMode ? "Catégorie" : "Sous-catégorie" }}
              </button>
              <button @click="appendCategory" class="add-button">
                Ajouter
              </button>
            </div>
            <p class="error-message" v-show="cat_error !== ''">{{ cat_error }}</p>
          </div>
          
          <div class="categories-display">
            <div v-if="Categories.length > 0" class="category-list">
              <h4>Catégories:</h4>
              <div class="tags-container">
                <span v-for="(cat, idx) in Categories" :key="idx" class="category-tag">
                  {{ cat }}
                  <button @click="deleteCategory('Categorie', idx, $event)" class="tag-remove">
                    &times;
                  </button>
                </span>
              </div>
            </div>
            
            <div v-if="Subcategories.length > 0" class="category-list">
              <h4>Sous-catégories:</h4>
              <div class="tags-container">
                <span v-for="(cat, idx) in Subcategories" :key="'sub'+idx" class="subcategory-tag">
                  {{ cat }}
                  <button @click="deleteCategory('Subcategorie', idx, $event)" class="tag-remove">
                    &times;
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <p class="error-message" v-show="submission_err !== ''">{{ submission_err }}</p>
        
        <button type="submit" class="submit-button">Modifier la discussion</button>
      </form>
    </div>
  </template>
  
  <script setup>
  /*eslint-disable*/
  import { ref } from 'vue';
  import { modifyDiscussion, addNewActivity } from '@/composables/useFirestore';
  import { useRouter } from 'vue-router';
  import PopUp from '@/components/PopUp.vue';
  import { hundlePopUp } from '@/composables/PopUpHundle';
  
  const props = defineProps({
      discussionID: String,
      discussion: Object
  });
  
  const emit = defineEmits(["CancelModifyMode"])
  
  const router = useRouter();
  
  const categorie = ref(""),
  Categories = ref(props.discussion.categories),
  Subcategories = ref(props.discussion.SubCategories),
  catMode = ref(true),
  cat_error = ref(""),
  
  title = ref(props.discussion.title),
  content = ref(props.discussion.content),
  submission_err = ref("");
  
  function changeMode(event) {
      event.preventDefault();
      catMode.value = !catMode.value;
  }
  
  function appendCategory(event) {
      event.preventDefault();
      if (categorie.value === "") {
          cat_error.value = "Veuillez entrer une catégorie";
          return;
      }
      if ((Categories.value.includes(categorie.value) && catMode.value) || 
          (Subcategories.value.includes(categorie.value) && !catMode.value)) {
          cat_error.value = catMode.value ? "Cette catégorie existe déjà" : "Cette sous-catégorie existe déjà";
          return;
      }
      cat_error.value = "";
      if(catMode.value) {
          Categories.value.push(categorie.value);
      } else {
          Subcategories.value.push(categorie.value);
      }
      categorie.value = "";
  }
  
  function deleteCategory(type, idx, event) {
      event.preventDefault();
      if(type === "Categorie") {
          Categories.value.splice(idx, 1);
      } else if(type === "Subcategorie") {
          Subcategories.value.splice(idx, 1);
      }
  }
  
  async function editDiscussion(event) {
      event.preventDefault();
  
      if (title.value === "") {
          submission_err.value = "Le titre ne peut pas être vide";
          return;
      }
      if (Categories.value.length === 0) {
          submission_err.value = "Veuillez ajouter au moins une catégorie";
          return;
      }
      if (content.value === "") {
          submission_err.value = "Le contenu ne peut pas être vide";
          return;
      }
  
      submission_err.value = "";

      showPopUp(2, "Voulez-vous modifier cette discussion?", 21);
  
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
    if(confEvent == 21) {
      const NewDiscussion = {
          title: title.value,
          categories: Categories.value,
          SubCategories: Subcategories.value,
          content: content.value,
      };
  
      let response = await modifyDiscussion(props.discussionID, NewDiscussion);
  
      if(response.status) {
        let activityRes = await addNewActivity({
          userUID: props.discussion.authorId,
          activity: "Discussion modified",
          content: content.value.substring(0, 100) + (content.value.length > 100 ? "..." : ""),
          
          atDate: new Date().getTime(),
          StringDate: getCurrentDate()
        });
        if(activityRes.status) {
          showPopUp(1, "Discussion modifiée Successivement.", 25);
        } else {
          showPopUp(3, activityRes.status, 26);
        }
      } else {
          showPopUp(3, response.status, 26);
      }
    } else if(confEvent == 25) {
      router.go();
      hidePopUp();
    } else if(confEvent == 26) {
      hidePopUp();
    }
}
  </script>
  
  <style scoped>
  .form-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
  }
  
  .discussion-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .cancel-button {
    background: none;
    border: none;
    color: #0079d3;
    cursor: pointer;
    margin-bottom: 1rem;
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .cancel-button:hover {
    text-decoration: underline;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }
  
  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #0079d3;
    box-shadow: 0 0 0 2px rgba(0, 121, 211, 0.2);
  }
  
  .form-textarea {
    width: 100%;
    min-height: 150px;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    resize: vertical;
  }
  
  .categories-section {
    margin: 2rem 0;
  }
  
  .categories-section h3 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  .category-input {
    margin-bottom: 1.5rem;
  }
  
  .category-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .mode-button {
    padding: 0.5rem 1rem;
    background-color: #f0f0f0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .mode-button.active {
    background-color: #0079d3;
    color: white;
  }
  
  .add-button {
    padding: 0.5rem 1rem;
    background-color: #0079d3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .error-message {
    color: #d32f2f;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }
  
  .categories-display {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .category-list h4 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: #555;
  }
  
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .category-tag, .subcategory-tag {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
  }
  
  .category-tag {
    background-color: #e1ecf4;
    color: #39739d;
  }
  
  .subcategory-tag {
    background-color: #e1f5fe;
    color: #0288d1;
  }
  
  .tag-remove {
    margin-left: 0.5rem;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0 0.25rem;
  }
  
  .submit-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #0079d3;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: background-color 0.2s;
  }
  
  .submit-button:hover {
    background-color: #0064b7;
  }
  </style>