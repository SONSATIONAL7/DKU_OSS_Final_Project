const jwt = require("jsonwebtoken");
const secret_config = require("./secret");
const jwtMiddleware = function (req, res, next) {
	// read the token from header or url
	const token = req.headers["x-access-token"] || req.query.token;
	// token does not exist
	if (!token) {
		return res.status(403).json({
			isSuccess: false,
			code: 403,
			message: "로그인이 되어 있지 않습니다.",
		});
	}

	try {
		const verifiedToken = jwt.verify(token, secret_config.jwtsecret);
		req.verifiedToken = verifiedToken;
		// next(); 함수는 다음에 존재하는 콜백 함수를 찾아가게 함
		// jwtMiddleware.js 실행 후 다음에 존재하는 index.readJwt로 찾아가게 한다
		next();
	} catch {
		res.status(403).json({
			isSuccess: false,
			code: 403,
			message: "검증 실패",
		});
	}
};

module.exports = jwtMiddleware;