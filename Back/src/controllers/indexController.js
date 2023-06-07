const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const jwt = require("jsonwebtoken");
const secret = require("../../config/secret");

const indexDao = require("../dao/indexDao");

// 맛집 조회
exports.readRestaurants = async function (req, res) {
	const { restaurantCategory } = req.query;

	// 맛집 카테고리 값이 넘어 왔다면, 유효한 값인지 체크
	if (restaurantCategory) {
		const validRestaurantCategory = ["한식", "중식", "일식", "양식", "분식", "구이", "주점", "기타",];

		if (!validRestaurantCategory.includes(restaurantCategory)) {
			return res.send({
				isSuccess: false,
				code: 400, // 요청 실패시 400번대 코드
				message: "유효한 카테고리가 아닙니다.",
			});
		}

	}

	try {
		const connection = await pool.getConnection(async (conn) => conn);
		try {
			const [rows] = await indexDao.selectRestaurants(connection, restaurantCategory);

			return res.send({
				result: rows,
				isSuccess: true,
				code: 200, // 요청 실패시 400번대 코드
				message: "맛집 목록 요청 성공",
			});
		} catch (err) {
			logger.error(`readRestaurants Query error\n: ${JSON.stringify(err)}`);
			return false;
		} finally {
			connection.release();
		}
	} catch (err) {
		logger.error(`readRestaurants DB Connection error\n: ${JSON.stringify(err)}`);
		return false;
	}
};

// 맛집 지도 서비스 회원가입
exports.createUsers = async function (req, res) {
	const { userId, userPassword, userName } = req.body;

	// 1. 유저 데이터 검증
	const userIdRegExp = /^[a-z]+[a-z0-9]{5,19}$/; // 아이디 정규식 영문자로 시작하는 영문자 또는 숫자 6-20
	const userPasswordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,16}$/; // 비밀번호 정규식 8-16 문자, 숫자 조합
	const userNameRegExp = /^[가-힣|a-z|A-Z|0-9|]{2,10}$/; // 닉네임 정규식 2-10 한글, 숫자 또는 영문

	if (!userIdRegExp.test(userId)) {
		return res.send({
			isSuccess: false,
			code: 400, // 요청 실패시 400번대 코드
			message: "아이디 정규식 영문자로 시작하는 영문자 또는 숫자 6-20",
		});
	}

	if (!userPasswordRegExp.test(userPassword)) {
		return res.send({
			isSuccess: false,
			code: 400, // 요청 실패시 400번대 코드
			message: "비밀번호 정규식 8-16 문자, 숫자 조합",
		});
	}

	if (!userNameRegExp.test(userName)) {
		return res.send({
			isSuccess: false,
			code: 400, // 요청 실패시 400번대 코드
			message: "닉네임 정규식 2-10 한글, 숫자 또는 영문",
		});
	}

	try {
		const connection = await pool.getConnection(async (conn) => conn);
		try {
			// 2. DB 입력
			const [rows] = await indexDao.insertUsers(
				connection,
				userId,
				userPassword,
				userName
			);

			// 입력된 유저 인덱스
			const userIdx = rows.insertId;

			// 3. JWT 발급
			const token = jwt.sign(
				{ userIdx: userIdx, userName: userName }, // payload 정의
				secret.jwtsecret // 서버 비밀키
			);

			return res.send({
				result: { jwt: token },
				isSuccess: true,
				code: 200, // 요청 실패시 400번대 코드
				message: "회원가입 성공",
			});
		} catch (err) {
			logger.error(`createUsers Query error\n: ${JSON.stringify(err)}`);
			return false;
		} finally {
			connection.release();
		}
	} catch (err) {
		logger.error(`createUsers DB Connection error\n: ${JSON.stringify(err)}`);
		return false;
	}
};

// 맛집 지도 서비스 로그인
exports.createJwt = async function (req, res) {
	const { userId, userPassword } = req.body;

	if (!userId || !userPassword) {
		return res.send({
			isSuccess: false,
			code: 400, // 요청 실패시 400번대 코드
			message: "회원정보를 입력해주세요.",
		});
	}

	try {
		const connection = await pool.getConnection(async (conn) => conn);
		try {
			// 2. DB 회원 검증
			const [rows] = await indexDao.isValidUsers(connection, userId, userPassword);

			if (rows.length < 1) {
				return res.send({
					isSuccess: false,
					code: 410, // 요청 실패시 400번대 코드
					message: "회원정보가 존재하지 않습니다.",
				});
			}

			const { userIdx, userName } = rows[0];

			// 3. JWT 발급
			const token = jwt.sign(
				{ userIdx: userIdx, userName: userName }, // payload 정의
				secret.jwtsecret // 서버 비밀키
			);

			return res.send({
				result: { jwt: token },
				isSuccess: true,
				code: 200, // 요청 실패시 400번대 코드
				message: "로그인 성공",
			});
		} catch (err) {
			logger.error(`createJwt Query error\n: ${JSON.stringify(err)}`);
			return false;
		} finally {
			connection.release();
		}
	} catch (err) {
		logger.error(`createJwt DB Connection error\n: ${JSON.stringify(err)}`);
		return false;
	}
};

// 맛집 지도 서비스 로그인 유지, 토큰 검증
exports.readJwt = async function (req, res) {
	const { userIdx, userName } = req.verifiedToken;

	return res.send({
		result: { userIdx: userIdx, userName: userName },
		code: 200, // 요청 실패시 400번대 코드
		message: "유효한 토큰입니다.",
	});
};
