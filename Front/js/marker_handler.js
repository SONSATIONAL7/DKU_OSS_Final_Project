/* 
마커 핸들러 API 연동

1. #marker-handler 클릭
2. #userId, #userPassword 값 확인 (두 값이 모두 입력 되어 있지 않으면 return)
3. 로그인 API 요청
4. 요청이 성공적이지 않다면, alert message
5. 요청이 성공하면, jwt를 localstorage에 저장하고 main page 이동

*/

let url = "http://127.0.0.1:3000";

const btnSignIn = document.querySelector("#signin");

// 1. #signin 클릭
btnSignIn.addEventListener("click", signIn);

async function markerHandler(event) {
    
}