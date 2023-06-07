const { pool } = require("../../config/database");

// 맛집 지도 서비스 회원가입
exports.insertUsers = async function (connection, userId, userPassword, userName) {
	const Query = `INSERT into Users(userId, userPassword, userName) VALUES (?,?,?);`;
	const Params = [userId, userPassword, userName];

	const rows = await connection.query(Query, Params);

	return rows;
};

// 맛집 지도 서비스 로그인 (회원검증)
exports.isValidUsers = async function (connection, userId, userPassword) {
	const Query = `SELECT userIdx, userName FROM Users where userId = ? and userPassword = ? and userStatus = 'A';`;
	const Params = [userId, userPassword];
  
	const rows = await connection.query(Query, Params);
  
	return rows;
};

exports.selectRestaurants = async function (connection, restaurantCategory) {
	const selectAllRestaurantsQuery = `SELECT restaurantName, restaurantAddress, restaurantCategory, restaurantYouTubeUrl, restaurantNaverUrl FROM Restaurants WHERE restaurantStatus = 'A';`;
	const selectCategorizedRestaurantsQuery = `SELECT restaurantName, restaurantAddress, restaurantCategory, restaurantYouTubeUrl, restaurantNaverUrl FROM Restaurants WHERE restaurantStatus = 'A' and restaurantCategory = ?;`;

	const Params = [restaurantCategory];

	const Query = restaurantCategory ? selectCategorizedRestaurantsQuery : selectAllRestaurantsQuery;

	const rows = await connection.query(Query, Params);

	return rows;
};

exports.exampleDao = async function (connection) {
	const Query = `SELECT * FROM Students;`;
	const Params = [];

	const rows = await connection.query(Query, Params);

	return rows;
};
