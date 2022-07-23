"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunktresor_oklm"] = self["webpackChunktresor_oklm"] || []).push([["FakeConnexion"],{

/***/ "./src/dependencies/fakeAuth/fakeConnexionPage/FakeConnexionPage.tsx":
/*!***************************************************************************!*\
  !*** ./src/dependencies/fakeAuth/fakeConnexionPage/FakeConnexionPage.tsx ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"FakeConnexionPage\": () => (/* binding */ FakeConnexionPage)\n/* harmony export */ });\n/* harmony import */ var _pages_components_layout_Layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../pages/_components/layout/Layout */ \"./src/pages/_components/layout/Layout.tsx\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n\n\nconst FakeConnexionPage = ({ fakeUsers, redirectTo }) => {\n  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(_pages_components_layout_Layout__WEBPACK_IMPORTED_MODULE_0__.Layout, null, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"div\", {\n    style: { maxWidth: 500, margin: \"0 auto\" }\n  }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"form\", {\n    method: \"post\"\n  }, !!redirectTo && /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"input\", {\n    type: \"hidden\",\n    name: \"redirectTo\",\n    value: redirectTo\n  }), \"Login de demo (vous serez redirig\\xE9s vers \", redirectTo, \")\", /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"div\", null, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"div\", {\n    style: { marginBottom: 20, marginTop: 20 }\n  }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"div\", {\n    className: \"fr-select-group\"\n  }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"select\", {\n    className: \"fr-select\",\n    id: \"select\",\n    name: \"userId\"\n  }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"option\", {\n    selected: true,\n    disabled: true,\n    hidden: true\n  }, \"Selectionnez un identifiant\"), fakeUsers.map(({ userId, nom }) => /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"option\", {\n    key: userId,\n    value: userId\n  }, nom))))), /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"button\", {\n    type: \"submit\"\n  }, \" Se Connecter\"), \" \", /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"br\", null)))));\n};\n\n\n//# sourceURL=webpack://tresor-oklm/./src/dependencies/fakeAuth/fakeConnexionPage/FakeConnexionPage.tsx?");

/***/ }),

/***/ "./src/pages/_components/layout/Layout.tsx":
/*!*************************************************!*\
  !*** ./src/pages/_components/layout/Layout.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Layout\": () => (/* binding */ Layout)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n\nfunction Layout({ children }) {\n  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"html\", {\n    className: \"h-full bg-gray-100\"\n  }, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"head\", null, /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"meta\", {\n    charSet: \"utf-8\"\n  }), /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"meta\", {\n    name: \"viewport\",\n    content: \"width=device-width,initial-scale=1\"\n  }), /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"link\", {\n    href: \"style.css\",\n    rel: \"stylesheet\"\n  })), /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(\"body\", {\n    className: \"h-full overflow-hidden\"\n  }, children));\n}\n\n\n//# sourceURL=webpack://tresor-oklm/./src/pages/_components/layout/Layout.tsx?");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/dependencies/fakeAuth/fakeConnexionPage/FakeConnexionPage.tsx"));
/******/ }
]);