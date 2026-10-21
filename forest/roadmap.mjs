import {icon} from './visual-icons.mjs';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function addLibrarySkill(child,library,id){
  const card=library.skills.find(x=>x.id===id);
  if(!card)throw new Error('找不到这项技能');
  const existing=child.trees.flatMap(t=>t.skills).find(x=>x.libraryId===id||x.name===card.title);
  if(existing){existing.libraryId=id;return existing}
  const category=library.categories.find(x=>x.id===card.categoryId);
  let tree=child.trees.find(x=>x.categoryId===category.id||x.name===category.title);
  if(!tree){tree={id:'library-'+category.id,categoryId:category.id,name:category.title,theme:category.theme,meta:'从具体动作开始练习',height:90,skills:[]};child.trees.push(tree)}
  const skill={id:'library-'+id,libraryId:id,name:card.title,type:'human',difficulty:3,reviews:0,minutes:0,last:null,createdAt:new Date().toISOString(),story:'已加入练习计划；尚未记录掌握情况。'};
  tree.skills.push(skill);
  return skill;
}

export function addLibraryProject(child,library,id){
  const template=library.projects.find(x=>x.id===id);
  if(!template)throw new Error('找不到这个项目');
  child.projects??=[];
  let project=child.projects.find(x=>x.templateId===id);
  if(project)return project;
  project={id:'project-'+id,templateId:id,title:template.title,skillIds:template.skillIds.map(sk=>addLibrarySkill(child,library,sk).id),attempts:[]};
  child.projects.push(project);
  return project;
}

export function mountRoadmap({getChild,onChange,notify}){
  const dialog=document.createElement('dialog');dialog.id='roadmapDialog';dialog.className='roadmap-dialog';
  dialog.innerHTML='<div class="roadmap-head"><div><small>从具体动作到真实作品</small><h2>技能路线</h2></div><button data-close aria-label="关闭技能路线">×</button></div><label class="roadmap-select">选择一条路线<select id="roadmapRoute" aria-label="选择技能路线"></select></label><div id="roadmapContent" aria-live="polite"></div>';
  document.body.appendChild(dialog);
  const content=dialog.querySelector('#roadmapContent'),select=dialog.querySelector('select');
  let library,loading;
  const load=()=>loading??=(fetch('./skill-library.json').then(r=>{if(!r.ok)throw new Error('技能资料暂时未能打开，请联网后重试');return r.json()}).then(data=>{library=data;select.innerHTML=['foundation','career'].map(kind=>`<optgroup label="${kind==='foundation'?'通用基础':'职业探索'}">${data.routes.filter(r=>r.kind===kind).map(r=>`<option value="${escapeHtml(r.id)}">${escapeHtml(r.title)}</option>`).join('')}</optgroup>`).join('');return data}).catch(error=>{loading=null;throw error}));
  const list=values=>'<ul class="guide-checks">'+values.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ul>';
  const skillButton=id=>{const sk=library.skills.find(x=>x.id===id),current=getChild().trees.flatMap(t=>t.skills).find(x=>x.libraryId===id);return `<button data-skill-guide="${escapeHtml(id)}">${icon('sprout')}<span>${escapeHtml(sk.title)}<small>${current?'已加入 · '+current.reviews+' 次练习':'查看做法与完成标准'}</small></span>${icon('chevron-right')}</button>`};
  const sourceLinks=ids=>ids.map(id=>{const source=library.sources[id];return `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a>`}).join(' · ');
  function route(){
    const selected=library.routes.find(x=>x.id===select.value);
    content.innerHTML=`<div class="route-intro"><div><h3>${selected.kind==='career'?'向一种未来，迈出小小一步。':'从一个小动作，走向独立完成。'}</h3><p>先选自己想尝试的事，看看需要哪些小本领，再到真实项目里练习。</p></div><span class="route-seal">${icon('compass')}</span></div><div class="route-stages">${selected.stages.map((stage,i)=>`<section class="roadmap-stage"><div class="stage-number">0${i+1}</div><h3>${escapeHtml(stage.title)}</h3><div class="roadmap-skills">${(stage.skillIds||[]).map(skillButton).join('')}${stage.projectId?`<button data-project="${escapeHtml(stage.projectId)}">${icon('trees')}<span>${escapeHtml(library.projects.find(x=>x.id===stage.projectId).title)}<small>把学会的小技能组合起来</small></span>${icon('arrow-up-right')}</button>`:''}</div></section>`).join('')}</div><p class="roadmap-note">依据：${sourceLinks(selected.sourceIds)}。${escapeHtml(selected.note||library.futureNote)}</p>`;
  }
  function skill(id){
    const sk=library.skills.find(x=>x.id===id);
    content.innerHTML=`<article class="roadmap-card"><span class="guide-kicker">${icon('sprout')}一项可以动手练习的小本领</span><h3>${escapeHtml(sk.title)}</h3><p>准备：${escapeHtml(sk.materials.join('、'))}</p>${sk.adultSupport?'<p class="project-record-note">一起练习：'+escapeHtml(sk.adultSupport)+'</p>':''}<div class="guide-grid"><div><h4>动手怎么做</h4><ol class="roadmap-steps">${sk.steps.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')}</ol><h4>怎么知道做成了</h4>${list(sk.criteria)}</div><aside class="guide-sidebar">${sk.prerequisites.length?'<h4>先会这些具体动作</h4><div class="roadmap-skills">'+sk.prerequisites.map(skillButton).join('')+'</div>':'<h4>从示范开始</h4><p class="roadmap-note">先看一次完整示范，再自己试。卡住时，可以请人帮忙。</p>'}<h4>怎么练、怎么复习</h4>${list(Object.values(sk.practice))}<p class="roadmap-note">${escapeHtml(sk.review.note)}</p></aside></div><p class="roadmap-note">参考：${sourceLinks(sk.sourceIds)}。操作卡为参考来源后的练习设计。</p><div class="roadmap-actions"><button class="route-primary" data-add-skill="${escapeHtml(id)}">${icon('plus')}加入${escapeHtml(getChild().name)}的技能树</button><button data-route-back>返回路线</button></div></article>`;
  }
  function project(id){
    const template=library.projects.find(x=>x.id===id),current=getChild().projects?.find(x=>x.templateId===id);
    content.innerHTML=`<article class="roadmap-card"><span class="guide-kicker">${icon('trees')}把小技能，种进真实项目里</span><h3>${escapeHtml(template.title)}</h3><p>成果：${escapeHtml(template.deliverable)}</p>${template.adultSupport?'<p class="roadmap-note">'+escapeHtml(template.adultSupport)+'</p>':''}<h4>在项目中使用这些技能</h4><div class="roadmap-skills">${template.skillIds.map(skillButton).join('')}</div><ol class="roadmap-steps">${template.steps.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')}</ol>${current?'<h4>记录这次实际尝试</h4><label class="roadmap-evidence">结果或作品说明<textarea id="projectResult" maxlength="1000" placeholder="做成了什么？也可以粘贴作品链接。"></textarea></label><label class="roadmap-evidence">复盘与需要的帮助<textarea id="projectReflection" maxlength="1000" placeholder="哪些自己做成了，哪里仍需帮助，下次想练什么？"></textarea></label><button class="route-primary" data-save-attempt="'+escapeHtml(id)+'">保存这次尝试</button><p class="roadmap-note">这是孩子或家长的自述记录，保存不代表全部技能已经掌握。</p>'+current.attempts.slice().reverse().map(a=>'<div class="roadmap-attempt"><b>'+escapeHtml(new Date(a.at).toLocaleString('zh-CN'))+'</b><p>'+escapeHtml(a.result)+'</p><p>'+escapeHtml(a.reflection)+'</p></div>').join(''):'<button class="route-primary" data-start-project="'+escapeHtml(id)+'">开始项目并加入需要的技能</button>'}<div class="roadmap-actions"><button data-route-back>返回路线</button></div></article>`;
  }
  select.onchange=route;
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  content.onclick=event=>{
    const button=event.target.closest('button');if(!button)return;
    const data=button.dataset;
    if(data.skillGuide)return skill(data.skillGuide);
    if(data.project)return project(data.project);
    if('routeBack' in data)return route();
    if(data.addSkill){addLibrarySkill(getChild(),library,data.addSkill);onChange();notify('已加入练习计划，选择一次真实场景开始尝试');return skill(data.addSkill)}
    if(data.startProject){addLibraryProject(getChild(),library,data.startProject);onChange();return project(data.startProject)}
    if(data.saveAttempt){
      const result=content.querySelector('#projectResult').value.trim(),reflection=content.querySelector('#projectReflection').value.trim();
      if(!result||!reflection)return notify('请写下实际结果，以及需要的帮助或下次的改进');
      const current=getChild().projects.find(x=>x.templateId===data.saveAttempt);
      current.attempts.push({id:crypto.randomUUID(),at:new Date().toISOString(),result,reflection,source:'self-report'});onChange();notify('这次尝试已保存');project(data.saveAttempt);
    }
  };
  async function open(id,kind='skill'){
    try{await load();if(!dialog.open)dialog.showModal();if(id&&kind==='project'){const parent=library.routes.find(r=>r.stages.some(st=>st.projectId===id));if(parent)select.value=parent.id;project(id)}else if(id&&kind==='route'){select.value=id;route()}else if(id){const parent=library.routes.find(r=>r.stages.some(st=>st.skillIds?.includes(id)));if(parent)select.value=parent.id;skill(id)}else route()}catch(error){notify(error.message)}
  }
  document.querySelectorAll('[data-open-roadmap]').forEach(button=>button.onclick=()=>open());
  document.addEventListener('click',event=>{const button=event.target.closest('[data-open-project],[data-open-route]');if(!button)return;if(button.dataset.openProject)open(button.dataset.openProject,'project');else open(button.dataset.openRoute,'route')});
  return {load,open,openProject:id=>open(id,'project'),openRoute:id=>open(id,'route')};
}
