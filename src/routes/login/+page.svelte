<script>
  let email = '';
  let password = '';
</script>

<section class="login-page">
  <div class="login-card">
    <h1>Iniciar sesión</h1>

    <input
      bind:value={email}
      type="email"
      placeholder="Correo electrónico"
    />

    <input
      bind:value={password}
      type="password"
      placeholder="Contraseña"
    />

    <button>Ingresar</button>
  </div>
</section>

<style>
  .login-page {
    min-height: 80vh;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 20px;
  }

  .login-card {
    width: 100%;
    max-width: 450px;

    background: white;

    padding: 40px;

    border-radius: 20px;

    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  }

  h1 {
    margin-top: 0;
    margin-bottom: 30px;
    text-align: center;
  }

  input {
    width: 100%;

    margin-bottom: 20px;

    padding: 15px;

    border-radius: 10px;
    border: 1px solid #ccc;

    outline: none;
  }

  button {
    width: 100%;

    padding: 15px;

    border: none;
    border-radius: 10px;

    background: #19194f;
    color: white;

    font-size: 16px;
    font-weight: bold;
  }
</style>