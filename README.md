# MMM-Hsl-stops
Magic Mirror Module for Helsinki region public transport stops-data

Data from HSL Digitransit Development, can be changed from config.js to production site when they realease production API.

[ Installation and Configuration documentation to be added soon ]

Magic Mirror config/config.js
```
{
  module: 'hsl_stops',
  position: 'top_right',
  config: {
    stopId: 'HSL:1020171',  // Id of the stop you want to display
    numberOfDepartures: '5', // Max number of departures to be listed
    timeRange: '43200', // Range of trips to be polled in seconds
    toStop: '120', // Time to get to the stop in seconds 
    apiUrl: 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql' // HSL digirtransit API url
  }
},
```
