
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'home', path: '', component: () => import('pages/IndexPage.vue') },
      { name: 'swaps', path: 'swaps', component: () => import('pages/Swaps.vue') },
      { name: 'withdrawals', path: 'withdrawals', component: () => import('pages/Withdrawals.vue') },
      { name: 'deposits', path: 'deposits', component: () => import('pages/Deposits.vue') },
      { name: 'transfers', path: 'transfers', component: () => import('pages/Transfers.vue') },
      { name: 'bonds', path: 'bonds', component: () => import('pages/Bonds.vue') },
      { name: 'rewards', path: 'rewards', component: () => import('pages/Rewards.vue') },
      // { name: 'slashes', path: 'slashes', component: () => import('pages/Slashes.vue') },
      { name: 'accounts', path: 'accounts', component: () => import('pages/Accounts.vue') },
      { name: 'history', path: 'history/:address?', component: () => import('pages/History.vue') },
      { name: 'active-bonds', path: 'active-bonds', component: () => import('pages/ActiveBonds.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
