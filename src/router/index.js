import { createRouter, createWebHistory } from 'vue-router'
import AddProject from '@/components/AddProject.vue'
import HomePage from '@/components/HomePage.vue'
import ProjectPage from '@/components/ProjectPage.vue'
import AuthForm from '@/components/AuthForm.vue'
import editProject from '@/components/editProject.vue'
import CompetencePage from '@/components/CompetencePage.vue'
import addCompetencePage from '@/components/addCompetencePage.vue'
import editCompetencePage from '@/components/editCompetencePage.vue'
import ProfilePage from '@/components/ProfilePage.vue'
import ObjectivesPage from '@/components/ObjectivesPage.vue'
import EditObjectif from '@/components/EditObjectif.vue'
import ViewObjectives from '@/components/ViewObjectives.vue'
import UserPage from '@/components/UserPage.vue'


const routes = [
  {
    path : '/',
    name : 'AuthForm',
    component : AuthForm
  },
  {
    path : "/friends",
    name : 'FriendPage',
    component : UserPage
  },

  {
    path : '/objectives',
    component: ObjectivesPage
  },
  {
    path : '/viewobjectives',
    component : ViewObjectives

  },
  {
    path : '/editobjectives/:id',
    component : EditObjectif,
  },
  {
    path: '/addproject',
    name: 'AddProject',
    component: AddProject
  },
  {
    path : '/home',
    name : 'HomePage',
    component : HomePage
  },
  {
    path : "/project",
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

  },
  {
    name : 'ProfilePage',
    path : '/profile',
    component : ProfilePage
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})


export default router
