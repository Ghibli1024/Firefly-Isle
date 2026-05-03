# audio/
> L2 | 父级: /public/CLAUDE.md

成员清单
CLAUDE.md: 说明公开背景音资源目录与授权边界，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
background-music.mp3: 旧版 MVP 背景音乐占位资产，由本地 FFmpeg 正弦波合成生成，保留作历史回退，不再是当前默认歌单源，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
tracks/: 用户提供的本地授权歌单音频目录，文件名由 `src/lib/background-audio-tracks.ts` manifest 指定，[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

法则: 这里只放可公开发布的音频；商业歌曲必须由用户提供授权文件，禁止从 Apple Music 下载或绕过 DRM。
