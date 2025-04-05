<template>
  <div>
    <div id="chart2" style="width: 100%; height: 400px;"></div>
    <button id="refreshButton">Refresh Chart</button>
  </div>
</template>

<script>
export default {
  name: 'MongoDBChart2',
  mounted() {
    // Dynamically load the CDN script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@mongodb-js/charts-embed-dom';
    script.onload = () => {
      // Ensure the library is loaded before using it
      const sdk = new window.ChartsEmbedSDK({
        baseUrl: 'https://charts.mongodb.com/charts-project-0-llcvfbm',
      });

      const chart2 = sdk.createChart({
        chartId: 'c503d4a3-b7a8-48d8-8a6d-47af1d346e1d',
      });

      chart2
        .render(document.getElementById('chart2'))
        .catch(() => window.alert('Chart failed to initialise'));

      document
        .getElementById('refreshButton')
        .addEventListener('click', () => chart2.refresh());
    };

    document.body.appendChild(script);
  },
};
</script>

<style scoped>
/* Add any specific styles for your chart component here */
</style>
