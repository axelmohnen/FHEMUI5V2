// FHEM Utilities
sap.ui.define([
		"sap/m/MessageBox"
	],
	function(MessageBox) {
		"use strict";
		return {

			readFhemData: function(oController, sDeviceId) {
				// Check input
				if (!sDeviceId) {
					MessageBox.error("FHEM: Couldn't read data -> DeviceID is missing");
					return;
				}
				
				var oThis = oController;
				var oModel = oThis.getModel("FhemService");
				//Get config parameters from manifest
				var oConfig = oThis.getOwnerComponent().getManifestEntry("/sap.ui5/config");
				var sPrefix = "?cmd=jsonlist2%20[DeviceID]&XHR=1&fwcsrf=" + oConfig.csrfToken;
				var sPlaceholder = "[DeviceId]";
				var sFhemcmd = oModel.sServiceUrl + sPrefix;
				sFhemcmd = sFhemcmd.replace(sPlaceholder, sDeviceId);

				var oModelFhemData = new sap.ui.model.json.JSONModel();

				// Read FHEM data asynchronous
				oModelFhemData.loadData(sFhemcmd, undefined, true);

				// Handle Request Complete
				oModelFhemData.attachRequestCompleted(function(oData) {

					// Check if we received the data sucessfully
					if (!oModelFhemData.getProperty("/Results/")) {
						return;
					}
					
					var oReadings = oModelFhemData.getProperty("/Results/0/Readings/");
					return oReadings;
				});

				// Error: Service URL is not valid
				oModelFhemData.attachRequestFailed(function(oData) {
					MessageBox.error("Service URL is not valid: " + sFhemcmd);
				});
			}
		};
	});