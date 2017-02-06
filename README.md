# MMM-Hsl-stops
Magic Mirror Module for Helsinki region public transport stops-data

Data from HSL Digitransit Development.


### TODO for this Module

- [ ] Installation and configuration documentation
- [ ] List multiple stops
- [ ] Filter routes from stop
- [ ] Get HSL's own icons
- [ ] Show platform data if available
- [ ] Display number of the stop if available (code in HSL data)
- [ ] Show status of trips if available (cancellations)
- [ ] Select multiple stops as one stop (large stations)
- [ ] Calculate distance and time to stop from current coordinates
- [ ] Display warning if traveltime to stop nears route arrivaltime
- [ ] Favourite trip, show times for multiples routes along favourite journey
- [ ] Work on UI look

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
![alt tag](https://raw.githubusercontent.com/0EQUALIZERO/MMM-Hsl-stops/master/images/screenshot.png)
