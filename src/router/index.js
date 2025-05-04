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
import CreatePage from '@/components/CreatePage.vue'
import NotificationPage from '@/components/NotificationPage.vue'
/*---*/
import ProfileView from '@/views/ProfileView.vue';
import Administration from '@/views/Administration.vue';
import Notification from '@/views/NotificationPage.vue';
import EditProfile from '@/views/EditProfile.vue';


const routes = [
  {
    path : '/',
    name : 'AuthForm',
    component : AuthForm
  },
  {
    path : '/create',
    component : CreatePage
  },
  {
    path : '/notif',
    component : NotificationPage
  }
  ,
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
  },
  { path: '/profiles', component: ProfileView },
  { path: '/profile/:userUID', component: ProfileView },
  { path: '/Administration', component: Administration },
  { path: '/notification', component: Notification },
  {path: '/edit-profile', component: EditProfile},
  {
    path: '/Discussion/:id',
    name: 'discussion',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('@/views/DiscussionPage.vue'),
    props: true,
  },
  {
    path : '/forumhome',
    name : 'ForumHoome',
    component : () =>import('@/views/HomePage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})


export default router
