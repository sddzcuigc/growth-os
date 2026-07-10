(() => {
  let queued = false;

  function ensureWorkflowChrome() {
    const section = document.getElementById('workflow');
    if (!section || !section.classList.contains('active')) return;

    const task = (() => {
      try { return typeof state !== 'undefined' ? state.task : null; } catch { return null; }
    })();
    const rationale = task?.rationale || '该任务来自孩子兴趣、当前能力、成长目标、可用时间和家庭资源的综合匹配。';

    let intro = section.querySelector('.coach-workflow-intro');
    if (!intro) {
      intro = document.createElement('section');
      intro.className = 'coach-workflow-intro';
      intro.innerHTML = '<span>AI推荐依据</span><p></p>';
      section.prepend(intro);
    }
    const rationaleNode = intro.querySelector('p');
    if (rationaleNode && rationaleNode.textContent !== rationale) rationaleNode.textContent = rationale;

    let footer = section.querySelector('.coach-feedback-callout');
    if (!footer) {
      footer = document.createElement('section');
      footer.className = 'coach-feedback-callout';
      footer.innerHTML = '<div><b>任务做完后，不要只打一个“完成”</b><p>喜欢程度、独立程度、实际难度和真实成果，才会让下一轮推荐变准。</p></div><button type="button" class="coach-btn primary" id="coachWorkflowFeedback">提交任务反馈</button>';
      section.append(footer);
    }
    const feedbackButton = footer.querySelector('#coachWorkflowFeedback');
    if (feedbackButton && !feedbackButton.dataset.bound) {
      feedbackButton.dataset.bound = 'true';
      feedbackButton.addEventListener('click', () => window.GrowthCoach?.openTaskFeedback?.());
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      ensureWorkflowChrome();
    });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', schedule, true);
  window.addEventListener('pageshow', schedule);
  schedule();
})();
