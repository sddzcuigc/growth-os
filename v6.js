(() => {
  const parts = window.GROWTH_OS_V6_PARTS || [];
  const image = document.getElementById('v6Reference');
  if (image && parts.length) image.src = `data:image/webp;base64,${parts.join('')}`;

  const toast = document.getElementById('v6Toast');
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
  }

  function openLegacy(target) {
    if (target === 'home-detail') {
      sessionStorage.setItem('growthOSHomeMode', 'detail');
      sessionStorage.setItem('growthOSV6Target', 'home');
    } else {
      sessionStorage.setItem('growthOSV6Target', target || 'home');
    }
    location.href = './index.html';
  }

  document.querySelectorAll('[data-child]').forEach(button => {
    button.addEventListener('click', () => {
      const childId = button.dataset.child;
      try {
        const family = JSON.parse(localStorage.getItem('growthOSFamilyV1') || 'null');
        if (family?.children?.[childId]) {
          family.activeChildId = childId;
          family.lastLoadedChildId = childId;
          localStorage.setItem('growthOSFamilyV1', JSON.stringify(family));
          localStorage.setItem('growthOS', JSON.stringify(family.children[childId].state));
          localStorage.setItem('growthOSDiscoveryV3', JSON.stringify(family.children[childId].assessment));
          showToast(childId === 'brother' ? '已切换到哥哥' : '已切换到妹妹');
          setTimeout(() => location.reload(), 420);
          return;
        }
      } catch (error) {
        console.warn(error);
      }
      showToast('孩子资料将在正式接入后切换');
    });
  });

  document.querySelectorAll('[data-target]').forEach(button => {
    button.addEventListener('click', () => openLegacy(button.dataset.target));
  });

  document.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
    sessionStorage.setItem('growthOSV6Target', 'home');
    location.href = './index.html';
  });

  if (new URLSearchParams(location.search).get('debug') === '1') document.body.classList.add('debug');
})();