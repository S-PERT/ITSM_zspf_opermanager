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
