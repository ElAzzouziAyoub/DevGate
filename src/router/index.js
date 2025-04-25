import { createRouter, createWebHistory } from 'vue-router'
import AddProject from '@/components/AddProject.vue'
import ProjectPage from '@/components/ProjectPage.vue'
import AuthForm from '@/components/AuthForm.vue'
import editProject from '@/components/editProject.vue'
import CompetencePage from '@/components/CompetencePage.vue'
import addCompetencePage from '@/components/addCompetencePage.vue'
import editCompetencePage from '@/components/editCompetencePage.vue'


const routes = [
  {
    path : '/',
    name : 'AuthForm',
    component : AuthForm

  }
  ,
  {
    path: '/addproject',
    name: 'AddProject',
    component: AddProject
  },
  {
    path : '/project',
    name : 'ProjectPage',
    component : ProjectPage
  },
  {
    path : '/editproject/:id',
    name : 'editProject',
    component : editProject
  },
  {
    path : '/addcompetence',
    component : addCompetencePage
  },
  {
    path : '/competence',
    component : CompetencePage
  },
  {
    name : 'editCompetencePage',
    path : '/editcompetence/:id',
    component : editCompetencePage

  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
