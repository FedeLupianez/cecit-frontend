<script>
  import { Search } from 'lucide-svelte';

  const banner =
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop';
</script>

<section class="hero">
  <img src={banner} alt="banner" />

  <div class="search-box">
    <input placeholder="Busca por palabra clave o marca" />

    <button>
      <Search size={20} />
    </button>
  </div>
</section>

<style>
  .hero {
    width: 100%;
    max-width: 1200px;

    margin: auto;
    margin-top: 30px;
  }

  img {
    width: 100%;
    height: 350px;

    object-fit: cover;

    border-radius: 20px;
  }

  .search-box {
    width: 60%;

    margin: auto;
    margin-top: -30px;

    background: white;
    border-radius: 50px;

    display: flex;
    align-items: center;

    overflow: hidden;

    position: relative;
    z-index: 5;
  }

  input {
    flex: 1;

    border: none;

    padding: 18px;

    outline: none;
  }

  button {
    width: 60px;
    height: 60px;

    border: none;

    background: #19194f;
    color: white;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .search-box {
      width: 90%;
    }

    img {
      height: 220px;
    }
  }
</style>