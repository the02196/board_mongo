const express = require("express"); //require은 무엇을 불러오겠다는 뜻
const app = express() ; //2줄의 의미는 express를 세팅하기 위함
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');


dotenv.config();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const url =`mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PW}@cluster0.xjqdfjy.mongodb.net/`

app.use(passport.initialize());
app.use(session({
    secret:"암호화에 쓸 비밀번호", //세션 문서의 암호화
    resave:false, //유저가 서버로 요청할 때마다 갱신할건지
    saveUninitialized:false, //로그인 안해도 세션 만들건지 
    cookie:{maxAge: 60 * 60 * 1000}, // 쿠키 만료일을 설정할 수 있음 (1시간뒤에 사라지도록 설정함)
    store: MongoStore.create({
        mongoUrl:url,
        dbName:"board"
    })

}))
app.use(passport.session());
 //글쓰기를 눌러서 body의 내용을 가져오기 위해서 두줄의 코드가 필요(복붙)
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
const{MongoClient, ObjectId} = require('mongodb');
app.use(express.static(__dirname + '/public'))
let db;
let sample; //샘플의 변수를 설정해줌
//url은 고유번호라서 사람들마다 데이터베이스에 저장되는 문자열이 다름

new MongoClient(url).connect().then((client)=>{
    db = client.db("board");
    sample = client.db("sample_training");
    console.log("DB 연결 완료!")  
    app.listen(process.env.SERVER_PORT, ()=>{ //데이터베이스에 연결이 되면 완전하게 서버를 열겠다는 의미임
        console.log(`${process.env.SERVER_PORT}번호에서 서버 실행 중`);
    }) //서버를 여는 방법
    //데이터베이스를 읽고 서버를 열어야 하기 때문에 위에 코드를 여기에 넣음
}).catch((error)=>{
    console.log(error)
})



app.get("/",(req,res)=>{ //get에서는 2개의 파라미터를 받음 (request,response)
    // res.send("Hello World");// 결과값을 보낸다라는 뜻
    res.sendFile(__dirname + '/page/index.html')
})

app.get("/about",(req,res)=>{ 
    // res.send("어바웃 페이지"); //리엑트에서 라우트 
    res.sendFile(__dirname + '/page/about.html')
    // db.collection("notice").insertOne({
    //     title: "1번째 글",
    //     content:"1번째 글"
    // })
})

app.get("/view/:id",async(req,res)=>{
    const result = await db.collection("notice").findOne({
        _id: new ObjectId(req.params.id) //내가 찾는 id는 오브젝트 id 찾는걸  받는다
    }) 
    console.log(result);
    res.render("view.ejs",{ 
        data : result //전체 데이터를 가져와서 보내주기 위해서 array로 담아서 object 형태로 보내줌
    }); 
})

// 1. Uniform Interface :  여러 URL과 METHOD는 일관성이 있어야 하며, 하나의 URL에서는 하나의 데이터만 디자인하며, 간결하고 예측 가능한 URL과 METHOD를 만들어야 한다.
// 동사보다는 명사위주
// 띄어쓰기는 언더바 대신 대시 기호
// 파일 확장자는 사용금지
// 하위 문서를 뜻할 떈 / 기호를 사용
// 2. 클라이언트와 서버역할 구분
// 유저에게 서버 역할을 맡기거나 직접 입출력을 시키면 안된다.
// 3. stateless
// 요청들은 서로 의존성이 있으면 안되고 , 각각 독립적으로 처리되어야 한다
// 4. Cacheable
// 서버가 보내는 자료는 캐싱이 가능해야 한다 - 대부분 컴퓨터가 동작
// 5.Layered System
// 서버 기능을 만들 때 레이어를 걸쳐서 코드가 실행되어야 한다
// 6. Code on Demeand
// 서버는 실행 가능한 코드를 보낼 수 있다


app.get('/home',(req,res)=>{ 
    res.send("잠와..."); //리엑트에서 라우트 
})

app.get('/list', async(req,res)=>{ 
    //ejs 파일 javascript template라서 컴파일,렌더링 해줘야함 
    const result = await db.collection("notice").find().limit(5).toArray() 
    //전체문서를 가져오는 방법 ? find(), 하나의 문서를 가져오는 방법 ? findOne() (파이어베이스는 getDocs/getDoc) 
    //await ? 데이터를 다 가져올때꺄지 기다렸다가 아래 코드를 실행하세요
    console.log(result[0]); //데이터가 나오지 않을때는 async await 를 하기(공식문서에 무조건 쓰라고 나와있음)
    res.render("list.ejs",{ 
        data : result //전체 데이터를 가져와서 보내주기 위해서 array로 담아서 object 형태로 보내줌
    }); //props로 데이터를 보냄

})

app.get('/list/2', async(req,res)=>{ 
    //ejs 파일 javascript template라서 컴파일,렌더링 해줘야함 
    const result = await db.collection("notice").find().skip(6).limit(5).toArray() 
    //전체문서를 가져오는 방법 ? find(), 하나의 문서를 가져오는 방법 ? findOne() (파이어베이스는 getDocs/getDoc) 
    //await ? 데이터를 다 가져올때꺄지 기다렸다가 아래 코드를 실행하세요
    //console.log(result[0]); //데이터가 나오지 않을때는 async await 를 하기(공식문서에 무조건 쓰라고 나와있음)
    res.render("list.ejs",{ 
        data : result //전체 데이터를 가져와서 보내주기 위해서 array로 담아서 object 형태로 보내줌
    }); //props로 데이터를 보냄

})

app.get('/list/:id', async(req,res)=>{ 
    //ejs 파일 javascript template라서 컴파일,렌더링 해줘야함 
    const result = await db.collection("notice").find().skip((req.params.id - 1)*5).limit(5).toArray() 
    //전체문서를 가져오는 방법 ? find(), 하나의 문서를 가져오는 방법 ? findOne() (파이어베이스는 getDocs/getDoc) 
    //await ? 데이터를 다 가져올때꺄지 기다렸다가 아래 코드를 실행하세요
    console.log(result[0]); //데이터가 나오지 않을때는 async await 를 하기(공식문서에 무조건 쓰라고 나와있음)
    res.render("list.ejs",{ 
        data : result //전체 데이터를 가져와서 보내주기 위해서 array로 담아서 object 형태로 보내줌
    }); //props로 데이터를 보냄

})


//1013-2 => write 페이지 생성해서 글쓰기 버튼을 누르면 add 페이지로 이동하게 하기
app.get('/write',(req,res)=>{ 
    res.render('write.ejs') //리엑트에서 라우트 
})


app.post('/add',async(req,res)=>{ 
    // console.log(req.body)
    // res.render('add.ejs')
   try{await db.collection("notice").insertOne({
        title: req.body.title,
        content:req.body.content
    })
    }catch(error){
        console.log(error)
    }
    // res.send("성공!")
    res.redirect('/list') //list 페이지로 바로 넘어가도록 함    
})

//1013-3
app.put('/edit',async(req,res)=>{
    //  수정하는 방법 updateOne({문서},{
    //     $set : {원하는 키 : 변경값}
    // })
    // console.log(req.body)
    await db.collection("notice").updateOne({
        _id: new ObjectId(req.body._id)
    },{
        $set :{
            title: req.body.title,
            content: req.body.content
        }
    })
    const result ="";
    // res.send(result)
    res.redirect('/list')
})


app.get('/edit/:id',async(req,res)=>{ 
    const result = await db.collection("notice").findOne({
        _id: new ObjectId(req.params.id) 
    }) 
    res.render('edit.ejs',{
       data:result
    }) 
})


app.get('/delete/:id',async(req,res)=>{ 
    // console.log(req.params.id)
    try{
        await db.collection("notice").deleteOne({
        _id: new ObjectId(req.params.id) 
        }) 
    }catch(error){
            console.log(error)
    }
    res.redirect('/list')
    
})

passport.use(new LocalStrategy({
    usernameField :'userid',
    passworddField: 'password'
}, async(userid,password,cb)=>{ //내가 입력한 아이디,비밀번호, 도중에 무언가를 실행할 때 사용하는 코드이며 passport를 로그인 되기 전에 적어줘야함
    let result = await db.collection("users").findOne({
        userid : userid
    })
    if(!result){
        // 미들웨어? 도중에 실행하는 것. 또는, 
      return cb(null,false,{message:'아이디나 비밀번호가 일치 하지 않음'})   
    }

    const passChk = await bcrypt.compare(password, result.password)
    console.log(passChk)

    if(passChk){
        return cb(null, result);
    }else{
        return cb(null,false,{message:'아이디나 비밀번호가 일치 하지 않음'})   

    }
}))

passport.serializeUser((user,done)=>{ //done은 session에 저장할 정보로 (null, user)
 process.nextTick(()=>{
    //done(null , 세션에 기록할 내용)
    done(null, {id: user._id, userid: user.userid})
 })
}) //인코딩

passport.deserializeUser(async(user,done)=>{
    let result = await db.collection("users").findOne({
        _id: new ObjectId(user.id) //위에 저장된 아이디를 몽고디비에 저장한다는 의미임
    })    
    delete result.password //콘솔창에 비밀번호가 삭제되어서 나타나게 됨
    console.log(result)
    process.nextTick(()=>{
        done(null,result);
    })
}) //디코딩





app.get('/login',(req,res)=>{
    res.render('login.ejs')
})

app.post('/login',async(req,res,next)=>{
    // console.log(req.body);
    //로그인 버튼을 눌렀을 때 인증을 해줘야하니깐..
    passport.authenticate('local',(error,user,info)=>{
        console.log(error,user,info)
         //user가 성공했을 때 데이터 info가 실패했을 때 데이터
         if(error) return res.status(500).json(error)
         if(!user) return res.status(401).json(info.message)
        req.logIn(user,(error)=>{
          if(error) return next(error);
           res.redirect('/')
     }) 
    })(req,res,next) //외우지 않고 복붙해서 쓰는 코드임
})

app.get('/register',(req,res)=>{
    res.render('register.ejs')
});

app.post('/register',async(req,res)=>{
    
    let hashPass = await bcrypt.hash(req.body.password, 10); // 문자 콤마 숫자 > 얼만큼 꼴거냐? 라는 의미이며 숫자가 높을수록 느려짐
    // console.log(hashPass)
    // console.log(req.body) 
    // 1.콘솔로 입력된 데이터가 터미널창에 잘 뜨는지 확인한다.

     try{
        await db.collection("users").insertOne({ 
            // 2. 데이터베이스에 데이터를 저장해야함
            // (req.body)로 데이터를 보낼 수 있지만 다른 정보들이 포함되어있기 때문에 정확하게 req.body.userid / req.body.password라고 적어야함 
            userid:req.body.userid,
            password:hashPass
         })
    }catch(error){
        console.log(error)
     }
     res.redirect('/list')
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

//* 리액트에서 사용하려면 yarn add mongoose

//* put과 delete메소드를 사용할 수 있는 yarn add method-override