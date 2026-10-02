let deck=[],playerHand=[],aiHand=[],board=[];
let currentTurn="player",gameOver=false,busy=false;
let playerScore=0,aiScore=0,roundNumber=1,consecutivePasses=0;
const boardWrap=document.getElementById("boardWrap");
const boardEl=document.getElementById("board");
const handEl=document.getElementById("hand");
const statusEl=document.getElementById("status");
const aiInfoEl=document.getElementById("aiInfo");
const roundEl=document.getElementById("round");
const scoreEl=document.getElementById("score");
const toastEl=document.getElementById("toast");
const btnBazaar=document.getElementById("btnBazaar");
const btnPass=document.getElementById("btnPass");
const btnNew=document.getElementById("btnNewGame");
const GAP=2;
function loadScore(){try{const s=JSON.parse(localStorage.getItem("domino_score")||"{}");
playerScore=s.player||0;aiScore=s.ai||0;roundNumber=s.round||1;}catch(e){}}
function saveScore(){try{localStorage.setItem("domino_score",JSON.stringify(
{player:playerScore,ai:aiScore,round:roundNumber}));}catch(e){}}
function createDeck(){const d=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)d.push([a,b]);return d;}
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));
[arr[i],arr[j]]=[arr[j],arr[i]];}}
function startRound(){
deck=createDeck();shuffle(deck);
playerHand=[];aiHand=[];board=[];
for(let i=0;i<7;i++){playerHand.push(deck.pop());aiHand.push(deck.pop());}
let starter="player",bestDbl=-1;
playerHand.forEach(t=>{if(t[0]===t[1]&&t[0]>bestDbl){bestDbl=t[0];starter="player";}});
aiHand.forEach(t=>{if(t[0]===t[1]&&t[0]>bestDbl){bestDbl=t[0];starter="ai";}});
currentTurn=starter;gameOver=false;busy=false;consecutivePasses=0;
statusEl.classList.remove("win","lose");
roundEl.textContent=roundNumber;
scoreEl.textContent=playerScore+" : "+aiScore;
btnNew.style.display="none";
render();renderHand(true);
if(currentTurn==="ai"){busy=true;setTimeout(aiTurn,700);}
}
function leftEnd(){return board.length?board[0].outerLeft:null;}
function rightEnd(){return board.length?board[board.length-1].outerRight:null;}
function canPlay(tile){if(board.length===0)return true;
const L=leftEnd(),R=rightEnd();
return tile[0]===L||tile[1]===L||tile[0]===R||tile[1]===R;}
function canPlayerMove(){return playerHand.some(canPlay);}
function canAiMove(){return aiHand.some(canPlay);}
function playTile(tile,hand,index){
if(!canPlay(tile))return false;
if(board.length===0){board.push({tile:tile,outerLeft:tile[0],outerRight:tile[1]});}
else{const L=leftEnd(),R=rightEnd();
if(tile[0]===L||tile[1]===L){const outer=(tile[0]===L)?tile[1]:tile[0];
board.unshift({tile:tile,outerLeft:outer,outerRight:L});}
else if(tile[0]===R||tile[1]===R){const outer=(tile[1]===R)?tile[0]:tile[1];
board.push({tile:tile,outerLeft:R,outerRight:outer});}
else return false;}
hand.splice(index,1);consecutivePasses=0;return true;
}
function render(){
renderBoard();renderHand();
aiInfoEl.textContent="У ИИ: "+aiHand.length+" · Базар: "+deck.length;
btnPass.style.display="none";
if(gameOver){btnBazaar.style.display="none";
btnNew.style.display="inline-block";return;}
btnNew.style.display="none";
if(currentTurn==="player"){
if(canPlayerMove()){statusEl.textContent="Ваш ход";
btnBazaar.style.display="inline-block";btnBazaar.disabled=true;}
else if(deck.length>0){statusEl.textContent="Ходов нет — берите из базара";
btnBazaar.style.display="inline-block";btnBazaar.disabled=false;}
else{statusEl.textContent="Ходов нет";
btnPass.style.display="inline-block";btnBazaar.style.display="none";}
}else{statusEl.textContent="Ход ИИ...";btnBazaar.style.display="none";}
}
function renderBoard(){
boardEl.innerHTML="";
if(board.length===0){const e=document.createElement("div");
e.className="board-empty";e.textContent="Стол пуст. Сделайте первый ход.";
boardEl.appendChild(e);return;}
const W=boardWrap.clientWidth,H=boardWrap.clientHeight,pad=4;
let tileLen=48,tileW=24;
const total=board.length;
const fitsOne=(total*(tileLen+GAP))<=(W-pad*2);
if(fitsOne){const rowW=total*(tileLen+GAP)-GAP;
const x0=(W-rowW)/2,y0=(H-tileW)/2;
for(let i=0;i<board.length;i++){const seg=board[i];
const el=makeBoardTileEl(seg.outerLeft,seg.outerRight);
el.classList.add("placed");
el.style.left=(x0+i*(tileLen+GAP))+"px";el.style.top=y0+"px";
el.style.width=tileLen+"px";el.style.height=tileW+"px";
boardEl.appendChild(el);}return;}
const perRow=Math.max(1,Math.floor((W-pad*2+GAP)/(tileLen+GAP)));
const rows=Math.ceil(total/perRow);
const availH=H-pad*2,rowH=tileW+GAP;
if(rows*rowH>availH){const k=availH/(rows*rowH);tileLen*=k;tileW*=k;}
const perRow2=Math.max(1,Math.floor((W-pad*2+GAP)/(tileLen+GAP)));
for(let i=0;i<board.length;i++){const seg=board[i];
const el=makeBoardTileEl(seg.outerLeft,seg.outerRight);
el.classList.add("placed");
const row=Math.floor(i/perRow2),col=i%perRow2;
const cnt=Math.min(perRow2,total-row*perRow2);
const rowW=cnt*(tileLen+GAP)-GAP;
const x0=(W-rowW)/2;
el.style.left=(x0+col*(tileLen+GAP))+"px";
el.style.top=(pad+row*(tileW+GAP))+"px";
el.style.width=tileLen+"px";el.style.height=tileW+"px";
boardEl.appendChild(el);}
}
function makeBoardTileEl(l,r){
const el=document.createElement("div");el.className="btile";
const L=document.createElement("div");L.className="bhalf left";
L.appendChild(makePips(l));
const R=document.createElement("div");R.className="bhalf right";
R.appendChild(makePips(r));
el.appendChild(L);el.appendChild(R);return el;
}
function renderHand(anim){
handEl.innerHTML="";
playerHand.forEach((tile,i)=>{
const ok=canPlay(tile)&&!gameOver&&currentTurn==="player";
const el=makeTileEl(tile);
if(anim)el.classList.add("new-in-hand");
if(ok){el.classList.add("playable");
el.addEventListener("click",()=>onTileClick(i));}
else el.classList.add("disabled");
handEl.appendChild(el);});
}
const PIP={0:[],1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
function makeTileEl(tile){
const el=document.createElement("div");el.className="tile";
const top=document.createElement("div");top.className="half top";
top.appendChild(makePips(tile[0]));
const bot=document.createElement("div");bot.className="half bottom";
bot.appendChild(makePips(tile[1]));
el.appendChild(top);el.appendChild(bot);return el;
}
function makePips(n){
const w=document.createElement("div");w.className="pips";
const pos=PIP[n]||[];
for(let i=1;i<=9;i++){const c=document.createElement("div");
if(pos.includes(i)){const p=document.createElement("div");
p.className="pip";c.appendChild(p);}
w.appendChild(c);}return w;
}
function onTileClick(index){
if(gameOver||currentTurn!=="player"||busy)return;
const tile=playerHand[index];
if(!playTile(tile,playerHand,index))return;
render();
if(checkWin("player"))return;
currentTurn="ai";statusEl.textContent="Ход ИИ...";
busy=true;setTimeout(aiTurn,700);
}
btnBazaar.addEventListener("click",()=>{
if(gameOver||currentTurn!=="player"||busy)return;
if(canPlayerMove()){showToast("У вас есть ход");return;}
if(deck.length===0){showToast("Базар пуст");render();return;}
takeFromBazaar();
});
function takeFromBazaar(){
if(deck.length===0){render();return;}
const tile=deck.pop();playerHand.push(tile);renderHand();
if(canPlay(tile)){showToast("Взяли "+tile[0]+"-"+tile[1]);
render();}else{render();setTimeout(takeFromBazaar,350);}
}
btnPass.addEventListener("click",()=>{
if(gameOver||currentTurn!=="player"||busy)return;
if(deck.length>0){showToast("Сначала возьмите из базара");return;}
if(canPlayerMove())return;
passTurn("player");
});
function passTurn(who){
consecutivePasses++;
statusEl.textContent=(who==="player")?"Вы пропускаете":"ИИ пропускает";
if(consecutivePasses>=2){endRound("fish");return;}
setTimeout(()=>{
currentTurn=(who==="player")?"ai":"player";busy=false;render();
if(currentTurn==="ai"){busy=true;setTimeout(aiTurn,700);}
},800);
}
function aiTurn(){
if(gameOver){busy=false;return;}
const playable=[];
aiHand.forEach((t,i)=>{if(canPlay(t))playable.push(i);});
if(playable.length===0){
if(deck.length>0){const tile=deck.pop();aiHand.push(tile);
render();setTimeout(aiTurn,400);return;}
busy=false;passTurn("ai");return;
}
playable.sort((a,b)=>(aiHand[b][0]+aiHand[b][1])-(aiHand[a][0]+aiHand[a][1]));
const idx=playable[0],tile=aiHand[idx];
playTile(tile,aiHand,idx);render();
if(checkWin("ai")){busy=false;return;}
currentTurn="player";busy=false;render();
}
function checkWin(who){
if(who==="player"&&playerHand.length===0){endRound("player");return true;}
if(who==="ai"&&aiHand.length===0){endRound("ai");return true;}
return false;
}
function endRound(res){
gameOver=true;busy=false;
if(res==="fish"){
const p=playerHand.reduce((s,t)=>s+t[0]+t[1],0);
const a=aiHand.reduce((s,t)=>s+t[0]+t[1],0);
if(p<a){playerScore+=(a-p);statusEl.textContent="🐟 Рыба! Вы +"+(a-p);statusEl.classList.add("win");}
else if(a<p){aiScore+=(p-a);statusEl.textContent="🐟 Рыба. ИИ +"+(p-a);statusEl.classList.add("lose");}
else statusEl.textContent="🐟 Рыба! Ничья";
}else if(res==="player"){
const a=aiHand.reduce((s,t)=>s+t[0]+t[1],0);
playerScore+=a;statusEl.textContent="🎉 Вы выиграли! +"+a+" очков";
statusEl.classList.add("win");
}else{
const p=playerHand.reduce((s,t)=>s+t[0]+t[1],0);
aiScore+=p;statusEl.textContent="🤖 ИИ выиграл (+"+p+")";
statusEl.classList.add("lose");
}
scoreEl.textContent=playerScore+" : "+aiScore;
saveScore();render();
}
btnNew.addEventListener("click",()=>{
roundNumber++;saveScore();startRound();
});
let toastTimer=null;
function showToast(text){
toastEl.textContent=text;toastEl.classList.add("show");
clearTimeout(toastTimer);
toastTimer=setTimeout(()=>toastEl.classList.remove("show"),1400);
}
window.addEventListener("resize",()=>{if(board.length>0)renderBoard();});
loadScore();startRound();
