sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function (ControllerExtension) {
    "use strict";

    // Row height (px) of the list grid table, tall enough for the manager image avatar.
    // GridTable rows have a fixed height (about 33px in compact density), which cut the image.
    var iListRowHeight = 50;

    function applyListRowHeight(oView) {
        var fnApply = function (oInnerTable) {
            if (!oInnerTable || !oInnerTable.isA || !oInnerTable.isA("sap.ui.table.Table")) {
                return;
            }
            // The mdc table drives the grid table through a row mode (Auto/Fixed); with a row mode set,
            // the deprecated table property rowHeight is ignored and rowContentHeight decides the height
            var oRowMode = typeof oInnerTable.getRowMode === "function" && oInnerTable.getRowMode();
            if (oRowMode && typeof oRowMode.setRowContentHeight === "function") {
                if (oRowMode.getRowContentHeight() !== iListRowHeight) {
                    oRowMode.setRowContentHeight(iListRowHeight);
                }
            } else if (oInnerTable.getRowHeight() !== iListRowHeight) {
                oInnerTable.setRowHeight(iListRowHeight);
            }
        };
        oView.findAggregatedObjects(true, function (o) {
            return o && o.isA && o.isA("sap.ui.table.Table");
        }).forEach(fnApply);
        oView.findAggregatedObjects(true, function (o) {
            return o && o.isA && o.isA("sap.ui.mdc.Table");
        }).forEach(function (oMdcTable) {
            if (oMdcTable.initialized) {
                oMdcTable.initialized().then(function () {
                    fnApply(oMdcTable.getAggregation("_content") || (typeof oMdcTable._getTable === "function" && oMdcTable._getTable()));
                }).catch(function () {});
            }
        });
    }

    function attachGridRowNavigation(oController) {
        var oView = oController.base.getView();
        var oExtensionAPI = oController.base.getExtensionAPI();
        if (!oView || !oExtensionAPI || !oExtensionAPI.routing) {
            return;
        }

        function doAttach(oInnerTable) {
            if (!oInnerTable || oInnerTable._bRowNavAttached) {
                return;
            }
            oInnerTable._bRowNavAttached = true;

            oInnerTable.attachCellClick(function (oEvent) {
                // 1. 행 선택(체크박스) 컬럼 클릭 시 상세 이동 방지
                var iColIndex = oEvent.getParameter("columnIndex");
                if (iColIndex === undefined || iColIndex === null || iColIndex < 0) {
                    return;
                }

                // 2. 내부 버튼, 링크 등 상호작용 요소 클릭 제외
                var oDomEvent = window.event;
                var oTarget = (oDomEvent && oDomEvent.target) || null;
                if (oTarget && (oTarget.closest("button") ||
                    oTarget.closest(".sapMBtn") ||
                    oTarget.closest(".sapMLnk") ||
                    oTarget.closest(".sapMCb") ||
                    oTarget.closest(".sapUiTableColResizer"))) {
                    return;
                }

                var oCellControl = oEvent.getParameter("cellControl");
                if (oCellControl && (oCellControl.isA("sap.m.Button") || oCellControl.isA("sap.m.Link") || oCellControl.isA("sap.m.CheckBox"))) {
                    return;
                }

                // 3. Object Page로 이동
                var oContext = oEvent.getParameter("rowBindingContext");
                if (oContext) {
                    oExtensionAPI.routing.navigate(oContext);
                }
            });
        }

        // 1) 이미 렌더링된 sap.ui.table.Table 검색
        var aTables = oView.findAggregatedObjects(true, function (o) {
            return o && o.isA && o.isA("sap.ui.table.Table");
        });
        if (aTables && aTables.length) {
            aTables.forEach(doAttach);
        }

        // 2) sap.ui.mdc.Table 초기화 대기 후 inner table 연결
        var aMdcTables = oView.findAggregatedObjects(true, function (o) {
            return o && o.isA && o.isA("sap.ui.mdc.Table");
        });
        if (aMdcTables && aMdcTables.length) {
            aMdcTables.forEach(function (oMdcTable) {
                if (oMdcTable.initialized) {
                    oMdcTable.initialized().then(function () {
                        var oInner = oMdcTable.getAggregation("_content") || (typeof oMdcTable._getTable === "function" && oMdcTable._getTable());
                        if (oInner && oInner.isA && oInner.isA("sap.ui.table.Table")) {
                            doAttach(oInner);
                        }
                    }).catch(function () {});
                }
            });
        }
    }

    return ControllerExtension.extend("zsp.itsm.zspfopermanager.ext.controller.ListReportExt", {
        override: {
            onAfterRendering: function () {
                var that = this;
                attachGridRowNavigation(that);
                applyListRowHeight(that.base.getView());
                setTimeout(function () {
                    attachGridRowNavigation(that);
                    applyListRowHeight(that.base.getView());
                }, 500);
            }
        }
    });
});

