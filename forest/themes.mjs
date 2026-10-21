export const THEME_KEY='cui-growth-theme';
export const normalizeTheme=value=>value==='blocks'?'blocks':'forest';
export function applyTheme(){
  const blocks=document.documentElement.dataset.theme==='blocks';
  for(const img of document.querySelectorAll('.hero-art,.tree-stage img')){
    img.dataset.originalSrc??=img.getAttribute('src');
    const kind=['oak','sakura','orange','bean','willow','ginkgo','pine'].includes(img.dataset.treeTheme)?img.dataset.treeTheme:'oak';
    const src=blocks?(img.classList.contains('hero-art')?'assets/voxel-world.svg':'assets/voxel-tree-'+kind+'.svg'):img.dataset.originalSrc;
    if(img.getAttribute('src')!==src)img.setAttribute('src',src);
  }
  const select=document.getElementById('themeSelect');if(select)select.value=blocks?'blocks':'forest';
}
export function initTheme(){
  let theme='forest';try{theme=normalizeTheme(localStorage.getItem(THEME_KEY))}catch{}
  document.documentElement.dataset.theme=theme;applyTheme();
  document.getElementById('themeSelect').onchange=event=>{
    const value=normalizeTheme(event.target.value);document.documentElement.dataset.theme=value;
    try{localStorage.setItem(THEME_KEY,value)}catch{}
    applyTheme();
  };
}
