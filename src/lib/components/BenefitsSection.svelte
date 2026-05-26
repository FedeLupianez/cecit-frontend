<script>
  /*
  ==========================================
  IMPORTS
  ==========================================
  */

  import BenefitCard from './BenefitCard.svelte';
  import { benefits } from '$lib/data/benefits';

  import {
    ChevronLeft,
    ChevronRight
  } from 'lucide-svelte';

  let { title = 'Beneficios populares' } = $props();

  /*
  ==========================================
  FILTROS
  ==========================================
  */

  const filters = [
    'Todo',
    'Comida',
    'Ropa',
    'Juguetes',
    'Libreria'
  ];

  let activeFilter = $state('Todo');

  /*
  ==========================================
  CARRUSEL
  ==========================================
  */

  let carousel = $state(/** @type {HTMLDivElement | null} */ (null));

  function closeBenefitOverlays() {
    window.dispatchEvent(new CustomEvent('close-benefit-overlays'));
  }

  function next() {
    if (!carousel) return;

    closeBenefitOverlays();

    carousel.scrollBy({
      left: 480,
      behavior: 'smooth'
    });
  }

  function prev() {
    if (!carousel) return;

    closeBenefitOverlays();

    carousel.scrollBy({
      left: -480,
      behavior: 'smooth'
    });
  }
</script>

<section class="section">

  <div class="top">

    <div class="title-group">

      <h2>{title}</h2>

      <button class="more-btn">
        Ver más
      </button>

    </div>

  </div>

  <div class="filters">

    {#each filters as filter}

      <button
        class:active={activeFilter === filter}
        onclick={() => activeFilter = filter}
      >
        {filter}
      </button>

    {/each}

  </div>

  <div class="carousel-wrapper">

    <button
      type="button"
      class="arrow left"
      onclick={prev}
      aria-label="Ver beneficios anteriores"
    >
      <ChevronLeft size={24} />
    </button>

    <div class="carousel" bind:this={carousel}>

      {#each benefits as benefit}

        <div class="card-wrapper">
          <BenefitCard {...benefit} />
        </div>

      {/each}

    </div>

    <button
      type="button"
      class="arrow right"
      onclick={next}
      aria-label="Ver más beneficios"
    >
      <ChevronRight size={24} />
    </button>

  </div>

</section>

<style>
  /*
  ==========================================
  VARIABLES
  ==========================================
  */

  :root {
    --primary: #19194f;
    --primary-light: #2b2b88;

    --shadow:
      0 10px 24px rgba(0,0,0,0.18);
  }

  /*
  ==========================================
  SECTION
  ==========================================
  */

  .section {
    width: 100%;
    max-width: 1205px;

    margin: auto;
    margin-top: 62px;

    overflow: visible;
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /*
  ==========================================
  TITULOS
  ==========================================
  */

  h2 {
    margin: 0;

    font-size: 25px;
    font-weight: 800;
    line-height: 1;

    font-family: 'Montserrat', sans-serif;

    color: #050505;
  }

  .more-btn {
    padding: 0;

    border: none;
    background: transparent;
    color: #050505;

    font-size: 11px;
    font-weight: 800;
    line-height: 1;

    cursor: pointer;

    transition:
      transform 0.3s ease,
      color 0.3s ease;
  }

  .more-btn:hover {
    transform: translateX(4px);

    color: var(--primary);
  }

  /*
  ==========================================
  FILTROS
  ==========================================
  */

  .filters {
    margin-top: 11px;

    display: flex;
    gap: 9px;

    flex-wrap: wrap;
  }

  .filters button {
    width: 111px;
    height: 32px;

    padding: 0 18px;

    border-radius: 999px;

    border: 1px solid #c7c8cf;

    background: transparent;
    color: #050505;

    font-size: 15px;
    font-weight: 700;

    cursor: pointer;

    transition:
      background 0.3s ease,
      color 0.3s ease,
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .filters button:hover {
    transform: translateY(-2px);

    box-shadow: none;
  }

  .filters button.active {
    background: #151535;

    color: white;

    border-color: transparent;

    box-shadow: none;

    transform: translateY(-2px);
  }

  /*
  ==========================================
  CARRUSEL
  ==========================================
  */
/*
==========================================
CARRUSEL
==========================================
*/

.carousel-wrapper {
  margin-top: 26px;
  margin-left: -60px;

  position: relative;

  width: calc(100% + 120px);
}

.carousel {
  display: flex;
  gap: 26px;

  overflow-x: clip;
  overflow-y: visible;

  scroll-behavior: smooth;

  margin: 0 60px;
  padding: 0 22px 8px 0;

  mask-image: none;
  -webkit-mask-image: none;
}

.card-wrapper {
  position: relative;

  min-width: 455px;
  max-width: 455px;

  flex-shrink: 0;

  transition: z-index 0.2s ease;
}

.card-wrapper:hover {
  z-index: 100;
}

  /*
  ==========================================
  FLECHAS
  ==========================================
  */

  .arrow {
    position: absolute;
    top: 50%;

    transform: translateY(-50%);

    width: 42px;
    height: 42px;

    border-radius: 50%;
    border: none;

    background: #e1e3e8;
    color: #4a4d55;

    box-shadow: none;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    z-index: 30;

    transition:
      transform 0.25s ease,
      background 0.25s ease;
  }

  .arrow:hover {
    transform:
      translateY(-50%)
      scale(1.08);

    background: #d6d9e0;
  }

  .left {
    left: 0;
  }

  .right {
    right: 0;
  }

  /*
  ==========================================
  RESPONSIVE
  ==========================================
  */

  @media (max-width: 768px) {

    .section {
      padding: 0 12px;
    }

    .carousel-wrapper {
      margin-left: 0;
      width: 100%;
    }

    h2 {
      font-size: 24px;
    }

    .filters {
      gap: 8px;
    }

    .filters button {
      width: auto;
      min-width: 92px;
      height: 34px;

      padding: 0 18px;

      font-size: 15px;
    }

    .carousel {
      gap: 16px;
      margin: 0 38px;
      padding-right: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .carousel::-webkit-scrollbar {
      display: none;
    }

    .card-wrapper {
      min-width: 92%;
      max-width: 92%;
    }

    .arrow {
      width: 44px;
      height: 44px;
    }

    .left {
      left: 0;
    }

    .right {
      right: 0;
    }
  }
</style>
