(function(win , doc){
	var Player = function(el , options){
		this.el = el ;
		this.array = []
		this.lrcPanel = options.lrc == undefined ? "lrc_panel" : options.lrc ;
		this.current = {}
		this.getArray = function(){
			return this.array
		}
		var self = this
		this.el.addEventListener("timeupdate" , function(){
			try{
				var now = self.el.currentTime
				var k = self.getLrcLine(now)
				if(k){
					var d = document.querySelectorAll(".lrc_item")
					for(var i=0 ; i<d.length ; i++){
						var temp = d[i]
						temp.style.color = "white"
					}
					self.current["lrc"][k].el.style.color = "#89ff00"
					if(self.current["lrc"][k].top > 130){
						$("#lrc_panel").mCustomScrollbar("scrollTo",self.current["lrc"][k].top-130,{
							//scrollInertia:1000
						});
					}
				}
			}catch(err){}
		})
		this.el.addEventListener("error" , function(){
			self.next()
		})
		this.el.addEventListener("ended" , function(){
			self.next()
		})
		this.next = function(){
			self.current["index"] = self.current["index"]*1 + 1
			if(self.current["index"]*1 > self.array.length){
				self.current["index"] = 1
			}
			self.play(self.current["index"])
		}
		this.getLrcLine = function(now){
			var old = self.current["ks"][0]
			for(var i in self.current["ks"]){
				if(now*1 < self.current["ks"][i]*1){
					return old
				}
				old = self.current["ks"][i]
			}
		}
		this.addAndPlay = function(data){
			for(var i in this.array){
				if(this.array[i].songName == data.songName && this.array[i].singer == data.singer){
					return
				}
			}
			this.storage(data)
			this.array.push(data)
			this.el.src = data.play_url
			try{
				document.getElementById("singer_bg_img").src = data.img
				document.getElementById("singer_img").src = data.img
			}catch(err){
				console.log("歌词上方图片设置失败")
			}
			this.el.play()
			self.current["index"] = this.array.length
		}
		this.storage = function(data){
			var store = window.localStorage["list"]
			if(store == undefined){
				store = "[]"
			}
			store = JSON.parse(store)
			store.push(data)
			window.localStorage["list"] = JSON.stringify(store)
		}
		this.add = function(data){
			for(var i in this.array){
				if(this.array[i].songName == data.songName && this.array[i].singer == data.singer){
					return
				}
			}
			this.storage(data)
			this.array.push(data)
		}
		this.play = function(index){
			self.current["index"] = index
			this.el.src = this.array[index-1].play_url
			this.lrc_init(this.array[index-1].lrc)
			this.el.play()
			document.getElementById("singer_bg_img").src = this.array[index-1].img
			document.getElementById("singer_img").src = this.array[index-1].img
		}
		this.lrc_init = function(lrc){
			var panel = document.getElementById(this.lrcPanel).querySelector(".mCSB_container")
			var data = this.lrc_decode(lrc)
			var arr = []
			for(var i in data){
				arr.push(i)
			}
			var d1 = document.querySelectorAll(".lrc_item")
			for(var i=0 ; i<d1.length ; i++){
				var temp = d1[i]
				panel.removeChild(temp)
			}
			for(var i=0 ; i<arr.length ; i++){
				for(var j=i ; j<arr.length ; j++){
					if(arr[i]*1 > arr[j]*1){
						var temp = arr[i]
						arr[i] = arr[j]
						arr[j] = temp  
					}
				}
				var div = document.createElement("div")
				div.setAttribute("class" , "lrc_item")
				div.innerHTML = data[arr[i]].data
				panel.appendChild(div)
			}
			self.current.ks = arr
			var d = document.querySelectorAll(".lrc_item")
			for(var i=0 ; i<d.length ; i++){
				var temp = d[i]
				data[arr[i]]["top"] = temp.offsetTop
				data[arr[i]]["el"] = temp
			}
			this.current.lrc = data
			console.log(data)
			$("#lrc_panel").mCustomScrollbar("update")
		}
		this.getKey = function(index , json){
			var count = 0 ;
			for(var i in json){
				if(index == count){
					return i
				}
				count++
			}
		}
		this.lrc_decode = function(lrcdata){
			if(typeof(lrcdata) == "undefined"){
				return ;
			}
			var json = undefined
			if(lrcdata != undefined && lrcdata != ""){
				var reg1 = /(\[\d{2}:\d{2}\..*?\])+(.[^\[]*)?/g  //匹配歌词时间及内容部分
				var reg2 = /\[.([^0-9\]]*)?\]/g                      //匹配歌词头部信息
				var lrc_body = lrcdata.match(reg1)
				var lrc_head = lrcdata.match(reg2)
				json = {};
				
				for(var i = 0; i < lrc_body.length ; i++){
					var str_time = lrc_body[i].match(/\[\d{2}:\d{2}.*?\]/g)
					var str_txt = lrc_body[i].replace(/\[\d{2}:\d{2}.*?\]/g,"")
					for(var j=0;j<str_time.length;j++){
						var min = str_time[j].substring(1,3)*1
						var sec = str_time[j].substring(4,6)*1
						var msec = str_time[j].substring(7,9)*1
						var time = min*60+sec+msec/100;
						//console.log(time)
						//json = json + "\""+time+"\":\"" + str_txt +"\",";
						var t = {}
						t.data = str_txt
						t.top = ""
						json[time] = t
					}
				}
			}
			return json
		}
	}
	if (typeof module != "undefined" && module.exports) {
        module.exports = Player;
    } else if ( typeof define == 'function' && define.amd ) {
        define( function () { return Player; } );
    } else {
        window.Player = Player;
    }
})(window , document)