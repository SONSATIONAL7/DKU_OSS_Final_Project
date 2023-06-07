/* 
회원가입 API 연동

1. #signup 클릭
2. #userID, #password, nickname 값 확인 (정규표현식 확인)
3. 회원가입 API 요청
4. 요청이 성공적이지 않다면, alert message
5. 요청이 성공하면, jwt를 localstorage에 저장하고 main page 이동

*/

let url = "http://127.0.0.1:3000";

const btnSignUp = document.querySelector("#signup");

// 1. #signup 클릭
btnSignUp.addEventListener("click", signup);

async function signup(event) {
    const userId = document.querySelector("#userId").value;
    const userPassword = document.querySelector("#userPassword").value;
    const userName = document.querySelector("#userName").value;

    // 2. #email, #password, nickname 값 확인 (정규표현식 확인)
    const userIdRegExp = /^[a-z]+[a-z0-9]{5,19}$/; // 아이디 정규식 영문자로 시작하는 영문자 또는 숫자 6-20
    const userPasswordRegExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,16}$/; // 비밀번호 정규식 8-16 문자, 숫자 조합
    const userNameRegExp = /^[가-힣|a-z|A-Z|0-9|]{2,10}$/; // 닉네임 정규식 2-10 한글, 숫자 또는 영문
    
    if (!userIdRegExp.test(userId)) {
        return alert("아이디 형식: 영문자로 시작하는 영문자 또는 숫자 6-20");
    }
    if (!userPasswordRegExp.test(userPassword)) {
        return alert("비밀번호 형식: 8-16 문자, 숫자 조합");
    }
    if (!userNameRegExp.test(userName)) {
        return alert("닉네임 형식 2-10 한글, 숫자 또는 영문");
    }

    // 3. 회원가입 API 요청
    const signUpReturn = await axios({
        method: "post", // http method
        url: url + "/sign-up",
        headers: {}, // packet header
        data: { userId: userId, userPassword: userPassword, userName: userName }, // packet body
    });

    // 4. 요청이 성공적이지 않다면, alert message
    const isValidSignUp = signUpReturn.data.code == 200;

    if (!isValidSignUp) {
        return alert("요청에 문제가 생겼습니다.");
    }

    // 5. 요청이 성공하면, jwt를 localstorage에 저장하고 main page 이동
    const jwt = signUpReturn.data.result.jwt;
    localStorage.setItem("x-access-token", jwt);
    alert(signUpReturn.data.message);

    return location.replace("./index.html");
}