sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/evorait/evosuite/evoprep/model/models",
	"com/evorait/evosuite/evoprep/controller/ErrorHandler",
	"com/evorait/evosuite/evoprep/controller/MessageManager",
	"sap/f/library",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, ErrorHandler, MessageManager, library, JSONModel) {
	"use strict";

	var oMessageManager = sap.ui.getCore().getMessageManager();

	return UIComponent.extend("com.evorait.evosuite.evoprep.Component", {

		metadata: {
			manifest: "json"
		},

		oTemplatePropsProm: null,
		oSystemInfoProm: null,

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// initializing error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			//creates the Information model and sets to the component
			this.setModel(models.createInformationModel(this), "InformationModel");

			//Creating the Global message model for MessageManager
			this.setModel(models.createMessageModel(), "message");

			//Creating the Global User model
			this.setModel(models.createUserModel(this), "user");

			var viewModelObj = {
				logoUrl: sap.ui.require.toUrl("com/evorait/evosuite/evoprep/assets/img/EvoPrep.png"),
				busy: true,
				delay: 100,
				densityClass: this.getContentDensityClass(),
				fullscreen: true,
				operationTableCount: ""
			};
			this.setModel(models.createHelperModel(viewModelObj), "viewModel");
			this.setModel(models.createCreateModel(), "CreateModel");

			this.MessageManager = new MessageManager();

			//GetSystemInformation Call
			this._getSystemInformation();

			this._getTemplateProps();
			this.oTemplatePropsProm.then(function () {
				// enable routing
				this.getRouter().attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
				this.getRouter().initialize();
			}.bind(this));

		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (Device.system.desktop && Device.support.touch) { // apply "compact" mode if touch is not supported
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCompact";
				} else if (Device.support.touch) { // apply "compact" mode if touch is not supported
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				} else {
					//sapUiSizeCompact
					this._sContentDensityClass = "sapUiSizeCompact";
				}
			}
			return this._sContentDensityClass;
		},

		/**
		 * This method registers the view to the message manager
		 * @param oView
		 */
		registerViewToMessageManager: function (oView) {
			oMessageManager.registerObject(oView, true);
		},

		/**
		 * Fetching GetSystemInformation Data
		 */
		_getSystemInformation: function () {
			this.oSystemInfoProm = new Promise(function (resolve) {
				this.readData("/SystemInformationSet", []).then(function (oData) {
					this.getModel("user").setData(oData.results[0]);
					resolve(oData);
				}.bind(this));
			}.bind(this));
		},

		/**
		 * get Template properties as model inside a global Promise
		 */
		_getTemplateProps: function () {
			this.oTemplatePropsProm = new Promise(function (resolve) {
				var realPath = sap.ui.require.toUrl("com/evorait/evosuite/evoprep/model/TemplateProperties.json");
				var oTempJsonModel = new JSONModel();
				oTempJsonModel.loadData(realPath);
				oTempJsonModel.attachRequestCompleted(function () {
					this.setModel(oTempJsonModel, "templateProperties");
					resolve(oTempJsonModel.getData());
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Read from oData model service url with filters
		 * returns promise
		 */
		readData: function (sUri, aFilters, mUrlParams) {
			return new Promise(function (resolve, reject) {
				this.getModel().read(sUri, {
					filters: aFilters,
					urlParameters: mUrlParams || {},
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						//Handle Error
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * post data
		 * returns promise
		 */
		postData: function (sUri, oEntry) {
			return new Promise(function (resolve, reject) {
				this.getModel().create(sUri, oEntry, {
					refreshAfterChange: false,
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						//Handle Error
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Adds messages from MessageModel to local message model
		 */
		createMessages: function () {
			var aMessages = [];
			var oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
			var oData = oMessageModel.getData();

			if (oData.length === 0) {
				return;
			}
			for (var i = 0; i < oData.length; i++) {
				aMessages.push(oData[i]);
			}
			this.getModel("message").setData(aMessages);
		},

		_onBeforeRouteMatched: function (oEvent) {
			var oModel = this.getModel("viewModel"),
				sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, set a default layout (normally OneColumn)
			if (!sLayout) {
				sLayout = library.LayoutType.OneColumn;
			}
			oModel.setProperty("/layout", sLayout);
		}

	});
});