<template>
    <div class="discussion-list-container">
      <div class="filterSection">
        <Filter @FilterUpdateded="updateFilter"/>
      </div>
      <div class="discussion-list" v-if="discussionsList">
        <DiscussionItem v-for="discussion in discussions" :key="discussion.id" :discussion="discussion"/>
      </div>
      <div v-else>
        Loading...
      </div>
    </div>
</template>
  
<script setup>
/*eslint-disable*/
  import DiscussionItem from '@/components/DiscussionItem.vue';
  import { queryingDiscussion } from '@/composables/useFirestore';
  import { where, orderBy } from "firebase/firestore";
  import { ref, onMounted, computed } from 'vue';
  import Filter from '@/components/FilterPage.vue';
  
  const discussions = computed(() => {
    return discussionsList.value.filter(filterCondition);
  });

  const discussionsList = ref(null);

  const categories = ref([]),
  SubCategories = ref([]),
  Keyword = ref("");

  onMounted( async () => {
    discussionsList.value = await queryingDiscussion("visits");
  });

  async function updateFilter(Categories, Subcategories, keyword, Order) {
    categories.value = Categories;
    console.log(Categories);
    SubCategories.value = Subcategories;
    Keyword.value = keyword;
    
    discussionsList.value = await queryingDiscussion(Order);
  }

  function filterCondition(discussion) {
    let cond1 = true;
    for (let cat of categories.value) {
      if(!discussion.categories.includes(cat)) {
        cond1 = false;
      }
    }

    let cond2 = true;
    for (let cat of SubCategories.value) {
      if(!discussion.SubCategories.includes(cat)) {
        cond2 = false;
      }
    }

    let cond3 = discussion.title.includes(Keyword.value);
    let cond4 = discussion.content.includes(Keyword.value);

    return cond1 && cond2 && (cond3 || cond4);
  }
</script>
  
<style scoped>
.discussion-list-container {
  max-width: 800px;
  margin: 1rem auto;
  padding: 0 1rem;
  z-index: 1;
}

.discussion-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>