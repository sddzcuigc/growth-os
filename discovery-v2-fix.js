(() => {
  const renderGeneratorV5 = renderGenerator;

  renderGenerator = function renderGeneratorV5Stable() {
    const section = el("generator");
    if (section) {
      section.querySelectorAll(":scope > .flow-map, :scope > .card.discovery-empty").forEach(node => node.remove());
      [el("profileSignal"), el("aiControlCard"), el("plusActionCard")].filter(Boolean).forEach(node => {
        node.style.display = "";
      });
    }

    renderGeneratorV5();

    const advanced = el("advancedProjectPanel");
    if (advanced && !advanced.querySelector('[data-manual-generate="true"]') && !advanced.querySelector('button[onclick="generateTask()"]')) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn full";
      button.dataset.manualGenerate = "true";
      button.textContent = "按手动调整生成方案";
      button.addEventListener("click", () => generateTask());
      advanced.appendChild(button);
    }
  };
})();
