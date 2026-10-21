import {writeFile} from 'node:fs/promises';
const root=new URL('../assets/',import.meta.url);
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${body}</svg>`;
const block=(x,y,w,h,d,front,top,side)=>`<path d="M${x} ${y}h${w}v${h}h-${w}z" fill="${front}"/><path d="m${x} ${y} ${d} -${d}h${w}l-${d} ${d}z" fill="${top}"/><path d="m${x+w} ${y} ${d} -${d}v${h}l-${d} ${d}z" fill="${side}"/>`;
const leaf=(x,y,color)=>block(x,y,48,30,12,...color);
const tree=(x,y,colors,kind='oak')=>{
  let body=block(x+44,y+120,28,90,12,'#826346','#ae8557','#5c4939');
  const positions=kind==='pine'||kind==='bean'?[[36,0],[12,34],[60,34],[-12,68],[36,68],[84,68],[12,102],[60,102]]:[[12,20],[60,20],[-12,50],[36,50],[84,50],[12,80],[60,80]];
  for(const [dx,dy]of positions)body+=leaf(x+dx,y+dy,colors);
  for(const [dx,dy]of[[26,59],[82,86],[43,102]])body+=`<rect x="${x+dx}" y="${y+dy}" width="9" height="9" fill="${kind==='orange'?'#f3b951':'#b9d27a'}"/>`;
  return body;
};
const palettes={oak:['#649356','#8ab96a','#416746'],sakura:['#d89ca4','#efc4b9','#ac768c'],orange:['#72a650','#9cc16c','#4d793d'],bean:['#7fba69','#aad789','#4d8350'],willow:['#739c68','#a0bf80','#466f50'],ginkgo:['#c9b659','#e9d781','#9b8941'],pine:['#548368','#7aaa7b','#355f53']};
for(const [kind,colors]of Object.entries(palettes)){
 const floor=block(20,252,200,17,18,'#967953','#a5ba74','#6b6448');
 await writeFile(new URL('voxel-tree-'+kind+'.svg',root),svg(264,295,floor+tree(62,28,colors,kind)));
}
let world='<rect width="1000" height="500" fill="#edf4dc"/><path d="M420 90h580v410H420z" fill="#cfe1d2"/><path d="M430 240h60v-40h60v-35h60v-38h70v50h60v-30h75v-28h70v45h115v336H430z" fill="#acc5b2"/><path d="M460 316h65v-39h65v-35h58v-55h65v34h50v-45h65v45h65v-30h107v309H460z" fill="#8eac99"/>';
world+='<path d="M200 370h105v-25h105v-25h115v-30h120v20h130v-20h225v210H200z" fill="#b4c585"/><path d="M200 396h105v-25h105v-25h115v-30h120v20h130v-20h225v184H200z" fill="#849d60"/>';
world+=block(418,363,253,75,23,'#ad8d64','#d0cb91','#8a714e')+block(666,329,256,102,26,'#9d8056','#baca85','#7d6b4c');
world+='<path d="M790 371h70v20h-45v18h-45v20h-60v20h-63v22h-78v29h-71v-39h54v-24h64v-22h60v-20h64v-24h50z" fill="#e9d69a"/>';
world+=tree(679,94,palettes.oak)+tree(871,170,palettes.orange)+tree(468,218,palettes.pine);
world+='<path d="M568 110h74v-22h48v22h53v25H568zM817 66h50V48h43v18h48v21H817z" fill="#fffced"/><path d="M460 434h26v12h-26zM489 459h16v10h-16zM911 405h16v16h-16z" fill="#d6b56c"/><rect x="941" y="310" width="9" height="9" fill="#f2d58a"/>';
// Leave the text side quiet; this is original vector scenery, not a game screenshot.
await writeFile(new URL('voxel-world.svg',root),svg(1000,500,world));
console.log('Original block-world vectors built: 1 landscape, 7 tree variants');
