<script>
    import User24Icon from '@iconify-svelte/qlementine-icons/user-24';
    const logo = "http://centrodecomercioag.com.ar/wp-content/uploads/2023/07/logonuevo.png";

</script>

<nav class="navbar">
    <div class="logo">
    <img src={logo} alt="CeCIT Logo" />
    </div>

    <div class="links">
        <a href="#/home">Institucional</a>
        <a ><p>⸽</p></a>
        <a href="#/become-member">Hacete socio</a>
        <a ><p>⸽</p></a>
        <a href="#/contact">Contacto</a>

        <button class="user-btn">
            <User24Icon height="3.0em" />
        </button>
    </div>
</nav>

<style>
    .navbar {
        height: 10vh;
        background: white;
    

        display: flex;
        justify-content: space-between;
        align-items: center;
        align-self: center;
        padding: 2vh 10vh;
    }

    .links {
        display: flex;
        align-items: center;
        gap: 30px;
    }

    .logo img {
    height: 90px;
    object-fit: contain;
    }

    a {
        text-decoration: none;
        color: #111;
        font-size: 20px;
    }

    .user-btn {
        border: none;
        background: transparent;
    }

    @media (max-width: 768px) {
        .navbar {
            padding: 0 20px;
        }

        .links {
            gap: 15px;
        }

        a {
            font-size: 25px;
        }
    }
</style>

