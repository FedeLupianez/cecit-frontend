<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="layout">
	<Navbar />

	<main>
		{@render children()}
	</main>

	<Footer />
</div>

<style>
	.layout {
		min-height: 100vh;

		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
	}
</style>