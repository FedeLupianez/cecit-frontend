<script>
    import { UserCircle2 } from "lucide-svelte";
</script>

<nav class="navbar">
    <div class="logo">
        <h2>CeCIT</h2>
    </div>

    <div class="links">
        <a href="#/home">Institucional</a>
        <a href="#/become-member">Hacete socio</a>
        <a href="#/contact">Contacto</a>

        <button class="user-btn">
            <UserCircle2 size={28} />
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

    a {
        text-decoration: none;
        color: #111;
        font-size: 15px;
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
            font-size: 12px;
        }
    }
</style>

