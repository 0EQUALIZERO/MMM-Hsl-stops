/* Magic Mirror
 * Node Helper: MMM-Hsl-stops
 *
 * By Magnus Huldén
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');
var debug = false;
var moment = require('moment');



module.exports = NodeHelper.create({
	updateTimer: "",
	start: function() {
		this.timesUpdated = 1;
        this.started = false;
        if(debug){console.log("DEBUG: " + this.name +" NodeHelper started")};
	},

	// Apply all filters to dataset and return filtered object
	tripFilters: function(obj,filter,timeToStop) {
		if(debug){console.log("DEBUG: Adding next arrival to dataset");};
		for (i in obj) {
			obj[i] = this.addNextArrival(obj,obj[i],i);	
		}
		if(debug){console.log("DEBUG: Filtering trips with routeIdFilter");};
		var obj = this.filterRoutes(obj,filter);
		//if(debug){console.log("DEBUG: Filtering times by timeToStop");};
		return obj;
	},

	// Search for next arrival time for the same route for the current trip and append it to the object
	addNextArrival: function(obj,objEntry,objKeyId) {
		objEntry.next = "";
		objEntry.next.realtime = false;
		for (i = objKeyId;i < Object.keys(obj).length ;i++) {
			if((objEntry.trip.route.shortName === obj[i].trip.route.shortName)&&(objKeyId!=i)) {
				if(obj[i].realtime){
					objEntry.trip.next = obj[i].realtimeArrival;
				}
				else{
					objEntry.trip.next = obj[i].scheduledArrival;
				}
				objEntry.trip.nextrealtime = obj[i].realtime;
				break;
			}
		}
		return objEntry;
	},

	// Strip from dataset entries that are impropable to make to in time according to given travel time to stop
	filterTimes: function(obj,timeToStop) {
		var filteredObj = {};
		var filteredObj = [];

		for (i in obj) {
			if(obj[i].realtime){
				var arrivalTime = moment.unix(obj[i].serviceDay+obj[i].realtimeArrival);
			}
			else{
				var arrivalTime = moment.unix(obj[i].serviceDay+obj[i].scheduledArrival);
			}

			var diff = moment.duration(moment(arrivalTime) - moment.now());
			var min = diff.minutes() + diff.hours() * 60;
			if(debug){console.log("arrivalTime -> " + min + " timeToStop -> " + timeToStop)};
			if (timeToStop-2 <= min) {
				filteredObj.push(obj[i])
			}
		}
		return filteredObj;
	},

	// Include only routes listed in routeIdFilter
	filterRoutes: function(obj,filter) {
		var filteredObj = {};
		var filteredObj = [];
		if(!this.isEmpty(filter)){
			for (i in obj) {
				if (filter.includes(obj[i].trip.route.shortName)) {
					filteredObj.push(obj[i]);
				}
			}
			return filteredObj;
		}
		else {
			return obj;
		}
	},

	// Check if given object is empty
	isEmpty: function(obj) {

	    // null and undefined are "empty"
	    if (obj == null) return true;

	    // Assume if it has a length property with a non-zero value
	    // that that property is correct.
	    if (obj.length > 0)    return false;
	    if (obj.length === 0)  return true;

	    // If it isn't an object at this point
	    // it is empty, but it can't be anything *but* empty
	    // Is it empty?  Depends on your application.
	    if (typeof obj !== "object") return true;

	    // Otherwise, does it have any properties of its own?
	    // Note that this doesn't handle
	    // toString and valueOf enumeration bugs in IE < 9
	    for (var key in obj) {
	        if (hasOwnProperty.call(obj, key)) return false;
	    }

	    return true;
	},

	// If test-data is used pass data through time machine to match current date
	temporalShift: function(obj){
		for (i in obj) {
			obj[i].serviceDay = moment().startOf('day').valueOf();
		}
		return obj;
	},

	// Update transport data
	updateTransportData: function(payload){
		var self = this;
		if(debug) {console.log("DEBUG: Data updated successfully (Times updated: " + this.timesUpdated + ")");this.timesUpdated++;};
		// If test data JSON-file is used by giving -> testMode: true & testJSON: 'filename', in config.js
		if(payload.testMode) {			
			var obj = require("./"+payload.testJSON);
			for (i in obj) {
				obj[i].stop.stoptimesWithoutPatterns = this.temporalShift(obj[i].stop.stoptimesWithoutPatterns);
			}
			var stopTimesObj = self.tripFilters(obj.data.stop.stoptimesWithoutPatterns,payload.routeIdFilter,payload.timeToStop);
            self.sendSocketNotification("HSL_UPDATED", {
	            stopName: obj.data.stop.name,
	            code: obj.data.stop.code,
	            stopGtfsId: obj.data.stop.gtfsId,
				stopRoutes: obj.data.stop.routes,
				stopTimes: stopTimesObj,
				firstLoad: false,
			});
		}
		// Build query, pass it to the API and return response to the module
		else {
			if(debug){console.log("DEBUG: Update attempted using API");};
			var retry = false;
			var query = '';
			query = '{stop(id: "';
			query += payload.stopId; // StopId here
			query += '") {gtfsId name code routes{shortName mode} stoptimesWithoutPatterns(startTime:0, timeRange:';
			query += payload.timeRange;
			query += ',numberOfDepartures:';
			query += payload.maxFetchedDepartures; // Max number of departures to be shown
			query += '){scheduledArrival serviceDay realtime realtimeArrival trip {tripHeadsign route{shortName mode } alerts{alertHeaderText}}}}}';
			if(debug){console.log("DEBUG: Query: " + query)} // Show constructed Query
			request.post({
				headers: {'Content-Type': 'application/graphql'},
	            url:     payload.apiUrl,
	            body:    query}, function (error, response, body) {
	            if (!error && response.statusCode == 200) {
	            	var obj = JSON.parse(body);
	            	var stopTimesObj = self.tripFilters(obj.data.stop.stoptimesWithoutPatterns,payload.routeIdFilter,payload.timeToStop);
	                self.sendSocketNotification("HSL_UPDATED", {
	                	stopName: obj.data.stop.name,
	                	code: obj.data.stop.code,
	                	stopGtfsId: obj.data.stop.gtfsId,
						stopRoutes: obj.data.stop.routes,
						stopTimes: stopTimesObj
					});
	            }
	            if (error) {
	               if(debug){console.log("DEBUG: Error: " + error)} // Show the ERROR
	            }
	            //if(debug){console.log("DEBUG: Response: " + body)}; // DEBUG RESPONSE
	        });
	    }
	},

	// Run updateTransportData if command is passed from module
	socketNotificationReceived: function(notification, payload) {
        if (notification === 'GETDATA') {
           	this.updateTransportData(payload);
		}
	}
});