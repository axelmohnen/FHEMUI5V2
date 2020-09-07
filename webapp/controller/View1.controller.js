sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/f/dnd/GridDropInfo",
	"fhemui5v2/fhemui5v2/util/FhemUtils"
], function (Controller, JSONModel, DragInfo, DropInfo, GridDropInfo, FhemUtils) {
	"use strict";
	
	var that;
	
	return Controller.extend("fhemui5v2.fhemui5v2.controller.View1", {
		onInit: function () {
			this.oModelDummy = new JSONModel("model/cardManifestMainDummy.json");
			this.initData();
			this.attachDragAndDrop();
		},

		initData: function () {
			//Init card list
			this.byId("listId").setModel(new JSONModel("model/cardManifestMain.json"));

			//Init card grid
			this.byId("gridContainerId").setModel(new JSONModel("model/cardManifestMain.json"));
		},

		updateCardGrid: function () {
			that = this;
			//Get card grid
			var oGridModel = this.byId("gridContainerId").getModel();
			var oGridCardData = oGridModel.getData();

			if (oGridCardData.cards instanceof Array) {
				oGridCardData.cards.forEach(function (oGridData, i) {
					//var oManifest = new JSONModel(oValue.manifest);
					
					var oManifest = new sap.ui.model.json.JSONModel();

				// Read FHEM data asynchronous
				oManifest.loadData(oGridData.manifest, undefined, true);

				// Handle Request Complete
				oManifest.attachRequestCompleted(function(oData) {
					var oAppData = oManifest.getProperty("/sap.app/");
					var aCardData = oManifest.getProperty("/sap.card/content/data/json/");
					
					//Read the actual data from FHEM for given device ID
					var aFhemData = FhemUtils.readFhemData(that, oAppData.DeviceId );
					
					if (aCardData instanceof Array) {
						aCardData.forEach(function (oCardData, j) {
							
							for(var k; k <= aFhemData.length; k++){
								if (!oCardData.ReadingId === aFhemData[k].XYZ){
									continue;
								}
							}
						});
					}
					
					
					
				});
				
				// Error: Service URL is not valid
				oManifest.attachRequestFailed(function(oData) {
					//MessageBox.error("Service URL is not valid: " + sFhemcmd);
				});
				
				});
			}
		},

		onMenuButtonPress: function () {
			this.updateCardGrid();

			var oDynamicSideContent = this.byId("dynamicSideContentId");
			if (oDynamicSideContent.getShowSideContent()) {
				oDynamicSideContent.setShowSideContent(false);
			} else {
				oDynamicSideContent.setShowSideContent(true);
			}
		},

		attachDragAndDrop: function () {
			var oGrid = this.byId("gridContainerId"),
				oList = this.byId("listId");

			oList.addDragDropConfig(new DragInfo({
				sourceAggregation: "items",
				dragStart: this.onDrag.bind(this)
			}));
			oList.addDragDropConfig(new DropInfo({
				targetAggregation: "items",
				dropPosition: "Between",
				dropLayout: "Vertical",
				drop: this.onDrop.bind(this)
			}));

			oGrid.addDragDropConfig(new DragInfo({
				sourceAggregation: "items"
			}));
			oGrid.addDragDropConfig(new GridDropInfo({
				targetAggregation: "items",
				dropPosition: "Between",
				dropLayout: "Horizontal",
				dropIndicatorSize: this.onDropIndicatorSize.bind(this),
				drop: this.onDrop.bind(this)
			}));
		},

		onDropIndicatorSize: function (oDraggedControl) {
			var oBindingContext = oDraggedControl.getBindingContext(),
				oData = oBindingContext.getModel().getProperty(oBindingContext.getPath());

			if (oDraggedControl.isA("sap.m.StandardListItem")) {
				return {
					rows: oData.rows,
					columns: oData.columns
				};
			}
		},

		onDrag: function (oInfo) {},

		onDrop: function (oInfo) {

			var oDragged = oInfo.getParameter("draggedControl"),
				oDropped = oInfo.getParameter("droppedControl"),
				sInsertPosition = oInfo.getParameter("dropPosition"),

				oDraggedParent = oDragged.getParent(),
				oDroppedParent = oDropped.getParent(),

				oDragModel = oDraggedParent.getModel(),
				oDropModel = oDroppedParent.getModel(),
				oDragModelData = oDragModel.getData().cards,
				oDropModelData = oDropModel.getData().cards,

				iDragPosition = oDraggedParent.indexOfItem(oDragged),
				iDropPosition = oDroppedParent.indexOfItem(oDropped);

			//Get drag item
			var oItem = oDragModelData[iDragPosition];

			if (oItem.id === "DUMMY") {
				return;
			}

			// remove the item
			oDragModelData.splice(iDragPosition, 1);

			if (oDragModelData.length === 0) {
				//Set dummy card 
				oDragModelData[0] = this.oModelDummy.getData();
			}

			if (oDragModel === oDropModel && iDragPosition < iDropPosition) {
				iDropPosition--;
			}

			// insert the control in target aggregation
			if (sInsertPosition === "Before") {
				oDropModelData.splice(iDropPosition, 0, oItem);
			} else {
				oDropModelData.splice(iDropPosition + 1, 0, oItem);
			}

			if (oDropModelData.length === 2) {
				for (var i = 0; i < oDropModelData.length; i++) {
					if (oDropModelData[i].id === "DUMMY") {
						oDropModelData.splice(i, 1);
					}
				}
			}

			if (oDragModel !== oDropModel) {
				oDragModel.setData("/cards", oDragModelData);
				oDropModel.setData("/cards", oDropModelData);
			} else {
				oDropModel.setData("/cards", oDropModelData);
			}

			//Rebuild Grid items (cards) in order to refresh the sizing
			//Get Grid instance
			var oGrid = this.byId("grid1");
			//Get all grid items (cards)
			var aItems = oGrid.getItems();

			if (aItems.length > 0) {
				//Remove all grid items
				oGrid.removeAllItems();
				//Rebuild grid items
				for (var j = 0; j < aItems.length; j++) {
					oGrid.insertItem(aItems[j], j);
				}
			}
		}
	});
});