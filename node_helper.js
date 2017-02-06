/* Magic Mirror
 * Node Helper: hsl_stops
 *
 * By Magnus Huldén
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');

module.exports = NodeHelper.create({
	start: function() {
		console.log("Starting module: " + this.name);
	},
	socketNotificationReceived: function(notification, config) {
		if (notification === "CONFIG") {
			this.config = config;
			this.initGetData();
			return;
		}
	},
	initGetData: function() {
		var self = this;
		
		this.getStopsData();
		
		setInterval(function() {
			self.getStopsData();
		}, self.config.serviceReloadInterval);
	},

	// Build query
	getStopsData: function() {
		var self = this;
		var query = '';
		query = '{stop(id: "';
		query += self.config.stopId; // StopId here
		query += '") {name code routes{shortName} stoptimesWithoutPatterns(startTime:0, timeRange:';
		query += self.config.timeRange;
		query += ',numberOfDepartures:';
		query += self.config.numberOfDepartures; // Max number of departures to be shown
		query += '){scheduledArrival serviceDay realtime realtimeArrival trip {tripHeadsign route{shortName mode }}}}}';
		request.post({
			headers: {'Content-Type': 'application/graphql'},
            url:     self.config.apiUrl,
            body:    query}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
            	var obj = JSON.parse(body);
                self.sendSocketNotification("HSL_UPDATE", {
                	stopName: obj.data.stop.name,
					stopRoutes: obj.data.stop.routes,
					stopTimes: obj.data.stop.stoptimesWithoutPatterns
				});
            }
            if (error) {
                console.log(error) // Show the ERROR
            }
            //console.log(body); // DEBUG RESPONSE
        });
	}

});