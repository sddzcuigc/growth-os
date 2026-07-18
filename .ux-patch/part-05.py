# Replace confusing internal vocabulary only in user-facing copy.
app = app_path.read_text(encoding='utf-8')
terminology = {
    '证据符文': '成长徽章',
    '六天证据汇成一次周决战': '六天完成记录汇成一次周挑战',
    '证据足够才结算': '完成记录达到要求才结算',
    '留下证据、打破一层护盾': '留下完成记录、打破一层护盾',
    '真实回答或行动证据': '真实回答或完成说明',
    '请留下一个真实回答或行动证据': '请写一句完成了什么',
    '击败每日小Boss并获得符文': '完成每日小Boss并获得成长徽章',
    '件证据': '件作品',
    '只根据我的证据回答': '只根据我的成长记录回答',
    '证据较强': '记录较多',
    '有多条证据': '有多条记录',
    '证据还很少': '记录还很少',
    '画像 × 未来能力 × 真实证据': '画像 × 未来能力 × 真实记录',
    'GLM根据真实证据生成': 'AI根据真实记录生成',
    '日记或行动带来了新证据': '日记或行动带来了新记录',
    '证据还少，先做小实验': '记录还少，先做个小实验',
    '根据新证据更新': '根据新记录更新',
    '不是分数，是成长证据': '不是分数，是成长记录',
    '我保存的成长证据': '我保存的成长记录',
    '成长证据已删除': '成长记录已删除',
}
for old, new in terminology.items():
    app = app.replace(old, new)
app_path.write_text(app, encoding='utf-8')

validator = validator_path.read_text(encoding='utf-8')
validator = validator.replace(
    'if (!serverSource.includes(\'if (devAdminEnabled && loginName === "admin")\')) failures.push("development demo login is not locally gated");',
    'if (!serverSource.includes(\'if (demoLoginEnabled && loginName === "admin")\')) failures.push("public demo login is not enabled");',
)
checks = '''
if (!readFileSync("styles.css", "utf8").includes("GROWTHOS_RESPONSIVE_WORKBENCH_V2")) failures.push("responsive workbench marker missing");
if (!serverSource.includes('url.pathname === "/api/models"')) failures.push("SiliconFlow model catalog route missing");
if (!appSourceText.includes("GROWTHOS_CONCRETE_TASKS_V2")) failures.push("concrete measurable task normalizer missing");
if (!htmlSource.includes("setting-question-mode") || !htmlSource.includes("setting-ai-model")) failures.push("AI preference controls missing");
if (appSourceText.includes("证据符文")) failures.push("confusing evidence rune wording remains");
'''
validator = validator.replace('\nif (failures.length) {', checks + '\nif (failures.length) {', 1)
validator_path.write_text(validator, encoding='utf-8')

print('Usability v7 migration applied')
