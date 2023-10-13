const express = require('express');
const app = express();
const port = 5000;
const dotenv = require('dotenv');

dotenv.config();

app.set('view engine', 'ejs');

const {MongoClient, ObjectId} = require('mongodb');

app.use(express.static(__dirname + "/public"))
let db;
let sample;
const url = `mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PW}@cluster0.xjqdfjy.mongodb.net/`

new MongoClient(url).connect().then((client)=>{
  db = client.db("board");
  sample = client.db("sample_training")
  console.log("DB 연결 완료!")
  app.listen(process.env.SERVER_PORT, ()=>{
    console.log(`${process.env.SERVER_PORT}번호에서 서버 실행 중`)
})

  // 서버 js 에서 구동되는 console.log는 브라우저에 뜨지 않고 터미널에 뜬다!
}).catch((error)=>{
  console.log(error)
})

app.get('/', (req, res)=>{
    // res.send("Hello world")
    res.sendFile(__dirname + '/page/index.html') 
})

app.get('/about', (req, res)=>{
    res.sendFile(__dirname + '/page/about.html') 
    // db.collection("notice").insertOne({
    //   title: "첫번째 글",
    //   content: "두번째 글"
    // })
})

app.get('/list/', async(req, res)=>{

   // 다 들고 올때 아래와 같이 쓰고, 하나만 가져올 때, find를 쓴다.
   const result = await db.collection("notice").find().toArray()
   console.log(result[0].title)
  //  try 은 실패 할 수도 있는 코드를 실행. then은 안됐을 때, catch 실행
  res.render("list.ejs", {
    data : result
  })
})


// click 이벤트로 하나의 인덱스 값만 넘어가는 것과 비슷한 개념으로 보면 된다.

app.get('/view/:id', async (req, res)=>{
  const result = await db.collection("notice").findOne({
    _id : new ObjectId (req.params.id)
  })
  console.log(result)
  res.render("view.ejs", {
    data : result
  })
})

app.get('/notice', (req, res)=>{
    res.send("공지 페이지")
})


//todo   주석

//* 1. Uniform Interface
/* 

여러 URL과 METHOD는 일관성이 있어야 하며, 
하나의 URL에서는 하나의 데이터만 가져오게 디자인 하며, 
간결하고 예측 가능한 URL과 METHOD를 만들어야 한다.

todo    동사보다는 "명사" 위주로 쓰는 것이 좋다.
todo    띄어쓰기는 언더바 대신 대시 기호
todo    파일 확장자는 사용 금지
todo    하위 문서를 뜻할 땐, / 기호를 사용

*/

//* 2. 클라이언트와 서버역할 구분
/* 

유저에게 서버 역할을 맡기거나 직접 입출력을 시키면 안된다.

*/

//* 3. stateless
/*

요청들은 서로 의존성이 있으면 안되고, 각각 독립적으로 처리되어야 한다.

*/

//* 4. Cacheable
/* 

서버가 보내는 자료는 캐싱이 가능해야 한다. - 대부분 컴퓨터가 동작

*/

//* 5. Cacheable
/*
서버 기능을 만들 때, 레이어를 걸쳐서 코드가 실행되어야 한다. (아직 몰라도 됨)
*/

//*6 Code on Demeand
/*
서버는 실행 가능한 코드를 보낼 수 있다.
*/

//* server.js 전체 정리
/*

todo    server.js 를 구동하기 위해서는 Node.js 가 필요하다.

?  Node.js를 이용할 떄, 항상 최신 업데이트 정보를 확인할 것.  "node -v" 터미널 입력. 
?  만약에 최신 버전으로 업데이트가 되어있지 않다면 다운 받을 것

todo    npm init -y

?  package.json을 생성해주는 명령어


todo    yarn add express
todo    npm install express

?  서버 구동을 위한 라이브러리 다운 받기

리액트 서버, 백엔드 서버를 함께 열 수 있다.
리액트 기본 서버 : 3000
백엔드 서버 : 5000
80, 25, 443번 포트 못염


todo    yarn add nodemon
안되면 서버 껐다 켜기 해야 되지만 매번 끄고 키기 쉽지 않다.
nodemon을 다운 받은 뒤, package.json에서 아래 설정으로 변경해준다.

? "start" : "node server.js" => "nodemon server.js"

?  "scripts": {
?    "test": "echo \"Error: no test specified\" && exit 1",
?    "start": "nodemon server.js"
?  },


todo    yarn add tailwindcss autoprefixer postcss
테일윈드 쓰려면 이것을 다운 받으면 된다.

postcss.config.js 와 tailwind.config.js를 폴더의 최상위에 추가 해줘야한다!

tailwind.config.js에는 

  content: [
    "./page/*.{html, ejs, js, ts}"
  ],

이라고 추가 해줘야한다.


todo 
?   app.get('/', (req, res)=>{
?       res.send("메인 페이지")
?   })

?   app.get('/', (req, res)=>{
?       res.sendFile(__dirname + '/page/index.html') 
?   })

npx tailwindcss -i ./page/css/tailwind.css -o ./page/css/index.css -watch


todo    yarn add mongodb
todo    yarn add ejs
ejs는 무조건! "views"로 만들어야한다.

todo    yarn add concurrently
서버 여러개 동시에 열어야 할 때 쓴다.

tailwind, node.js 같이 실행하기 위해서 package.json 에 아래와 같이 설정해 준다.

  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "concurrently \"nodemon server.js\" \" npx tailwindcss -i ./page/css/tailwind.css -o ./public/index.css --watch\""
  },

*/

//* yarn add dotenv
