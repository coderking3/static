/**
 * OgImage.tsx
 *
 * 用法：
 *   1. 在 Vite 项目中新建一个路由 /og-preview，只渲染此组件
 *   2. 确保已安装依赖：
 *        npm install lucide-react
 *        npm install -D tailwindcss @tailwindcss/vite
 *   3. tailwind.config 中开启任意值支持（默认已支持）
 *   4. 用 puppeteer 对 /og-preview 截图 1200×630
 *
 * 尺寸: 1200 × 630
 * 色彩: 完全对齐 king3.me 设计系统
 *   --background : #0d0f11
 *   --foreground : #e3e6e8
 *   --brand      : #809fff
 *   --muted-fg   : #82878c
 *   --border     : #272b2e
 *   --secondary  : #1a1c1f
 *   --sidebar    : #14181a
 *
 * 截图脚本见底部注释。
 */

// ─── 设计 token（与网站 CSS 变量对齐）────────────────────────────────
const C = {
  bg: '#0d0f11',
  fg: '#e3e6e8',
  brand: '#809fff',
  muted: '#82878c',
  border: '#272b2e',
  secondary: '#1a1c1f',
  sidebar: '#14181a',
} as const

// ─── GitHub 图标 ─────────────────────────────────────────────────────
function GitHubIcon({
  size = 16,
  color = C.muted,
}: {
  size?: number
  color?: string
}) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill={color}
      width={size}
      height={size}
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
    </svg>
  )
}

// ─── 自定义品牌 Logo ─────────────────────────────────────────────────
function BrandLogo({
  size = 144,
  color = C.brand,
  glowColor = C.brand,
}: {
  size?: number
  color?: string
  glowColor?: string
}) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      style={{ color, filter: `drop-shadow(0 0 32px ${glowColor}80)` }}
    >
      <path
        d='M7.5 12H16.5'
        stroke='#e3e6e8'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M3.25499 3.25H3.66807L11.3418 17.7214L12.0044 18.9709L12.667 17.7214L20.3408 3.25H20.754H22.0006L21.4166 4.35136L12.7208 20.75H11.2881L2.59238 4.35136L2.00836 3.25H3.25499Z'
        fill='#ffffff'
        stroke='#ffffff'
        strokeWidth='0.4'
        strokeLinejoin='round'
        strokeLinecap='round'
      />

      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.2882 3.25L2.59238 19.6487L2.00836 20.7501H3.25499H3.66804L11.3418 6.27864L12.0044 5.02909L12.667 6.27864L20.3408 20.7501H20.754H22.0006L21.4166 19.6487L12.7208 3.25H11.2882Z'
        fill='#ffffff'
        stroke='#ffffff'
        strokeWidth='0.4'
        strokeLinejoin='round'
        strokeLinecap='round'
      />
    </svg>
  )
}

// ─── 闪烁光标（brand 色）────────────────────────────────────────────
function Cursor() {
  return (
    <span
      className='inline-block shrink-0'
      style={{
        marginTop: -3,
        marginLeft: -3,
        color: C.brand,
        borderRadius: '2px',
        letterSpacing: -2.5,
        opacity: 0.85,
        // fontSize: 18,
      }}
    >
      ❯_
    </span>

    // <span
    //   className='inline-block shrink-0'
    //   style={{
    //     width: '10px',
    //     height: '20px',
    //     // marginLeft: 8,
    //     background: C.brand,
    //     borderRadius: '2px',
    //     opacity: 0.85,
    //   }}
    // />
  )
}

// ─── Tag 标签 ────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '17px',
        fontWeight: 400,
        color: C.brand,
        background: `${C.brand}14`,
        border: `1px solid ${C.brand}38`,
        padding: '2px 12px',
        borderRadius: '6px',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
    // <span
    //   style={{
    //     fontFamily: "'JetBrains Mono', monospace",
    //     fontSize: '17px',
    //     fontWeight: 400,
    //     color: C.brand,
    //     background: `${C.brand}14`,
    //     border: `1px solid ${C.brand}38`,
    //     padding: '2px 12px',
    //     borderRadius: '6px',
    //     letterSpacing: '0.02em',
    //     whiteSpace: 'nowrap',
    //   }}
    // >
    //   {children}
    // </span>
  )
}

// ─── 主组件 ─────────────────────────────────────────────────────────
export default function OgImage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;700;900&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* 画布：固定 1200 × 630 */}
      <div
        className='relative w-[1200px] h-[630px] overflow-hidden flex items-center justify-between'
        style={{
          background: C.bg,
          padding: '0 90px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* ── L1 点阵底纹 ── */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            maskImage:
              'radial-gradient(ellipse 100% 100% at 50% 50%, black 20%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 100% 100% at 50% 50%, black 20%, transparent 100%)',
          }}
        />

        {/* ── L2 左上 brand 光晕 ── */}
        <div
          className='absolute pointer-events-none'
          style={{
            top: '-180px',
            left: '-140px',
            width: '700px',
            height: '700px',
            background: `radial-gradient(circle, ${C.brand}17 0%, transparent 60%)`,
          }}
        />

        {/* ── L3 右侧呼应光晕 ── */}
        <div
          className='absolute pointer-events-none'
          style={{
            top: '50%',
            right: '60px',
            transform: 'translateY(-50%)',
            width: '440px',
            height: '440px',
            background: `radial-gradient(circle, ${C.brand}0f 0%, transparent 60%)`,
          }}
        />

        {/* ── L4 暗角 ── */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              'radial-gradient(ellipse 88% 88% at 24% 50%, transparent 28%, rgba(0,0,0,0.58) 100%)',
          }}
        />

        {/* ── L5 顶部 border 线 ── */}
        <div
          className='absolute top-0 left-0 right-0 pointer-events-none'
          style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${C.border} 20%, ${C.border} 80%, transparent)`,
          }}
        />

        {/* ── L6 底部 brand 线 ── */}
        <div
          className='absolute bottom-0 left-0 right-0 pointer-events-none'
          style={{
            height: '1px',
            background: `linear-gradient(90deg, transparent 5%, ${C.brand}70 35%, ${C.brand}70 65%, transparent 95%)`,
          }}
        />

        {/* ════════════ 左侧主内容 ════════════ */}
        <div
          className='relative z-10 flex flex-col mt-2'
          style={{ gap: '26px', maxWidth: '57%' }}
        >
          <div className='flex gap-6'>
            {/* 头像 — 三层结构 */}
            <div className='relative' style={{ width: 'fit-content' }}>
              {/* 外层漫射光晕 */}
              <div
                className='absolute rounded-full pointer-events-none'
                style={{
                  inset: '-12px',
                  background: `radial-gradient(circle, ${C.brand}30 0%, transparent 68%)`,
                }}
              />
              {/* 虚线装饰环（brand 色） */}
              <div
                className='absolute rounded-full pointer-events-none'
                style={{
                  inset: '-4px',
                  border: `1px dashed ${C.brand}55`,
                }}
              />
              {/* 头像本体 */}
              <img
                src='/avatar.png'
                alt='King3'
                className='relative z-10 rounded-full object-cover block'
                style={{
                  width: '80px',
                  height: '80px',
                  border: `2px solid ${C.brand}66`,
                  background: C.secondary,
                }}
              />
            </div>

            {/* 姓名 */}
            <h1
              className='m-0 leading-none'
              style={{
                fontFamily: 'Audiowide, sans-serif',
                fontSize: '80px',
                fontWeight: 900,
                color: C.fg,
                letterSpacing: '-0.033em',
              }}
            >
              King3
            </h1>
          </div>

          {/* Tagline — monospace + brand 光标 */}
          {/* <p
            className='m-0 flex items-center'
            style={{
              fontFamily: "'PingFang SC', monospace",
              fontSize: '22px',
              fontWeight: 400,
              color: C.muted,
              gap: '12px',
            }}
          >
            <Cursor />
            前端开发 · 细节控 · 慢生活
          </p> */}
          {/* Developer · Meticulous · SlowLife */}

          {/* Hashtags（网站真实标签） */}
          <div className='flex items-center mt-2' style={{ gap: '6px' }}>
            <Tag>#Developer</Tag>
            <Tag>#Meticulous</Tag>
            <Tag>#SlowLife</Tag>
          </div>

          {/* Org 行 */}
          <div className='flex items-center' style={{ gap: '10px' }}>
            <GitHubIcon size={18} color={C.muted} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '18px',
                color: C.muted,
              }}
            >
              OpenKnights
            </span>
          </div>
        </div>

        {/* ── 中间分割线（用真实 border 色） ── */}
        <div
          className='absolute z-10 pointer-events-none'
          style={{
            left: '50%',
            top: '12%',
            bottom: '12%',
            width: '1px',
            background: `linear-gradient(to bottom, transparent, ${C.border} 20%, ${C.border} 80%, transparent)`,
          }}
        />

        {/* ════════════ 右侧 Logo 区 ════════════ */}
        <div
          className='relative z-10 flex items-center justify-center shrink-0 mr-12'
          style={{ width: '296px', height: '296px' }}
        >
          {/* 底板：sidebar 色 + border */}
          <div
            className='absolute rounded-[36px] pointer-events-none'
            style={{
              inset: 0,
              background: C.sidebar,
              border: `1px solid ${C.border}`,
            }}
          />

          {/* 内圈 brand 光晕 */}
          <div
            className='absolute rounded-full pointer-events-none'
            style={{
              inset: '48px',
              background: `radial-gradient(circle, ${C.brand}28 0%, transparent 70%)`,
            }}
          />

          {/* Logo 本体（brand 色 + 发光） */}
          <BrandLogo size={148} color={'#809fff'} glowColor={'#809fff'} />

          {/* 四角装饰点（对角两个亮 brand，另两个用 border 色） */}
          {[
            { style: { top: '16px', left: '16px' }, accent: true },
            { style: { top: '16px', right: '16px' }, accent: false },
            { style: { bottom: '16px', left: '16px' }, accent: false },
            { style: { bottom: '16px', right: '16px' }, accent: true },
          ].map(({ style, accent }, i) => (
            <div
              key={i}
              className='absolute pointer-events-none'
              style={{
                ...style,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: accent ? `${C.brand}66` : C.border,
              }}
            />
          ))}
        </div>

        {/* ── 左下 句子 ── */}
        <div
          className='absolute z-20 flex items-center'
          style={{ bottom: '28px', left: '90px' }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '15px',
              letterSpacing: '0.08em',
              color: C.muted,
            }}
          >
            Less code, more life.
          </span>
        </div>

        {/* ── 右下 badge ── */}
        <div
          className='absolute z-20 flex items-center'
          style={{ bottom: '28px', right: '90px', gap: '8px' }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: C.brand,
              opacity: 0.65,
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '15px',
              letterSpacing: '0.08em',
              color: C.muted,
            }}
          >
            king3.me
          </span>
        </div>
      </div>
    </>
  )
}

/*
─────────────────────────────────────────────────────────────────
  Puppeteer 截图脚本  scripts/gen-og.ts
─────────────────────────────────────────────────────────────────

  依赖: npm install -D puppeteer

  import puppeteer from 'puppeteer'

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // @2x 物理像素，输出 2400×1350，质量更高
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })

  // 确保 Vite dev server 已启动（npm run dev）
  await page.goto('http://localhost:5173/og-preview', { waitUntil: 'networkidle0' })

  // 等待字体加载完毕
  await page.evaluateHandle('document.fonts.ready')

  await page.screenshot({
    path: 'public/opengraph-image.png',
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  })

  await browser.close()
  console.log('✅ opengraph-image.png generated')

*/
