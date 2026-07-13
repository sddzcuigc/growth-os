(() => {
  const ROUTE_KEY = 'growthOSCoachRoute';
  const VERSION = '8.0';
  let currentRecommendations = [];
  let openLegacyLabNext = false;
  let manualPreview = null;
  let manualDraft = { realUser: '家人', problem: '', availableTime: 35 };

  const THEMES = {
    block: { icon: '▦', name: '方块世界', line: '建造、挑战、闯关' },
    space: { icon: '✦', name: '星际世界', line: '探索、发现、无限可能' },
    nature: { icon: '❦', name: '自然世界', line: '温柔、生命、真实成长' },
    studio: { icon: '◫', name: '创造工作室', line: '简洁、专注、像真正的项目' }
  };
  const WORLD_GROUPS = {
    creator: { icon: '✦', name: '创造力', line: '把想法做成别人能看见的作品', skills: ['中文书写', '英文书写', '打字', 'AI协作'] },
    explorer: { icon: '⌁', name: '探索力', line: '找到证据、规律和真正的问题', skills: ['深度阅读', '信息可信度', '数据分析', '数学预算'] },
    builder: { icon: '⚡', name: '行动力', line: '把困难拆成下一步并完成收尾', skills: ['责任闭环', '任务拆解', '计算思维', '挫折恢复'] },
    connector: { icon: '∞', name: '连接力', line: '合作、反馈，并让成果真正帮助别人', skills: ['用户意识', '合作分工', '反馈与提炼', '迁移应用'] }
  };
  const KIND_ICONS = {
    '阅读表达': '📖', '工程创造': '🛠', '生活项目': '🧭', '运动实验': '🏸', '生活责任': '🍳',
    '整理系统': '🗂', '数字素养': '🤖', '数字表达': '⌨', '合作表达': '🤝', '科学研究': '🔭',
    '数学生活': '🧮', '创造表达': '🎨'
  };
  const EVIDENCE_CHIPS = ['我拍了照片', '我记录了数字', '我保存了作品', '我讲给别人听'];

  const esc = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value ?? ''))
    : String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));
  const unique = values => [...new Set((values || []).filter(Boolean))];
  const clone = value => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  const profile = () => window.GrowthCoach?.profile?.() || (state.coachProfile ||= {});
  const activeChild = () => window.GrowthFamily?.getActiveChild?.() || { id: 'child', relation: state.child?.name || '孩子' };

  function ageNumber() {
    const match = String(state.child?.age || '').match(/\d+/);
    return match ? Number(match[0]) : 9;
  }

  function ageMode() {
    const age = ageNumber();
    if (age <= 7) return { role: '小小探险家', world: '探索乐园', mission: '挑战', step: '小关卡', work: '成长宝藏' };
    if (age <= 11) return { role: '冒险者', world: '成长世界', mission: '冒险', step: '关卡', work: '真实作品' };
    return { role: '项目主理人', world: '真实项目实验室', mission: '项目', step: '阶段', work: '项目成果' };
  }

  function defaultTheme() {
    const interests = (state.child?.interests || []).join('|');
    if (/Minecraft|游戏|方块/.test(interests)) return 'block';
    if (/科幻|科学|AI|天文/.test(interests)) return 'space';
    if (ageNumber() <= 7 || /自然|动物|运动|户外/.test(interests)) return 'nature';
    return 'studio';
  }

  function applyTheme() {
    const p = profile();
    p.theme ||= defaultTheme();
    document.body.dataset.worldV8 = 'true';
    document.body.dataset.worldTheme = p.theme;
  }

  function removeGhostTask() {
    const task = state.task;
    const untouchedDefault = task
      && task.compilerVersion === 'fallback-compiler-2.2'
      && task.title === '建立家庭刘慈欣科幻档案馆'
      && task.problem === '家里的科幻书需要更好整理。'
      && task.steps?.every(step => !step.done && !step.note);
    if (untouchedDefault) {
      state.task = null;
      saveAll();
    }
  }

  function saveAll() {
    if (typeof save === 'function') save();
    window.GrowthFamily?.syncCurrent?.();
  }

  function completedHistory() {
    return (profile().history || []).filter(item => item.type === 'completed');
  }

  function meaningfulWorks() {
    return completedHistory().filter(item => item.outcome !== false);
  }

  function evidenceCount() {
    return Object.values(state.skills || {}).reduce((sum, item) => sum + (item.evidence?.length || 0), 0);
  }

  function identityTitle() {
    const count = meaningfulWorks().length;
    if (count >= 10) return '项目主理人';
    if (count >= 6) return '可靠合作者';
    if (count >= 3) return '问题解决者';
    if (count >= 1) return '作品创造者';
    return ageMode().role;
  }

  function profileCompleteness() {
    const p = profile();
    const checks = [
      state.child?.interests?.length >= 3,
      p.goals?.length >= 2,
      p.strengths?.length >= 1,
      p.challenges?.length >= 1,
      Number(p.dailyMinutes || 0) >= 10,
      completedHistory().length > 0
    ];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }

  function worldStrength(group) {
    const skillLevels = group.skills.map(skill => state.skills?.[skill]?.level || 0);
    const confidence = group.skills.map(skill => profile().skillConfidence?.[skill]).filter(value => Number.isFinite(value));
    const levelPart = skillLevels.reduce((sum, value) => sum + value, 0) / Math.max(1, skillLevels.length) / 5;
    const confidencePart = confidence.length ? confidence.reduce((sum, value) => sum + value, 0) / confidence.length : levelPart;
    return Math.round((levelPart * .55 + confidencePart * .45) * 100);
  }

  function activeProgress() {
    const task = state.task;
    if (!task?.steps?.length) return null;
    const done = task.steps.filter(step => step.done).length;
    return { task, done, total: task.steps.length, complete: done === task.steps.length };
  }

  function recommendationReasons(reasons) {
    const mapping = {
      '贴合当前兴趣': '你可能会喜欢',
      '与已出现的优势迹象相符': '你已经露出一点天赋',
      '难度位于可挑战但不易挫败的区间': '刚好有点难',
    };
    return (reasons || []).map(reason => {
      if (mapping[reason]) return mapping[reason];
      if (reason.startsWith('正好补强')) return `会让${reason.replace('正好补强', '')}变强`;
      if (reason.startsWith('适合今天')) return '今天来得及完成';
      return reason;
    }).slice(0, 3);
  }

  function missionCard(item, index) {
    const task = item.task;
    const reasons = recommendationReasons(item.reasons);
    return `<article class="world-mission-card" style="--mission-index:${index}">
      <div class="world-mission-icon">${KIND_ICONS[task.kind] || '✦'}</div>
      <div class="world-mission-copy">
        <span>${esc(task.kind)} · ${task.duration}分钟</span>
        <h3>${esc(task.title)}</h3>
        <p>${esc(task.goal)}</p>
        <div class="world-reason-chips">${reasons.map(reason => `<i>${esc(reason)}</i>`).join('')}</div>
        <div class="world-deliverable"><b>你会做出：</b>${esc(task.deliverable)}</div>
      </div>
      <button type="button" data-world-start="${esc(task.id)}">选这个</button>
    </article>`;
  }

  function worldOrbs() {
    return Object.entries(WORLD_GROUPS).map(([key, group]) => {
      const strength = worldStrength(group);
      return `<button type="button" class="world-orb-v8" data-world-group="${key}">
        <span>${group.icon}</span><div><b>${esc(group.name)}</b><small>${esc(group.line)}</small></div><em>${strength}%</em>
      </button>`;
    }).join('');
  }

  function renderHomeWorld() {
    applyTheme();
    const home = document.getElementById('home');
    if (!home) return;
    const child = activeChild();
    const p = profile();
    const mode = ageMode();
    const progress = activeProgress();
    currentRecommendations = window.GrowthCoach?.recommendations?.() || [];

    home.innerHTML = `<div class="world-home-v8">
      <section class="world-hero-v8">
        <div class="world-topbar-v8">
          <div class="world-child-switch-v8">
            <button data-world-child="brother" class="${child?.id === 'brother' ? 'active' : ''}">哥哥</button>
            <button data-world-child="sister" class="${child?.id === 'sister' ? 'active' : ''}">妹妹</button>
          </div>
          <button type="button" class="world-theme-button" id="worldThemeButton">${THEMES[p.theme]?.icon || '✦'} 换世界</button>
        </div>
        <div class="world-identity-v8"><span class="world-avatar-v8">${esc((state.child?.name || '小').slice(0, 1))}</span><div><small>${esc(identityTitle())}</small><h2>${esc(state.child?.name || '孩子')}的${esc(mode.world)}</h2><p>不是多做题，而是不断做出真正有用的东西。</p></div></div>
        <div class="world-proof-stats"><div><b>${meaningfulWorks().length}</b><span>${mode.work}</span></div><div><b>${evidenceCount()}</b><span>能力证据</span></div><div><b>${profileCompleteness()}%</b><span>世界已了解你</span></div></div>
      </section>

      ${progress ? renderCurrentMission(progress, mode) : `<section class="world-section-title"><div><small>自己选择，才会真正投入</small><h2>今天想开始哪场${mode.mission}？</h2></div><button id="worldRefreshMissions" type="button">换一批</button></section><section class="world-mission-list">${currentRecommendations.map(missionCard).join('')}</section>`}

      <section class="world-context-v8"><div><small>今天的能量</small><div class="world-inline-choice">${[['low','想轻松一点'],['normal','状态正常'],['high','想挑战一下']].map(([value,label]) => `<button data-world-energy="${value}" class="${p.energy === value ? 'active' : ''}">${label}</button>`).join('')}</div></div><div><small>今天能投入</small><div class="world-inline-choice">${[15,30,45].map(value => `<button data-world-minutes="${value}" class="${Number(p.dailyMinutes) === value ? 'active' : ''}">${value}分钟</button>`).join('')}</div></div></section>

      <section class="world-section-title"><div><small>能力只有被使用才真正属于你</small><h2>我的四个能力世界</h2></div></section>
      <section class="world-orb-grid-v8">${worldOrbs()}</section>

      <section class="world-parent-entry"><div><span>家长舱</span><b>把分析、设置和教学建议留给成人</b><p>孩子首页不再展示匹配率、优势假设和画像完整度。</p></div><button type="button" id="worldParentCockpit">进入</button></section>
    </div>`;

    bindHomeWorld();
  }

  function renderCurrentMission(progress, mode) {
    const nextIndex = progress.task.steps.findIndex(step => !step.done);
    const next = nextIndex >= 0 ? progress.task.steps[nextIndex] : progress.task.steps.at(-1);
    const percent = Math.round(progress.done / progress.total * 100);
    return `<section class="world-current-mission ${progress.complete ? 'complete' : ''}">
      <div class="world-current-head"><span>${progress.complete ? '🏆' : '🚀'}</span><div><small>${progress.complete ? '作品已经完成' : `正在进行 · 第 ${nextIndex + 1} ${mode.step}`}</small><h2>${esc(progress.task.title)}</h2></div></div>
      <div class="world-progress-track"><i style="width:${percent}%"></i></div>
      <div class="world-next-step"><span>${progress.complete ? '最后一步' : '现在只做这一件事'}</span><h3>${esc(progress.complete ? '把作品交付给真实的人，并完成任务结局' : next.child)}</h3><p>${esc(progress.complete ? '记录谁使用了、发生了什么、你根据反馈改了什么。' : next.standard)}</p></div>
      <div class="world-current-actions"><button type="button" class="primary" id="worldContinueTask">${progress.complete ? '完成任务结局' : '继续这一关'}</button><button type="button" id="worldPauseTask">查看完整路线</button></div>
    </section>`;
  }

  function bindHomeWorld() {
    document.querySelectorAll('[data-world-child]').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.worldChild !== window.GrowthFamily?.getActiveId?.()) window.GrowthFamily?.switchTo?.(button.dataset.worldChild);
    }));
    document.getElementById('worldThemeButton')?.addEventListener('click', openThemePicker);
    document.getElementById('worldRefreshMissions')?.addEventListener('click', () => {
      profile().refreshSeed = Number(profile().refreshSeed || 0) + 1;
      saveAll();
      renderHomeWorld();
    });
    document.querySelectorAll('[data-world-start]').forEach(button => button.addEventListener('click', () => openMissionContract(button.dataset.worldStart)));
    document.querySelectorAll('[data-world-energy]').forEach(button => button.addEventListener('click', () => {
      profile().energy = button.dataset.worldEnergy;
      profile().refreshSeed = Number(profile().refreshSeed || 0) + 1;
      saveAll();
      renderHomeWorld();
    }));
    document.querySelectorAll('[data-world-minutes]').forEach(button => button.addEventListener('click', () => {
      profile().dailyMinutes = Number(button.dataset.worldMinutes);
      profile().refreshSeed = Number(profile().refreshSeed || 0) + 1;
      saveAll();
      renderHomeWorld();
    }));
    document.querySelectorAll('[data-world-group]').forEach(button => button.addEventListener('click', () => goWorld('skills')));
    document.getElementById('worldParentCockpit')?.addEventListener('click', openParentCockpit);
    document.getElementById('worldContinueTask')?.addEventListener('click', () => activeProgress()?.complete ? openFinishMission() : goWorld('workflow'));
    document.getElementById('worldPauseTask')?.addEventListener('click', () => goWorld('workflow'));
  }

  function openThemePicker() {
    const selected = profile().theme || defaultTheme();
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = `<div class="world-modal-head"><div><small>这是孩子的世界</small><h2>选择一个愿意每天回来的样子</h2></div><button id="worldCloseModal">×</button></div><div class="world-theme-grid">${Object.entries(THEMES).map(([key, theme]) => `<button data-theme-choice="${key}" class="${selected === key ? 'active' : ''}"><span>${theme.icon}</span><b>${theme.name}</b><small>${theme.line}</small></button>`).join('')}</div><p class="world-modal-note">主题只改变表达方式，不改变成长规则。不要用单一“儿童风”假设所有孩子。</p>`;
    document.getElementById('modal').classList.add('open');
    document.getElementById('worldCloseModal').onclick = closeWorldModal;
    document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', () => {
      profile().theme = button.dataset.themeChoice;
      saveAll();
      applyTheme();
      closeWorldModal();
      goWorld('home');
    }));
  }

  function openMissionContract(taskId) {
    const item = currentRecommendations.find(entry => entry.task.id === taskId)
      || (window.GrowthCoach?.recommendations?.() || []).find(entry => entry.task.id === taskId);
    if (!item) return;
    const sibling = activeChild()?.id === 'brother' ? '妹妹' : '哥哥';
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = `<div class="world-modal-head"><div><small>接受${ageMode().mission}</small><h2>${esc(item.task.title)}</h2></div><button id="worldCloseModal">×</button></div>
      <div class="world-contract-output"><span>${KIND_ICONS[item.task.kind] || '✦'}</span><div><small>你会做出</small><b>${esc(item.task.deliverable)}</b></div></div>
      <div class="world-contract-block"><label>这件作品准备给谁使用？</label><div class="world-user-choice">${['自己','家人',sibling,'爷爷奶奶','同学'].map((name,index) => `<button data-real-user="${name}" class="${index === 1 ? 'active' : ''}">${name}</button>`).join('')}</div><input id="worldCustomUser" placeholder="也可以输入一个真实的人"></div>
      <div class="world-contract-block"><label>我为什么愿意试试？</label><div class="world-user-choice reason">${['我真的好奇','我想做出作品','我想帮助别人','我想挑战自己'].map((name,index) => `<button data-start-reason="${name}" class="${index === 0 ? 'active' : ''}">${name}</button>`).join('')}</div></div>
      <button class="world-main-button" id="worldConfirmMission">开始这场${ageMode().mission}</button>`;
    document.getElementById('modal').classList.add('open');
    document.getElementById('worldCloseModal').onclick = closeWorldModal;
    bindSingleChoice('[data-real-user]');
    bindSingleChoice('[data-start-reason]');
    document.getElementById('worldConfirmMission').onclick = () => {
      const custom = document.getElementById('worldCustomUser').value.trim();
      const user = custom || document.querySelector('[data-real-user].active')?.dataset.realUser || '家人';
      const reason = document.querySelector('[data-start-reason].active')?.dataset.startReason || '我愿意试试';
      acceptRecommendation(item, user, reason);
    };
  }

  function bindSingleChoice(selector) {
    document.querySelectorAll(selector).forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll(selector).forEach(item => item.classList.remove('active'));
      button.classList.add('active');
    }));
  }

  function createTaskFromRecommendation(item, realUser, startReason) {
    const task = item.task;
    const total = task.steps.length;
    const perStep = Math.max(8, Math.round(task.duration / total));
    const mode = ageMode();
    const phaseSets = mode.role === '小小探险家'
      ? ['发现问题', '准备办法', '做出第一版', '请人试试', '变得更好']
      : mode.role === '项目主理人'
        ? ['定义问题', '设计方案', '完成原型', '真实验证', '迭代交付']
        : ['明确目的', '设计准备', '完成第一版', '真实测试', '修改交付'];
    return {
      id: typeof makeId === 'function' ? makeId() : `${Date.now()}`,
      compilerVersion: 'growth-world-v8',
      recommendationId: task.id,
      recommendationScore: item.score,
      generatedBy: '可解释成长推荐引擎',
      compiledAt: new Date().toISOString(),
      title: task.title,
      purpose: `${task.goal} 真实使用者：${realUser}。`,
      shell: task.shell,
      realUser,
      problem: task.goal,
      availableTime: task.duration,
      coreSkills: task.skills.slice(0, 3),
      supportSkills: unique(['用户意识', '反馈与提炼'].filter(skill => !task.skills.includes(skill))),
      maintenanceSkills: unique(['责任闭环'].filter(skill => !task.skills.includes(skill))),
      outputs: [task.deliverable],
      materials: task.materials,
      safety: task.parentSupport,
      rationale: item.reasons.join('；'),
      recommendationMeta: { kind: task.kind, interests: task.interests, challenge: task.challenge, reasons: item.reasons },
      worldMeta: { startReason, theme: profile().theme, acceptedBy: state.child?.name },
      steps: task.steps.map((title, index) => ({
        id: typeof makeId === 'function' ? makeId() : `${Date.now()}_${index}`,
        phase: phaseSets[Math.min(index, phaseSets.length - 1)],
        title,
        purpose: index === total - 1 ? task.standard : `完成“${title}”并留下可检查结果。`,
        child: title,
        parent: index === 0 ? task.parentSupport : '只给一个提示，不接管任务；让孩子自己说出下一步。',
        elder: '提醒一次，守时间和安全，不替孩子完成。',
        duration: perStep,
        evidence: index === total - 1 ? task.deliverable : '照片、文字、数据、作品位置或口头说明中的一种',
        standard: index === total - 1 ? task.standard : '孩子能说清做了什么、结果是什么、下一步是什么。',
        skills: [task.skills[index % task.skills.length]],
        skillTraining: [{ skill: task.skills[index % task.skills.length], role: index < task.skills.length ? '核心训练' : '重要支撑', action: title }],
        done: false,
        note: '',
        evidenceKinds: []
      }))
    };
  }

  function acceptRecommendation(item, realUser, startReason) {
    state.task = createTaskFromRecommendation(item, realUser, startReason);
    const p = profile();
    p.history ||= [];
    p.history.unshift({ type: 'accepted', taskId: item.task.id, title: item.task.title, skills: item.task.skills, score: item.score, realUser, startReason, at: new Date().toISOString() });
    p.history = p.history.slice(0, 80);
    saveAll();
    closeWorldModal();
    goWorld('workflow');
    celebrate('新的冒险开始了', '一次只做一关，做完一定留下证据。');
  }

  function renderWorkflowWorld() {
    applyTheme();
    const section = document.getElementById('workflow');
    if (!section) return;
    const task = state.task;
    if (!task?.steps?.length) {
      section.innerHTML = `<section class="world-empty-v8"><span>🧭</span><h2>还没有正在进行的${ageMode().mission}</h2><p>先去冒险大厅，选择一件你真正愿意做的事。</p><button id="worldFindMission">寻找${ageMode().mission}</button></section>`;
      document.getElementById('worldFindMission').onclick = () => goWorld('generator');
      return;
    }
    const done = task.steps.filter(step => step.done).length;
    const complete = done === task.steps.length;
    const nextIndexRaw = task.steps.findIndex(step => !step.done);
    const current = nextIndexRaw < 0 ? task.steps.length - 1 : nextIndexRaw;
    const percent = Math.round(done / task.steps.length * 100);
    section.innerHTML = `<div class="world-workflow-v8">
      <section class="world-workflow-head"><div><button id="worldBackHome">← ${ageMode().world}</button><span>${done}/${task.steps.length} ${ageMode().step}</span></div><h2>${esc(task.title)}</h2><p>${esc(task.purpose)}</p><div class="world-progress-track"><i style="width:${percent}%"></i></div></section>
      <section class="world-road-v8">${task.steps.map((step, index) => renderWorldStep(step, index, current, complete)).join('')}</section>
      ${complete ? `<section class="world-finish-callout"><span>🏆</span><div><b>作品已经完成，但成长闭环还差最后一步</b><p>交给${esc(task.realUser || '真实的人')}使用，记录反馈，并至少改一次。</p></div><button id="worldFinishMission">完成任务结局</button></section>` : ''}
    </div>`;
    document.getElementById('worldBackHome').onclick = () => goWorld('home');
    document.getElementById('worldFinishMission')?.addEventListener('click', openFinishMission);
    document.querySelectorAll('[data-world-evidence]').forEach(button => button.addEventListener('click', () => addEvidenceChip(Number(button.dataset.stepIndex), button.dataset.worldEvidence, button)));
    document.querySelectorAll('[data-world-note]').forEach(field => field.addEventListener('change', () => {
      state.task.steps[Number(field.dataset.worldNote)].note = field.value.trim();
      saveAll();
    }));
    document.querySelectorAll('[data-world-complete-step]').forEach(button => button.addEventListener('click', () => completeWorldStep(Number(button.dataset.worldCompleteStep))));
    document.querySelectorAll('[data-world-reopen-step]').forEach(button => button.addEventListener('click', () => reopenWorldStep(Number(button.dataset.worldReopenStep))));
  }

  function renderWorldStep(step, index, current, allComplete) {
    const done = step.done;
    const isCurrent = !allComplete && index === current;
    const locked = !done && index > current;
    return `<article class="world-step-v8 ${done ? 'done' : ''} ${isCurrent ? 'current' : ''} ${locked ? 'locked' : ''}">
      <div class="world-step-marker">${done ? '✓' : index + 1}</div>
      <div class="world-step-card"><div class="world-step-title"><span>${esc(step.phase)}</span><h3>${esc(step.title)}</h3></div>
        ${locked ? `<p class="world-locked-copy">完成前一关后自动解锁。</p>` : `<p class="world-child-action">${esc(step.child)}</p>
          <div class="world-evidence-box"><b>留下证据才能通过</b><div>${EVIDENCE_CHIPS.map(chip => `<button type="button" data-world-evidence="${chip}" data-step-index="${index}" class="${step.evidenceKinds?.includes(chip) ? 'active' : ''}">${chip}</button>`).join('')}</div><textarea data-world-note="${index}" placeholder="写一句真实发生的事，或说明作品保存在哪里">${esc(step.note || '')}</textarea></div>
          <details><summary>卡住时再看帮助</summary><p><b>家长：</b>${esc(step.parent)}</p><p><b>完成标准：</b>${esc(step.standard)}</p></details>
          ${done ? `<button class="world-reopen-button" data-world-reopen-step="${index}">重新打开这一关</button>` : `<button class="world-complete-button" data-world-complete-step="${index}">我完成了这一关</button>`}`}
      </div>
    </article>`;
  }

  function addEvidenceChip(index, chip, button) {
    const step = state.task.steps[index];
    step.evidenceKinds ||= [];
    if (step.evidenceKinds.includes(chip)) step.evidenceKinds = step.evidenceKinds.filter(item => item !== chip);
    else step.evidenceKinds.push(chip);
    button.classList.toggle('active');
    saveAll();
  }

  function completeWorldStep(index) {
    const step = state.task.steps[index];
    const textarea = document.querySelector(`[data-world-note="${index}"]`);
    step.note = textarea?.value.trim() || step.note || '';
    if (!step.evidenceKinds?.length && step.note.length < 4) return showToast('先留下一点证据：选一种方式，或者写一句真实发生的事。');
    step.done = true;
    step.completedAt = new Date().toISOString();
    saveAll();
    renderWorkflowWorld();
    const complete = state.task.steps.every(item => item.done);
    celebrate(complete ? '作品完成了' : `第 ${index + 1} 关通过`, complete ? '现在去交给真实的人使用。' : '下一关已经打开。');
  }

  function reopenWorldStep(index) {
    state.task.steps[index].done = false;
    delete state.task.steps[index].completedAt;
    saveAll();
    renderWorkflowWorld();
  }

  function openFinishMission() {
    const task = state.task;
    if (!task) return;
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = `<div class="world-modal-head"><div><small>任务结局</small><h2>这件作品真的改变了什么？</h2></div><button id="worldCloseModal">×</button></div>
      <div class="world-finish-title">${esc(task.title)}</div>
      ${ratingBlock('做这件事时，我有多愿意继续？','worldEnjoyment',[['😣','不想再做'],['😕','有点勉强'],['😐','还可以'],['🙂','愿意再做'],['🤩','我还想继续'] ],4)}
      ${ratingBlock('这次主要是谁完成的？','worldIndependence',[['1','大人接管'],['2','多次提醒'],['3','少量提示'],['4','基本独立'] ],3)}
      ${ratingBlock('实际难度怎么样？','worldDifficulty',[['1','太简单'],['2','稍简单'],['3','刚刚好'],['4','有挑战'],['5','太难'] ],3)}
      <div class="world-finish-checks"><label><input type="checkbox" id="worldOutcome" checked> ${esc(task.realUser || '真实使用者')}真的使用或验证过</label><label><input type="checkbox" id="worldRevised"> 我根据反馈至少修改过一次</label></div>
      <div class="world-contract-block"><label>写下一个具体事实</label><textarea id="worldFinishNote" placeholder="例如：妹妹按我的标签在25秒内找到了书，但她看不懂‘长篇’这个词，我换成了颜色标签。"></textarea></div>
      <button class="world-main-button" id="worldSubmitFinish">保存作品，点亮能力世界</button>`;
    document.getElementById('modal').classList.add('open');
    document.getElementById('worldCloseModal').onclick = closeWorldModal;
    bindRatingGroups();
    document.getElementById('worldSubmitFinish').onclick = submitMissionFinish;
  }

  function ratingBlock(label, name, options, selected) {
    return `<div class="world-rating-block"><label>${label}</label><div data-world-rating="${name}">${options.map(([value,text], index) => `<button type="button" data-rating-value="${index + 1}" class="${index + 1 === selected ? 'active' : ''}"><b>${value}</b><small>${text}</small></button>`).join('')}</div></div>`;
  }

  function bindRatingGroups() {
    document.querySelectorAll('[data-world-rating]').forEach(group => group.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
    })));
  }

  function submitMissionFinish() {
    const task = state.task;
    const p = profile();
    const rating = name => Number(document.querySelector(`[data-world-rating="${name}"] button.active`)?.dataset.ratingValue || 3);
    const enjoyment = rating('worldEnjoyment');
    const independence = rating('worldIndependence');
    const difficulty = rating('worldDifficulty');
    const outcome = document.getElementById('worldOutcome').checked;
    const revised = document.getElementById('worldRevised').checked;
    const note = document.getElementById('worldFinishNote').value.trim();
    if (note.length < 8) return showToast('请写一个具体事实，不要只写“很好”或“完成了”。');
    const skills = task.coreSkills || [];
    const interests = task.recommendationMeta?.interests || [task.shell];
    const quality = clamp01((enjoyment / 5) * .22 + (independence / 4) * .28 + (outcome ? .2 : 0) + (revised ? .18 : 0) + (difficulty === 3 || difficulty === 4 ? .12 : .04));

    p.interestSignals ||= {};
    p.skillConfidence ||= {};
    p.history ||= [];
    interests.forEach(tag => {
      const current = p.interestSignals[tag] ?? .5;
      p.interestSignals[tag] = clamp01(current * .72 + (enjoyment / 5) * .28);
    });
    skills.forEach(skill => {
      const current = p.skillConfidence[skill] ?? .35;
      const evidence = clamp01((independence / 4) * .45 + (outcome ? .25 : 0) + (revised ? .2 : 0) + (difficulty >= 3 && difficulty <= 4 ? .1 : .04));
      p.skillConfidence[skill] = clamp01(current * .78 + evidence * .22);
      if (state.skills?.[skill]) {
        state.skills[skill].evidence ||= [];
        state.skills[skill].evidence.push({ date: new Date().toISOString().slice(0, 10), shell: task.shell, strong: outcome && revised && independence >= 3 && quality >= .72, transfer: note, source: 'growth-world-v8' });
      }
    });
    const strong = outcome && revised && independence >= 3 && quality >= .72;
    p.history.unshift({ type: 'completed', taskId: task.recommendationId || task.id, title: task.title, skills, interests, realUser: task.realUser, enjoyment, independence, difficulty, outcome, revised, note, quality: Math.round(quality * 100), at: new Date().toISOString() });
    p.history = p.history.slice(0, 80);
    state.reviews ||= [];
    state.reviews.unshift({ id: typeof makeId === 'function' ? makeId() : `${Date.now()}`, date: new Date().toISOString(), task: task.title, shell: task.shell, evidenceType: outcome ? '真实用户反馈' : '照片/作品', independence, userTest: outcome, revised, taught: false, feedback: note, summary: note, abstract: revised ? '根据真实反馈修改作品。' : '完成了第一版作品。', apply: '下次先确认使用者和成功标准。', transfer: '把本次方法用于另一个真实问题。', score: Math.round(quality * 12), strong });
    state.task = null;
    saveAll();
    closeWorldModal();
    goWorld('home');
    celebrate(strong ? '一颗能力星被真正点亮' : '作品已经进入成长档案', strong ? '因为它被真实使用、修改，而且主要由你完成。' : '下一次加入真实试用和修改，证据会更强。');
  }

  function renderProfileWorld() {
    applyTheme();
    const section = document.getElementById('profile');
    if (!section) return;
    const p = profile();
    const works = meaningfulWorks().slice(0, 6);
    const interests = Object.entries(p.interestSignals || {}).sort((a, b) => b[1] - a[1]).slice(0, 10);
    section.innerHTML = `<div class="world-profile-v8">
      <section class="world-profile-hero"><div class="world-avatar-large">${esc((state.child?.name || '小').slice(0,1))}</div><div><small>${esc(identityTitle())}</small><h2>${esc(state.child?.name)} · ${esc(state.child?.age)}</h2><p>这里记录证据，不给孩子贴死标签。</p></div><button id="worldProfileTheme">${THEMES[p.theme]?.icon || '✦'}</button></section>
      <section class="world-section-title"><div><small>会主动靠近、愿意重复的东西</small><h2>我的兴趣星云</h2></div></section>
      <section class="world-interest-cloud">${interests.length ? interests.map(([name,value],index) => `<span style="--signal:${Math.round(value*100)};--i:${index}">${esc(name)} <small>${Math.round(value*100)}%</small></span>`).join('') : (state.child?.interests || []).map((name,index) => `<span style="--signal:65;--i:${index}">${esc(name)}</span>`).join('')}</section>
      <section class="world-section-title"><div><small>真正做过、被使用过的成果</small><h2>我的作品足迹</h2></div></section>
      <section class="world-portfolio-v8">${works.length ? works.map(item => `<article><span>${item.outcome ? '★ 已验证' : '☆ 已完成'}</span><h3>${esc(item.title)}</h3><p>${esc(item.note || '留下了一次真实任务记录。')}</p><small>${new Date(item.at).toLocaleDateString()} · 独立 ${item.independence}/4</small></article>`).join('') : '<div class="world-empty-inline">完成第一件被真实使用的作品后，它会出现在这里。</div>'}</section>
      <details class="world-parent-drawer"><summary>家长查看：动态画像依据</summary><div><p>画像完整度：${profileCompleteness()}%</p><p>本月目标：${esc((p.goals || []).join('、') || '尚未设置')}</p><p>当前困难：${esc((p.challenges || []).join('、') || '尚未设置')}</p><button id="worldCalibrateProfile">重新校准画像</button></div></details>
    </div>`;
    document.getElementById('worldProfileTheme').onclick = openThemePicker;
    document.getElementById('worldCalibrateProfile').onclick = () => window.GrowthCoach?.openOnboarding?.();
  }

  function renderSkillsWorld() {
    applyTheme();
    const section = document.getElementById('skills');
    if (!section) return;
    section.innerHTML = `<div class="world-skills-v8"><section class="world-skills-hero"><small>能力星图</small><h2>不是“学过什么”，<br>而是“能用它做成什么”。</h2><p>完成、真实使用、修改和迁移，会让证据逐渐变强。</p></section><section class="world-skill-worlds">${Object.entries(WORLD_GROUPS).map(([key,group]) => `<article><div class="world-skill-world-head"><span>${group.icon}</span><div><h3>${esc(group.name)}</h3><p>${esc(group.line)}</p></div><b>${worldStrength(group)}%</b></div><div class="world-skill-list-v8">${group.skills.map(skill => { const data = state.skills?.[skill] || {level:0,evidence:[]}; const ready = typeof canUpgrade === 'function' && canUpgrade(skill); return `<div><span><b>${esc(skill)}</b><small>${data.evidence?.length || 0} 条真实证据</small></span><i><em style="width:${Math.max(data.level*20, Math.round((profile().skillConfidence?.[skill]||0)*100))}%"></em></i>${ready ? `<button data-world-upgrade="${esc(skill)}">点亮</button>` : ''}</div>`; }).join('')}</div></article>`).join('')}</section></div>`;
    document.querySelectorAll('[data-world-upgrade]').forEach(button => button.addEventListener('click', () => { confirmUpgrade(button.dataset.worldUpgrade); renderSkillsWorld(); }));
  }

  function renderAdventureHall() {
    applyTheme();
    const section = document.getElementById('generator');
    if (!section) return;
    currentRecommendations = window.GrowthCoach?.recommendations?.() || [];
    section.innerHTML = `<div class="world-adventure-hall"><section class="world-adventure-hero"><small>冒险大厅</small><h2>兴趣负责让你开始，<br>真实成果负责让你成长。</h2><p>一次只选一件。没有无限信息流，也没有为了打卡而打卡。</p></section><section class="world-mission-list">${currentRecommendations.map(missionCard).join('')}</section><button class="world-secondary-button" id="worldHallRefresh">换一批任务</button><button class="world-parent-lab-link" id="worldOpenParentLab">家长：手动创建一个真实家庭项目 →</button></div>`;
    document.querySelectorAll('[data-world-start]').forEach(button => button.addEventListener('click', () => openMissionContract(button.dataset.worldStart)));
    document.getElementById('worldHallRefresh').onclick = () => { profile().refreshSeed = Number(profile().refreshSeed || 0) + 1; saveAll(); renderAdventureHall(); };
    document.getElementById('worldOpenParentLab').onclick = openParentLab;
  }

  function openParentLab() {
    openLegacyLabNext = true;
    goWorld('generator');
  }

  function captureManualDraft() {
    manualDraft = {
      realUser: document.getElementById('realUser')?.value.trim() || manualDraft.realUser || '家人',
      problem: document.getElementById('realProblem')?.value.trim() || manualDraft.problem || '',
      availableTime: Number(document.getElementById('availableTime')?.value || manualDraft.availableTime || 35)
    };
  }

  function renderLegacyLab() {
    const section = document.getElementById('generator');
    section.innerHTML = `<div class="world-parent-lab-head"><button id="worldExitParentLab">← 返回冒险大厅</button><small>家长专用</small><h2>手动创建真实家庭项目</h2><p>只有当推荐库没有覆盖真实问题时才使用，不要把这里变成新的作业布置器。</p></div>
      <div class="field"><label>选择孩子熟悉的项目外壳</label><div id="shellTags" class="row wrap">${SHELLS.map(shell => `<button type="button" class="tag ${shell === chosenShell ? 'selected' : ''}" data-manual-shell="${esc(shell)}">${esc(shell)}</button>`).join('')}</div></div>
      <div class="field"><label>核心补强能力（最多3项）</label><div id="skillTags" class="row wrap">${SKILLS.map(skill => `<button type="button" class="tag skill ${chosenSkills.includes(skill) ? 'selected' : ''}" data-manual-skill="${esc(skill)}">${esc(skill)}</button>`).join('')}</div></div>
      <div class="field"><label>真实使用者</label><input id="realUser" value="${esc(manualDraft.realUser)}"/></div>
      <div class="field"><label>当前真实问题</label><textarea id="realProblem" placeholder="写一个家里真实存在、做完会产生实际变化的问题。">${esc(manualDraft.problem)}</textarea></div>
      <div class="field"><label>每天可用时间</label><select id="availableTime"><option value="20" ${manualDraft.availableTime===20?'selected':''}>约20分钟</option><option value="35" ${manualDraft.availableTime===35?'selected':''}>约35分钟</option><option value="60" ${manualDraft.availableTime===60?'selected':''}>约60分钟</option></select></div>
      <button class="world-main-button" id="worldGenerateManual">生成完整工作流</button><div id="generatedTask"></div>`;
    document.getElementById('worldExitParentLab').onclick = () => { openLegacyLabNext = false; renderAdventureHall(); };
    document.querySelectorAll('[data-manual-shell]').forEach(button => button.onclick = () => { captureManualDraft(); chosenShell = button.dataset.manualShell; manualPreview = null; renderLegacyLab(); });
    document.querySelectorAll('[data-manual-skill]').forEach(button => button.onclick = () => {
      captureManualDraft();
      const skill = button.dataset.manualSkill;
      if (chosenSkills.includes(skill)) chosenSkills = chosenSkills.filter(item => item !== skill);
      else if (chosenSkills.length < 3) chosenSkills = [...chosenSkills, skill];
      else return showToast('核心能力最多选择 3 项');
      manualPreview = null;
      renderLegacyLab();
    });
    document.getElementById('worldGenerateManual').onclick = () => {
      captureManualDraft();
      if (!chosenSkills.length) return showToast('至少选择 1 项核心能力');
      manualPreview = compileTask({ shell: chosenShell, coreSkills: [...chosenSkills], realUser: manualDraft.realUser, problem: manualDraft.problem || TEMPLATES[chosenShell].purpose, availableTime: manualDraft.availableTime });
      document.getElementById('generatedTask').innerHTML = `<section class="world-manual-preview"><small>家长审核后再交给孩子选择</small><h3>${esc(manualPreview.title)}</h3><p>${esc(manualPreview.purpose)}</p><div>${manualPreview.coreSkills.map(skill => `<span>${esc(skill)}</span>`).join('')}</div><b>交付：${esc(manualPreview.outputs.join('、'))}</b><button id="worldUseManualTask">采用这个项目</button></section>`;
      document.getElementById('worldUseManualTask').onclick = () => { state.task = clone(manualPreview); saveAll(); goWorld('workflow'); celebrate('真实项目已经建立', '现在把选择权和执行权交还给孩子。'); };
    };
  }

  function openParentCockpit() {
    const p = profile();
    const recent = completedHistory().slice(0, 5);
    const topSkills = Object.entries(p.skillConfidence || {}).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = `<div class="world-modal-head"><div><small>家长舱</small><h2>你的角色不是监督员，<br>而是成长条件设计者。</h2></div><button id="worldCloseModal">×</button></div>
      <div class="world-parent-principle"><b>本周最重要原则</b><p>先让孩子自己选择；卡住时只示范最小样例；作品必须交给真实使用者；不要为了“完成”而接管。</p></div>
      <div class="world-parent-stats"><div><b>${profileCompleteness()}%</b><span>画像完整度</span></div><div><b>${recent.length}</b><span>近期完成反馈</span></div><div><b>${meaningfulWorks().length}</b><span>真实作品</span></div></div>
      <div class="world-parent-evidence"><b>当前较强信号</b>${topSkills.length ? topSkills.map(([skill,value]) => `<p><span>${esc(skill)}</span><i><em style="width:${Math.round(value*100)}%"></em></i><small>${Math.round(value*100)}%</small></p>`).join('') : '<p>证据不足，继续安排多样的小任务。</p>'}</div>
      <button class="world-main-button" id="worldParentCalibrate">校准孩子画像</button><button class="world-secondary-button" id="worldParentManualLab">手动创建真实项目</button><button class="world-secondary-button" id="worldParentTheme">让孩子选择界面世界</button>`;
    document.getElementById('modal').classList.add('open');
    document.getElementById('worldCloseModal').onclick = closeWorldModal;
    document.getElementById('worldParentCalibrate').onclick = () => { closeWorldModal(); window.GrowthCoach?.openOnboarding?.(); };
    document.getElementById('worldParentManualLab').onclick = () => { closeWorldModal(); openParentLab(); };
    document.getElementById('worldParentTheme').onclick = openThemePicker;
  }

  function renderReviewWorld() {
    document.getElementById('review').innerHTML = `<section class="world-empty-v8"><span>★</span><h2>作品馆已经合并到“我的档案”</h2><p>那里只展示真实完成、被使用和留下证据的成长足迹。</p><button id="worldGoPortfolio">查看作品馆</button></section>`;
    document.getElementById('worldGoPortfolio').onclick = () => goWorld('profile');
  }

  function closeWorldModal() {
    document.getElementById('modal')?.classList.remove('open');
  }

  function showToast(message) {
    document.querySelector('.world-toast-v8')?.remove();
    const toast = document.createElement('div');
    toast.className = 'world-toast-v8';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.remove(), 2600);
  }

  function celebrate(title, line) {
    const layer = document.createElement('div');
    layer.className = 'world-celebrate-v8';
    layer.innerHTML = `<div class="world-celebrate-star">✦</div><div><small>成长不是虚拟金币，而是你真的做到了</small><h2>${esc(title)}</h2><p>${esc(line)}</p></div>`;
    document.body.appendChild(layer);
    requestAnimationFrame(() => layer.classList.add('show'));
    layer.onclick = () => layer.remove();
    setTimeout(() => layer.remove(), 2800);
  }

  function updateNavigation() {
    const mode = ageMode();
    const labels = ageNumber() <= 7
      ? { home:['✦','乐园'], profile:['☺','我的'], skills:['◆','星星'], generator:['▣','挑战'], workflow:['✓','现在'] }
      : ageNumber() <= 11
        ? { home:['✦','世界'], profile:['☺','我的'], skills:['◆','星图'], generator:['▣','冒险'], workflow:['✓','当前'] }
        : { home:['⌂','首页'], profile:['◎','档案'], skills:['◇','能力'], generator:['＋','项目'], workflow:['✓','进行中'] };
    Object.entries(labels).forEach(([page,[icon,label]]) => {
      const button = document.querySelector(`nav button[data-page="${page}"]`);
      if (button) button.innerHTML = `<span>${icon}</span>${label}`;
    });
    const version = document.querySelector('.version');
    if (version) version.textContent = `V${VERSION} · ${mode.world}`;
  }

  function goWorld(page) {
    applyTheme();
    const allowed = ['home', 'profile', 'skills', 'generator', 'workflow', 'review'];
    const route = allowed.includes(page) ? page : 'home';
    sessionStorage.setItem(ROUTE_KEY, route);
    document.querySelectorAll('.page').forEach(node => node.classList.remove('active'));
    document.getElementById(route)?.classList.add('active');
    document.querySelectorAll('nav button').forEach(node => node.classList.toggle('active', node.dataset.page === route));
    const mode = ageMode();
    const titles = {
      home: [mode.world, '孩子自己选择，真实作品点亮能力'],
      profile: ['我的档案', '兴趣是信号，作品才是证据'],
      skills: ['能力星图', '能力只有被使用，才真正属于孩子'],
      generator: ['冒险大厅', '一次只选一件真正愿意做的事'],
      workflow: ['当前任务', '一次只推进一关，并留下证据'],
      review: ['作品馆', '记录真实完成、使用、修改和迁移']
    }[route];
    document.getElementById('pageTitle').textContent = titles[0];
    document.getElementById('pageSub').textContent = titles[1];
    if (route === 'generator' && openLegacyLabNext) {
      openLegacyLabNext = false;
      renderLegacyLab();
    } else {
      ({ home: renderHomeWorld, profile: renderProfileWorld, skills: renderSkillsWorld, generator: renderAdventureHall, workflow: renderWorkflowWorld, review: renderReviewWorld }[route])?.();
    }
    updateNavigation();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  renderHome = renderHomeWorld;
  renderProfile = renderProfileWorld;
  renderSkills = renderSkillsWorld;
  renderGenerator = renderAdventureHall;
  renderWorkflow = renderWorkflowWorld;
  renderReview = renderReviewWorld;
  go = goWorld;
  window.GrowthWorld = { go: goWorld, openThemePicker, openParentCockpit, openFinishMission, renderHome: renderHomeWorld };
  if (window.GrowthCoach) window.GrowthCoach.go = goWorld;

  const restore = () => { removeGhostTask(); goWorld(sessionStorage.getItem(ROUTE_KEY) || 'home'); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore, { once: true });
  else restore();
})();
