## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Fri Sep 18 2026 13:08:02 GMT+0900 (Korean Standard Time)|
|**App Generator**<br>SAP Fiori Application Generator|
|**App Generator Version**<br>1.32.0|
|**Generation Platform**<br>Visual Studio Code|
|**Template Used**<br>List Report Page V4|
|**Service Type**<br>OData URL|
|**Service URL**<br>https://saphana2.s-pert.com:44360/sap/opu/odata4/sap/zsp_itsm_p_opermanager_ui_v4/srvd/sap/zsp_itsm_p_opermanager_ui/0001/|
|**Module Name**<br>zspf_opermanager|
|**Application Title**<br>운영 담당자|
|**Namespace**<br>zsp.itsm|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.152.0|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>True, see https://www.npmjs.com/package/@sap-ux/eslint-plugin-fiori-tools#rules for the eslint rules.|
|**Main Entity**<br>OperManager|

## zspf_opermanager

운영 담당자 마스터 관리 애플리케이션

### Starting the generated app

- This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite. To launch the generated application, run the following from the generated application root folder:

```
    npm start
```

- It is also possible to run the application using mock data that reflects the OData Service URL supplied during application generation. In order to run the application with Mock Data, run the following from the generated app root folder:

```
    npm run start-mock
```

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version. (See https://nodejs.org)

### Architecture & UI5 Configurations

Fiori Elements 표준 List Report / Object Page V4 템플릿을 기반으로 구현된 운영담당자 관리 앱입니다.

<br>

#### 1) manifest.json — Cross-App Navigation 인바운드 등록

고객업체 요청관리(`zspf_request`) 앱의 댓글 피드에서 `@홍길동` 또는 `#홍길동(변경권한추가)` 멘션 링크를 클릭했을 때 본 앱으로 원활히 이동할 수 있도록 Semantic Object Inbound를 선언했습니다.

```json
"crossNavigation": {
  "inbounds": {
    "ZSPF_OPERMANAGER-display": {
      "semanticObject": "ZSPF_OPERMANAGER",
      "action": "display",
      "title": "{{ZSPF_OPERMANAGER-display.flpTitle}}",
      "subTitle": "{{ZSPF_OPERMANAGER-display.flpSubtitle}}",
      "signature": {
        "parameters": {},
        "additionalParameters": "allowed"
      }
    }
  }
}
```

* **연동 동작**:
  - `zspf_request`의 `FeedNote.js`에서 생성되는 해시 URL `#ZSPF_OPERMANAGER-display?Mngname=홍길동&Manager=3000000001`을 수신하여 해당 담당자의 정보를 바로 조회할 수 있습니다.

#### 2) TableSettings — GridTable 설정

대량의 담당자 데이터 조회 및 반응형 스크롤 성능 최적화를 위해 LineItem 테이블을 GridTable 형태로 지정했습니다.

```json
"controlConfiguration": {
  "@com.sap.vocabularies.UI.v1.LineItem": {
    "tableSettings": {
      "type": "GridTable"
    }
  }
}
```

#### 3) 주요 엔티티 및 OData 서비스

* **Service Binding**: `ZSP_ITSM_P_OPERMANAGER_UI_V4` (OData V4)
* **Main Entity**: `OperManager` (`zsp_itsm_p_opermanager`)
  - `Manager`: 운영담당자 사번 (Key)
  - `Mngname`: 담당자명
  - `Posit`: 직급 코드
  - `PositText`: 직급명 텍스트
  - 기타 연락처 및 이메일 정보

<br>

#### 4) ListReportExt.controller.js — GridTable 라인(행) 클릭 시 Object Page 자동 진입 네비게이션

대량 데이터 조회 성능과 하단 가로 스크롤바를 제공하는 `GridTable` 고유의 데스크톱 레이아웃을 그대로 유지하면서, 우측 끝의 네비게이션 화살표(`>`) 버튼 외에도 **행이나 셀을 클릭했을 때 바로 Object Page로 이동**할 수 있도록 컨트롤러 확장을 적용했습니다.

* **manifest.json (컨트롤러 확장 등록)**:
```json
"sap.ui5": {
  "extends": {
    "extensions": {
      "sap.ui.controllerExtensions": {
        "sap.fe.templates.ListReport.ListReportController": {
          "controllerName": "zsp.itsm.zspfopermanager.ext.controller.ListReportExt"
        }
      }
    }
  }
}
```

* **ListReportExt.controller.js (cellClick 이벤트 연동 및 예외 처리)**:
  - `onAfterRendering` 생명주기에서 `sap.ui.mdc.Table`의 `initialized()` 시점에 내부 `sap.ui.table.Table` 인스턴스를 확보하여 `cellClick` 이벤트를 등록합니다.
  - **체크박스 열 제외**: 행 삭제 및 선택을 위한 체크박스 열(`columnIndex < 0`) 클릭 시에는 상세 이동 없이 행 선택만 유지되도록 보호했습니다.
  - **인터랙티브 요소 제외**: 버튼, 링크 등 상호작용 컨트롤 클릭 시 상세 이동 방지.
  - 셀 클릭 시 해당 행의 OData V4 바인딩 컨텍스트(`rowBindingContext`)를 추출하여 Fiori Elements 표준 `routing.navigate(oContext)`를 호출합니다.

```javascript
sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension"
], function (ControllerExtension) {
    "use strict";

    function attachGridRowNavigation(oController) {
        var oView = oController.base.getView();
        var oExtensionAPI = oController.base.getExtensionAPI();
        if (!oView || !oExtensionAPI || !oExtensionAPI.routing) return;

        function doAttach(oInnerTable) {
            if (!oInnerTable || oInnerTable._bRowNavAttached) return;
            oInnerTable._bRowNavAttached = true;

            oInnerTable.attachCellClick(function (oEvent) {
                var iColIndex = oEvent.getParameter("columnIndex");
                if (iColIndex === undefined || iColIndex === null || iColIndex < 0) return; // 체크박스 열 제외

                var oDomEvent = window.event;
                var oTarget = (oDomEvent && oDomEvent.target) || null;
                if (oTarget && (oTarget.closest("button") || oTarget.closest(".sapMBtn") || oTarget.closest(".sapMLnk"))) return;

                var oContext = oEvent.getParameter("rowBindingContext");
                if (oContext) {
                    oExtensionAPI.routing.navigate(oContext);
                }
            });
        }

        var aTables = oView.findAggregatedObjects(true, function (o) { return o && o.isA && o.isA("sap.ui.table.Table"); });
        if (aTables && aTables.length) aTables.forEach(doAttach);

        var aMdcTables = oView.findAggregatedObjects(true, function (o) { return o && o.isA && o.isA("sap.ui.mdc.Table"); });
        if (aMdcTables && aMdcTables.length) {
            aMdcTables.forEach(function (oMdc) {
                if (oMdc.initialized) {
                    oMdc.initialized().then(function () {
                        var oInner = oMdc.getAggregation("_content") || (typeof oMdc._getTable === "function" && oMdc._getTable());
                        if (oInner && oInner.isA && oInner.isA("sap.ui.table.Table")) doAttach(oInner);
                    });
                }
            });
        }
    }

    return ControllerExtension.extend("zsp.itsm.zspfopermanager.ext.controller.ListReportExt", {
        override: {
            onAfterRendering: function () {
                var that = this;
                attachGridRowNavigation(that);
                setTimeout(function () {
                    attachGridRowNavigation(that);
                }, 500);
            }
        }
    });
});
```
