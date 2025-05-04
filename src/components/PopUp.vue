<template>
    <div class="popUp" v-show="popUpMode">
        <div :style="style" class="PopUpCard">
            <p>{{ content }}</p>
            <button v-if="type !== 'Info'" :class="{'SuccessBtn': type == 'Success', 'WarningBtn': type == 'Warning', 'InfoBtn': type == 'Info', 'CriticalBtn': type == 'Critical'}" @click="emit('DisappearPopUp')"><i class="fa fa-close"></i></button>
            <div class="buttons" v-if="type == 'Success'">
                <button class="SuccessBtn" @click="emit('confirmed', confEvent)"><i class="fa fa-check"></i>Done</button>
            </div>
            <div class="buttons" v-if="type == 'Warning'">
                <button class="WarningBtn" @click="emit('DisappearPopUp')">Non</button>
                <button class="WarningBtn" @click="emit('confirmed', confEvent)">Oui</button>
            </div>
            <div class="buttons" v-if="type == 'Info'">
                <button class="InfoBtn" @click="emit('confirmed', confEvent)">OK</button>
            </div>
            <div class="buttons" v-if="type == 'Critical'">
                <button class="CriticalBtn" @click="emit('DisappearPopUp')">OK</button>
            </div>
        </div>
    </div>
</template>

<script setup>
/*eslint-disable*/
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const emit = defineEmits(["DisappearPopUp", "confirmed"]);
const props = defineProps({
    popUpMode: Boolean,
    content: String,
    type: String,
    colorEffect: String,
    confEvent: Number,
});

const style = computed(() => {
    return 'color: ' + props.colorEffect + '; border : 1px solid ' + props.colorEffect + ';' ;
});
</script>

<style scoped>
@import '@/assets/css/PopUpStyle.css';
</style>