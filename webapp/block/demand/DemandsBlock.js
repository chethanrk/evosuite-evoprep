sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
    "use strict";
    var myBlock = BlockBase.extend("com.evorait.evosuite.evoprep.block.demand.DemandsBlock", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.evorait.evosuite.evoprep.block.demand.DemandsBlock",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.evorait.evosuite.evoprep.block.demand.DemandsBlock",
                    type: "XML"
                }
            }
        }
    });
    return myBlock;
}, true);