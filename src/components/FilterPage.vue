<template>
    <div class="filter">
        <div class="CategoryFilter">
          <div  class="toggleCat">
            <button @click="toggleShowCatFilter"><i class="fa" :class="showCatFilter ? 'fa-angle-up' : 'fa-angle-down'"></i></button>
            <p>Affichier le filtre par categories</p>
          </div>
            <div class="categories-section" v-show="showCatFilter">
            <h4>Catégories</h4>
            <div class="category-input">
                <input
                type="text"
                v-model="categorie"
                class="form-input"
                placeholder="Ajouter une catégorie"
                />
                <div class="category-buttons">
                  <button
                      @click="changeMode"
                      :class="['mode-button', catMode ? 'active' : '']"
                  >
                      {{ catMode ? "Catégorie" : "Sous-catégorie" }}
                  </button>
                  <button @click="appendCategory" class="add-button">
                      Ajouter
                  </button>
                </div>
                <p class="error-message" v-show="cat_error !== ''">
                {{ cat_error }}
                </p>
            </div>
            <div class="categories-display">
                <div v-if="Categories.length > 0" class="category-list">
                <div class="tags-container">
                    <span v-for="(cat, idx) in Categories" :key="idx" class="category-tag">
                    {{ cat }}
                    <button
                        @click="deleteCategory('Categorie', idx, $event)"
                        class="tag-remove"
                    >
                        &times;
                    </button>
                    </span>
                </div>
                </div>
                <div v-if="Subcategories.length > 0" class="category-list">
                <div class="tags-container">
                    <span v-for="(cat, idx) in Subcategories" :key="'sub'+idx" class="subcategory-tag">
                    {{ cat }}
                    <button
                        @click="deleteCategory('Subcategorie', idx, $event)"
                        class="tag-remove"
                    >
                        &times;
                    </button>
                    </span>
                </div>
                </div>
            </div>
            </div>
        </div>
        <div class="normalFilters">
          <div class="keywordFilter">
              <input type="text" v-model="keyword" @keyup="updateFilter" placeholder="Mots clés">
          </div>
          <div class="OrderFilter">
              <select name="" id="filterCateg" v-model="Order" @change="updateFilter">
                  <option value="visits" selected>Order by popilarity</option>
                  <option value="upvotes">Order by upvotes</option>
                  <option value="createdAt">Order by date</option>
              </select>
          </div>
        </div>
    </div>
</template>

<script setup>
/*eslint-disable*/
import { ref } from 'vue';

const emit = defineEmits(["FilterUpdateded"]);
const categorie = ref(""),
Categories = ref([]),
Subcategories = ref([]),
catMode = ref(true),
keyword = ref(""),
Order = ref("visits"),
cat_error = ref("");

const showCatFilter = ref(false);

function toggleShowCatFilter(event) {
  event.preventDefault();

  if(showCatFilter.value) {
    showCatFilter.value = false;
  } else {
    showCatFilter.value = true;
  }
}

function changeMode(event) {
    event.preventDefault();
    if(catMode.value) {
        catMode.value = false;
    } else {
        catMode.value = true;
    }
}
  
function appendCategory(event) {
    event.preventDefault();
    if (categorie.value === "") {
        cat_error.value = "Empty Category";
        return;
    }
    if (
    (Categories.value.includes(categorie.value) && catMode.value) || 
    (Subcategories.value.includes(categorie.value) && !catMode.value)
    ) {
        cat_error.value = catMode.value ? "Category exist already" : "Sub-category exist already";
        return;
    }
    cat_error.value = "";
    if(catMode.value) {
        Categories.value.push(categorie.value);
    } else {
        Subcategories.value.push(categorie.value);
    }
    categorie.value = "";

    emit("FilterUpdateded", Categories.value, Subcategories.value, keyword.value, Order.value);
}

function deleteCategory(type, idx, event) {
    event.preventDefault();
    if(type === "Categorie") {
        Categories.value.splice(idx, 1);
    } else if(type === "Subcategorie") {
        Subcategories.value.splice(idx, 1);
    }
    emit("FilterUpdateded", Categories.value, Subcategories.value, keyword.value, Order.value);
}

function updateFilter(event) {
    event.preventDefault();

    emit("FilterUpdateded", Categories.value, Subcategories.value, keyword.value, Order.value);
}
</script>

<style scoped>
@import '@/assets/css/Filter.css';
</style>