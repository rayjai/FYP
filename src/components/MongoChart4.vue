<template>
  <div>
    <div id="chart4" style="width: 100%; height: 400px;"></div>
    <button id="refreshButton">Refresh Chart</button>
  </div>
</template>

<script>
export default {
  name: 'MongoDBChart4',
  mounted() {
    // Dynamically load the CDN script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@mongodb-js/charts-embed-dom';
    script.onload = () => {
      // Ensure the library is loaded before using it
      const sdk = new window.ChartsEmbedSDK({
        baseUrl: 'https://charts.mongodb.com/charts-project-0-llcvfbm',
      });

      const chart4 = sdk.createChart({
        chartId: 'eaa1a883-a09a-48bb-8b16-594f610d5d8f',
      });

      chart4
        .render(document.getElementById('chart4'))
        .catch(() => window.alert('Chart failed to initialise'));

      document
        .getElementById('refreshButton')
        .addEventListener('click', () => chart4.refresh());
    };

    document.body.appendChild(script);
  },
};
</script>

<style scoped>
/* Add any specific styles for your chart component here */
</style>
