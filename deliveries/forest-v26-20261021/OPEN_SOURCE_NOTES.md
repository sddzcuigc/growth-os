# V19 架构参考说明

本轮没有为了“参考开源”继续加入大型框架，而是采用成熟项目中常见、可验证的最小模式：

1. **Local-first / Offline queue**：前端先完成本地写入，再异步同步，失败事件保留队列。
2. **Optimistic concurrency**：服务端使用 `version / expectedVersion` 防止多设备静默互相覆盖。
3. **Idempotency key**：每次浇水使用 `clientEventId`，离线重放不会重复计数。
4. **Append-only audit event**：浇水动作独立留痕，而不是只保存聚合后的总次数。
5. **One-time invite**：家庭协作不共享密码，使用短期单次邀请码建立成员关系。
6. **Cache boundary**：Service Worker 只缓存静态壳，认证/API/云状态永远绕过缓存。

这些模式比增加新 Agent、状态管理库或微服务更符合当前规模：先提高数据正确性、可恢复性和可验证性。
