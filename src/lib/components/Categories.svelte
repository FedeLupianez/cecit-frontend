<script>
  /*
  ==========================================
  CONFIGURACIÓN
  ==========================================
  */

  const ITEM_SCROLL = 100;
  const RESET_DELAY = 400;

  /*
  ==========================================
  IMPORTS
  ==========================================
  */

  import './Categories.css';

  import { categories } from '$lib/data/categories';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  /*
  ==========================================
  VARIABLES
  ==========================================
  */

  let carousel;

  /*
  ==========================================
  FUNCIONES
  ==========================================
  */

  function next() {
    carousel.scrollBy({
      left: ITEM_SCROLL,
      behavior: 'smooth'
    });

    setTimeout(() => {
      if (
        carousel.scrollLeft >=
        carousel.scrollWidth / 2
      ) {
        carousel.scrollLeft = 0;
      }
    }, RESET_DELAY);
  }

  function prev() {
    if (carousel.scrollLeft <= 0) {
      carousel.scrollLeft = carousel.scrollWidth / 2;
    }

    carousel.scrollBy({
      left: -ITEM_SCROLL,
      behavior: 'smooth'
    });
  }
</script>

<section class="categories">

  <h2>Explorar cupones por categoría</h2>

  <div class="container">

    <button type="button" class="arrow" onclick={prev}>
      <ChevronLeft size={24} />
    </button>

    <div class="carousel" bind:this={carousel}>

      {#each [...categories, ...categories] as category}

        <div class="category-wrapper">

          <button class="category-btn">
            <category.icon size={28} />
          </button>

          <span class="tooltip">
            {category.name}
          </span>

        </div>

      {/each}

    </div>

    <button type="button" class="arrow" onclick={next}>
      <ChevronRight size={24} />
    </button>

  </div>

  <div class="quick-actions">

    <div class="action-card">
      <span class="sparkle sparkle-1">✦</span>

      <h3>Hacete socio</h3>
    </div>

    <div class="action-card featured">
      <span class="sparkle sparkle-2">✦</span>
      <span class="sparkle sparkle-3">✦</span>

      <h3>Todos los beneficios</h3>
    </div>

    <div class="action-card">
      <span class="sparkle sparkle-4">✦</span>

      <h3>Nuestros socios</h3>
    </div>

  </div>

</section>