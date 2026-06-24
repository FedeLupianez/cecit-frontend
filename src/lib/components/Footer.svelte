<script>
  const cecitLogo = 'http://centrodecomercioag.com.ar/wp-content/uploads/2023/07/cecit2023.png';
  const recurso6 = 'http://centrodecomercioag.com.ar/wp-content/uploads/2025/04/Recurso-6.png';
  const recurso8 = 'http://centrodecomercioag.com.ar/wp-content/uploads/2025/04/Recurso-8.png';
</script>

<footer>
  <div class="inner">
    <div class="brand">
      <img class="cecit-logo" src={cecitLogo} alt="CeCIT" />

      <div class="contact">
        <p>España 147, Alta Gracia, Córdoba, Argentina</p>
        <p>Tel. (03547) 3547446368</p>
      </div>
    </div>

    <div class="support">
      <img class="parks-logo" src={recurso6} alt="Paseo Libertador y Paseo del Centro" />
      <img class="backers-logo" src={recurso8} alt="Nos respaldan: CAME y FEDECOM" />
    </div>
  </div>
</footer>

<style>
  footer {
    margin-top: 0;
    padding: 46px 20px 42px;
    min-height: 190px;

    background: #151532;
    color: white;
  }

  .inner {
    width: 100%;
    max-width: 1200px;

    margin: auto;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 96px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 34px;
  }

  .cecit-logo {
    width: 168px;
    height: auto;
    display: block;
  }

  .contact {
    padding-top: 22px;
  }

  .contact p {
    margin: 0 0 6px;

    font-size: 14px;
    line-height: 1.35;
  }

  .support {
    display: flex;
    align-items: flex-start;
    gap: 50px;
  }

  .parks-logo,
  .backers-logo {
    height: auto;
    object-fit: contain;
    display: block;
  }

  .parks-logo {
    width: 150px;
  }

  .backers-logo {
    width: 210px;
  }

  @media (max-width: 820px) {
    footer {
      padding: 34px 24px 38px;
    }

    .inner,
    .brand,
    .support {
      align-items: flex-start;
      flex-direction: column;
      gap: 24px;
    }

    .brand img {
      width: 136px;
    }

    .contact {
      padding-top: 0;
    }

    .support {
      gap: 28px;
      flex-direction: row;
      flex-wrap: wrap;
    }

    .parks-logo {
      width: 128px;
    }

    .backers-logo {
      width: 178px;
    }
  }

  @media (max-width: 520px) {
    footer {
      padding: 30px 22px 34px;
    }

    .contact p {
      font-size: 16px;
      line-height: 1.35;
    }

    .support {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 18px;
    }

    .cecit-logo {
      width: 156px;
    }

    .parks-logo,
    .backers-logo {
      width: 100%;
      max-width: 170px;
    }
  }
</style>
