import {icon} from './visual-icons.mjs';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dayKey=date=>[date.getFullYear(),date.getMonth()+1,date.getDate()].join('-');
export function growthProgress(child,now=new Date()){
  const trees=Array.isArray(child.trees)?child.trees:[],skills=trees.flatMap(t=>(t.skills||[]).map(s=>({...s,treeName:t.name}))),reviews=skills.reduce((n,s)=>n+(Number(s.reviews)||0),0);
  const days=new Set((child.reviewsHistory||[]).filter(h=>Number(h.minutes)>0&&Number.isFinite(Date.parse(h.at))&&Date.parse(h.at)<=now.getTime()).map(h=>dayKey(new Date(h.at))));
  let streak=0,cursor=new Date(now);cursor.setHours(12,0,0,0);
  if(!days.has(dayKey(cursor)))cursor.setDate(cursor.getDate()-1);
  while(days.has(dayKey(cursor))){streak++;cursor.setDate(cursor.getDate()-1)}
  const weekStart=new Date(now);weekStart.setDate(weekStart.getDate()-(weekStart.getDay()+6)%7);
  const week=Array.from({length:7},(_,i)=>{const date=new Date(weekStart);date.setDate(date.getDate()+i);return{label:'一二三四五六日'[i],done:days.has(dayKey(date)),today:dayKey(date)===dayKey(now)}});
  const badges=[
    {name:'第一颗果实',icon:'sprout',done:skills.length>0,note:'种下 1 项小技能'},
    {name:'浇水10次',icon:'droplet',done:reviews>=10,note:'累计练习 10 次'},
    {name:'生活达人',icon:'utensils',done:skills.some(s=>/生活|劳动/.test(s.treeName)&&s.reviews>=8),note:'生活技能长成金果实'},
    {name:'学习探索者',icon:'book-open',done:skills.filter(s=>/学习|语言|阅读/.test(s.treeName)&&s.reviews>0).length>=2,note:'练习 2 项学习技能'},
    {name:'百日森林',icon:'sun',done:days.size>=100,note:'100 天留下练习足迹'},
    {name:'森林守护者',icon:'trees',done:trees.length>=3&&reviews>=20,note:'照顾 3 棵树，练习 20 次'}
  ];
  const next=skills.filter(s=>(Number(s.reviews)||0)<8).map(s=>{const count=Number(s.reviews)||0,max=count<2?2:count<4?4:8;return{name:s.name,count,max,remaining:max-count,label:max===2?'铜果实':max===4?'银果实':'金果实'}}).sort((a,b)=>a.remaining-b.remaining)[0]||null;
  return{streak,week,badges,next};
}
export function renderVisualState(child,library){
  const defaults=[{id:'family-lunch',title:'为家人准备一顿午餐',note:'把买菜、预算和做菜，放在一起练。',icon:'utensils',label:'生活里的大项目'},{id:'learning-exhibit',title:'做一本植物观察小册',note:'观察、记录，再把发现讲给别人听。',icon:'leaf',label:'带着问题去探索'}];
  const projects=library?.projects||defaults;
  const target=document.getElementById('projectShowcase');if(!target)return;
  const stored=Array.isArray(child.projects)?child.projects:[];
  const card=p=>{const saved=stored.find(x=>x.templateId===p.id),attempts=Array.isArray(saved?.attempts)?saved.attempts:[],count=attempts.length,style=defaults.find(x=>x.id===p.id);return `<button class="project-tile" data-open-project="${escapeHtml(p.id)}"><span class="project-illustration">${icon(style?.icon||'trees')}</span><span><small>${count?'已记录 '+count+' 次尝试':saved?'进行中 · 记录第一次尝试':escapeHtml(style?.label||'把小技能用起来')}</small><b>${escapeHtml(p.title)}</b><p>${escapeHtml(String(count?attempts.at(-1)?.result||'':p.note||p.deliverable||'').slice(0,65))}</p></span>${icon('arrow-up-right')}</button>`};
  target.innerHTML=projects.slice().sort((a,b)=>Number(stored.some(x=>x.templateId===b.id))-Number(stored.some(x=>x.templateId===a.id))).slice(0,2).map(card).join('');
  const collection=document.getElementById('projectCollection');if(collection)collection.innerHTML=projects.map(card).join('');
  const progress=growthProgress(child),reward=document.getElementById('growthReward'),streak=document.getElementById('growthStreak'),milestones=document.getElementById('growthMilestones');
  if(reward){const n=progress.next;reward.innerHTML=`<div class="reward-title">下一份奖励 · 果实光环</div><div class="reward-big">${n?escapeHtml(n.name)+' → '+n.label:'每一颗果实，都值得继续照顾'}</div><p class="growth-note">${n?'再留下 '+n.remaining+' 次练习记录，点亮下一级果实光环。':'从技能路线种下新本领，或在真实项目里继续尝试。'}</p>${n?`<div class="reward-track"><i style="width:${n.count/n.max*100}%"></i></div><div class="reward-sub"><span>${n.count} / ${n.max} 次</span><span>还差 ${n.remaining} 次</span></div>`:''}<p class="growth-note">果实等级是练习反馈；实际会不会，还要在项目里检验。</p>`}
  if(streak)streak.innerHTML=`<div class="head"><div><h2>连续成长 ${progress.streak} 天</h2><p>按有日期的练习足迹计算，休息一天也没关系。</p></div></div><div class="days">${progress.week.map(d=>`<div class="day${d.done?' done':''}${d.today?' today':''}"><i>${d.done?'✓':'·'}</i><span>${d.label}</span></div>`).join('')}</div>`;
  if(milestones)milestones.innerHTML=`<div class="head"><div><h2>成长徽章</h2><p>为做过的事情，留下一个纪念。</p></div><span class="pill">${progress.badges.filter(b=>b.done).length} / ${progress.badges.length}</span></div><div class="badge-grid">${progress.badges.map(b=>`<div class="badge${b.done?'':' lock'}" aria-label="${b.name}，${b.done?'已点亮':'待点亮'}">${icon(b.icon)}<b>${b.name}</b><small>${b.note}</small></div>`).join('')}</div>`;
}
