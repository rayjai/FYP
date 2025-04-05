<template>
  <div>
    <div id="chart3" style="width: 100%; height: 400px;"></div>
    <button id="refreshButton">Refresh Chart</button>
  </div>
</template>

<script>
export default {
  name: 'MongoDBChart3',
  mounted() {
    // Dynamically load the CDN script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@mongodb-js/charts-embed-dom';
    script.onload = () => {
      // Ensure the library is loaded before using it
      const sdk = new window.ChartsEmbedSDK({
        baseUrl: 'https://charts.mongodb.com/charts-project-0-llcvfbm',
      });

      const chart3 = sdk.createChart({
        chartId: 'd0aa8e7a-de61-4f65-9277-795c9bb98855',
      });

      chart3
        .render(document.getElementById('chart3'))
        .catch(() => window.alert('Chart failed to initialise'));

      document
        .getElementById('refreshButton')
        .addEventListener('click', () => chart3.refresh());
    };

    document.body.appendChild(script);
  },
};
</script>

<style scoped>
/* Add any specific styles for your chart component here */
</style>
