/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"fhemui5v2/fhemui5v2/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});