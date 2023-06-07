/* 
1. 지도 생성 & 확대 축소 컨트롤러
2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
3. 여러개 마커 찍기
	* 주소 - 좌표 변환 (지도 라이브러리)
4. 마커에 인포윈도우 붙이기
	* 마커에 클릭 이벤트로 인포윈도우
	* url에서 썸네일 따기
	* 클릭한 마커로 지도 센터 이동
5. 카테고리 분류
 */

/*
**********************************************************
1. 지도 생성 & 확대 축소 컨트롤러
https://apis.map.kakao.com/web/sample/addMapControl/
*/

var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
	center: new kakao.maps.LatLng(37.321582, 127.126752), //지도의 중심좌표.
	level: 3 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

/*
**********************************************************
2. 더미데이터 준비하기 (제목, 주소, url, 카테고리)
*/

async function getDataSet(restaurantCategory) {
	let qs = restaurantCategory;
	if (!qs) {
		qs = "";
	}

	const dataSet = await axios ({
		method: "get", // http method
		url: `http://localhost:3000/restaurants?restaurantCategory=${qs}`,
		headers: {}, // packet header
		data: {}, // packet body
	});

	return dataSet.data.result;
}

getDataSet();

/*
**********************************************************
3. 여러개 마커 찍기
  * 주소 - 좌표 변환
https://apis.map.kakao.com/web/sample/multipleMarkerImage/ (여러개 마커)
https://apis.map.kakao.com/web/sample/addr2coord/ (주소로 장소 표시하기)
*/

// 주소 - 좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

// 주소 - 좌표 변환 함수
function getCoordsByAddress(restaurantAddress) {
	// Promise 형태로 반환
	return new Promise((resolve, reject) => {
		// 주소로 좌표를 검색합니다
		geocoder.addressSearch(restaurantAddress, function (result, status) {
			// 정상적으로 검색이 완료됐으면 
			if (status === kakao.maps.services.Status.OK) {
				var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
				resolve(coords);
				return;
			}
			reject(new Error("getCoordsByAddress Error: not Vaild Address"));
		})
	});
}

/* 
******************************************************************************
4. 마커에 인포윈도우 붙이기
  * 마커에 클릭 이벤트로 인포윈도우 https://apis.map.kakao.com/web/sample/multipleMarkerEvent/
  * url에서 섬네일 따기
  * 클릭한 마커로 지도 센터 이동 https://apis.map.kakao.com/web/sample/moveMap/
*/

function getContent(data) {
	// 유튜브 썹네일 id 가져오기
	console.log(data);
	let replaceUrl = data.restaurantYouTubeUrl;
	let finUrl = "";
	replaceUrl = replaceUrl.replace("https://youtu.be/", "");
	replaceUrl = replaceUrl.replace("https://www.youtube.com/embed/", "");
	replaceUrl = replaceUrl.replace("https://www.youtube.com/watch?v=", "");
	replaceUrl = replaceUrl.replace("https://www.youtube.com/shorts/", "");
	finUrl = replaceUrl.split("&")[0];

	// 인포윈도우 가공하기
	return `
	<div class="infowindow">
        <div class="infowindow-img-container">
                <img src="https://img.youtube.com/vi/${finUrl}/mqdefault.jpg" alt="infowindow-img">
        </div>
        <div class="infowindow-body">
            <h5 class="infowindow-title">${data.restaurantName}</h5>
            <p class="infowindow-address">${data.restaurantAddress}</p>
            <a href="${data.restaurantYouTubeUrl}" class="infowindow-btn1" target="_blank">영상이동</a>
            <a href="${data.restaurantNaverUrl}" class="infowindow-btn2" target="_blank">검색이동</a>
        </div>
    </div>`;
}

async function setMap(dataSet) {
	markerArray = [];
	infowindowArray = [];

	for (var i = 0; i < dataSet.length; i++) {
		// 마커를 생성합니다
		let coords = await getCoordsByAddress(dataSet[i].restaurantAddress);

		var marker = new kakao.maps.Marker({
			map: map, // 마커를 표시할 지도
			position: coords, // 마커를 표시할 위치
			/* title : positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
			image : markerImage // 마커 이미지  */
		});

		markerArray.push(marker);

		// 마커에 표시할 인포윈도우를 생성합니다 
		var infowindow = new kakao.maps.InfoWindow({
			content: getContent(dataSet[i]) // 인포윈도우에 표시할 내용
		});

		infowindowArray.push(infowindow);

		console.log(markerArray, infowindowArray);

		// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
		// 이벤트 리스너로는 클로저를 만들어 등록합니다 
		// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
		kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow, coords));
		kakao.maps.event.addListener(map, 'click', makeOutListener(infowindow));
	}
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
// 1. 클릭 시 다른 인포윈도우 닫기
// 2. 클릭한 곳으로 지도 중심 옮기기
function makeOverListener(map, marker, infowindow, coords) {
	return function () {
		// 1. 클릭 시 다른 인포윈도우 닫기
		closeInfoWindow();
		infowindow.open(map, marker);

		// 2. 클릭한 곳으로 지도 중심 옮기기
		map.panTo(coords)
	};
}

let infowindowArray = [];
function closeInfoWindow() {
	for (let infowindow of infowindowArray) {
		infowindow.close();
	}
}

// 인포윈도우를 닫는 클로저를 만드는 함수입니다 
function makeOutListener(infowindow) {
	return function () {
		infowindow.close();
	};
}

/*
**********************************************
5. 카테고리 분류
*/

// 카테고리
const categoryMap = {
	korea: "한식",
	china: "중식",
	japan: "일식",
	america: "양식",
	wheat: "분식",
	meat: "구이",
	pub: "주점",
	etc: "기타",
};

const categoryList = document.querySelector(".category-list");
categoryList.addEventListener("click", categoryHandler);

async function categoryHandler(event) {
	const categoryId = event.target.id;
	const category = categoryMap[categoryId];

	try {
		// 데이터 분류
		let categorizedDataSet = await getDataSet(category);

		// 기존 마커 삭제
		closeMarker();

		// 기존 인포윈도우 닫기
		closeInfoWindow();

		setMap(categorizedDataSet);
	} catch (error) {
		console.error(error);
	}
}

let markerArray =[];
function closeMarker() {
	for (let marker of markerArray) {
		marker.setMap(null);
	}
}


async function setting() {
	try {
		const dataSet = await getDataSet();
		setMap(dataSet);
	} catch (error) {
		console.error(error);
	}

}

setting();