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
  const style=document.createElement('style');style.textContent=`
    .roadmap-dialog{width:min(920px,calc(100% - 20px));max-height:90dvh;border:0;border-radius:24px;padding:20px;color:#214638;background:#fcfdf7;box-sizing:border-box;overflow:auto;overflow-wrap:anywhere}
    .roadmap-dialog::backdrop{background:#102e28aa}.roadmap-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.roadmap-head h2{margin:4px 0 12px}.roadmap-dialog button{cursor:pointer;border:1px solid #cfdfd3;border-radius:12px;background:white;padding:10px 12px;color:#214638;font:inherit}.roadmap-head button{font-size:24px}.roadmap-select{display:grid;gap:8px;font-weight:bold}.roadmap-select select{width:100%;max-width:100%;font:inherit;padding:12px;border-radius:12px;border:1px solid #b7cfc0;background:white;color:#214638}.roadmap-note{font-size:13px;line-height:1.7;color:#4b6257}.roadmap-stage{margin:16px 0;border-left:3px solid #70aa76;padding-left:14px}.roadmap-stage h3{margin:6px 0}.roadmap-skills{display:flex;flex-wrap:wrap;gap:8px}.roadmap-skills button{text-align:left}.roadmap-skills small{display:block;color:#536c5d;margin-top:4px}.roadmap-steps{line-height:1.8;padding-left:24px}.roadmap-card{margin-top:16px;padding:16px;border-radius:18px;background:#fff;border:1px solid #d2e1d4}.roadmap-card h3{margin-top:0}.roadmap-card a{color:#2369a1}.roadmap-dialog .route-primary{background:#327a46;color:white;border-color:#327a46}.roadmap-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.roadmap-evidence{display:grid;gap:8px;margin:14px 0}.roadmap-evidence textarea{box-sizing:border-box;width:100%;min-height:80px;padding:10px;border-radius:10px;border:1px solid #b7cfc0;font:inherit}.roadmap-attempt{border-top:1px solid #d2e1d4;padding:12px 0;white-space:pre-wrap}.skill-card{max-height:90dvh;overflow:auto}
  `;document.head.appendChild(style);
  const content=dialog.querySelector('#roadmapContent'),select=dialog.querySelector('select');
  let library,loading;
  const load=()=>loading??=(fetch('./skill-library.json').then(r=>{if(!r.ok)throw new Error('技能资料暂时未能打开，请联网后重试');return r.json()}).then(data=>{library=data;select.innerHTML=['foundation','career'].map(kind=>`<optgroup label="${kind==='foundation'?'通用基础':'职业探索'}">${data.routes.filter(r=>r.kind===kind).map(r=>`<option value="${escapeHtml(r.id)}">${escapeHtml(r.title)}</option>`).join('')}</optgroup>`).join('');return data}).catch(error=>{loading=null;throw error}));
  const list=values=>'<ul>'+values.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ul>';
  const skillButton=id=>{const sk=library.skills.find(x=>x.id===id),current=getChild().trees.flatMap(t=>t.skills).find(x=>x.libraryId===id);return `<button data-skill-guide="${escapeHtml(id)}">${escapeHtml(sk.title)}<small>${current?'已加入 · '+current.reviews+' 次练习':'可选练习'}</small></button>`};
  const sourceLinks=ids=>ids.map(id=>{const source=library.sources[id];return `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a>`}).join(' · ');
  function route(){
    const selected=library.routes.find(x=>x.id===select.value);
    content.innerHTML=`<p class="roadmap-note">先看会做什么，再选需要的前置技能。分支可按兴趣选择，练习次数只表示经历。职业路线用于探索。</p>${selected.stages.map((stage,i)=>`<section class="roadmap-stage"><h3>${i+1}. ${escapeHtml(stage.title)}</h3><div class="roadmap-skills">${(stage.skillIds||[]).map(skillButton).join('')}${stage.projectId?`<button data-project="${escapeHtml(stage.projectId)}">🌳 ${escapeHtml(library.projects.find(x=>x.id===stage.projectId).title)}<small>组合技能，做出实际结果</small></button>`:''}</div></section>`).join('')}<p class="roadmap-note">依据：${sourceLinks(selected.sourceIds)}。${escapeHtml(selected.note||library.futureNote)}</p>`;
  }
  function skill(id){
    const sk=library.skills.find(x=>x.id===id);
    content.innerHTML=`<article class="roadmap-card"><h3>${escapeHtml(sk.title)}</h3><p>准备：${escapeHtml(sk.materials.join('、'))}</p>${sk.adultSupport?'<p class="roadmap-note">一起练习：'+escapeHtml(sk.adultSupport)+'</p>':''}${sk.prerequisites.length?'<h4>先会这些具体动作</h4><div class="roadmap-skills">'+sk.prerequisites.map(skillButton).join('')+'</div>':'<p>没有必须的前置技能，可从示范开始。</p>'}<h4>动手怎么做</h4><ol class="roadmap-steps">${sk.steps.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')}</ol><h4>怎么知道做成了</h4>${list(sk.criteria)}<h4>怎么练、怎么复习</h4>${list(Object.values(sk.practice))}<p class="roadmap-note">复习起点可试次日、3 天、7 天，再按实际遗忘与项目需要调整。</p><p class="roadmap-note">参考：${sourceLinks(sk.sourceIds)}。操作卡为参考来源后的练习设计。</p><div class="roadmap-actions"><button class="route-primary" data-add-skill="${escapeHtml(id)}">加入${escapeHtml(getChild().name)}的技能树</button><button data-route-back>返回路线</button></div></article>`;
  }
  function project(id){
    const template=library.projects.find(x=>x.id===id),current=getChild().projects?.find(x=>x.templateId===id);
    content.innerHTML=`<article class="roadmap-card"><h3>${escapeHtml(template.title)}</h3><p>成果：${escapeHtml(template.deliverable)}</p>${template.adultSupport?'<p class="roadmap-note">'+escapeHtml(template.adultSupport)+'</p>':''}<h4>在项目中使用这些技能</h4><div class="roadmap-skills">${template.skillIds.map(skillButton).join('')}</div><ol class="roadmap-steps">${template.steps.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')}</ol>${current?'<h4>记录这次实际尝试</h4><label class="roadmap-evidence">结果或作品说明<textarea id="projectResult" maxlength="1000" placeholder="做成了什么？也可以粘贴作品链接。"></textarea></label><label class="roadmap-evidence">复盘与需要的帮助<textarea id="projectReflection" maxlength="1000" placeholder="哪些自己做成了，哪里仍需帮助，下次想练什么？"></textarea></label><button class="route-primary" data-save-attempt="'+escapeHtml(id)+'">保存这次尝试</button><p class="roadmap-note">这是孩子或家长的自述记录，保存不代表全部技能已经掌握。</p>'+current.attempts.slice().reverse().map(a=>'<div class="roadmap-attempt"><b>'+escapeHtml(new Date(a.at).toLocaleString('zh-CN'))+'</b><p>'+escapeHtml(a.result)+'</p><p>'+escapeHtml(a.reflection)+'</p></div>').join(''):'<button class="route-primary" data-start-project="'+escapeHtml(id)+'">开始项目并加入需要的技能</button>'}<div class="roadmap-actions"><button data-route-back>返回路线</button></div></article>`;
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
  async function open(id){
    try{await load();if(!dialog.open)dialog.showModal();id?skill(id):route()}catch(error){notify(error.message)}
  }
  document.querySelectorAll('[data-open-roadmap]').forEach(button=>button.onclick=()=>open());
  return {open};
}
