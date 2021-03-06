var express = require('express');
var request = require('request');
var parser = require('fast-html-parser');
var cors = require('cors');
var channels = require('./channel-info');

var app = express();
app.use(cors());

app.get('/stations',function(req, res){
    request('https://www.seirsanduk.com/',function(err,result,body){
       if(err){
           console.log(err);
       }else{
            var page = parser.parse(body);
            var menu = page.querySelector('ul.nav_vodlist').childNodes.map(function(node){
                if(node.childNodes){
                    return {
                        href: node.childNodes[0].rawAttrs.replace(/(href=\")|(\")*$/igm,''),
                        img:node.childNodes[0].querySelector('img').rawAttrs.split('src="')[1].split('"')[0],
                        name:node.childNodes[0].childNodes[1].rawText
                    }
                }
            }).filter(function(item){
                if(item) return item;
            });

            res.json({
                menu:menu,
                channels:channels
            })
       }
    })
});

app.get('/station', function(req,res){
    request({
        url:'http://www.seirsanduk.com/'+req.query.id,
        // headers:req.headers
    },function(error,result,body){
        if(error) {
            console.log(error);
        } else {
            var page = parser.parse(body,{script:true});
            var scripts =page.querySelectorAll('.content script');
            var url  = scripts.map(function(script){
                return script.childNodes[0];
            }).filter(function(script){
                if(script) return script;
            }).map(function(script){
                return script.rawText;
            }).filter(function(script){
                if(script.indexOf('jwplayer("Element").setup')>0){
                    return script;
                }
            })[0].split('file:"')[1].split('"')[0]

            res.json({'url':url});
        }
    });
});

app.get('/stream',function(req,res,body){
    request({
        url:req.query.url,
        headers:{
            'Referer':'http://seirsanduk.com/'
        }
    },function(error,response,body){
        if(!error){
            res.send(body);
        }
    })
})

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 
app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
});