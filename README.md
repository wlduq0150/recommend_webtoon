## <img style="width: 80px; height: 80px" src="https://github.com/wlduq0150/recommend_webtoon/assets/73841368/8bb66148-8a66-498e-b238-515d9fe588ef">

웹툰 AI 장르 분석 및 추천 서비스 입니다. 

<br>
<br>


<h2>💡 프로젝트 소개</h2>
<p align='center'>
장르 기반의 웹툰 추천을 위한 서비스입니다.
<br>
<br>
웹툰의 데이터 수집을 위해 <b>자동 크롤링</b>이 구현되어 있으며
<br>
<br>
크롤링시 장르 키워드가 없는 경우도 존재 OpenAI를 통해 AI 장르 분석 기능을 도입했습니다.
</p>
<br>

## 환경변수

```bash
NODE_ENV=development | production
SERVER_PORT=SERVER_PORT
DATABASE_HOST=MYSQL_HOST
DATABASE_PORT=MYSQL_PORT
DATABASE_USERNAME=MYSQL_USERNAME
DATABASE_PASSWORD=MYSQL_PASSWORD
DATABASE_NAME=MYSQL_DB_NAME
REDIS_HOST=REDIS_HOST
REDIS_PORT=REDIS_PORT
REDIS_PASSWORD=REDIS_PASSWORD
JWT_ACCESS_TOKEN_SECRET=JWT_ACCESS_SECRET
JWT_ACCESS_TOKEN_EXP=JWT_ACCESS_EXP
JWT_REFRESH_TOKEN_SECRET=JWT_REFRESH_SECRET
JWT_REFRESH_TOKEN_EXP=JWT_REFRESH_EXP
CRAWLING_NAVER_ID=NAVER_ID
CRAWLING_NAVER_PW=NAVER_PW
CRAWLING_KAKAO_ID=KAKAO_ID
CRAWLING_kAKAO_PW=KAKAO_PW
OPENAI_API_KEY=OPENAI_API_KEY
OPENAI_WEBTOON_GENRE_MODEL=OPENAI_FINE_TUNED_MODEL
```

## 실행

```bash
$ npm install

# development mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 🚀 시연 영상
<div>
    👉 <a href="https://youtu.be/XV-YGhEXFc0"><span> 시연 영상 보러가기 </span></a> 
</div>

<br>
<br>

## 🧑🏻‍💻 주요 기술 스택

<!-- 프로젝트에 사용된 기술 스택을 나열 -->

### ⚡ Frontend

<div dir="auto">
    <img src="https://img.shields.io/badge/StyledComponents-B4CA65?style=for-the-badge&logo=StyledComponents&logoColor=white">
    <img src="https://img.shields.io/badge/React.js-1572B6?style=for-the-badge&logo=React.js&logoColor=white">
    <img src="https://img.shields.io/badge/Redux-000000?style=for-the-badge&logo=Redux&logoColor=white">
</div>

### ⚡ Backend

<div dir="auto">
    <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white">
    <img src="https://img.shields.io/badge/Sequelize-000000?style=for-the-badge&logo=sequelize&logoColor=white">
</div>

### ⚡ Database

<div dir="auto">
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">
    <img src="https://img.shields.io/badge/Amazon RDS-527FFF?style=for-the-badge&logo=Amazon RDS&logoColor=white">
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=Redis&logoColor=white">
</div>

### ⚡ DevOps

<div dir="auto">
    <img src="https://img.shields.io/badge/Amazon EC2-FF9900?style=for-the-badge&logo=Amazon EC2&logoColor=white">
</div>

### ⚡ 버전 관리

<div dir="auto">
    <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white">
</div>

<br>
<br>

## 🪄 주요 기능

1. **웹툰 자동 크롤링**

    - 카카오, 네이버 로그인
    - 무한스크롤이 필요한 크롤링
    - 플랫폼별 웹툰 크롤링

2. **AI 웹툰 장르 분석**

    - OpenAI Fine-tuning을 통해 학습 모델 생성
    - 장르 키워드 의미 학습
    - 웹툰 제목, 카테고리, 줄거리에 따른 장르 학습
    - 정확도 향상을 위해 카운팅 알고리즘 적용

3. **웹툰 장르 추천**

    - OpenAI Embedding을 통해 문자열을 벡터화
    - 벡터간 거리 값을 통해 유사도 측정
    - 불필요한 추천을 막기 위해 캐싱 적용

<br>
<br>
