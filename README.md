# 留白笔记

留白笔记是一款面向个人使用的 Microsoft Edge 浏览器扩展。点击工具栏图标后，它会在新标签页打开一个简洁的双栏笔记界面。无需账号，笔记只保存在当前 Edge 配置的扩展本地空间中。

当前版本：`1.0.0`

## 功能

- 新建、编辑与二次确认删除笔记
- 输入后自动保存
- 搜索标题和正文
- 置顶笔记，并按“置顶优先、最近修改优先”排序
- 显示最后修改时间与正文字符数
- 桌面双栏布局，窄屏列表/编辑页切换
- `Ctrl/Command + N` 新建，`Ctrl/Command + F` 搜索，`Esc` 返回或关闭确认框

## 浏览器与权限

本项目是面向 Microsoft Edge 的 Manifest V3 扩展。

扩展声明的权限：**无**。

- 不读取浏览历史、网页内容或剪贴板。
- 不访问网络，也不包含统计或广告脚本。
- 点击扩展图标时，仅通过浏览器扩展 API 打开自身的 `dist/index.html` 页面。
- 笔记使用 `localStorage` 保存在扩展自己的本地存储域中。

## 安装

### 使用分发包

1. 下载并解压 `liubai-notes-edge-v1.0.0.zip`。
2. 在 Microsoft Edge 打开 `edge://extensions/`。
3. 开启“开发者模式”。
4. 选择“加载已解压的扩展程序”，选中解压后的目录。
5. 将“留白笔记”固定到 Edge 工具栏，点击图标即可打开。

浏览器通常不能直接安装来源不明的 ZIP；ZIP 是便于传输的“已解压扩展”包，不是商店签名安装包。

### 从源码安装

下载本项目后，在扩展管理页直接加载项目根目录。根目录包含 `manifest.json`。

## 使用

首次打开时点击“写下第一篇笔记”。编辑标题或正文后，状态会从“正在保存”变为“已保存”。左侧可搜索、切换和查看笔记，编辑器右上角可置顶或删除。

## 开发、测试与打包

要求：Node.js 20+；打包脚本目前使用 Windows PowerShell 5+。

```powershell
npm test
npm run build
npm run package
```

- `npm test`：检查 JavaScript 语法、Manifest V3 配置、文件引用、敏感文件规则和 GitHub Pages 相对路径。
- `npm run build`：把扩展运行所需文件复制到 `build/extension/`。
- `npm run package`：运行测试和构建，生成 `release/liubai-notes-edge-v1.0.0.zip`，并同步到官网的 `docs/downloads/`。

无需安装 npm 依赖。

## 介绍官网

静态官网源码位于 `docs/`。所有资源与下载链接都使用相对路径，可部署在 GitHub Pages 的 `/仓库名/` 子路径下。

本地预览：

```powershell
python -m http.server 4175 --directory docs
```

## 隐私

笔记不会主动上传。卸载扩展、清除扩展数据、更换浏览器配置或设备，均可能导致笔记丢失。完整说明见官网的 `docs/privacy.html`。

## 已知限制

- 暂无账号、云同步、备份导入导出和跨设备同步。
- 浏览器扩展存储被清除后无法恢复。
- 目前尚未通过 Microsoft Edge Add-ons 审核，因此只能用 Edge 开发人员模式加载已解压版本。
- 源码与反馈地址分别为项目仓库和 GitHub Issues；商店地址会在审核通过后再配置。
- 自动保存遇到浏览器存储空间耗尽时，当前版本尚无专门的错误恢复界面。

## 发布前检查

项目不会读取或提交 `.env`。`.gitignore` 已排除 `.env`、日志、临时构建目录和本地调试文件。发布前仍应运行 `npm test` 并人工复核打包内容。

## 项目链接

- 源码：<https://github.com/pxifer/LiubaiNotes>
- 反馈：<https://github.com/pxifer/LiubaiNotes/issues>
- 官网（启用 GitHub Pages 后）：<https://pxifer.github.io/LiubaiNotes/>

Microsoft Edge Add-ons 商店链接将在审核通过后补充。商店提交资料见 `EDGE_STORE_SUBMISSION.md`。
