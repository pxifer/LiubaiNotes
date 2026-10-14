# Microsoft Edge Add-ons 提交资料

> 本文件仅用于准备商店资料。当前尚未提交审核，也没有商店产品链接。

## 基本信息

- 扩展名称：留白笔记
- 版本：1.0.0
- 目标浏览器：Microsoft Edge
- 类别建议：Productivity（生产力）
- 语言：简体中文（zh-CN）
- 官网：<https://pxifer.github.io/LiubaiNotes/>
- 源码：<https://github.com/pxifer/LiubaiNotes>
- 支持与反馈：<https://github.com/pxifer/LiubaiNotes/issues>
- 隐私说明：<https://pxifer.github.io/LiubaiNotes/privacy.html>

## 短简介

无需登录、仅保存在当前 Microsoft Edge 中的简洁个人笔记工具。

## 详细简介

留白笔记是一款专注、轻量的 Microsoft Edge 个人笔记扩展。点击工具栏图标即可在新标签页打开笔记空间，快速记录灵感、清单和日常想法。

主要功能：

- 新建、编辑和删除笔记，删除前二次确认。
- 输入后自动保存，无需手动点击保存。
- 同时搜索笔记标题与正文。
- 置顶重要笔记，并按最近修改时间排序。
- 显示修改时间与正文字符数。
- 支持窄屏布局和常用键盘快捷键。

扩展无需账号，不读取网页内容，不包含广告或分析代码，也不会主动上传笔记。数据仅保存在当前 Microsoft Edge 配置的扩展本地空间中。

## 权限说明

Manifest 的 `permissions` 为空数组，不申请可选权限或主机权限。

扩展仅使用 Microsoft Edge 支持的 Manifest V3 基础能力：

- `action`：提供工具栏图标及点击事件。
- `runtime.getURL()`：生成扩展自身笔记页面的内部 URL。
- `tabs.create()`：用户点击图标后打开扩展自身页面；此调用不需要声明 `tabs` 权限。
- `background.service_worker`：处理工具栏点击事件。

扩展不读取当前标签页、浏览历史、剪贴板、书签、下载记录或网站数据。

## ZIP

提交包：`release/liubai-notes-edge-v1.0.0.zip`

ZIP 根目录直接包含 `manifest.json`，不包含 `.env`、令牌、测试文件、构建缓存或源码映射。

## 图片清单

Microsoft Edge Add-ons 当前接受最多 6 张截图，尺寸应为 `640 × 480` 或 `1280 × 800`。

建议准备：

1. `1280 × 800`：有多篇笔记时的双栏主界面，展示自动保存状态。
2. `1280 × 800`：搜索标题与正文后的即时结果。
3. `1280 × 800`：笔记置顶后的列表排序效果。
4. `1280 × 800`：删除二次确认弹窗。
5. 可选：窄屏列表与编辑界面组合图，但不得拉伸或模糊。

其他素材：

- 扩展 Logo：正方形，建议 `300 × 300`，最低 `128 × 128`。
- 可选小型宣传图：`440 × 280`。
- 可选大型宣传图：`1400 × 560` PNG。

截图必须来自真实 Microsoft Edge 运行界面，不应包含令牌、个人笔记或其他隐私信息。

## 提交前人工检查

1. 在 Edge 的 `edge://extensions/` 中加载解压后的包。
2. 点击工具栏图标，确认笔记页面能够打开。
3. 完成新建、自动保存、搜索、置顶、删除和刷新持久化测试。
4. 核对商店中的名称、简介、权限、官网与隐私链接。
5. 商店审核通过并获得产品链接后，将链接填入 `docs/site-config.js` 的 `edgeAddonsUrl`。
