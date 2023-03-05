<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->

        <q-toolbar-title style="max-width: 100px;">
          Tidescan
        </q-toolbar-title>

        <q-separator dark vertical inset />

        <q-btn-dropdown stretch flat label="Tidechain">
          <q-list>
            <InternalLink
              v-for="link in internalLinks"
              :key="link.title"
              v-bind="link"
            />
          </q-list>
        </q-btn-dropdown>

        <!-- <q-toolbar-title>
          Quasar App
        </q-toolbar-title> -->

        <!-- <div>Quasar v{{ $q.version }}</div> -->

        <q-space />
        <q-btn
          aria-label="Dark theme toggle"
          flat
          round
          :icon="$q.dark.isActive ? matBrightness5 : matBrightness2"
          @click="$q.dark.toggle()"
        >
          <q-tooltip>Toggle dark mode</q-tooltip>
        </q-btn>

      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, getCurrentInstance, watch } from 'vue'
import { useQuasar } from 'quasar'
// import EssentialLink from 'components/EssentialLink.vue'
import InternalLink from 'components/InternalLink.vue'

const matBrightness2 = 'M0 0h24v24H0z@@fill:none;&&M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z'
const matBrightness5 = 'M0 0h24v24H0z@@fill:none;&&M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z'

const internalLinks = [
  {
    title: 'Blocks',
    link: 'blocks'
  },
  {
    title: 'Extrinsics',
    link: 'extrinsics'
  },
  {
    title: 'Events',
    link: 'events'
  },
  {
    title: 'Swaps',
    link: 'swaps'
  },
  {
    title: 'Withdrawals',
    link: 'withdrawals'
  },
  {
    title: 'Deposits',
    link: 'deposits'
  },
  {
    title: 'Accounts',
    link: 'accounts'
  }
]

// const linksList = [
//   {
//     title: 'Docs',
//     caption: 'quasar.dev',
//     icon: 'school',
//     link: 'https://quasar.dev'
//   },
//   {
//     title: 'Github',
//     caption: 'github.com/quasarframework',
//     icon: 'code',
//     link: 'https://github.com/quasarframework'
//   },
//   {
//     title: 'Discord Chat Channel',
//     caption: 'chat.quasar.dev',
//     icon: 'chat',
//     link: 'https://chat.quasar.dev'
//   },
//   {
//     title: 'Forum',
//     caption: 'forum.quasar.dev',
//     icon: 'record_voice_over',
//     link: 'https://forum.quasar.dev'
//   },
//   {
//     title: 'Twitter',
//     caption: '@quasarframework',
//     icon: 'rss_feed',
//     link: 'https://twitter.quasar.dev'
//   },
//   {
//     title: 'Facebook',
//     caption: '@QuasarFramework',
//     icon: 'public',
//     link: 'https://facebook.quasar.dev'
//   },
//   {
//     title: 'Quasar Awesome',
//     caption: 'Community Quasar projects',
//     icon: 'favorite',
//     link: 'https://awesome.quasar.dev'
//   }
// ]

export default defineComponent({
  name: 'MainLayout',

  components: {
    // EssentialLink,
    InternalLink
  },

  setup () {
    const vm = getCurrentInstance()
    const $q = useQuasar() || vm.proxy.$q || vm.ctx.$q

    const leftDrawerOpen = ref(false)
    const theme = ref(null)

    // ----------------------------------------------------
    // dark mode preferences
    theme.value = $q.localStorage.getItem('theme')

    watch(() => $q.dark.isActive, val => {
      theme.value = val ? 'dark' : 'light'
    })

    watch(theme, (val) => {
      $q.localStorage.set('theme', val)
    })

    return {
      // essentialLinks: linksList,
      internalLinks,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      matBrightness2,
      matBrightness5
    }
  }
})
</script>
