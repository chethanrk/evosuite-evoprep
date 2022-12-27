sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/evorait/evosuite/evoprep/model/models",
	"com/evorait/evosuite/evoprep/controller/ErrorHandler",
	"com/evorait/evosuite/evoprep/controller/MessageManager",
	"com/evorait/evosuite/evoprep/model/Constants",
	"sap/f/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/evorait/evosuite/evoprep/controller/GanttActions",
	"com/evorait/evosuite/evoprep/controller/MaterialInfoDialog",
	"com/evorait/evosuite/evoprep/controller/DialogTemplateRenderController",
], function (UIComponent, Device, models, ErrorHandler, MessageManager, Constants, library, JSONModel, Filter, FilterOperator,
	GanttActions, MaterialInfoDialog, DialogTemplateRenderController) {
	"use strict";

	var oMessageManager = sap.ui.getCore().getMessageManager();

	return UIComponent.extend("com.evorait.evosuite.evoprep.Component", {

		metadata: {
			manifest: "json"
		},

		oTemplatePropsProm: null,
		oSystemInfoProm: null,
		oFunctionSetProm: null,

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			//!Important as there are multiple issues when POST or UPDATE request happended
			// and refresh call send with same batch request
			this.getModel().setRefreshAfterChange(false);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// initializing error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			//creates the Information model and sets to the component
			this.setModel(models.createInformationModel(this), "InformationModel");

			//Creating the Global message model for MessageManager
			this.setModel(models.createMessageModel(), "messageManager");

			//initialize dialog conroller
			this.DialogTemplateRenderer = new DialogTemplateRenderController(this);

			//Creating the Global User model
			this.setModel(models.createUserModel(this), "user");

			var viewModelObj = {
				logoUrl: sap.ui.require.toUrl("com/evorait/evosuite/evoprep/assets/img/EvoPrep.png"),
				busy: true,
				delay: 100,
				densityClass: this.getContentDensityClass(),
				fullscreen: true,
				operationTableCount: "",
				allowPrePlanCreate: false,
				isPrePlanSelected: false,
				showStatusButton: false,
				editMode: true,
				loadMaster: false,
				launchMode: Constants.LAUNCH_MODE.BSP,
				bEnableSave: false,
				orderListEditMode: false,
				bShowDependencies: false, //Enabling/Disabling Dependencies in Graphic Planning GanttChart
				bEnableGanttShapesEdit: true,
				ganttFullMode: true,
				fullscreenGantt: true,
				isCreatePage: false,
				ganttSelectionPane: "30%", //Setting Gantt Pane Adjustment Percentage
				ganttSettings: {
					busy: true,
					sStartDate: null,
					sEndDate: null,
					bShowUtilization: false, //Utilization Column Visibility
					bUtilizationCall: false //Utilization Service Call
				},
				bDependencyCall: false, //Restricting expand call in Graphic Planning GanttChart
				bEnableOperationDelete: false, //Enabling/Disabling Delete Button in Plan Detail Operation Tab
				bOperationTableMode: false, //Plan Detail Operation Table Selection Mode
				bCopyEnabled: false, //disable the copy button by default
				ganttUtilization: { //Utilization Gantt Chart Parameters
					busy: true,
					dLastSync: null,
					iCount: 0,
					ganttSelectionPane: "30%"
				},
				aAllSelectedOperations: [], //handle select all,
				bMaterialsDemandsBlock: false, // handle the enable and disable of finalize button in the demands table
				bEnableFinalizeBtn: false, // handle the enable or disable of finalize button of the operations 
				validateIW32Auth: true, // SAP standard check
				bEnableApplyFilter: false,
				filtersExist: false,
				sPopoverLongText: "", //Field for display long text in Popover
				bLongTextField: "", // To identify whether its Order/Operation Long Text
				bOperationReprocess: false
			};

			//GetSystemInformation Call
			this._getSystemInformation();

			this.oSystemInfoProm.then(this._handleAuthorization.bind(this));

			this.setModel(models.createHelperModel(viewModelObj), "viewModel");
			this.setModel(models.createCreateModel(), "CreateModel");

			this.MessageManager = new MessageManager();

			this.setModel(oMessageManager.getMessageModel(), "message");

			//Creating the Global Gantt Model for PlanningGanttChart
			this.setModel(models.createHelperModel(), "ganttModel");
			//Creating compare model
			var oCompareObj = {
				compareOriginal: [],
				compareCollapsed: [],
				compare: [],
				compareProperty: []
			};
			this.setModel(models.createHelperModel(oCompareObj), "compareModel");

			this._getTemplateProps();

			this._setApp2AppLinks();
			this.oTemplatePropsProm.then(this._getFunctionSets.bind(this));

			this.oTemplatePropsProm.then(function () {
				// enable routing
				this.getRouter().attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
				this.getRouter().initialize();
			}.bind(this));

			//initialize GanttActions.js with component
			this.GanttActions = new GanttActions();
			this.materialInfoDialog = new MaterialInfoDialog();
			this.materialInfoDialog.init();
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
		 * @{param} oView
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
					resolve(oData.results[0]);
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
		 * get SystemStatus and UserStatus FunctionsSet
		 * what can be selected for changing status of an order
		 * important for visibility based on startpage
		 */
		_getFunctionSets: function () {
			this.oFunctionSetProm = new Promise(function (resolve) {
				var oFilter = new Filter("FunctionType", FilterOperator.EQ, "I"),
					oFunctionSet = {
						userStatus: []
					};
				this.readData("/PlanHeaderFunctionsSet", [oFilter])
					.then(function (data) {
						data.results.forEach(function (oItem) {
							oFunctionSet.userStatus.push(oItem);
						}.bind(this));
						this.getModel("templateProperties").setProperty("/functionsSet/", oFunctionSet);
						resolve(oFunctionSet);
					}.bind(this));
			}.bind(this));
		},

		/**
		 * read app2app navigation links from backend
		 */
		_setApp2AppLinks: function () {
			if (sap.ushell && sap.ushell.Container) {
				this.getModel("viewModel").setProperty("/launchMode", Constants.LAUNCH_MODE.FIORI);
			}
			var oFilter = new Filter("LaunchMode", FilterOperator.EQ, this.getModel("viewModel").getProperty("/launchMode")),
				mProps = {};

			this.readData("/NavigationLinksSet", [oFilter])
				.then(function (data) {
					data.results.forEach(function (oItem) {
						if (oItem.Value1 && Constants.APPLICATION[oItem.ApplicationId]) {
							oItem.Property = oItem.Value2 || Constants.PROPERTY[oItem.ApplicationId];
							mProps[oItem.Property] = oItem;
						}
					});
					this._navLinksVisibility(mProps);
					this.getModel("templateProperties").setProperty("/navLinks/", mProps);
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

		_onBeforeRouteMatched: function (oEvent) {
			var oModel = this.getModel("viewModel"),
				sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, set a default layout (normally OneColumn)
			if (!sLayout) {
				sLayout = library.LayoutType.OneColumn;
			}
			oModel.setProperty("/layout", sLayout);
		},

		/**
		 * Handle nav link button visibility in Navigation action sheet
		 */
		_navLinksVisibility: function (mProps) {
			for (var n in mProps) {
				mProps[n].btnVisibility = Object.values(Constants.ALLOWED_LINKS).indexOf(mProps[n].ApplicationId) !== -1 ? true : false;
			}
		},

		/**
		 * Handle SAP authorization
		 */
		_handleAuthorization: function () {
			var bPMAuth = this.getModel("user").getProperty("/ENABLE_PM_AUTH_CHECK"),
				bIW32Auth = this.getModel("user").getProperty("/ENABLE_IW32_AUTH_CHECK");
			if (bPMAuth) {
				this.getModel("viewModel").setProperty("/validateIW32Auth", Boolean(bIW32Auth));
			}
		}

	});
});