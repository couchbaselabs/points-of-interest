global.Promise = require('bluebird')
import config from './config'
import Vue from 'vue'
import BootstrapVue from "bootstrap-vue"
import App from './App.vue'
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.use(BootstrapVue)

Vue.use(VueGoogleMaps, {
  load: {
    key: config.googleMapsKey
  }
})

new Vue({
  el: '#app',
  render: h => h(App)
})
