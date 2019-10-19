# MMM-Hsl-stops

A Magic Mirror Module for Finnish National public transport stops-data

Data from Finnish National Digitransit API.

Parts borrowed from similar projects like:
https://github.com/lgmorand/MMM-Ratp
https://github.com/CatoAntonsen/MMM-Ruter

## Installation of module and dependencies

- git clone https://github.com/0EQUALIZERO/MMM-Hsl-stops.git into ~/MagicMirror/modules directory.
- npm install in your ~/MagicMirror/modules/MMM-Hsl-stops directory.

## TODO for this Module

- [x] Installation and configuration documentation
- [x] List multiple stops
- [x] Filter routes from stop
- [x] Get HSL's own icons
- [x] Show platform data if available
- [x] Display number of the stop if available (code in HSL data)
- [x] Show status of trips if available (cancellations)
- [ ] Group multiple stops as one stop (large stations)
- [ ] Calculate distance and time to stop from current coordinates
- [x] Display warning if traveltime to stop nears route arrivaltime
- [ ] Favourite trip, show times for multiples routes along favourite journey
- [x] Work on UI look

## Add to Config.js
```
{
	module: 'MMM-Hsl-stops',
	position: 'top_right',
	config: {
		stopId: 'HSL:1173148',  // FeedId and StopId of the stop you want to display, give id test to use test data JSON
		debug: false, // Increase log output
		testMode: false, // Activate module in test-mode using provided static JSON test data
		testJSON: 'test',
		hurryTime: 5, // In minutes apply hurrytime is passenger has to hurry, 0-x minutes
		stopNickName: '', // Personalize stop name with a nickname
		routeIdFilter: ['23','69'], // Routes filters, retain only the routes listed here
		maxListedDepartures: '5', // Max number of departures listed on screen
		maxFetchedDepartures: '100', // Max number of departures fetched from API to dataset
		timeRange: 12 * 60 * 60, // Range of trips to be polled in seconds
		timeToStop: 8, // Time to get to the stop in minutes
		humanizeTimeTreshold: 15,
		apiUrl: 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql', // Finnish National Digitransit API url
		hideNext: true
	}	                            
},
```

## Configuration

- feedID's (different transportation companies) can be explored from [Digitransit's site].(https://api.digitransit.fi/graphiql/finland?query=%7B%0A%20%20feeds%20%7B%0A%20%20%20%20feedId%0A%20%20%20%20agencies%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)
- stopID's can also be browsed in website: https://beta.digitransit.fi, select a stop -> open stop in window -> stopId can be copied from url and appended to HSL:### in stopID field
- HSL stopID's can be explored with GraphiQL @ https://api.digitransit.fi/graphiql/hsl.
- Translations can be found in your ~/MagicMirror/modules/MMM-Hsl-stops/translations directory, translations for English,Finnish and Swedish are provided and can be modified by updating the en.json,fi.json and sv.json -files.

## Config Options

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `stopId` | `HSL:1173148` | Id of the stop you want to display. |
| `debug` | `false` | Increase log output |
| `testMode` | `false` | Activate test-mode for module. If activated json file must be provided |
| `testJSON` | `test` | Name of JSON file to be used in test mode; test.json provided |
| `hurryTime` | `5` | In minutes time to arrival where passenger has to hurry, applying hurry-style. |
| `stopNickName` | ``  |Instead of API data stopname a nickname can be displayed. |
| `routeIdFilter` | [] | Routes filters, retain only the routes listed her. Like ['23','69']|
| `maxListedDepartures` | `5` | Max number of departures listed on screen |
| `maxFetchedDepartures` | `100`|  Max number of departures fetched from API to dataset |
| `timeRange` | `12 * 60 * 60` | Range of trips to be polled in seconds |
| `timeToStop` | `8` | Time to get to the stop in minutes |
| `humanizeTimeTreshold` | `15` | Time in minutes |
| `apiUrl` | `https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql` | URL to digitransit API |

![alt tag](https://raw.githubusercontent.com/0EQUALIZERO/MMM-Hsl-stops/master/images/screenshot.png)