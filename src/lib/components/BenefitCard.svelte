<script>
  let { title, image, business } = $props();
</script>

<div class="card">
  <img src={image} alt={title} />

  <div class="content">
    <h2>{title}</h2>

    <div class="bottom">
      <p>{business}</p>

      <button>Adquirir cupón</button>
    </div>
  </div>
</div>

<style>
  .card {
    background: white;
    border-radius: 15px;
    overflow: hidden;

    box-shadow: 0 4px 10px rgba(0,0,0,0.08);

    transition: 0.3s;
  }

  .card:hover {
    transform: translateY(-5px);
  }

  img {
    width: 100%;
    height: 220px;
    object-fit: cover;
  }

  .content {
    padding: 15px;
  }

  h2 {
    margin: 0;
    font-size: 28px;
  }

  .bottom {
    margin-top: 20px;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  button {
    background: #19194f;
    color: white;

    border: none;
    border-radius: 20px;

    padding: 10px 16px;
  }
</style>