import {icon} from './visual-icons.mjs';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderVisualState(child){
  const projects=[{id:'family-lunch',title:'为家人准备一顿午餐',note:'把买菜、预算和做菜，放在一起练。',icon:'utensils',label:'生活里的大项目'},{id:'learning-exhibit',title:'做一本植物观察小册',note:'观察、记录，再把发现讲给别人听。',icon:'leaf',label:'带着问题去探索'}];
  const target=document.getElementById('projectShowcase');if(!target)return;
  const stored=Array.isArray(child.projects)?child.projects:[];
  target.innerHTML=projects.map(p=>{const saved=stored.find(x=>x.templateId===p.id),attempts=Array.isArray(saved?.attempts)?saved.attempts:[],count=attempts.length;return `<button class="project-tile" data-open-project="${p.id}"><span class="project-illustration">${icon(p.icon)}</span><span><small>${count?'已记录 '+count+' 次尝试':p.label}</small><b>${p.title}</b><p>${count?escapeHtml(String(attempts.at(-1)?.result||'').slice(0,45)):p.note}</p></span>${icon('arrow-up-right')}</button>`}).join('');
}
