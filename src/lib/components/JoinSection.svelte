<script>
    const balloonDog =
        "https://cdn-icons-png.flaticon.com/512/2829/2829748.png";
    const shoppingCart =
        "https://cdn-icons-png.flaticon.com/512/3144/3144456.png";
</script>

<section class="join-section">
    <img
        loading="lazy"
        class="cart"
        src={shoppingCart}
        alt=""
        aria-hidden="true"
    />

    <img
        loading="lazy"
        class="balloon-dog"
        src={balloonDog}
        alt=""
        aria-hidden="true"
    />

    <div class="content">
        <h2>¡HACETE SOCIO!</h2>

        <button type="button">Contactanos</button>
    </div>
</section>

<style>
    @import url(https://db.onlinewebfonts.com/c/eccf30d3af8a69bf0b97f01c6d46b8e2?family=Agrandir+Grand+Heavy);
    .join-section {
        min-height: 80vh;
        margin-top: 2rem;

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
        font-family: "Agrandir Grand Heavy";
        font-size: 8rem;
        font-weight: 900;
        line-height: 1;
        letter-spacing: 0;
    }

    button {
        margin-top: 12px;
        width: 15rem;
        padding: 1rem;

        border: 1px solid #c8ccd4;
        border-radius: 999px;

        background: #f8f9fb;
        color: #050505;

        font-family: "Open Sauce One", serif;
        font-size: 1.3rem;
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
        right: -75px;

        width: 25rem;
        height: 25rem;
        object-fit: contain;

        opacity: 0.5;
        filter: grayscale(1);
        transform: rotate(-18deg) scaleX(-1);
    }

    @media (max-width: 768px) {
        .join-section {
            min-height: 560px;
            margin-top: 64px;
        }

        h2 {
            max-width: 330px;
            font-size: 48px;
            text-align: center;
        }

        button {
            min-width: 170px;
            height: 40px;
            font-size: 18px;
        }

        .cart {
            left: -74px;
            bottom: 52px;
            width: 250px;
            height: 250px;
        }

        .balloon-dog {
            top: 40px;
            right: -118px;
            width: 300px;
            height: 300px;
        }
    }

    @media (max-width: 420px) {
        .join-section {
            min-height: 500px;
        }

        h2 {
            max-width: 280px;
            font-size: 40px;
        }

        .cart {
            left: -86px;
            width: 220px;
            height: 220px;
        }

        .balloon-dog {
            right: -132px;
            width: 260px;
            height: 260px;
        }
    }
</style>
