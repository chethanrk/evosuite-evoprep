sap.ui.define([],
	function () {
		"use strict";

		/**
		 * exclude annotationPath and entitySet
		 * for further functionality
		 * @private
		 */
		var _getAnnotationPath = function (oAnnotationPathContext) {
			var oAnnotationObj = oAnnotationPathContext.getObject(),
				sAnnotationPath, sEntitySet, sAnnotationHeadPath;

			if (typeof oAnnotationObj === "string") {
				sAnnotationPath = oAnnotationObj;
			} else {
				sAnnotationPath = oAnnotationObj.path;
				sEntitySet = oAnnotationObj.entitySet;
				sAnnotationHeadPath = oAnnotationObj.headerPath;
			}
			return {
				entitySet: sEntitySet,
				path: sAnnotationPath,
				headerPath: sAnnotationHeadPath
			};
		};

		var getAnnotationByPath = function (sAnnotationPath, sEntitySet, oModel) {
			var oMetaModel = oModel.getMetaModel() || oModel.getProperty("/metaModel"),
				oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			return oEntityType[sAnnotationPath];
		};

		/**
		 * create context binding based on annotation path
		 * context from metadata model
		 * @private
		 */
		var _createBindingContext = function (oAnnotationPathContext, sPathPropertyName) {
			var oAnnotationObj = oAnnotationPathContext.getObject(),
				oData = _getAnnotationPath(oAnnotationPathContext);

			var oModel = oAnnotationPathContext.getModel();
			var oMetaModel = oModel.getProperty("/metaModel");
			var oEntitySet = oMetaModel.getODataEntitySet(oData.entitySet ? oData.entitySet : oModel.getProperty("/tempData/entitySet"));
			var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
			return oMetaModel.createBindingContext(oEntityType.$path + "/" + oData[sPathPropertyName]);
		};

		/**
		 * get annotation binding context for object page
		 * content OR header
		 * @private
		 */
		var _resolveObjectPagePath = function (oAnnotationPathContext, sPathPropertyName) {
			var oModel = oAnnotationPathContext.getModel(),
				oData = _getAnnotationPath(oAnnotationPathContext);

			if (!oData.entitySet) {
				oData.entitySet = oModel.getProperty("/tempData/entitySet");
			}

			var oAnnotationByPath = getAnnotationByPath(oData[sPathPropertyName], oData.entitySet, oModel),
				oBindingPath = _createBindingContext(oAnnotationPathContext, sPathPropertyName);

			if (!oAnnotationByPath) {
				var splittedAnno = oData[sPathPropertyName].split("#"),
					sQualifier = splittedAnno[1],
					sNewAnnoPath = splittedAnno[0],
					oContextObject = oAnnotationPathContext.getObject();

				sQualifier = sQualifier.slice(0, sQualifier.lastIndexOf("_"));
				if (typeof oContextObject === "string") {
					oModel.setProperty("/annotationPath", sNewAnnoPath + "#" + sQualifier);
				} else {
					oModel.setProperty("/annotationPath/" + sPathPropertyName, sNewAnnoPath + "#" + sQualifier);
				}
				oBindingPath = _createBindingContext(oAnnotationPathContext, sPathPropertyName);
			}
			return oBindingPath;
		};

		/**
		 * resolve annotation path saved in JsonModel
		 * @public
		 */
		var resolveModelPath = function (oAnnotationPathContext) {
			return _createBindingContext(oAnnotationPathContext, "path");
		};

		/**
		 * get annotation context by qualifier with splitter "_"
		 * for object page header content
		 * checks if there are annoations available or not
		 * @public
		 */
		var resolveObjectHeaderPath = function (oAnnotationPathContext) {
			return _resolveObjectPagePath(oAnnotationPathContext, "headerPath");
		};

		/**
		 * get annotation context by qualifier with splitter "_"
		 * for object page content
		 * checks if there are annoations available or not
		 * @public
		 */
		var resolveObjectContentPath = function (oAnnotationPathContext) {
			return _resolveObjectPagePath(oAnnotationPathContext, "path");
		};

		/**
		 * get property name from path
		 * @public
		 */
		var getPathName = function (oInterface) {
			return oInterface ? oInterface.Path : undefined;
		};

		/**
		 * get entityType name from path
		 * for setting smartField property name
		 * @public
		 */
		var getSmartFieldName = function (oInterface) {
			var sPathName = getPathName(oInterface);
			return sPathName ? "id" + sPathName : undefined;
		};

		/**
		 * checks if an value is in templateProp Json Model navigation links
		 */
		var isInNavLinks = function (sValue, mNavLinks) {
			if (mNavLinks.hasOwnProperty(sValue)) {
				return true;
			}
			return null;
		};

		/**
		 * checks if an annotation Description has a string of "longText"
		 */
		var isLongTextTab = function (sDescription) {
			if (sDescription && sDescription === "longText") {
				return true;
			}
			return false;
		};

		/**
		 * checks if annotation description has tab name inside
		 */
		var hasTabNameInDescription = function (sValue, sAnnotation, sLongAnnotation) {
			if (sAnnotation.indexOf(sValue) >= 0 || sLongAnnotation.indexOf(sValue) >= 0) {
				return true;
			}
			return false;
		};

		/**
		 * checks if annotation description has tab name inside compare
		 */
		var hasTabNameMatch = function (sValue, sAnnotation, sLongAnnotation) {
			if (sValue && (sAnnotation || sLongAnnotation)) {
				if (sValue === sAnnotation || sValue === sLongAnnotation) {
					return true;
				}
				return false;
			}
			return false;
		};

		/**
		 * get extension point name for field group before and after
		 * in SmartFormTemplate fragment
		 */
		var getFieldExtPoint = function (oTarget, oField, oAnnoPath, sAddString) {
			var sExtPointName = "FormExtP";
			if (oAnnoPath.path) {
				sExtPointName += "|" + oAnnoPath.path.split("#")[1];
			}
			if (oTarget.Target) {
				var sTargetPath = oTarget.Target.AnnotationPath.split("#");
				sExtPointName += "|" + sTargetPath[1];
			}
			if (oField.Path) {
				sExtPointName += "|" + oField.Path;
			}
			sExtPointName = sAddString ? sExtPointName + "|" + sAddString : sExtPointName;
			return sExtPointName;
		};

		/**
		 * get extension point name for field group before and after
		 * in SmartFormTemplate fragment
		 */
		var getFieldGroupExtPoint = function (oTarget, oField, oAnnoPath, sAddString) {
			var sExtPointName = "FormExtP";
			if (typeof oAnnoPath === "string") {
				sExtPointName += "|" + oAnnoPath.split("#")[1];
			} else if (oAnnoPath.path) {
				sExtPointName += "|" + oAnnoPath.path.split("#")[1];
			}
			if (oTarget.Target) {
				var sTargetPath = oTarget.Target.AnnotationPath.split("#");
				sExtPointName += "|" + sTargetPath[1];
			}
			if (typeof oField === "string") {
				sExtPointName += "|" + oField;
			} else if (oField.Path) {
				sExtPointName += "|" + oField.Path;
			}
			sExtPointName = sAddString ? sExtPointName + "|" + sAddString : sExtPointName;
			return sExtPointName;
		};

		var getEntitySet = function (sEntitySet, sDesc, sLongText) {
			return sEntitySet || sDesc || sLongText;
		};

		/**
		 * get extension point name for dynamic SmartTables
		 */
		var getExtPoint = function (sTabName, sEntitySet, sDesc, sLongText, sAddString) {
			var sExtPointName = "TableExtP";

			if (sTabName) {
				sExtPointName += "|" + sTabName;
			}
			var sEntitySetName = getEntitySet(sEntitySet, sDesc, sLongText);
			if (sEntitySetName) {
				sExtPointName += "|" + sEntitySetName;
			}
			sExtPointName = sAddString ? sExtPointName + "|" + sAddString : sExtPointName;
			return sExtPointName;
		};

		/**
		 * checks if a special property is allowed for create
		 * and set field details also to JsonModel
		 */
		var isFieldCreatableAndSetMetaData = function (mLineItem, mTableDetails, oTempModelData) {
			var oMetaModel = oTempModelData.metaModel,
				oEntitySet = oMetaModel.getODataEntitySet(mTableDetails.entitySet),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				sFieldName = mLineItem.Value.Path;

			var oProperty = oMetaModel.getODataProperty(oEntityType, sFieldName);
			//check if key is creatable true
			if (oProperty && (!oProperty.hasOwnProperty("sap:creatable") || oProperty["sap:creatable"] === "true")) {
				mLineItem.Property = oProperty;
				return true;
			}
			return false;
		};

		var getOperationDate = function (sProp) {
			return "{path:'CreateModel>" + sProp + "'" + "," + "formatter:'.formatter.formatDate'" + "}";
		};
		
		/**
		 * Validate the unit filed 
		 * @{param} - sEntity - entiry name
		 * @{param} - sProp   - Property name
		 * @{param} - oTempModelData - metadomdel reference
		*/
		var getUnitField = function (sEntity, sProp, oTempModelData) {
			var oMetaModel = oTempModelData.metaModel,
				oEntitySet = oMetaModel.getODataEntitySet(sEntity),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				sFieldName = sProp;

			var oProperty = oMetaModel.getODataProperty(oEntityType, sFieldName);
			if (oProperty && oProperty.hasOwnProperty("sap:unit")) {
				return true;
			}
			return false;
		};
		
		/**
		 * Prepare unit field path 
		 * @{param} - sEntity - entiry name
		 * @{param} - sProp   - Property name
		 * @{param} - oTempModelData - metadomdel reference
		*/
		var getUnitDetails = function (sEntity, sProp, oTempModelData) {
			var oMetaModel = oTempModelData.metaModel,
				oEntitySet = oMetaModel.getODataEntitySet(sEntity),
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
				sFieldName = sProp;
			
			var oProperty = oMetaModel.getODataProperty(oEntityType, sFieldName);
			if (oProperty && oProperty.hasOwnProperty("sap:unit")) {
				return "{path:'CreateModel>" + oProperty["Org.OData.Measures.V1.Unit"].Path + "'}";
			}
			return "";
		};

		/*Format compare screen dates*/
		var getCompareDate = function (sProp) {
			return "{path:'compareModel>" + sProp + "'" + "," + "formatter:'.formatter.formatDate'" + "}";
		};

		return {
			resolveModelPath: resolveModelPath,
			resolveObjectHeaderPath: resolveObjectHeaderPath,
			resolveObjectContentPath: resolveObjectContentPath,
			getPathName: getPathName,
			getSmartFieldName: getSmartFieldName,
			getAnnotationByPath: getAnnotationByPath,
			isInNavLinks: isInNavLinks,
			isLongTextTab: isLongTextTab,
			hasTabNameInDescription: hasTabNameInDescription,
			getEntitySet: getEntitySet,
			isFieldCreatableAndSetMetaData: isFieldCreatableAndSetMetaData,
			getFieldExtPoint: getFieldExtPoint,
			getFieldGroupExtPoint: getFieldGroupExtPoint,
			getExtPoint: getExtPoint,
			getOperationDate: getOperationDate,
			getCompareDate: getCompareDate,
			hasTabNameMatch: hasTabNameMatch,
			getUnitField: getUnitField,
			getUnitDetails: getUnitDetails
		};

	},
	/* bExport= */
	true);