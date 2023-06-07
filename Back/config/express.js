const express = require("express");
const compression = require("compression");
const methodOverride = require("method-override");
var cors = require("cors");

module.exports = function () {
	const app = express();

	app.use(compression()); // HTTP 요청을 압축 및 해제

	app.use(express.json()); // body 값을 파싱

	app.use(express.urlencoded({ extended: true })); // form으로 제출되는 값 파싱

	app.use(methodOverride()); // put, delete 요청 처리

	app.use(cors()); // 웹 브라우저 cors 설정을 관리

	require("../src/routes/indexRoute")(app);

	return app;
};
