
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var xlsx = require('node-xlsx');
var i = 0;
var myDatas = [];

function fetchPage(x) {     //封装了一层函数
  startRequest(x);
}

function startRequest(x) {
    //采用http模块向服务器发起一次get请求
    http.get(x, function (res) {
        var html = '';        //用来存储请求网页的整个html内容
        var titles = [];
        res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
          var $ = cheerio.load(html); //采用cheerio模块解析html
          savedContent($);  //存储每篇文章的内容及文章标题
          i += 1;
          var nextLink= $(".aNxt").attr('href');
          var page = document.querySelector('#txt_page').value || 10;
          if (i <= page && nextLink) {
              startRequest(nextLink);
          } else {
            console.log('end')
            // 写数据到excel文件
            var filename='./tpl.xlsx';
            var now = new Date();
            var name = now.getFullYear()+'-'+now.getMonth()+'-'+now.getDate()
            var buffer = xlsx.build([{name: name, data: myDatas}]);
            fs.writeFileSync('./excel/'+name+'.xlsx', buffer, 'binary');
            document.querySelector('#txt_remark').innerHTML = '数据爬取结束';
          }
        });
    }).on('error', function (err) {
        console.log(err);
    });
}

//该函数的作用：在本地存储所爬取的新闻内容资源
function savedContent($) {
    $('.jjr-itemmod').each(function (index, item) {
      var colum = [];
      var name = $(this).find('.thumbnail').attr('alt');
      var ps = $(this).find('.jjr-info').find('p')
      var company = ps.first().find('a').first().text();
      if (ps.length === 3) {
        company = ps.eq(1).find('a').first().text();
      }
      var tel = $(this).find('.jjr-side')[0].children[2].data.replace(/(^\s*)|(\s*$)/g, '');
      colum.push(name);
      colum.push(company);
      colum.push(tel);
      myDatas.push(colum);
    });
}

// 注册页面按钮事件
var btnSearch = document.querySelector('#btnRen');
btnSearch.addEventListener('click', function() {
  fetchPage(document.querySelector('#txt_url').value);
  document.querySelector('#txt_remark').style.display = "block"
  document.querySelector('#txt_remark').innerHTML = '数据爬取中........'
});
