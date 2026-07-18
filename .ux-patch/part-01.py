# Responsive workbench and visible account/model controls.
styles = styles_path.read_text(encoding='utf-8')
if 'GROWTHOS_RESPONSIVE_WORKBENCH_V2' not in styles:
    styles += '''

/* GROWTHOS_RESPONSIVE_WORKBENCH_V2 */
body { display: block; min-height: 100dvh; overflow-y: auto; }
.phone {
  width: min(100%, 1180px); min-height: 100dvh; aspect-ratio: auto;
  margin: 0 auto; padding: 0; border: 0; border-radius: 0;
  background: transparent; box-shadow: none;
}
.screen { min-height: 100dvh; height: auto; overflow: visible; border-radius: 0; padding-bottom: 168px; }
.content { height: auto; min-height: calc(100dvh - 350px); overflow: visible; padding: 0 24px 28px; }
.level-panel, .tabbar {
  position: fixed; left: 50%; right: auto; transform: translateX(-50%);
  width: min(calc(100vw - 32px), 1080px);
}
.level-panel { bottom: 78px; }
.tabbar { bottom: 10px; }
.ai-preference-panel {
  margin: 0 16px 16px; padding: 14px; border: 3px solid #76592e;
  border-radius: 8px; background: #fff3c6;
}
.ai-preference-panel h3 { margin: 0 0 10px; }
.ai-preference-panel label { display: grid; gap: 5px; margin-top: 9px; font-weight: 900; }
.ai-preference-panel select { min-height: 40px; padding: 6px 8px; border: 2px solid #8c6c38; background: #fffaf0; font: inherit; }
.ai-preference-panel small { display: block; margin-top: 9px; color: #654a28; line-height: 1.45; }
@media (min-width: 760px) {
  .hero { min-height: 190px; }
  .logo { margin-top: 42px; font-size: 64px; }
  .child-switcher { grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 820px; margin: -6px auto 0; }
  .content { padding: 0 36px 190px; }
  .panel { padding: 18px; }
  .quick-start-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width: 759px) {
  .phone, .screen { width: 100%; min-height: 100dvh; }
  .content { min-height: calc(100dvh - 350px); padding: 0 14px 178px; }
  .hero { min-height: 205px; }
  .logo { margin-top: 48px; }
}
'''
styles_path.write_text(styles, encoding='utf-8')

index = index_path.read_text(encoding='utf-8')
index = replace_once(
    index,
    '<div class="settings-body" id="settings-content"></div>',
    '''<div class="settings-body" id="settings-content"></div>
            <section class="ai-preference-panel" id="ai-preference-panel">
              <h3>AI速度与模型</h3>
              <label>提问方式
                <select id="setting-question-mode">
                  <option value="fast">快速：3个关键问题</option>
                  <option value="balanced">均衡：4个问题</option>
                  <option value="deep">深入：6个问题</option>
                </select>
              </label>
              <label>使用模型
                <select id="setting-ai-model"><option value="">正在读取硅基流动模型…</option></select>
              </label>
              <small>快速模式默认少问、直接生成；模型越强通常等待越久。设置对当前角色生效。</small>
            </section>''',
    'settings AI panel',
)
index = replace_once(
    index,
    '<small>账户数据按角色隔离，并保存到本机 SQLite 数据库。</small>',
    '<small>演示账号：admin / admin（公共演示数据）；正式使用请注册自己的账户。数据按角色隔离并保存到云端。</small>',
    'demo login hint',
)
index_path.write_text(index, encoding='utf-8')
