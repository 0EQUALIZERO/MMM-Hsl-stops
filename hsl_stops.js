/* Magic Mirror
 * Module: MMM - HSL stops
 *
 * By Magnus Huldén
 * MIT Licensed.
 */

Module.register("hsl_stops",{

    // Default module configuration
    defaults: {
        serviceReloadInterval: 30000,
        timeReloadInterval: 1000,
        humanizeTimeTreshold: 15,
        animationSpeed: 1000
    },

    // Fetch helper-scripts
    getScripts: function() {
        return ["moment.js"];
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

    // Create icons to be used
    getIcons: function() {
        iconRealtime = document.createElement("span");
        iconRealtimeClock = document.createElement("i");
        iconRealtimeSpin = document.createElement("i");
        iconRealtime.className = 'fa-stack fa-3x';
        iconRealtimeClock.className = 'fa fa-clock-o';
        iconRealtimeSpin.className = 'fa fa-circle-o-notch fa-spin fa-3x fa-fw';

        iconBus = document.createElement("i");
        iconBus.className = 'fa fa-bus';

        iconTram = document.createElement("i");
        iconTram.className = 'fa fa-train tram';

        iconTrain = document.createElement("i");
        iconTrain.className = 'fa fa-train';

        iconSubway = document.createElement("i");
        iconSubway.className = 'fa fa-subway';

        iconFerry = document.createElement("i");
        iconFerry.className = 'fa fa-ship';

        iconBicycle = document.createElement("i");
        iconBicycle.className = 'fa fa-bicycle';

        iconAirplane = document.createElement("i");
        iconAirplane.className = 'fa fa-plane';

        iconRocket = document.createElement("i");
        iconRocket.className = 'fa fa-rocket';

        iconWalk = document.createElement("i");
        iconWalk.className = 'fa fa-hand-peace-o fa-rotate-180 fa-flip-vertical';
    },

    start: function() {
        var self = this;
        this.stopName = '';
        stopRoutes = '';
        stopTimes = '';
        iconBus = '';
        iconRealtime = '';
        console.log(this.translate("STARTINGMODULE") + ": " + this.name);
        this.sendSocketNotification("CONFIG", this.config);
        setInterval(function() {
            self.updateDom(self.config.animationSpeed);
        }, this.config.timeReloadInterval);
    },

    // Update data to dom
    socketNotificationReceived: function(notification, payload) {
        if (notification === "HSL_UPDATE") {
            this.stopName = payload.stopName;
            stopRoutes = payload.stopRoutes;
            stopTimes = payload.stopTimes;
            this.updateDom();
        }
    },

    // Override dom generator.
    getDom: function() {
        this.getIcons();
        var self = this;
        if (stopRoutes.length > 0){
            var caption = this.getTableCaption();
            var table = document.createElement("table");
            table.appendChild(caption);
            table.appendChild(this.getTableHeader());
            Object.keys(stopTimes).forEach(function(key) {
                var tr = self.getResultRow(stopTimes[key]);
                table.appendChild(tr);
            });
            return table;
        }
        else {
            var wrapper = document.createElement("div");
            wrapper.innerHTML = this.translate("LOADING");
            wrapper.className = "small dimmed";
        }
        return wrapper;
    },

    // Create caption for table
    getTableCaption: function() {
        var caption = document.createElement("caption");
        var caption_stopname = document.createElement("div");
        caption_stopname.className = "stopName";
        var caption_tostop = document.createElement("div");
        caption_tostop.className = "toStop";
        var caption_routes = document.createElement("div");
        caption_routes.className = "routes";
        caption_stopname.appendChild(document.createTextNode(this.stopName));
        caption_tostop.appendChild(iconWalk);
        caption_tostop.appendChild(document.createTextNode(this.config.toStop/60 + " " + this.translate("MINUTES")));
        Object.keys(stopRoutes).forEach(function(key) {
            var val = document.createTextNode(stopRoutes[key].shortName);
            iconBus = document.createElement("i");
            iconBus.className = 'fa fa-bus';
            caption_routes.appendChild(iconBus);
            caption_routes.appendChild(val);
        });
        caption.appendChild(caption_stopname);
        caption.appendChild(caption_tostop);
        caption.appendChild(caption_routes);
        return caption;
    },

    // Create header for table - parts borrowed from MMM-Ruter
    getTableHeader: function() {
        var thLine = document.createElement("th");
        thLine.className = "light";
        thLine.appendChild(document.createTextNode(this.translate("LINEHEADER")));

        var thDestination = document.createElement("th");
        thDestination.className = "light";
        thDestination.appendChild(document.createTextNode(this.translate("DESTINATIONHEADER")));
        
        var thTime = document.createElement("th");
        thTime.className = "light time"
        thTime.appendChild(document.createTextNode(this.translate("TIMEHEADER")));

        var thead = document.createElement("thead");
        
        thead.addClass = "xsmall dimmed";
        thead.appendChild(thLine);
        thead.appendChild(thDestination);
        thead.appendChild(thTime);
        
        return thead;
    },

    // Create table rows - parts borrowed from MMM-Ruter
    getResultRow: function(stopTimes) {
        this.getIcons();
        var time = moment.unix(stopTimes.serviceDay+stopTimes.scheduledArrival);
        var tdLine = document.createElement("td");
        var txtLine = document.createTextNode(stopTimes.trip.route.shortName);
        if (stopTimes.trip.route.mode === "BUS"){
            tdLine.appendChild(iconBus);
        } else if (stopTimes.trip.route.mode === "TRAM") {
            tdLine.appendChild(iconTram);
        } else if (stopTimes.trip.route.mode === "RAIL") {
            tdLine.appendChild(iconRail);
        } else if (stopTimes.trip.route.mode === "SUBWAY") {
            tdLine.appendChild(iconSubway);
        } else if (stopTimes.trip.route.mode === "FERRY") {
            tdLine.appendChild(iconFerry);
        } else if (stopTimes.trip.route.mode === "AIRPLANE") {
            tdLine.appendChild(iconAirplane);
        } else if (stopTimes.trip.route.mode === "BICYCLE_RENT") {
            tdLine.appendChild(iconBicycle);
        } else {
            tdLine.appendChild(iconRocket);
        }
        tdLine.appendChild(txtLine);

        var tdDestination = document.createElement("td");
        tdDestination.className = "destination light";
        tdDestination.appendChild(document.createTextNode(stopTimes.trip.tripHeadsign));



        var tdTime = document.createElement("td");
        tdTime.className = "time light";
        tdTime.appendChild(document.createTextNode(this.formatTime(time)));
        if (stopTimes.realtime){
            tdTime.appendChild(iconRealtime);
            iconRealtime.appendChild(iconRealtimeClock);
        }

        var tr = document.createElement("tr");
        if (stopTimes.realtime){
            tr.className = "realtime";
        }
        tr.appendChild(tdLine);
        tr.appendChild(tdDestination);
        tr.appendChild(tdTime);
        
        return tr;
    },

    // Format time-fields in used in table - parts borrowed from MMM-Ruter
    formatTime: function(t) {
        var diff = moment.duration(moment(t) - moment.now());
        var min = diff.minutes() + diff.hours() * 60;

        if (min == 0) {
            return this.translate("NOW")
        } else if (min == 1) {
            return this.translate("1MIN");
        } else if (min < this.config.humanizeTimeTreshold) {
            return min + " " + this.translate("MINUTES");
        } else {
            return moment(t).format("LT");
        }
    }

});
