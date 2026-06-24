<script>
  import { partners } from '$lib/data/partners';

  const repeatedPartners = [
    ...partners,
    ...partners,
    ...partners,
    ...partners
  ];
</script>

<section class="partners">
  <h2>Nuestros socios</h2>

  <div class="carousel">
    <div class="track">
      {#each repeatedPartners as partner}
        <div class="partner-card">
          <img src={partner.logo} alt={partner.name} />

          <p>{partner.name}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .partners {
    width: 100%;
    max-width: 1200px;

    margin: auto;
    margin-top: 66px;

    overflow: hidden;
  }

  h2 {
    margin: 0;

    color: #050505;

    font-size: 25px;
    font-weight: 800;
    line-height: 1;
  }

  .carousel {
    margin-top: 28px;
    width: 100%;

    overflow: hidden;
  }

  .track {
    width: max-content;

    display: flex;
    align-items: center;
    gap: 52px;

    animation: partners-scroll 24s linear infinite;
  }

  .carousel:hover .track {
    animation-play-state: paused;
  }

  .partner-card {
    width: 110px;
    flex: 0 0 auto;

    text-align: center;
  }

  img {
    width: 86px;
    height: 86px;

    object-fit: cover;
    border-radius: 50%;

    background: white;

    box-shadow:
      0 4px 12px rgba(0,0,0,0.12);
  }

  p {
    margin: 10px 0 0;

    color: #151535;

    font-size: 11px;
    font-weight: 800;
    line-height: 1.15;
    text-transform: uppercase;
  }

  @keyframes partners-scroll {
    from {
      transform: translateX(0);
    }

    to {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 768px) {
    .partners {
      padding: 0 12px;
      margin-top: 58px;
    }

    h2 {
      font-size: 28px;
    }

    .track {
      gap: 34px;
      animation-duration: 18s;
    }

    .partner-card {
      width: 116px;
    }

    img {
      width: 104px;
      height: 104px;
    }

    p {
      font-size: 13px;
    }
  }

  @media (max-width: 420px) {
    .track {
      gap: 28px;
    }

    .partner-card {
      width: 104px;
    }

    img {
      width: 92px;
      height: 92px;
    }
  }
</style>
