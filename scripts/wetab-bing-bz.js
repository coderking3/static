// ========== 配置与常量 ==========
const API_URL = 'https://bing.ee123.net/img/4k'
const KEY_ENABLED = 'bingWallpaperMode'
const KEY_CACHE = 'bingWallpaperCache'
const KEY_MASK = 'bingWallpaperMaskVisible'

const ICON_PICTURE =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zOSA2SDlDNy4zNDMxNSA2IDYgNy4zNDMxNSA2IDlWMzlDNiA0MC42NTY5IDcuMzQzMTUgNDIgOSA0MkgzOUM0MC42NTY5IDQyIDQyIDQwLjY1NjkgNDIgMzlWOUM0MiA3LjM0MzE1IDQwLjY1NjkgNiAzOSA2WiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE4IDIzQzIwLjc2MTQgMjMgMjMgMjAuNzYxNCAyMyAxOEMyMyAxNS4yMzg2IDIwLjc2MTQgMTMgMTggMTNDMTUuMjM4NiAxMyAxMyAxNS4yMzg2IDEzIDE4QzEzIDIwLjc2MTQgMTUuMjM4NiAyMyAxOCAyM1oiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MiAzNkwzMSAyNkwyMSAzNUwxNCAyOUw2IDM1IiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4='

// ========== 类型定义 (JSDoc) ==========

/**
 * @typedef {Object} WallpaperCache
 * @property {string} date  缓存日期，格式 YYYY-MM-DD
 * @property {string} newUrl  Bing 壁纸 CDN 地址
 * @property {string} oldUrl  原始壁纸地址
 */

/**
 * @typedef {Object} WallpaperUrls
 * @property {string} newUrl
 * @property {string} oldUrl
 */

// ========== 工具函数 ==========

/** 获取当日日期字符串 (YYYY-MM-DD) */
function getTodayString() {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 从 CSS backgroundImage 字符串中提取真实 URL */
function extractUrlFromStyle(bgImage) {
  if (!bgImage) return null
  const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/)
  return match ? match[1] : null
}

// ========== 缓存读写 ==========

/** @returns {WallpaperCache|null} */
function getCache() {
  const raw = localStorage.getItem(KEY_CACHE)
  if (!raw) return null
  try {
    const data = JSON.parse(raw)
    if (data.date === getTodayString()) return data
  } catch (e) {
    console.error('[BingWP] 解析壁纸缓存失败:', e)
  }
  return null
}

/**
 * @param {string} newUrl
 * @param {string} oldUrl
 */
function setCache(newUrl, oldUrl) {
  const cacheData = { date: getTodayString(), newUrl, oldUrl }
  localStorage.setItem(KEY_CACHE, JSON.stringify(cacheData))
}

// ========== DOM 查询 ==========

function getWallpaperEl() {
  return document.querySelector('.home-wallpaper .transition-wallpaper')
}

function getMaskEl() {
  return document.querySelector('.home-wallpaper .mask')
}

/**
 * 获取当前 DOM 中背景图片的真实 URL
 * @returns {string|null}
 */
function getDomWallpaperUrl() {
  const el = getWallpaperEl()
  if (!el) return null
  return extractUrlFromStyle(el.style.backgroundImage)
}

// ========== API ==========

/** @returns {Promise<string|null>} */
async function fetchBingUrl() {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      console.error('[BingWP] HTTP 错误:', response.status, response.statusText)
      return null
    }
    return response.url
  } catch (e) {
    console.error('[BingWP] 获取 Bing 壁纸失败:', e)
    return null
  }
}

// ========== 集中状态管理 ==========

const state = {
  /** @type {boolean} */
  enabled: false,

  /**
   * 标记脚本是否正在进行背景更新（用于 MutationObserver 区分内部/外部改动）
   * @type {boolean}
   */
  selfUpdating: false,

  /**
   * 本次更新期望的最终背景 URL
   * @type {string|null}
   */
  expectedUrl: null,

  /** @type {number|null} */
  _clearTimer: null,

  load() {
    this.enabled = localStorage.getItem(KEY_ENABLED) === 'true'
  },

  /** @param {boolean} value */
  setEnabled(value) {
    this.enabled = value
    localStorage.setItem(KEY_ENABLED, String(value))
  },

  /**
   * 标记进入"自我更新"状态，持续期间 MutationObserver 会忽略背景变化。
   * 覆盖整个 400ms 延迟 + 800ms transition 动画窗口（默认 1200ms）。
   * @param {string} expectedUrl  这次更新期望的最终 URL
   * @param {number} [duration=1200]
   */
  markSelfUpdating(expectedUrl, duration = 1200) {
    this.selfUpdating = true
    this.expectedUrl = expectedUrl
    if (this._clearTimer) clearTimeout(this._clearTimer)
    this._clearTimer = setTimeout(() => {
      this.selfUpdating = false
      this.expectedUrl = null
    }, duration)
  },
}

// ========== 蒙版控制 ==========

function toggleMask() {
  const el = getMaskEl()
  if (!el) {
    console.warn('[BingWP] 未找到蒙版元素')
    return
  }
  const isVisible = window.getComputedStyle(el).display !== 'none'
  if (isVisible) {
    el.style.display = 'none'
    localStorage.setItem(KEY_MASK, 'false')
    console.log('[BingWP] 蒙版已隐藏')
  } else {
    el.style.display = ''
    localStorage.setItem(KEY_MASK, 'true')
    console.log('[BingWP] 蒙版已显示')
  }
}

function initMask() {
  const el = getMaskEl()
  if (!el) return
  if (localStorage.getItem(KEY_MASK) === 'false') {
    el.style.display = 'none'
  }
}

// ========== 动画与 DOM 操作 ==========

/**
 * 对目标元素执行背景图片的淡入淡出切换
 * @param {HTMLElement} el
 * @param {string} url
 */
function applyWallpaperWithTransition(el, url) {
  el.style.transition = 'opacity 0.8s ease-in-out'
  el.style.opacity = '0'
  setTimeout(() => {
    el.style.backgroundImage = `url("${url}")`
    el.style.backgroundPosition = 'center center'
    el.style.backgroundSize = 'cover'
    el.style.opacity = '1'
  }, 400)
}

// ========== 核心业务逻辑 ==========

/**
 * 解析出应使用的壁纸 URL 对（带缓存命中检查）
 * @returns {Promise<WallpaperUrls|null>}
 */
async function resolveWallpaperUrls() {
  const cached = getCache()
  const domOldUrl = getDomWallpaperUrl()

  if (cached && cached.newUrl && cached.oldUrl && cached.oldUrl === domOldUrl) {
    console.log('[BingWP] 使用缓存的 Bing 壁纸')
    return { newUrl: cached.newUrl, oldUrl: cached.oldUrl }
  }

  const oldUrl = domOldUrl
  if (!oldUrl) {
    console.error('[BingWP] 无法获取原始壁纸 URL')
    return null
  }

  const newUrl = await fetchBingUrl()
  if (!newUrl) {
    console.error('[BingWP] 无法获取 Bing 壁纸 URL')
    return null
  }

  console.log('[BingWP] 请求新的 Bing 壁纸:', newUrl)
  setCache(newUrl, oldUrl)
  return { newUrl, oldUrl }
}

/** 开启 Bing 壁纸模式 */
async function activateBingWallpaper() {
  const el = getWallpaperEl()
  if (!el) return

  const urls = await resolveWallpaperUrls()
  if (!urls) return

  state.markSelfUpdating(urls.newUrl)
  applyWallpaperWithTransition(el, urls.newUrl)
}

/** 恢复原壁纸（关闭模式时调用） */
function deactivateBingWallpaper() {
  const el = getWallpaperEl()
  const cached = getCache()
  if (!el || !cached || !cached.oldUrl) return

  state.markSelfUpdating(cached.oldUrl)
  applyWallpaperWithTransition(el, cached.oldUrl)
}

/**
 * 强制关闭 Bing 壁纸模式并恢复原壁纸
 * 用于外部背景被改动时的自动回退
 */
function disableBingMode() {
  if (!state.enabled) return
  state.setEnabled(false)
  deactivateBingWallpaper()
  updateButtonUI()
  console.log('[BingWP] 外部背景已改动，已自动关闭 Bing 壁纸模式')
}

// ========== 切换按钮 UI ==========

const BTN_ENABLED_CLASSES = ['opacity-100', 'bg-[rgba(0,0,0,0.15)]']
const BTN_DISABLED_CLASSES = [
  'opacity-0',
  'hover:opacity-100',
  'hover:bg-[rgba(0,0,0,0.15)]',
  'backdrop-blur-[20px]',
  'backdrop-saturate-150',
]

/** @type {HTMLButtonElement|null} */
let buttonEl = null

function updateButtonUI() {
  if (!buttonEl) return
  if (state.enabled) {
    buttonEl.classList.remove(...BTN_DISABLED_CLASSES)
    buttonEl.classList.add(...BTN_ENABLED_CLASSES)
  } else {
    buttonEl.classList.remove(...BTN_ENABLED_CLASSES)
    buttonEl.classList.add(...BTN_DISABLED_CLASSES)
  }
}

function createToggleButton() {
  if (document.getElementById('bing-wallpaper-toggle')) return
  if (buttonEl) return

  console.log('[BingWP] 创建切换按钮')

  const btn = document.createElement('button')
  btn.id = 'bing-wallpaper-toggle'
  btn.type = 'button'
  btn.setAttribute('aria-label', '切换 Bing 壁纸')
  btn.className = [
    'absolute left-[20px] top-[20px]',
    'h-[36px] w-[36px]',
    'cursor-pointer rounded-[8px] p-[4px]',
    'text-[rgba(255,255,255,0.6)]',
    'hover:text-[rgba(255,255,255,1)]',
    'transition-all',
  ].join(' ')

  const icon = document.createElement('span')
  icon.className = 'block h-full w-full'
  icon.style.cssText = `
    background-color: currentColor;
    mask-image: url("${ICON_PICTURE}");
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: contain;
    -webkit-mask-image: url("${ICON_PICTURE}");
    -webkit-mask-position: center;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-size: contain;
  `

  btn.appendChild(icon)

  btn.addEventListener('click', () => {
    state.setEnabled(!state.enabled)
    updateButtonUI()
    if (state.enabled) {
      activateBingWallpaper()
    } else {
      deactivateBingWallpaper()
    }
  })

  btn.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    toggleMask()
  })

  document.body.appendChild(btn)
  buttonEl = btn
}

// ========== 背景变化监听（新功能：外部改动自动关闭） ==========

/**
 * 监听 wallpaper 元素的 style 属性变化。
 * 当检测到非脚本自身引发的 backgroundImage 变化时，若 Bing 模式当前为开启状态，则自动关闭。
 *
 * @returns {MutationObserver|null}
 */
function watchBackgroundChange() {
  const el = getWallpaperEl()
  if (!el) return null

  const observer = new MutationObserver((mutations) => {
    // 1. 如果脚本正在自我更新，忽略所有变化（此时 backgroundImage 的改变是我们自己触发的）
    if (state.selfUpdating) return

    for (const mutation of mutations) {
      if (mutation.type !== 'attributes' || mutation.attributeName !== 'style')
        continue

      const currentUrl = getDomWallpaperUrl()
      if (!currentUrl) continue

      // 2. Bing 开启状态下，背景变成了非期望 URL，判定为外部改动
      if (state.enabled && currentUrl !== state.expectedUrl) {
        console.log('[BingWP] 检测到外部改动背景 URL:', currentUrl)
        disableBingMode()
        break // 一次批量 mutation 只需处理一次
      }
    }
  })

  observer.observe(el, {
    attributes: true,
    attributeFilter: ['style'],
  })

  return observer
}

// ========== 初始化 ==========

function init() {
  state.load()
  initMask()

  // 等待 wallpaper DOM 出现
  const domObserver = new MutationObserver(() => {
    const wallpaperEl = getWallpaperEl()
    if (!wallpaperEl) return

    createToggleButton()
    watchBackgroundChange()

    if (state.enabled) {
      activateBingWallpaper()
    }

    console.log('[BingWP] 初始化完成')
    domObserver.disconnect()
  })

  domObserver.observe(document.body, { childList: true, subtree: true })
}

init()
