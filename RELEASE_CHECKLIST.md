# 发布检查清单

当前状态：已准备本地检查、构建与打包；Microsoft Edge Add-ons 尚未提交审核。

## 发布前必须完成

1. 确认 GitHub 仓库地址为 `https://github.com/pxifer/LiubaiNotes`。
2. 保持 `docs/site-config.js` 中的源码与 Issues 地址可访问。
3. 审核通过并获得 Edge Add-ons 产品地址后，填写 `edgeAddonsUrl`；审核通过前不要展示虚假的商店链接。
4. 用真实产品截图替换官网首页的界面示意占位。
5. 运行 `npm test`、`npm run test:browser` 和 `npm run package`。
6. 解压 `release/liubai-notes-edge-v1.0.0.zip`，在 Microsoft Edge 中执行一次“加载解压缩的扩展”验收。
7. 确认 `.env`、令牌、日志、调试配置、`build/`、`release/` 未进入 Git 暂存区。

## GitHub Pages 建议步骤（尚未执行）

1. 创建远程仓库并推送经过复核的源码。
2. 在仓库 Settings → Pages 中选择从分支部署。
3. Source 选择默认分支，Folder 选择 `/docs`。
4. 等待 Pages 构建完成，访问 `https://<用户名>.github.io/<仓库名>/`。
5. 验证首页、`privacy.html`、CSS/JS、下载 ZIP 均位于 `/仓库名/` 下且返回成功。

官网使用 `./` 相对链接，不依赖域名根目录，因此兼容 GitHub Pages 的仓库子路径。

## Microsoft Edge Add-ons 建议步骤（尚未执行）

1. 保留本次生成的 ZIP 与版本号，确认隐私说明和截图素材。
2. 注册 Microsoft Edge Add-ons 开发者账户并完成需要的身份验证，此步骤必须由所有者操作。
3. 上传 ZIP，填写功能、权限、隐私和支持信息。
4. 提交审核。
5. 审核通过后，把官方商店地址写入官网；在此之前保留本地 ZIP 下载与开发者模式安装说明。

## 版本发布

1. 将 `manifest.json` 和 `package.json` 的版本保持一致。
2. 重新运行打包命令，确认 ZIP 文件名包含相同版本号。
3. 创建 Git tag 与 GitHub Release，并把同一 ZIP 作为 Release 附件。
4. 复查官网版本文字和下载链接。
