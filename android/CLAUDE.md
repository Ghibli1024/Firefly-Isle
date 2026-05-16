# android/
> L1 | 父级: /CLAUDE.md

成员清单
app/: Capacitor 生成的 Android app module，承载 namespace、applicationId、MainActivity、manifest 与资源名，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
capacitor-cordova-android-plugins/: Capacitor Cordova 兼容插件占位 module，由 Capacitor sync 维护，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
gradle/: Gradle wrapper 运行时文件，保证 Android 工程可重复执行基础任务，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
build.gradle / settings.gradle / capacitor.settings.gradle: Android 顶层 Gradle 与 Capacitor module 连接配置，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
variables.gradle / gradle.properties: Android SDK、AndroidX 与构建参数集中入口，不保存 keystore 密码，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
.gitignore: Android build 输出、local.properties、同步 assets、generated config 与 keystore 文件的忽略边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: Android 目录只包装 `dist` 产物；不要在原生侧复制患者记录模型、LLM/OCR 调用或 Supabase 权限规则。
