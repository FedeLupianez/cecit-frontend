<script>
  /*
  ==========================================
  IMPORTS
  ==========================================
  */

  import './Categories.css';

  import { onMount } from 'svelte';
  import { categories } from '$lib/data/categories';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  const LOOP_COPIES = 33;
  const START_COPY = 16;
  const RECYCLE_DISTANCE = 12;

  const loopCategories = Array.from(
    { length: LOOP_COPIES },
    () => categories
  ).flat();

  const SCROLL_AMOUNT = 288;

  let carousel = $state(/** @type {HTMLDivElement | null} */ (null));

  onMount(() => {
    if (!carousel) return;

    const sectionWidth = carousel.scrollWidth / LOOP_COPIES;

    carousel.scrollLeft = sectionWidth * START_COPY;
  });

  function keepInfiniteLoop() {
    if (!carousel) return;

    const sectionWidth = carousel.scrollWidth / LOOP_COPIES;

    if (carousel.scrollLeft < sectionWidth * 6) {
      carousel.scrollLeft += sectionWidth * RECYCLE_DISTANCE;
    }

    if (carousel.scrollLeft > sectionWidth * (LOOP_COPIES - 7)) {
      carousel.scrollLeft -= sectionWidth * RECYCLE_DISTANCE;
    }
  }

  /**
   * @param {-1 | 1} direction
   */
  function moveCategories(direction) {
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * SCROLL_AMOUNT,
      behavior: 'smooth'
    });

    setTimeout(keepInfiniteLoop, 420);
  }

  /*
  ==========================================
  FUNCIONES
  ==========================================
  */

  function next() {
    moveCategories(1);
  }

  function prev() {
    moveCategories(-1);
  }
</script>

<section class="categories">

  <h2>Explorar cupones por categoría</h2>

  <div class="container">

    <button type="button" class="category-arrow" onclick={prev} aria-label="Ver categorías anteriores">
      <ChevronLeft size={24} />
    </button>

    <div
      class="category-carousel"
      bind:this={carousel}
    >
      <div class="category-track">

        {#each loopCategories as category}

          <div class="category-wrapper">

            <button class="category-btn">
              <category.icon size={28} />
            </button>

            <span class="category-name">
              {category.name}
            </span>

            <span class="tooltip">
              {category.name}
            </span>

          </div>

        {/each}

      </div>
    </div>

    <button type="button" class="category-arrow" onclick={next} aria-label="Ver más categorías">
      <ChevronRight size={24} />
    </button>

  </div>

</section>
