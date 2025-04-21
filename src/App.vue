<template>
  <AddProject/>
</template>

<script>
import AddProject from '@/components/AddProject.vue'

export default {
  name: 'App',
  components: {
    AddProject
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
