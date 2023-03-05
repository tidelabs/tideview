import { boot } from 'quasar/wrappers'
import urql from '@urql/vue'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.use(urql, {
    url: 'https://squid.subsquid.io/tidechain-tidescan/v/v2/graphql'
  })
})
