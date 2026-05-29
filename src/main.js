import './style.css'

const base = import.meta.env.BASE_URL
const playerUrl = `${base}emulator/index.html?disk_filename=prunelda.atr`

document.querySelector('#app').innerHTML = `
  <main class="page-shell">
    <section class="hero-panel">
      <div class="eyebrow">Atari 8-bit web edition</div>
      <h1>Aunt Prunelda's Inheritance</h1>
      <p class="lede">
        The original Atari disk image is now playable in the browser from this site,
        wrapped in a responsive shell and deployable to the same subfolder hosting model as Nightcrossing.
      </p>
      <div class="hero-actions">
        <a class="button-primary" href="${playerUrl}" target="_blank" rel="noreferrer">Open full player</a>
        <button class="button-secondary" id="reload-player" type="button">Restart embedded player</button>
      </div>
      <dl class="facts-grid">
        <div>
          <dt>Source image</dt>
          <dd>Bundled from the original .atr in this repo</dd>
        </div>
        <div>
          <dt>Emulator</dt>
          <dd>jsA8E adapted from AtariOnline</dd>
        </div>
        <div>
          <dt>Hosting</dt>
          <dd>Built for /prunelda/ subfolder deployment</dd>
        </div>
      </dl>
    </section>

    <section class="player-panel">
      <div class="player-frame">
        <iframe
          id="prunelda-player"
          title="Aunt Prunelda's Inheritance"
          src="${playerUrl}"
          allow="fullscreen; gamepad; autoplay"
        ></iframe>
      </div>
      <div class="player-notes">
        <article>
          <h2>How to play</h2>
          <p>Click or tap inside the game screen first. The emulator listens for keyboard input inside the embedded Atari session.</p>
        </article>
        <article>
          <h2>Console keys</h2>
          <p>F1-F5 map to Atari console controls including Help, Option, Select, Start, and Reset.</p>
        </article>
        <article>
          <h2>Best on mobile</h2>
          <p>Use the full player button for the largest possible viewport. If your browser shows a software keyboard, keep the canvas focused while entering text.</p>
        </article>
      </div>
    </section>

    <section class="provenance-panel">
      <div>
        <h2>About this build</h2>
        <p>
          This first implementation keeps the original Atari experience intact rather than rewriting the game logic.
          The browser player and runtime assets are hosted locally so production deploys remain static and GitHub Actions friendly.
        </p>
      </div>
      <div>
        <h2>Credits</h2>
        <p>
          jsA8E is credited in the player page to Sascha Springer, with the browser packaging adapted from the AtariOnline project by eahumada.
        </p>
      </div>
    </section>
  </main>
`

document.querySelector('#reload-player')?.addEventListener('click', () => {
  const frame = document.querySelector('#prunelda-player')
  if (!(frame instanceof HTMLIFrameElement)) {
    return
  }

  frame.src = playerUrl
})
