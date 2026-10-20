/* Root Coffee: nút bật/tắt thông báo trên trang nhân viên */
(function(){
var KEY="rootcc_ma",ok="serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
var VK="";function layVK(){return VK?Promise.resolve(VK):_gs("ccKhoiTao").then(function(r){VK=(r&&r.vk)||"";return VK})}
var _gs=gs;gs=function(fn){var p=_gs.apply(this,arguments);if(fn==="ccKhoiTao")p.then(function(r){if(r&&r.vk)VK=r.vk}).catch(function(){});return p};
function idb(){return new Promise(function(res,rej){var r=indexedDB.open("rootcc",1);r.onupgradeneeded=function(){r.result.createObjectStore("kv")};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
function getMa(){return idb().then(function(db){return new Promise(function(res){var q=db.transaction("kv").objectStore("kv").get("ma");q.onsuccess=function(){res(q.result||[])};q.onerror=function(){res([])}})}).catch(function(){return[]})}
function setMa(a){return idb().then(function(db){return new Promise(function(res){var t=db.transaction("kv","readwrite");t.objectStore("kv").put(a,"ma");t.oncomplete=function(){res()};t.onerror=function(){res()}})}).catch(function(){})}
function luu(ten){try{return JSON.parse(localStorage.getItem(KEY)||"{}")[ten]||""}catch(e){return""}}
function ghi(ten,ma){try{var o=JSON.parse(localStorage.getItem(KEY)||"{}");if(ma)o[ten]=ma;else delete o[ten];localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
function u8(b){var p="=".repeat((4-b.length%4)%4),s=(b+p).replace(/-/g,"+").replace(/_/g,"/"),r=atob(s),o=new Uint8Array(r.length);for(var i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o}
function standalone(){return window.matchMedia&&matchMedia("(display-mode: standalone)").matches||navigator.standalone===true}
function ios(){return/iphone|ipad|ipod/i.test(navigator.userAgent)}
function card(h){var a=document.querySelector("#scr .acts"),d=document.createElement("div");d.id="pcard";d.className="blk";d.style.marginTop="14px";d.innerHTML=h;var old=document.getElementById("pcard");if(old)old.remove();if(a&&a.parentNode)a.parentNode.insertBefore(d,a.nextSibling)}
function huong(){var a=ios()?'<ol class="sm" style="margin:8px 0 0 18px;padding:0"><li>Mở <b>Cài đặt</b> của iPhone</li><li>Chọn <b>Thông báo</b>, kéo xuống chọn biểu tượng <b>ROOT</b></li><li>Bật <b>Cho phép thông báo</b></li><li>Quay lại ứng dụng này</li></ol>':'<ol class="sm" style="margin:8px 0 0 18px;padding:0"><li>Giữ biểu tượng ROOT ngoài Màn hình chính, chọn <b>Thông tin ứng dụng</b> (hoặc <b>Cài đặt trang web</b>)</li><li>Chọn <b>Thông báo</b></li><li>Bật <b>Cho phép thông báo</b></li><li>Quay lại ứng dụng này</li></ol>';return a}
function ui(){
 if(!S.st||S.mode==="ql")return;
 var ma=luu(S.ten);
 if(!ok){if(ios()&&!standalone())card('<div class="sm" style="margin:0">Để nhận thông báo: thêm trang này vào Màn hình chính (nút Chia sẻ, chọn Thêm vào MH chính), rồi mở từ biểu tượng đó.</div>');return}
 if(Notification.permission==="denied"){card('<div style="font-size:15px;font-weight:600">Thông báo đang bị tắt trong máy</div><div class="sm">Làm theo các bước sau để bật lại:</div>'+huong());return}
 if(ma&&Notification.permission==="granted")card('<div style="font-size:15px;font-weight:600">Thông báo: đang bật trên máy này</div><div class="two" style="margin-top:10px"><button class="cta ghost sm2" id="pthu">Gửi thử</button><button class="cta ghost sm2" id="ptat">Tắt</button></div><div class="sm" style="margin-top:10px"><a href="#" id="phd" style="color:inherit;text-decoration:underline">Không thấy thông báo? Xem cách bật trong máy</a></div><div id="phdn" style="display:none">'+huong()+'</div>');
 else card('<div style="font-size:15px;font-weight:600">Nhận thông báo đổi ca, tăng ca</div><div class="sm">Khi có người nhờ bạn đổi ca hoặc chủ quán duyệt, điện thoại sẽ báo ngay.</div><button class="cta sm2" id="pbat" style="margin-top:10px">Bật thông báo</button>')}
function bat(){
 if(S.busy)return;S.busy=true;var b=document.getElementById("pbat");if(b){b.disabled=true;b.textContent="Đang bật…"}
 var ten=S.ten,pin=S.pin;
 Notification.requestPermission().then(function(p){
  if(p!=="granted")throw new Error("Bạn chưa cho phép thông báo.");
  return layVK()}).then(function(vk){if(!vk)throw new Error("Chưa tải được khóa thông báo, thử lại sau vài giây.");
  return navigator.serviceWorker.register("sw.js").then(function(){return navigator.serviceWorker.ready})}).then(function(reg){
  return reg.pushManager.getSubscription().then(function(s){return s||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(VK)})})}).then(function(sub){
  return gs("ccDangKyBao",ten,pin,sub.toJSON())}).then(function(r){
  S.busy=false;
  if(!r.ok){if(r.khoa)return showNames();throw new Error(r.msg||"Không bật được")}
  ghi(ten,r.ma);return getMa().then(function(a){if(a.indexOf(r.ma)<0)a.push(r.ma);return setMa(a)}).then(function(){toast("Đã bật thông báo");return gs("ccBaoThu",ten,pin).catch(function(){})}).then(function(){if(S.st&&S.ten===ten)ui()})
 }).catch(function(e){S.busy=false;toast(String(e&&e.message||e));if(S.st)ui()})}
function tat(){
 if(S.busy)return;S.busy=true;var ten=S.ten,ma=luu(ten);
 gs("ccHuyBao",ten,S.pin,ma).then(function(r){S.busy=false;if(r.khoa)return showNames();ghi(ten,"");return getMa().then(function(a){return setMa(a.filter(function(x){return x!==ma}))}).then(function(){toast("Đã tắt thông báo");ui()})}).catch(function(){S.busy=false;toast("Mất kết nối. Thử lại sau vài giây.")})}
function thu(){if(S.busy)return;gs("ccBaoThu",S.ten,S.pin).then(function(r){toast(r.ok?"Đã gửi thử, đợi vài giây":(r.msg||"Chưa gửi được"))}).catch(function(){toast("Mất kết nối.")})}
var dong={};
function dongBo(){
 if(!ok||Notification.permission!=="granted"||!S.ten||!S.pin||dong[S.ten]||!luu(S.ten))return;
 dong[S.ten]=1;var ten=S.ten,pin=S.pin;
 navigator.serviceWorker.register("sw.js").then(function(){return navigator.serviceWorker.ready}).then(function(reg){return reg.pushManager.getSubscription()}).then(function(sub){
  if(!sub){ghi(ten,"");return}
  return gs("ccDangKyBao",ten,pin,sub.toJSON()).then(function(r){if(r&&r.ok&&r.ma!==luu(ten)){ghi(ten,r.ma);return getMa().then(function(a){if(a.indexOf(r.ma)<0)a.push(r.ma);return setMa(a)})}})}).catch(function(){})}
var _sh=showHome;showHome=function(){_sh.apply(this,arguments);try{ui();dongBo()}catch(e){}};
document.getElementById("scr").addEventListener("click",function(e){var t=e.target;
 if(t.closest&&t.closest("#pbat"))bat();else if(t.closest&&t.closest("#ptat"))tat();else if(t.closest&&t.closest("#pthu"))thu();else if(t.closest&&t.closest("#phd")){e.preventDefault();var x=document.getElementById("phdn");if(x)x.style.display=x.style.display==="none"?"block":"none"}});
if(ok&&Notification.permission==="granted"){try{navigator.serviceWorker.register("sw.js")}catch(e){}}
})();
