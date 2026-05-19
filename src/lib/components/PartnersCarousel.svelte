<script>
  import { partners } from '$lib/data/partners';
</script>

<section class="partners">
  <h2>Nuestros socios</h2>

  <div class="list">
    {#each partners as partner}
      <div class="partner-card">
        <img src={partner.logo} alt={partner.name} />

        <p>{partner.name}</p>
      </div>
    {/each}
  </div>
</section>

<style>
  .partners {
    width: 100%;
    max-width: 1200px;

    margin: auto;
    margin-top: 80px;
  }

  .list {
    margin-top: 30px;

    display: flex;
    gap: 30px;

    overflow-x: auto;
  }

  .partner-card {
    min-width: 180px;

    text-align: center;
  }

  img {
    width: 140px;
    height: 140px;

    object-fit: cover;
    border-radius: 50%;

    background: white;
  }
</style>