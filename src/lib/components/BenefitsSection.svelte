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

  let activeFilter = 'Todo';

  /*
  ==========================================
  CARRUSEL
  ==========================================
  */

  let carousel;

  function next() {
    carousel.scrollBy({
      left: 390,
      behavior: 'smooth'
    });
  }

  function prev() {
    carousel.scrollBy({
      left: -390,
      behavior: 'smooth'
    });
  }
</script>

<section class="section">

  <div class="top">

    <div class="title-group">

      <h2>Beneficios populares</h2>

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
    max-width: 1250px;

    margin: auto;
    margin-top: 70px;

    overflow: hidden;
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
    font-size: 42px;
    font-weight: 700;

    font-family: 'Montserrat', sans-serif;

    color: #111827;
  }

  .more-btn {
    border: none;
    background: transparent;

    font-size: 18px;
    font-weight: 600;

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
    margin-top: 24px;

    display: flex;
    gap: 15px;

    flex-wrap: wrap;
  }

  .filters button {
    height: 52px;

    padding: 0 35px;

    border-radius: 4px;

    border: 1px solid #d1d5db;

    background: white;

    font-size: 18px;
    font-weight: 600;

    cursor: pointer;

    transition:
      background 0.3s ease,
      color 0.3s ease,
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .filters button:hover {
    transform: translateY(-2px);

    box-shadow:
      0 8px 18px rgba(0,0,0,0.08);
  }

  .filters button.active {
    background: linear-gradient(
      145deg,
      #2b2b88,
      #19194f
    );

    color: white;

    border-color: transparent;

    box-shadow:
      0 12px 24px rgba(25,25,79,0.28);

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
  margin-top: 35px;

  position: relative;

  width: 100%;
}

.carousel {
  display: flex;
  gap: 24px;

  overflow-x: hidden;

  scroll-behavior: smooth;

  padding: 10px 60px 20px;
}

.card-wrapper {
  min-width: 520px;
  max-width: 520px;

  flex-shrink: 0;

  transition:
    transform 0.35s ease,
    filter 0.35s ease;
}

.card-wrapper:hover {
  transform: translateY(-6px);
}

  /*
  ==========================================
  FLECHAS
  ==========================================
  */

  .arrow {
    position: absolute;
    top: 42%;

    transform: translateY(-50%);

    width: 54px;
    height: 54px;

    border-radius: 50%;
    border: none;

    background: var(--primary);
    color: white;

    box-shadow: var(--shadow);

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    z-index: 20;

    transition:
      transform 0.25s ease,
      background 0.25s ease;
  }

  .arrow:hover {
    transform:
      translateY(-50%)
      scale(1.08);

    background: var(--primary-light);
  }

  .left {
    left: 10px;
  }

  .right {
    right: 10px;
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

    h2 {
      font-size: 30px;
    }

    .filters {
      gap: 10px;
    }

    .filters button {
      height: 42px;

      padding: 0 22px;

      font-size: 15px;
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