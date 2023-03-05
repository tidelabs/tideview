
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'blocks', component: () => import('pages/Blocks.vue') },
      { path: 'block/:block?', component: () => import('pages/Block.vue') },
      { path: 'extrinsics', component: () => import('pages/Extrinsics.vue') },
      { path: 'extrinsic/:extrinsic?', component: () => import('pages/Extrinsic.vue') },
      { path: 'events', component: () => import('pages/Events.vue') },
      { path: 'event/:event?', component: () => import('pages/Event.vue') },
      { path: 'swaps', component: () => import('pages/Swaps.vue') },
      { path: 'swap/:swap?', component: () => import('pages/Swap.vue') },
      { path: 'withdrawals', component: () => import('pages/Withdrawals.vue') },
      { path: 'withdrawal/:withdrawal?', component: () => import('pages/Withdrawal.vue') },
      { path: 'deposits', component: () => import('pages/Deposits.vue') },
      { path: 'deposit/:deposit?', component: () => import('pages/Deposit.vue') },
      { path: 'accounts', component: () => import('pages/Accounts.vue') },
      { path: 'account/:address?', component: () => import('pages/Account.vue') }
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
