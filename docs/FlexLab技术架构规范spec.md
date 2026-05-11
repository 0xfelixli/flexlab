# FlexLab 技术架构规范（Technical Stack Spec）

## 1. 项目定位

FlexLab 是一个基于 `mitmproxy` 深度扩展的现代化 Web 安全调试工作台。

目标：

- 类似 BurpSuite 的流量调试能力
- 更现代化的 UI/UX
- 可扩展插件系统
- 实时流量分析
- 可工作台化（Workspace）
- 后续支持 Scanner / Repeater / Interceptor / Plugin System

核心理念：

```text
MITM Proxy Core + Modern Security Workspace
````

---

# 2. 总体架构

```text
Frontend (React/TS)
        │
        │ WebSocket + REST
        ▼
Backend Control Layer
        │
        │ mitmproxy API
        ▼
mitmproxy Core
```

---

# 3. 技术栈

## 3.1 前端技术栈

| 类型               | 技术               |
| ---------------- | ---------------- |
| Runtime          | Bun              |
| Build Tool       | Vite             |
| Framework        | React            |
| Language         | TypeScript       |
| State Management | Zustand          |
| Router           | React Router     |
| UI Styling       | TailwindCSS      |
| HTTP Client      | Axios            |
| Realtime         | Native WebSocket |
| Table            | TanStack Table   |
| Virtual List     | TanStack Virtual |
| Editor           | Monaco Editor    |
| Diff Editor      | Monaco Diff      |
| Syntax Highlight | Monaco / Prism   |

---

## 3.2 后端技术栈

| 类型              | 技术                |
| --------------- | ----------------- |
| Language        | Python 3.12+      |
| Runtime Manager | uv                |
| Proxy Core      | mitmproxy         |
| API Framework   | FastAPI（轻量控制层）    |
| Async Runtime   | asyncio           |
| WebSocket       | FastAPI WebSocket |
| ORM             | SQLAlchemy        |
| Database        | SQLite            |
| Config          | Pydantic          |
| Plugin Runtime  | importlib         |

---

# 4. 仓库结构

```text
flexlab/
├── backend/
├── frontend/
├── shared/
└── mitmproxy/ (git submodule)
```

---

# 5. 前端架构

## 5.1 前端定位

前端本质：

```text
实时安全工作台（Security Workspace）
```

而不是传统网页。

目标参考：

* VSCode
* Chrome Devtools
* Postman
* BurpSuite
* Caido

---

## 5.2 前端模块

### 核心模块

| 模块              | 功能     |
| --------------- | ------ |
| Flow List       | 实时流量列表 |
| Request Viewer  | 请求查看   |
| Response Viewer | 响应查看   |
| Interceptor     | 拦截器    |
| Repeater        | 请求重放   |
| Workspace Tabs  | 工作区    |
| Search/Filter   | 搜索过滤   |
| Project System  | 项目管理   |

---

## 5.3 状态管理

采用：

```text
Zustand
```

原因：

* 轻量
* 高频实时数据适合
* 比 Redux 更适合 Flow 更新
* 无样板代码

Store 推荐：

```text
flowStore
tabStore
projectStore
settingStore
```

---

## 5.4 编辑器

统一采用：

```text
Monaco Editor
```

支持：

* Raw HTTP
* JSON
* XML
* HTML
* GraphQL
* Diff Compare

---

# 6. 后端架构

## 6.1 后端定位

后端不负责代理实现。

仅负责：

```text
Control Layer
```

即：

* Flow 管理
* WebSocket 推送
* Repeater
* Interceptor
* 插件系统
* Scanner
* 项目管理

---

## 6.2 mitmproxy 集成原则

原则：

```text
尽量少修改 mitmproxy Core
```

推荐修改区域：

```text
mitmproxy/tools/web/
```

避免修改：

```text
mitmproxy/proxy/
```

---

## 6.3 Flow 数据流

```text
mitmproxy Flow
    ↓
Serializer
    ↓
DTO
    ↓
WebSocket
    ↓
Frontend Store
```

禁止：

```text
直接序列化 mitmproxy flow
```

---

## 6.4 Flow 分层

### FlowSummary

用于：

* 流量列表
* 高性能渲染

### FlowDetail

用于：

* 请求详情
* Repeater
* Diff

---

# 7. WebSocket 规范

统一事件驱动。

协议：

```json
{
  "event": "FLOW_ADD",
  "data": {}
}
```

事件类型：

| Event             | 说明   |
| ----------------- | ---- |
| FLOW_ADD          | 新流量  |
| FLOW_UPDATE       | 流量更新 |
| FLOW_REMOVE       | 删除流量 |
| INTERCEPT_REQUEST | 请求拦截 |
| REPEATER_RESULT   | 重放结果 |
| SCANNER_RESULT    | 扫描结果 |

---

# 8. 插件系统

## 8.1 插件目标

支持：

* Payload
* Scanner
* Decoder
* Auth
* Rule Engine

---

## 8.2 插件接口

```python
class Plugin:
    name = "plugin"

    async def on_request(self, flow):
        pass

    async def on_response(self, flow):
        pass
```

---

# 9. 数据库设计

初期：

```text
SQLite
```

核心表：

| Table            | 说明   |
| ---------------- | ---- |
| projects         | 项目   |
| flows            | 流量   |
| findings         | 漏洞   |
| repeater_history | 重放历史 |
| plugins          | 插件   |

---

# 10. 开发原则

## 10.1 不直接魔改 mitmproxy

优先：

```text
addon
api
hook
command
```

扩展。

---

## 10.2 Flow 轻量化

禁止：

```text
前端持有完整 flow
```

采用：

```text
Summary + Lazy Detail
```

模式。

---

## 10.3 UI 工作台化

目标：

```text
IDE 风格安全工作台
```

不是传统 Web 页面。

---

# 11. 第一阶段目标（MVP）

## 必做

* HTTP/HTTPS 抓包
* Flow List
* Request Viewer
* Response Viewer
* WebSocket 实时同步
* HTTPS CA
* Repeater
* Interceptor

---

## 暂不实现

* 自动扫描器
* Fuzz Engine
* Intruder
* Team Collaboration
* Cloud Sync

---

# 12. 后期规划

## 第二阶段

* Plugin SDK
* Rule Engine
* Scanner
* Decoder
* Workspace Save

---

## 第三阶段

* Electron Desktop
* 多窗口
* 多项目
* AI Analysis
* Team Collaboration

---

# 13. 长期目标

FlexLab 最终定位：

```text
下一代 Web 安全工作台
```

而不是：

```text
BurpSuite Clone
```