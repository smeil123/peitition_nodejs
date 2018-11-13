// $(document).ready(function(){
//     tab = 1;
//     cate = 0;
// });
// tab = 1;
// cate = 0;
function only_sel(obj){ 
    document.querySelectorAll('.category_tab1')[0].classList.remove('active');
    document.querySelectorAll('.category_tab2')[0].classList.remove('active');

    $(obj).addClass('active');
    tab = $(obj).attr('rel-only');
    mode = "category";

    petitionPrint(function(result_top){
        $('.petition_list').html(result_top);
    });
            
}
function category_sel(obj){
    var cateList = document.querySelectorAll('.category_link');

    cateList.forEach(function(c){
        c.classList.remove('active');
    });

    $(obj).addClass('active');
    cate = $(obj).attr('rel-category');
    mode = "list";

    petitionPrint(function(result_top,result_list,paging){
        $('.petition_list').html(result_top);
        $('.petition_list_total').html(result_list);
        $('.list_pagination').html(paging);
    });
}
function paging(obj){
    if (typeof cate === 'undefined' || cate === null) {
        // variable is undefined or null
        cate = 0;
    }

    $.get('/boards/catecondition?c='+cate+'&page='+$(obj).text(),function(petitionList){
        if (cate == 0){
            var output2 ='<table class="table table-hover"><div style="float:left"><h2 class="title">'+'청원'+
        ' 목록</h2></div>'
        }else{
            var output2 ='<table class="table table-hover"><div style="float:left"><h2 class="title">'+cate+
            ' 목록</h2></div>'
        }       
        
        output2+='<tr class="table-active"><th>번호</th>'+
            '<th>분류</th><th>제목</th><th>청원인</th><th>청원기간</th><th>참여인원</th><th>조회 수</th></tr>';

        var i = 10*($(obj).text()-1);
        petitionList['pageContents'].forEach(function(item){  
            i++;
            output2 +='<tr><td class="number">'+i+'</td>';
            output2 +='<td class="category">'+item.category+'</td>';
            output2 +='<td class="title"><a href="/boards/view?id=<%='+item._id+'%>">'+item.title+'</a></td>';
            output2 +='<td class="writer">'+nameSlicingScript(item.writer)+'</td>';
            output2 +='<td class="date">'+dateFormatChangeScript(item.start_date)+'~'+dateFormatChangeScript(item.end_date)+'</td>';
            output2 +='<td class="participants_cnt">'+item.parti_cnt+'</td>';
            output2 +='<td class="cnt">'+item.count+'</td></tr>';
        });
        output2 +='</table>';

        $('.petition_list_total').html(output2);
    });
}
function petitionPrint(callback){
    if (typeof cate === 'undefined' || cate === null) {
        // variable is undefined or null
        cate = 0;
    }
    if (typeof tab === 'undefined' || tab === null) {
        // variable is undefined or null
        tab = 1;
    }

    $.get('/boards/catecondition?tab='+tab+'&c='+cate,function(top_petitionList){
        var output1 ='<table class="table table-hover"><tr class="table-active"><th>번호</th>'+
            '<th>분류</th><th>제목</th><th>청원인</th><th>청원기간</th><th>참여인원</th><th>조회 수</th></tr>';
        var i = 0;
        top_petitionList.forEach(function(item){  
            i++;
            output1 +='<tr><td class="number">'+i+'</td>';
            output1 +='<td class="category">'+item.category+'</td>';
            output1 +='<td class="title"><a href="/boards/view?id=<%='+item._id+'%>">'+item.title+'</a></td>';
            output1 +='<td class="writer">'+nameSlicingScript(item.writer)+'</td>';
            output1 +='<td class="date">'+dateFormatChangeScript(item.start_date)+'~'+dateFormatChangeScript(item.end_date)+'</td>';
            output1 +='<td class="participants_cnt">'+item.parti_cnt+'</td>';
            output1 +='<td class="cnt">'+item.count+'</td></tr>';
        });
        output1 +='</table>';

        if(mode=='list'){
            $.get('/boards/catecondition?c='+cate,function(petitionList){
                if(cate == 0){
                    var output2 ='<table class="table table-hover"><div style="float:left"><h2 class="title">'+
                    '청원 목록</h2></div>'
                }else{
                    var output2 ='<table class="table table-hover"><div style="float:left"><h2 class="title">'+cate+
                    ' 목록</h2></div>'
                }
                
                
                output2+='<tr class="table-active"><th>번호</th>'+
                    '<th>분류</th><th>제목</th><th>청원인</th><th>청원기간</th><th>참여인원</th><th>조회 수</th></tr>';
                var i = 0;
                petitionList['pageContents'].forEach(function(item){  
                    i++;
                    output2 +='<tr><td class="number">'+i+'</td>';
                    output2 +='<td class="category">'+item.category+'</td>';
                    output2 +='<td class="title"><a href="/boards/view?id=<%='+item._id+'%>">'+item.title+'</a></td>';
                    output2 +='<td class="writer">'+nameSlicingScript(item.writer)+'</td>';
                    output2 +='<td class="date">'+dateFormatChangeScript(item.start_date)+'~'+dateFormatChangeScript(item.end_date)+'</td>';
                    output2 +='<td class="participants_cnt">'+item.parti_cnt+'</td>';
                    output2 +='<td class="cnt">'+item.count+'</td></tr>';
                });
                output2 +='</table>';

                output3 ='<div class="pagination" style="margin:auto;"><ul class="pagination">'
                    
                for(var i=1; i<=petitionList['pageNum']; i++){
                    output3 +='<li class="page-item"><a href="javascript:void(0);" class="page-link" onclick="paging(this);">'+i+'</a></li>'
                }
                output3 +='</ul></div>'
                callback(output1,output2,output3);
            });
        }else{
            callback(output1);

        }
    });   
}
function dateFormatChangeScript(date) {
    var newdate = new Date(date);
    return newdate.toLocaleDateString();
}
function nameSlicingScript(name){
    var hidename = name.slice(0,3);
    hidename = hidename.concat("***");

    var email_i = name.indexOf("@");
    return hidename.concat(name.slice(email_i));
}
