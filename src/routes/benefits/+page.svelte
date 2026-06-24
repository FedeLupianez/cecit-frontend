<script>
  import BenefitCard from '$lib/components/BenefitCard.svelte';
  import { benefits } from '$lib/data/benefits';
</script>

<section class="benefits-page">
  <div class="top">
    <h1>Todos los beneficios</h1>

    <input placeholder="Buscar beneficio..." />
  </div>

  <div class="grid">
    {#each benefits as benefit}
      <BenefitCard {...benefit} />
    {/each}
  </div>
</section>

<style>
  .benefits-page {
    width: 100%;
    max-width: 1200px;

    margin: auto;

    padding: 50px 20px;
  }

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    gap: 20px;
  }

  input {
    width: 300px;

    padding: 14px;

    border-radius: 10px;
    border: 1px solid #ccc;
  }

  .grid {
    margin-top: 40px;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  @media (max-width: 900px) {
    .top {
      flex-direction: column;
      align-items: flex-start;
    }

    input {
      width: 100%;
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>