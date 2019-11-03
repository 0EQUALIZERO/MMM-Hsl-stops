/* Magic Mirror
 * Module: MMM-Hsl-stops
 *
 * By Magnus Huldén
 * MIT Licensed.
 */

Module.register("MMM-Hsl-stops",{


    // Default module configuration
    defaults: {
        updateInterval: 1 * 30 * 1000, // Update 30 secs
        animationSpeed: 2000,
        initialLoadDelay: 1 * 3 * 1000, // start delay seconds.
        firstLoad: true,
    },

    // Fetch helper-scripts
    getScripts: function() {
        return ["moment.js"];
    },

    // Create SVG-icon objects
    svgIconFactory: function(glyph) {
        if(glyph === "BICYCLE_RENT"){glyph = "BICYCLE";}
        glyph = glyph.toLowerCase();
        var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttributeNS(null, "class", "icon large large-icon " + glyph);
        var use = document.createElementNS('http://www.w3.org/2000/svg', "use");
        use.setAttributeNS("http://www.w3.org/1999/xlink", "href", "modules/MMM-HSL-DEV/images/hsl_icons.svg#icon-icon_" + glyph);
        svg.appendChild(use);
 
        return(svg);
    },

    // Fetch translations
    getTranslations: function() {
        return {
            en: "translations/en.json",
            fi: "translations/fi.json",
            sv: "translations/sv.json"
        }
    },

    // Fetch styles
    getStyles: function() {
        return ["font-awesome.css","hsl_stops.css"];
    },

    // Create non-HSL icon objects
    createIcons: function() {
        iconRealtimeClock = document.createElement("i");
        iconRealtimeSpin = document.createElement("i");
        iconRealtimeClock.className = 'fa fa-clock-o';
        iconRealtimeSpin.className = 'fa fa-circle-o-notch fa-spin fa-3x fa-fw';
        iconRocket = document.createElement("i");
        iconRocket.className = 'fa fa-rocket';
    },

    start: function() {
        console.log("Starting module: " + this.name);
        this.loaded = false;
        this.timesUpdated = 1;
        this.updateTimer = null;
        this.scheduleUpdate(this.config.initialLoadDelay);
    },

    // Run update data at interval
    scheduleUpdate: function(delay) {
        var self = this;
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function() {
            self.sendSocketNotification('GETDATA', self.config);
        }, nextLoad);
    },

    // Updated data returned from node_helper
    socketNotificationReceived: function(notification, payload) {
        var self = this;
        if (notification === "HSL_UPDATED" && (self.config.stopId === payload.stopGtfsId)||(self.config.stopId==="test")) {
            // console.log("DEBUG: Retrieved JSON: " + JSON.stringify(payload)); // Debug returned object
            this.config.firstLoad = payload.firstLoad;
            this.stopName = payload.stopName;
            this.stopCode = payload.code;
            stopRoutes = payload.stopRoutes;
            stopTimes = payload.stopTimes;
            this.loaded = true;
            this.updateDom(this.config.animationSpeed);
            this.scheduleUpdate(this.config.updateInterval);
        }

    },

    // Override dom generator.
    getDom: function() {
        this.createIcons();
        var self = this;
        var wrapper = document.createElement("div");
        if (this.config.apiUrl === "") {
            wrapper.innerHTML = self.translate("SETAPI") + this.name + ".";
            return wrapper;
        }
        // Show placeholder till data is loaded
        if (!this.loaded) {
            wrapper.innerHTML = self.translate("LOADING");
            var loader = document.createElement("div");
            loader.className = "loader";
            wrapper.appendChild(loader);
            wrapper.className = "dimmed light small";
            return wrapper;
        }
        // Show data if recieved
        else if (stopRoutes.length > 0 && this.loaded){
            if(self.config.debug) {console.log("DEBUG: Data updated successfully (Times updated: " + self.timesUpdated + ")");};
            self.timesUpdated++;
            var caption = this.getTableCaption();
            var table = document.createElement("table");
            table.appendChild(caption);
            table.appendChild(this.getTableHeader());
            // Show only number of departures defined in config  
            Object.keys(stopTimes).slice(0,self.config.maxListedDepartures).forEach(function(key) {
                var tr = self.getResultRow(stopTimes[key]);
                if (tr !== undefined) {
                    table.appendChild(tr);
                }
                // Include Alert-data if found in returned JSON
                if(stopTimes[key].trip.alerts.alertHeaderText !== undefined){
                    var alerttdLine = document.createElement("td");
                    alerttdLine.colSpan = "4";
                    var alertLine = document.createTextNode(self.translate("ALERT") + ": " + stopTimes[key].trip.alerts.alertHeaderText);
                    alerttdLine.appendChild(alertLine);
                    var trAlert = document.createElement("tr");
                    trAlert.appendChild(alerttdLine);
                    trAlert.className = "alert";
                    table.appendChild(trAlert);
                }
            });
            return table;
        }
        // If nothing is returned
        else {
            var wrapper = document.createElement("div");
            wrapper.innerHTML = this.translate("No data");
            wrapper.className = "small dimmed";
        }

        return wrapper;
    },

    // Create caption for table
    getTableCaption: function() {
        var caption = document.createElement("caption");
        var caption_stopname = document.createElement("div");
        var caption_stopcode = document.createElement("span");
        caption_stopname.className = "stopName bright";
        caption_stopcode.className = "stopCode dimmed";
        var caption_tostop = document.createElement("div");
        caption_tostop.className = "toStop";
        var caption_routes = document.createElement("div");
        caption_routes.className = "routes";
        if(this.config.stopNickName !== ""){
            caption_stopname.appendChild(document.createTextNode(this.config.stopNickName));
        }
        else {
            caption_stopname.appendChild(document.createTextNode(this.stopName));
        }
        
        caption_stopcode.appendChild(document.createTextNode(this.stopCode));
        caption_stopname.appendChild(caption_stopcode);
        caption_tostop.appendChild(this.svgIconFactory("walk"));
        caption_tostop.appendChild(document.createTextNode(this.config.timeToStop + " " + this.translate("MINUTES")));
        for (var key in stopRoutes) {
            if(!stopRoutes.hasOwnProperty(key)) continue;
            val = stopRoutes[key].shortName;
            var route = document.createElement("div");
            if(this.config.routeIdFilter.includes(stopRoutes[key].shortName) || (this.isEmpty(this.config.routeIdFilter))){route.className = "route bright";} // Bright style if route is in routeIdFilter
            else {route.className = "route dimmed";} // Dimmed style if route is not in routeIdFilter
            route.appendChild(this.svgIconFactory(stopRoutes[key].mode));
            route.appendChild(document.createTextNode(" " + val));
            caption_routes.appendChild(route);
        }

        caption.appendChild(caption_stopname);
        caption.appendChild(caption_tostop);
        caption.appendChild(caption_routes);
        return caption;
    },

    // Create header for table
    getTableHeader: function() {
        var thLine = document.createElement("th");
        thLine.className = "light";
        thLine.appendChild(document.createTextNode(this.translate("LINEHEADER")));

        var thDestination = document.createElement("th");
        thDestination.className = "light";
        thDestination.appendChild(document.createTextNode(this.translate("DESTINATIONHEADER")));
        
        var thTimeCurrent = document.createElement("th");
        thTimeCurrent.className = "light time"
        thTimeCurrent.appendChild(document.createTextNode(this.translate("TIMECURRENT")));

        var thTimeNext = document.createElement("th");
        thTimeNext.className = "light time"
        thTimeNext.appendChild(document.createTextNode(this.translate("TIMENEXT")));

        var thead = document.createElement("thead");
        
        thead.addClass = "xsmall dimmed";
        thead.appendChild(thLine);
        thead.appendChild(thDestination);
        thead.appendChild(thTimeCurrent);

        if(!this.config.hideNext) {
            thead.appendChild(thTimeNext);
        }

        
        return thead;
    },

    // Create table rows
    getResultRow: function(stopTimes) {
        this.createIcons();
        var time = moment.unix(stopTimes.serviceDay+stopTimes.scheduledArrival);
        var tdLine = document.createElement("td");
        var iconMode = this.svgIconFactory(stopTimes.trip.route.mode);
        var iconRealTime = this.svgIconFactory("realtime");
        var nexticonRealTime = this.svgIconFactory("realtime");
        var txtLine = document.createTextNode(stopTimes.trip.route.shortName);
         
        tdLine.appendChild(iconMode);
        tdLine.appendChild(txtLine);
        var tdDestination = document.createElement("td");
        tdDestination.className = "destination light";
        tdDestination.appendChild(document.createTextNode(stopTimes.trip.tripHeadsign));
        
        var tdTimeCurrent = document.createElement("td");
        tdTimeCurrent.className = "time light";
        if (stopTimes.realtime){
            tdTimeCurrent.appendChild(iconRealTime);
        }
        tdTimeCurrent.appendChild(document.createTextNode(this.formatTime(time)));

        if(!this.config.hideNext) {
            var tdTimeNext = document.createElement("td");
            if (!stopTimes.trip.nextrealtime){
                tdTimeNext.className = "time light timeNext timeNextNotRealTime";
            }
            else {
                tdTimeNext.appendChild(nexticonRealTime);
                tdTimeNext.className = "time light timeNext timeNextRealTime";
            }
            var timeNext = moment.unix(stopTimes.serviceDay+stopTimes.trip.next);
            tdTimeNext.appendChild(document.createTextNode(this.formatTime(timeNext)));
        }
        
        var tr = document.createElement("tr");
        if (stopTimes.realtime){
            tr.className = "realtime";
        };
        // Apply style if passanger has to hurry, time to departure 0 and x minutes
        if ((this.timeMinutes(time)-this.config.timeToStop)<=this.config.hurryTime) {
            if((this.timeMinutes(time)-this.config.timeToStop)>=0){
                tr.className += " hurry";
            }
        };
        // Apply style if passanger has/will propably missed the departure
        if ((this.timeMinutes(time)-this.config.timeToStop)<0){
            tr.className += " outatime dimmed";
        };
        tr.appendChild(tdLine);
        tr.appendChild(tdDestination);
        tr.appendChild(tdTimeCurrent);
        if(!this.config.hideNext) {
            tr.appendChild(tdTimeNext);
        }
        return tr;
    },

    // Return give value in minutes
    timeMinutes: function(t) {
        var diff = moment.duration(moment(t) - moment.now());
        var min = diff.minutes() + diff.hours() * 60;
        return min;
    },

    // Format time-fields in used in table - parts borrowed from MMM-Ruter
    formatTime: function(t) {
        var diff = moment.duration(moment(t) - moment.now());
        var min = diff.minutes() + diff.hours() * 60;
        moment.locale("fi");
        if (min == 0) {
            return this.translate("NOW")
        } else if (min == 1) {
            return this.translate("1MIN");
        } else if (min < this.config.humanizeTimeTreshold) {
            return min + " " + this.translate("MINUTES");
        } else {
            return moment(t).format("LT");
        }
        moment.locale(this.config.language);
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
    }

});