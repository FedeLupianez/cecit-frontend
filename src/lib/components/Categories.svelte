<script>
  import { categories } from '$lib/data/categories';
</script>

<section class="categories">
  <h2>Explorar cupones por categoría</h2>

  <div class="icons">
    {#each categories as category}
      <button>
        <category.icon size={26} />
      </button>
    {/each}
  </div>
</section>

<style>
  .categories {
    margin-top: 50px;
    text-align: center;
  }

  .icons {
    margin-top: 20px;

    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  button {
    width: 70px;
    height: 70px;

    border-radius: 50%;
    border: none;

    background: #19194f;
    color: white;

    transition: 0.3s;
  }

  button:hover {
    transform: scale(1.1);
  }
</style>