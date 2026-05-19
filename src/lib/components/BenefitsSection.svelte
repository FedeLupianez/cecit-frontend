<script>
  import BenefitCard from './BenefitCard.svelte';
  import { benefits } from '$lib/data/benefits';
</script>

<section class="section">
  <div class="top">
    <h2>Beneficios populares</h2>

    <button>Ver más</button>
  </div>

  <div class="grid">
    {#each benefits as benefit}
      <BenefitCard {...benefit} />
    {/each}
  </div>
</section>

<style>
  .section {
    width: 100%;
    max-width: 1200px;

    margin: auto;
    margin-top: 70px;
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .top button {
    border: none;
    background: transparent;
  }

  .grid {
    margin-top: 30px;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>