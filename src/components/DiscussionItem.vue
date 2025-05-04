<template>
    <div class="discussion-item" @click="goToDiscussion">
      <PopUp :popUpMode="popUpMode" :content="popUpContent" :type="PopUpType" :colorEffect="effectColor" :confEvent="ConfRef" @DisappearPopUp="hidePopUp" @confirmed="ContinueOp"/>
      <div class="discussion-header">
        <span class="author">{{ discussion.authorName }}</span>
        <span class="date">{{ discussion.createdAtDate }}</span>
      </div>
      
      <h3 class="discussion-title">{{ discussion.title }}</h3>
      
      <div class="categories">
        <span v-for="(cat, idx) in discussion.categories" :key="idx" class="category-tag">
          {{ cat }}
        </span>
        <span v-for="(cat, idx) in discussion.SubCategories" :key="'sub'+idx" class="subcategory-tag">
          {{ cat }}
        </span>
      </div>
      
      <p class="discussion-preview">{{ text }}</p>
    </div>  
</template>
  
  <script setup>
  /*eslint-disable*/
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { modifyDiscussion } from '@/composables/useFirestore';
  import PopUp from '@/components/PopUp.vue';
  import { hundlePopUp } from '@/composables/PopUpHundle';
  
  const router = useRouter();
  
  const props = defineProps({
      discussion: Object,
  });
  
  const text = computed(() => {
    if (props.discussion.content.length < 60) {
      return props.discussion.content;
    }
    return props.discussion.content.substring(0, 60) + '...';
  });

  async function goToDiscussion(event) {
    event.preventDefault();
    const res = await modifyDiscussion(props.discussion.id, {visits: (props.discussion.visits + 1)});
    if(res.status) {
      router.push('/Discussion/' + props.discussion.id);
    } else {
      showPopUp(3, res.error, 39);
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
    if(confEvent == 0) {
        hidePopUp();
    }
}
  </script>
  
<style scoped>
  .discussion-item {
    background: white;
    padding: 1.5rem;
    margin-top: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .discussion-item:hover {
    background-color: rgb(240, 240, 240);
    box-shadow: 0 4px 8px rgba(0, 0, 0);
  }
  
  .discussion-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: #666;
  }
  
  .author {
    font-weight: 600;
  }
  
  .discussion-title {
    margin: 0.5rem 0;
    color: #222;
    font-size: 1.2rem;
  }
  
  .categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
  
  .category-tag {
    background-color: #e1ecf4;
    color: #39739d;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
  }
  
  .subcategory-tag {
    background-color: #e1f5fe;
    color: #0288d1;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
  }
  
  .discussion-preview {
    color: #555;
    font-size: 0.95rem;
    margin-top: 0.5rem;
    line-height: 1.4;
  }
</style>