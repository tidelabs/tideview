
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'home', path: '', component: () => import('pages/IndexPage.vue') },
      { name: 'blocks', path: 'blocks', component: () => import('pages/Blocks.vue') },
      { name: 'block', path: 'block/:block?', component: () => import('pages/Block.vue') },
      { name: 'extrinsics', path: 'extrinsics', component: () => import('pages/Extrinsics.vue') },
      { name: 'extrinsic', path: 'extrinsic/:extrinsic?', component: () => import('pages/Extrinsic.vue') },
      { name: 'events', path: 'events', component: () => import('pages/Events.vue') },
      { name: 'event', path: 'event/:event?', component: () => import('pages/Event.vue') },
      { name: 'swaps', path: 'swaps', component: () => import('pages/Swaps.vue') },
      { name: 'swap', path: 'swap/:swap?', component: () => import('pages/Swap.vue') },
      { name: 'withdrawals', path: 'withdrawals', component: () => import('pages/Withdrawals.vue') },
      { name: 'withdrawal', path: 'withdrawal/:withdrawal?', component: () => import('pages/Withdrawal.vue') },
      { name: 'deposits', path: 'deposits', component: () => import('pages/Deposits.vue') },
      { name: 'deposit', path: 'deposit/:deposit?', component: () => import('pages/Deposit.vue') },
      { name: 'transfers', path: 'transfers', component: () => import('pages/Transfers.vue') },
      { name: 'transfer', path: 'transfer/:transfer?', component: () => import('pages/Transfer.vue') },
      { name: 'bonds', path: 'bonds', component: () => import('pages/Bonds.vue') },
      { name: 'bond', path: 'deposit/:bond?', component: () => import('pages/Bond.vue') },
      { name: 'rewards', path: 'rewards', component: () => import('pages/Rewards.vue') },
      { name: 'reward', path: 'reward/:reward?', component: () => import('pages/Reward.vue') },
      { name: 'slashes', path: 'slashes', component: () => import('pages/Slashes.vue') },
      { name: 'slash', path: 'slash/:slash?', component: () => import('pages/Slash.vue') },
      { name: 'accounts', path: 'accounts', component: () => import('pages/Accounts.vue') },
      { name: 'account', path: 'account/:address?', component: () => import('pages/Account.vue') },
      { name: 'history', path: 'history/:address?', component: () => import('pages/History.vue') }
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
