/* Root Coffee: nhận thông báo đẩy, lấy nội dung từ máy chủ bằng mã máy */
var API="https://script.google.com/macros/s/AKfycbzHicLYU0zSu144X26QJKzXEAjYIQyD8obWskkwD06NwYj_AsH1LP13ZXlxfvjS0K0/exec?cc=1";
self.addEventListener("install",function(){self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim())});
function idb(){return new Promise(function(res,rej){var r=indexedDB.open("rootcc",1);r.onupgradeneeded=function(){r.result.createObjectStore("kv")};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
function layMa(){return idb().then(function(db){return new Promise(function(res){var q=db.transaction("kv").objectStore("kv").get("ma");q.onsuccess=function(){res(q.result||[])};q.onerror=function(){res([])}})}).catch(function(){return[]})}
function lay(ma){return fetch(API,{method:"POST",redirect:"follow",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({fn:"ccThongBao",args:[ma]})}).then(function(r){return r.json()}).then(function(j){return j.tb||[]}).catch(function(){return[]})}
self.addEventListener("push",function(e){
 e.waitUntil(layMa().then(function(ds){return Promise.all(ds.map(lay))}).then(function(kq){
  var ds=[].concat.apply([],kq);
  if(!ds.length)ds=[{id:"chung",tieu:"Root Coffee",nd:"Có cập nhật mới. Mở trang chấm công để xem."}];
  return Promise.all(ds.map(function(x){return self.registration.showNotification(x.tieu,{body:x.nd,tag:x.id,renotify:true,lang:"vi"})}))}))});
self.addEventListener("notificationclick",function(e){
 e.notification.close();
 e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(cs){
  for(var i=0;i<cs.length;i++){if(cs[i].url.indexOf(self.registration.scope)===0&&"focus"in cs[i])return cs[i].focus()}
  return self.clients.openWindow(self.registration.scope)}))});
