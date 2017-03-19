var express = require('express');
var request = require('request');
var parser = require('fast-html-parser');
var cors = require('cors');

var app = express();
app.use(cors());

app.get('/stations',(req, res)=>{
    request('https://www.seirsanduk.com/',(err,result,body)=>{
       if(err){
           console.log(err);
       }else{
            var page = parser.parse(body);
            var menu = page.querySelector('ul.nav_vodlist').childNodes.map((node)=>{
                if(node.childNodes){
                    return {
                        href: node.childNodes[0].rawAttrs.replace(/(href=\")|(\")*$/igm,''),
                        img:node.childNodes[0].querySelector('img').rawAttrs.split('src="')[1].split('"')[0],
                        name:node.childNodes[0].childNodes[1].rawText
                    }
                }
            }).filter((item)=>{
                if(item) return item;
            });

            res.json(menu)
       }
    })
});

app.get('/station', (req,res)=>{
    request({
        url:'http://www.seirsanduk.com/'+req.query.id,
        // headers:req.headers
    },(error,result,body)=>{
        if(error) {
            console.log(error);
        } else {
            var page = parser.parse(body,{script:true});
            var scripts =page.querySelectorAll('.content script');
            var url  = scripts.map((script)=>{
                return script.childNodes[0];
            }).filter((script)=>{
                if(script) return script;
            }).map((script)=>{
                return script.rawText;
            }).filter((script)=>{
                if(script.indexOf('jwplayer("Element").setup')>0){
                    return script;
                }
            })[0].split('file:"')[1].split('"')[0]

            res.json({'url':url});
        }
    });
});

app.get('/stream',(req,res,body)=>{
    request({
        url:req.query.url,
        headers:{
            'Referer':'http://seirsanduk.com/'
        }
    },(error,response,body)=>{
        if(!error){
            res.send(body);
        }
    })
})

app.listen(80,()=>{
    
});