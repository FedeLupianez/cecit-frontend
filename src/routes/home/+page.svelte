<script>
  import HeroCarousel from '$lib/components/HeroCarousel.svelte';
  import Categories from '$lib/components/Categories.svelte';
  import BenefitsSection from '$lib/components/BenefitsSection.svelte';
  import PartnersCarousel from '$lib/components/PartnersCarousel.svelte';
</script>

<section class="home-page">
  <HeroCarousel />

  <Categories />

  <div class="buttons-section">
    <button>Hacete socio</button>
    <button>Todos los beneficios</button>
    <button>Nuestros socios</button>
  </div>

  <BenefitsSection />

  <BenefitsSection />

  <PartnersCarousel />

  <section class="join-section">
    <h1>¡HACETE SOCIO!</h1>

    <button>Contactanos</button>
  </section>
</section>

<style>
  .home-page {
    padding-bottom: 50px;
  }

  .buttons-section {
    width: 100%;
    max-width: 1200px;

    margin: auto;
    margin-top: 60px;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  }

  .buttons-section button {
    height: 70px;

    border: none;
    background: #ef233c;
    color: white;

    font-size: 20px;
    font-weight: bold;

    border-radius: 10px;

    transition: 0.3s;
  }

  .buttons-section button:hover {
    transform: translateY(-5px);
  }

  .join-section {
    width: 100%;

    margin-top: 120px;

    padding: 120px 20px;

    background: #ececec;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

</style>