<script>
  import { onMount } from 'svelte';
  import { X } from 'lucide-svelte';
  import favicon from '$lib/assets/favicon.svg';

  let { title, image, business } = $props();

  let isExpanded = $state(false);
  let openTimer = /** @type {ReturnType<typeof setTimeout> | null} */ (null);

  function clearOpenTimer() {
    if (!openTimer) return;

    clearTimeout(openTimer);
    openTimer = null;
  }

  function scheduleExpanded() {
    clearOpenTimer();

    openTimer = setTimeout(() => {
      isExpanded = true;
      openTimer = null;
    }, 1000);
  }

  function openExpandedNow() {
    clearOpenTimer();
    isExpanded = true;
  }

  function closeExpanded() {
    clearOpenTimer();
    isExpanded = false;
  }

  onMount(() => {
    window.addEventListener('close-benefit-overlays', closeExpanded);

    return () => {
      window.removeEventListener('close-benefit-overlays', closeExpanded);
    };
  });
</script>

<div class="card">
  <div
    class="compact-card"
    role="button"
    tabindex="0"
    onmouseenter={scheduleExpanded}
    onmouseleave={clearOpenTimer}
    onfocusin={openExpandedNow}
    onkeydown={(event) => (event.key === 'Enter' || event.key === ' ') && openExpandedNow()}
  >
    <img src={image} alt={title} />

    <div class="content">
      <div class="title-row">
        <h2>{title}</h2>

        <button class="info-btn">Más información</button>
      </div>

      <div class="bottom">
        <div class="business">
          <img src={favicon} alt="" />
          <p>{business}</p>
        </div>

        <button class="coupon-btn">Adquirir cupón</button>
      </div>
    </div>
  </div>

  <div
    class:visible={isExpanded}
    class="expanded-backdrop"
    role="presentation"
    onkeydown={(event) => event.key === 'Escape' && closeExpanded()}
  >
    <div
      class="expanded-card"
      role="dialog"
      aria-label={title}
      tabindex="-1"
      onmouseleave={closeExpanded}
    >
      <button
        class="close-btn"
        type="button"
        aria-label="Cerrar"
        onclick={closeExpanded}
      >
        <X size={22} />
      </button>

      <div class="expanded-info">
        <h3>{title}</h3>
        <p>{business}</p>

        <button class="coupon-btn">Adquirir cupón</button>
      </div>

      <div class="expanded-preview">
        <img src={image} alt={title} />
      </div>
    </div>
  </div>
</div>

<style>
  .card {
    position: relative;
    z-index: 1;

    background: #f4f5f7;
    border: 1px solid #2b2b2b;
    border-radius: 0;
    overflow: visible;

    box-shadow: none;

    transition:
      box-shadow 0.25s ease;
  }

  .card:hover,
  .card:focus-within {
    z-index: 100;
  }

  .compact-card {
    overflow: hidden;
  }

  .compact-card > img {
    width: 100%;
    height: 174px;
    object-fit: cover;

    display: block;
  }

  .content {
    padding: 8px 10px 14px;
  }

  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  h2 {
    margin: 0;
    color: #050505;

    font-size: 25px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: 0;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bottom {
    margin-top: 8px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .business {
    min-width: 0;

    display: flex;
    align-items: center;
    gap: 9px;
  }

  .business img {
    width: 24px;
    height: 24px;

    flex: 0 0 auto;
    object-fit: contain;
  }

  p {
    margin: 0;

    color: #151535;

    font-size: 16px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.3px;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button {
    border: none;
    font-family: inherit;
    cursor: pointer;
  }

  .info-btn {
    min-width: max-content;

    padding: 6px 13px;

    border: 1px solid #c4c7cf;
    border-radius: 999px;

    background: transparent;
    color: #8a8d95;

    font-size: 14px;
    font-weight: 500;
  }

  .coupon-btn {
    min-width: max-content;

    background: #19194f;
    color: white;

    border-radius: 999px;

    padding: 8px 18px;

    font-size: 14px;
    font-weight: 500;
  }

  .expanded-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;

    padding: 42px;

    background: rgba(238,240,243,0.72);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

    display: flex;
    align-items: center;
    justify-content: center;

    opacity: 0;
    visibility: hidden;
    pointer-events: none;

    transition:
      opacity 0.18s ease,
      visibility 0.18s ease;
  }

  .expanded-backdrop.visible {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .expanded-card {
    width: min(980px, calc(100vw - 84px));
    height: min(560px, calc(100vh - 84px));

    background: #f4f5f7;
    border: 1px solid #7f8188;

    display: grid;
    grid-template-columns: 1.08fr 1fr;

    transform: translateY(12px) scale(0.985);
    transition: transform 0.18s ease;

    position: relative;
  }

  .expanded-backdrop.visible .expanded-card {
    transform: translateY(0) scale(1);
  }

  .close-btn {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 2;

    width: 42px;
    height: 42px;

    border: 1px solid #c7c9cf;
    border-radius: 50%;

    background: rgba(244,245,247,0.9);
    color: #151535;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .expanded-info {
    min-width: 0;
    padding: 54px 48px 38px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .expanded-info h3 {
    max-width: 430px;
    margin: 0;

    color: #050505;

    font-size: 50px;
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .expanded-info p {
    margin-top: 12px;

    color: #050505;

    font-size: 14px;
    font-weight: 900;
  }

  .expanded-info .coupon-btn {
    margin-top: auto;
    width: auto;
    padding: 10px 26px;
  }

  .expanded-preview {
    border-left: 1px solid #7f8188;
    background: #f4f5f7;
  }

  .expanded-preview img {
    width: 100%;
    height: 100%;

    display: block;
    object-fit: cover;
  }

  @media (max-width: 640px) {
    .card {
      background: #fff;
    }

    .compact-card > img {
      height: 145px;
    }

    .content {
      padding: 10px 12px 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .title-row {
      display: contents;
    }

    h2 {
      order: 1;
      width: 100%;
      max-width: 100%;
      font-size: 20px;
      line-height: 1.05;
      white-space: nowrap;
    }

    .bottom {
      display: contents;
    }

    .business {
      order: 2;
      width: 100%;
    }

    p {
      font-size: 15px;
    }

    .info-btn {
      order: 3;
    }

    .info-btn,
    .coupon-btn {
      width: auto;
      min-width: 0;
      padding: 8px 13px;
      font-size: 13px;
    }

    .coupon-btn {
      order: 4;
      margin-left: auto;
    }

    .expanded-backdrop {
      display: none;
    }
  }
</style>
