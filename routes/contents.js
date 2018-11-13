var express = require('express');
var router = express.Router();
var BoardContents = require('../models/boardSchema.js'); //db에 저장시키고 저장되어있는 것을 불러주는데 사용된다
var Answers = require('../models/answerSchema.js'); 
var Categorys = require('../models/categorySchema.js'); 

//db에 저장되어있는 글들을 불러오고, 그것을 뷰단에서 뿌려주기
router.get('/', function(req,res){
    // 처음 index로 접속 했을시 나오는 부분 4
    // db에서 게시글 리스트 가져와서 출력
    /** page는 1-5까지 보여줌 -> db에서 총 갯수를 받아와서 10으로 나눈 뒤 올림
     * 한 페이지에는 10개의 게시글 :limit:10,skip:(page-1)*10
     * page number는 param으로 받아오기, 가장 처음엔 param이 없으니까 그땐 자동 1 설정
     * (첫페이지에는 스킵할것이 없고 2페이지에는 10개스킵)
     */
    var sess = req.session;
    var uid = null;
    if(sess.uid){
        uid = sess.uid;
        console.log(uid);
    }

    var page = req.param('page');
    if(page == null) {page = 1;}

    var sortCondition = null;
    if(req.param('sort') == "latest"){
        sortCondition = {start_date:-1};
    }else if(req.param('sort') == "recommend"){
        sortCondition = {parti_cnt:-1};
    }else{
        sortCondition = {start_date:-1};    
    }

    var skipSize = (page-1)*10;
    var limitSize = 10;
    var pageNum = 1;

    var hotPetition = null;
    var waitPetition = null;

    BoardContents.count({answer_flag:false},function(err, totalCount){
       // db에서 날짜 순으로 데이터들을 가져옴
        if(err) {throw err;}

        pageNum = Math.ceil(totalCount/limitSize);
        
        //가장 인기있는 청원
        BoardContents.findOne({answer_flag:false}).sort({parti_cnt:-1}).exec(function(err, pageContent) {
            if(!err){
                hotPetition = pageContent;
            }
        });

        //답변을 기다리는 청원
        BoardContents.find({$and:[{answer_flag:false},{parti_cnt:{"$gte":5}}]}).sort({start_date:-1}).limit(5).exec(function(err, pageContents) {
            if(!err){
                waitPetition = pageContents;
            }
        });
        
        //청원목록
        BoardContents.find({answer_flag:false}).sort(sortCondition).skip(skipSize).limit(limitSize).exec(function(err, pageContents) {
            if(err) {throw err;}
            //board.ejs의 title변수엔 "Board"를, contents변수엔 db검색 결과 json데이터를 저장해 줌.

            res.render('board', {
                hotPetition: hotPetition,
                waitPetition: waitPetition,
                contents: pageContents, 
                pagination: pageNum, 
                searchWord: '',
                uid:uid});
        });
    });
});
//form에 입력된 정보를 req.body를 통해 받아오고 데이터베이스에 저정(addBoard)
// 그 후 다시 /boards 경로로 보낸다
router.post('/',function(req,res){
    //글 작성하고 submit하게 되면 저장되는 부분
    //글 수정하고 submit하면 수정된 결과가 저장되는 부분
    var mode = req.param('mode');

    var addNewTitle = req.body.addContentSubject;
    var addNewCategory = req.body.ContentCategorySelect;
    var addNewContent = req.body.addContents;

    var modTitle = req.body.modContentSubject;
    var modContent = req.body.modContents;
    var modId = req.body.modId;

    if(mode == 'add'){
        if(!req.session.uid){
            res.send('<script type="text/javascript">alert("' + '청원하기위해선 로그인이 필요합니다' + '");window.location.href = "/users/login";</script>');
        }
        else{
            var sess = req.session;
            addBoard(sess,addNewTitle,addNewCategory,addNewContent);
            res.redirect('/boards');
        }        
    }else{
        modBoard(modId,modTitle,modContent);
        res.redirect('/boards');
    }
});

router.get('/category',function(req,res){
    // 로그인 여부 확인
    var sess = req.session;
    var uid = null;
    if(sess.uid)
        uid = sess.uid;

    //페이징
    var limitSize = 10;
    var pageNum = 1;  

    BoardContents.count({answer_flag:false},function(err, totalCount){
       // db에서 날짜 순으로 데이터들을 가져옴
        if(err) {throw err;}

        pageNum = Math.ceil(totalCount/limitSize);
        
        //진행 중 or 만료된 청원 top 5
        BoardContents.find({answer_flag:false}).sort({parti_cnt:-1}).limit(5).exec(function(err, pageContent) {
            if(!err){
                conditionPetition = pageContent;
            }
        });
        
        //청원목록
        BoardContents.find({answer_flag:false}).limit(limitSize).exec(function(err, pageContents) {
            if(err) {throw err;}
            //board.ejs의 title변수엔 "Board"를, contents변수엔 db검색 결과 json데이터를 저장해 줌.
               
            Categorys.find().exec(function(err,categorys){
                if(!err){
                    console.log(pageContents)
                    res.render('boardCategory', {
                        category : categorys,
                        conditionPetition: conditionPetition,
                        contents: pageContents, 
                        pagination: pageNum, 
                        uid:uid});
                }
            });            
        });
    });
});

router.get('/catecondition',function(req,res){
    var cate = req.param('c');
    var tab = req.param('tab');

    if(cate == 0){
        cate = {$regex:""};
    }else{
        cate = {$regex:cate};
    }

    /* 페이징 정보 받아오기 */
    var page = req.param('page');
    if(page == null) {page = 1;}

    console.log(page);

    var limitSize = 10;
    var pageNum = 1;  
    var skipSize = (page-1)*10;

    var sortCondition = null;

    if(tab == 2){
        sortCondition = {answer_flag:true};
    }else if(tab == 1){
        sortCondition =  {answer_flag:false};
    }else{
        sortCondition = {answer_flag:false},{answer_flag:true};
    }

    if(tab){
        BoardContents.find({$and:[{category:cate},sortCondition]}).sort({parti_cnt:-1}).limit(5).exec(function(err, top_pageContent) {
        if(!err){
            res.send(top_pageContent);          
        }
        });
    }else{
        BoardContents.find({$and:[{category:cate},sortCondition]}).sort({parti_cnt:-1}).skip(skipSize).limit(limitSize).exec(function(err, pageContents) {
            if(err) {throw err;}
            BoardContents.count({category:cate},function(err, totalCount){
                // db에서 날짜 순으로 데이터들을 가져옴
                if(err) {throw err;}
        
                pageNum = Math.ceil(totalCount/limitSize);
        
                var Contents = new Object();
                Contents = {pageContents}
                Contents.pageNum = pageNum
                
                console.log(Contents);
                console.log(Contents.pageContents);
                res.send(Contents);       
            });      
        });
    }
})
router.get('/view',function(req,res){
    //글 보는 부분, 글 내용을 출력하고 조회수를 늘린다.
    //댓글 페이지 추가, 5개씩 출력
    var contentId = req.param('id');

    var sess = req.session;
    var uid = null;
    var answer = null;

    if(sess.uid)
        uid = sess.uid;

    BoardContents.findOne({_id:contentId}, function(err, rawContent){
        if(err) throw err;
        rawContent.count += 1;//조회수 늘린다.
        var reply_pg=Math.ceil(rawContent.comments.length/5);
        rawContent.save(function(err){//변화된 조횟수 저장
            if(!err){
                Answers.findOne({petitions:contentId}).populate("petitions").exec((err,petition_answer) => {
                    if(!err){
                        answer = petition_answer;

                        res.render('boardDetail',{
                            content : rawContent,
                            replyPage : reply_pg,
                            answer : answer, 
                            uid : uid});//db에서 가져온 내용을 뷰로
                    }
                });
            }            
        });
    })
});

router.get('/password',function(req,res){
    //글 비밀번호 찾아오기
    var contentId = req.param('id');

    BoardContents.findOne({_id:contentId},function(err,rawContents){
        if(err) throw err;
        res.send(rawContents.password);
    });
});

router.get('/delete',function(req,res){
    var contentId = req.param('id');

    BoardContents.update({_id:contentId},{$set:{deleted:true}},function(err){
        if(err) throw err;
        res.redirect('/boards');
    });
});

router.get('/search', function(req, res){
    // 글 검색하는 부분
    var search_word = req.param('searchWord');
    var searchCondition = {$regex:search_word};

    var sess = req.session;
    var uid = null;
    if(sess.uid){
        uid = sess.uid;
        console.log(uid);
    }

    var page = req.param('page');
    if(page == null) {page = 1;}
    var skipSize = (page-1)*10;
    var limitSize = 10;
    var pageNum = 1;

    BoardContents.count({deleted:false, $or:[{title:searchCondition},{contents:searchCondition},{writer:searchCondition}]},function(err, searchCount){
        if(err) throw err;ct 
        pageNum = Math.ceil(searchCount/limitSize);

        BoardContents.find({deleted:false, $or:[{title:searchCondition},{contents:searchCondition},{writer:searchCondition}]}).sort({start_date:-1}).skip(skipSize).limit(limitSize).exec(function(err, searchContents){
            if(err) throw err;

            res.render('board', {contents: searchContents, pagination: pageNum, searchWord: search_word,uid:uid});
        });
    });
});

router.post('/reply',function(req,res){
    //댓글 다는 부분
    if(!req.session.uid){
        res.send('<script type="text/javascript">alert("' + '청원동의하기위해선 로그인이 필요합니다. 로그인 페이지로 이동합니다' + '");window.location.href = "/users/login";</script>');
    }
    else{
        var sess = req.session;

        var reply_comment = req.body.replyComment;
        var reply_id = req.body.petitionId; //청원글 ID
      
        if(!reply_comment){
            reply_comment = "동의합니다";
        }

        var add = addComment(reply_id,sess,reply_comment,function(result){
            if(result){
                console.log(" addComment result true")
                res.redirect('/boards/view?id='+reply_id);
            }else{
                console.log(" addComment result false")
                res.send('<script type="text/javascript">alert("' + '이미 동의한 청원입니다.' + '");window.history.back();</script>');
            }
        });
    }   
});

// 댓글 페이징
router.get('/reply',function(req,res){
  //댓글 ajax로 페이징하는 부분
  var id = req.param('id');
  var page = req.param('page');
  var max = req.param('max');//댓글 총 개수 확인
  var skipSize = (page-1)*5;
  var limitSize = skipSize+5;

  console.log(skipSize);
  if(max<skipSize+5){limitSize=max*1;}//댓글 개수보다 넘어가는 경우는 댓글 수로 맞춰줌

  BoardContents.findOne({_id:id},{comments:{$slice:[skipSize,limitSize]}},function(err,pageReply){
    if(err) throw err;
    res.send(pageReply.comments);
  });3
});

router.get('/write',function(req,res){
    if(!req.session.uid){
        res.send('<script type="text/javascript">alert("' + '청원하기위해선 로그인이 필요합니다' + '");window.location.href = "/users/login";</script>');
    }
    else{
        Categorys.find().exec(function(err,categorys){
            res.render('boardWrite',{categorys : categorys,uid:req.session.uid});
        });
    }
});

// 답변된 청원 보여주기
router.get('/answer',function(req,res){
    var page = req.param('page');
    if(page == null) {page = 1;}

    var skipSize = (page-1)*10;
    var limitSize = 10;
    var pageNum = 1;

    var sess = req.session;
    var uid = null;
    if(sess.uid)
        uid = sess.uid;

    Answers.count(function(err, totalCount){
       // db에서 날짜 순으로 데이터들을 가져옴
        if(err) throw err;

        pageNum = Math.ceil(totalCount/limitSize);
        Answers.find().sort({date:-1}).populate("petitions").skip(skipSize).limit(limitSize).exec(function(err, pageContents) {
            if(err) throw err;
            //board.ejs의 title변수엔 "Board"를, contents변수엔 db검색 결과 json데이터를 저장해 줌.
            console.log(pageContents);
            res.render('boardAnswer', {answers: pageContents, pagination: pageNum,uid:uid});
        });
    });

});

// 청원답변글 생성
router.post('/answer',function(req,res){
    //글 작성하고 submit하게 되면 저장되는 부분
    //글 수정하고 submit하면 수정된 결과가 저장되는 부분
    var mode = req.param('mode');

    var petitionId = req.body.ContentId;
    var addNewContent = req.body.addContents;

    if(mode == 'add'){
        if(!req.session.uid){
            res.send('<script type="text/javascript">alert("' + '청원답변 하기위해선 로그인이 필요합니다' + '");window.location.href = "/users/login";</script>');
        }
        else{
            var sess = req.session;
            console.log(petitionId);
            addAnswer(sess,petitionId,addNewContent);
            res.redirect('/boards');
        }        
    }
});

// 청원답변하기 선택 -> 로그인 및 권한여부 확인
router.get('/answerWrite',function(req,res){
    if(!req.session.uid){
        res.send('<script type="text/javascript">alert("' + '청원답변을 위해선 로그인이 필요합니다' + '");window.location.href = "/users/login";</script>');
    }
    else{
        var contentId = req.param('id');

        BoardContents.findOne({_id:contentId}, function(err, rawContent){
            if(err) throw err;
            res.render('boardAnswerWrite',{content:rawContent, uid:req.session.uid});//db에서 가져온 내용을 뷰로
        });
        //??res.render('boardAnswer');   
     }
});

module.exports = router; 

function addBoard(session,title,category,content){
    var newBoardContents = new BoardContents;

    // newBoardContents.writer = writer;
    newBoardContents.writer = session.email;
    newBoardContents.category = category;
    newBoardContents.title = title;
    newBoardContents.contents = content;

    //데이터베이스 저장
    newBoardContents.save(function(err){
        if(err) throw err;
    });
}

function modBoard(id, title, content) {
    var modContent = content.replace(/\r\n/gi, "\\r\\n");

    BoardContents.findOne({_id:id}, function(err, originContent){
        if(err) throw err;
        originContent.updated.push({title: originContent.title, contents:originContent.contents});
        originContent.save(function(err){
            if(err) throw err;
        });
    });

    BoardContents.update({_id:id}, {$set: {title: title, contents: modContent, start_date: Date.now(),end_date: Date.now()}}, function(err) {
        if(err) throw err;
    });
}

function addComment(petition,writer,comment,callback){

    var result = false;

    BoardContents.findOne({_id:petition},{'comments':{$elemMatch:{name:writer.email}}},function(err,user_comment){
        if(!err){
            console.log(user_comment.comments.length);
            console.log(user_comment.comments);
            if(user_comment.comments.length == 0){                
                BoardContents.findOne({_id:petition},function(err,rawContent){
                    if(err) throw err;
                    
                    //데이터를 배열 앞에 추가해준다 (댓글이 추가된 순서대로 보기 위해서)
                    rawContent.comments.unshift({name:writer.email,memo:comment});
                    rawContent.parti_cnt +=1;
                    rawContent.count -=1; //댓글을 추가하고 refresh되면서 조회수가 2배로 증가하게되어서 추가
                
                    rawContent.save(function(err){
                        if(err) throw err;
                        result = true;
                        
                        console.log("callback true return");
                        callback(result);
                    });
                });
            }
            else{
                console.log("callback false return");
                callback(result);                
            }
        }
    });
  }

function addAnswer(session,petition,content){
    var newAnswers = new Answers({
        writer : session.email,
        contents : content,
        petitions : petition
    });
    console.log(newAnswers);

    //데이터베이스 저장
    newAnswers.save(function(err){
        if(err) throw err;
        
        BoardContents.findOne({_id:petition}, function (err, doc){
            doc.answer_flag = true;
            doc.save();
        });
    });

    console.log(newAnswers._id);
}