import Vue from 'vue'
import VueRouter from 'vue-router'

// Routes
// import { canNavigate } from '@/libs/acl/routeProtection'
// import { isUserLoggedIn, getUserData, getHomeRouteForLoggedInUser } from '@/auth/utils'
import { isUserLoggedIn } from '@/auth/utils'
import apps from './routes/apps'
import authentication from './routes/authentication'
import common from './routes/common'
import dashboard from './routes/dashboard'
import pages from './routes/pages'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 }
  },
  routes: [
    { path: '/', redirect: { name: 'dashboard-analytics' } },
    ...apps,
    ...dashboard,
    ...authentication,
    ...common,
    ...pages,
    {
      path: '*',
      redirect: 'error-404',
    },
  ],
})

// router.beforeEach((to, _, next) => {
//   const isLoggedIn = isUserLoggedIn()
//
//   if (!canNavigate(to)) {
//     // Redirect to login if not logged in
//     if (!isLoggedIn) return next({ name: 'auth-login' })
//
//     // If logged in => not authorized
//     return next({ name: 'misc-not-authorized' })
//   }
//
//   if (to.meta.redirectIfLoggedIn && isLoggedIn) {
//     const userData = getUserData()
//     next(getHomeRouteForLoggedInUser(userData ? userData.role : null))
//   }
//
//   return next()
// })

router.beforeEach((to, _, next) => {
  const isLoggedIn = isUserLoggedIn()

  if (!isLoggedIn && to.name !== 'auth-login') {
    // Redirect to login if not logged in
    return next({ name: 'auth-login' })
  }

  return next()
})

export default router
