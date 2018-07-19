<template>
  <div id="app">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12">
          <h2>Points of Interest</h2>
        </div>
        <div class="col-md-12">
          <b-dropdown id="cities" v-bind:text=display class="m-md-2">
            <b-dropdown-item-button v-for="city in cities" v-bind:key="city.name" v-on:click="selected = city">{{ city.name }}</b-dropdown-item-button>
          </b-dropdown>
          <b-table id="destinations" :items="destinationsProvider" :fields="fields" @row-clicked="hotelSelected" striped hover></b-table>
        </div>
        <div class="col-md-12">
          <GmapMap ref="map" style="width: 100%; height: 400px;" :zoom="16" :center="{lat: 43.542619, lng: 6.955665}">
            <GmapMarker v-for="(marker, index) in poi"
              :key="index"
              :position="{ lat: marker.position[0], lng: marker.position[1] }"
              :icon="{ url: marker.icon }"
            />
          </GmapMap>
        </div>
        <div class="col-8" />
        <div class="col-4" id="tagline">
            Powered by <img src="./assets/logo.png">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const serverURL = location.origin;
const server = axios.create({ baseURL: serverURL });
const es = new EventSource(`${serverURL}/events/poi`);

export default {
  name: 'app',
  data() {
    return {
      fields: [
        { key: 'name', label: 'Hotel Name', sortable: true },
        { key: 'address', sortable: false },
        { key: 'airportname', label: 'Airport Name', sortable: true },
        { key: 'icao', label: 'ICAO Code', sortable: true }
      ],
      selected: null,
      cities: [],
      poi: []
    }
  },
  computed: {
    display: function() {
      return this.selected ? this.selected.name : 'Choose a city';
    }
  },
  watch: {
    selected: function() {
      this.$root.$emit('bv::refresh::table', 'destinations');
    }
  },
  methods: {
    destinationsProvider(context) {
      if (null === this.selected) return [];

      let promise = server.get(`/records/hotels/byCity/${this.selected.name}`);

      return promise.then(response => {
        return(response.data);
      }).catch(error => {
        return [];
      });
    },
    hotelSelected(record, index) {
      this.$refs.map.panTo({ lat: record.geo.lat, lng: record.geo.lon });

      server.post('/records/select/geo', record.geo)
      .catch(error => {
        console.log(error)
      });
    }
  },
  mounted: function() {
    es.addEventListener('poi', event => this.poi = JSON.parse(event.data));

    server.get('/records/destinations')
    .then(response => {
      this.cities = response.data;
    })
    .catch(error => {
      console.log(error)
    });
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#tagline img {
  height: 38px;
  margin: 10px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>