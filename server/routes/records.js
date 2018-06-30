const express = require('express');
const router = express.Router();

router.get('/destinations', async function(req, res, next) {
  let couchbase = req.app.locals.couchbase;
  let travel = req.app.locals.travel;
  let queryPromise = Promise.promisify(travel.query, { context: travel });

  let query = `SELECT DISTINCT airport.city as name
              FROM \`travel-sample\` airport
              INNER JOIN \`travel-sample\` hotel
              USE HASH(probe)
              ON hotel.city = airport.city
              WHERE airport.type = 'airport'
              AND hotel.type = 'hotel';`;
  
  query = couchbase.N1qlQuery.fromString(query);
  
  await queryPromise(query)
  .then(rows => res.json(rows))
  .catch(err => {
    console.log(err);
    res.status(500).send({ error: err });
  });
});

router.get('/hotels/byCity/:id', async function(req, res, next) {
  let couchbase = req.app.locals.couchbase;
  let travel = req.app.locals.travel;
  let queryPromise = Promise.promisify(travel.query, { context: travel });

  let query = `SELECT hotel.name, hotel.address, airport.airportname, airport.icao, hotel.geo
              FROM \`travel-sample\` airport
              INNER JOIN \`travel-sample\` hotel
                ON hotel.type = 'hotel' AND hotel.city = airport.city 
              WHERE airport.type = 'airport'
                AND airport.city = '${req.params.id}'
              LIMIT 5;`;
  
  query = couchbase.N1qlQuery.fromString(query);
  
  await queryPromise(query)
  .then(rows => res.json(rows))
  .catch(err => {
    console.log(err);
    res.status(500).send({ error: err });
  });
});  

router.post('/select/geo', async function(req, res, next) {
  let couchbase = req.app.locals.couchbase;
  let travel = req.app.locals.travel;
  let queryPromise = Promise.promisify(travel.query, { context: travel });

  let location = JSON.stringify(req.body);

  let query = `UPSERT INTO \`travel-sample\` (KEY, VALUE) VALUES('trigger', ${location})`;
  
  query = couchbase.N1qlQuery.fromString(query);
  
  await queryPromise(query)
  .then(response => res.json(response))
  .catch(err => {
    console.log(err);
    res.status(500).send({ error: err });
  });
});

module.exports = router;