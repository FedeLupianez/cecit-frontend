<script>
  const balloonDog = 'https://cdn-icons-png.flaticon.com/512/2829/2829748.png';
  const shoppingCart = 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png';
</script>

<section class="join-section">
  <img class="cart" src={shoppingCart} alt="" aria-hidden="true" />

  <img class="balloon-dog" src={balloonDog} alt="" aria-hidden="true" />

  <div class="content">
    <h2>¡HACETE SOCIO!</h2>

    <button type="button">Contactanos</button>
  </div>
</section>

<style>
  .join-section {
    min-height: 470px;
    margin-top: 74px;

    background: #eef0f3;

    position: relative;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    position: relative;
    z-index: 2;

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  h2 {
    margin: 0;

    color: #020205;

    font-size: 54px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: 0;
  }

  button {
    margin-top: 12px;
    min-width: 132px;
    height: 30px;

    border: 1px solid #c8ccd4;
    border-radius: 999px;

    background: #f8f9fb;
    color: #050505;

    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
  }

  .cart {
    position: absolute;
    left: 22px;
    bottom: 28px;

    width: 245px;
    height: 245px;
    object-fit: contain;

    opacity: 0.46;
    filter: grayscale(1);

    transform: rotate(24deg);
  }

  .balloon-dog {
    position: absolute;
    top: 16px;
    right: -84px;

    width: 330px;
    height: 330px;
    object-fit: contain;

    opacity: 0.5;
    filter: grayscale(1);

    transform: rotate(-18deg);
  }

  @media (max-width: 768px) {
    .join-section {
      min-height: 360px;
      margin-top: 54px;
    }

    h2 {
      font-size: 36px;
    }

    .cart {
      left: -44px;
      bottom: 12px;
      width: 170px;
      height: 170px;
    }

    .balloon-dog {
      top: 10px;
      right: -116px;
      width: 230px;
      height: 230px;
    }
  }
</style>
