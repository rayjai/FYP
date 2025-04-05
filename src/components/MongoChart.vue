<template>
  <div>
    <div id="chart" style="width: 100%; height: 400px;"></div>
    <button id="refreshButton">Refresh Chart</button>
  </div>
</template>

<script>
export default {
  name: 'MongoDBChart',
  mounted() {
    // Dynamically load the CDN script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@mongodb-js/charts-embed-dom';
    script.onload = () => {
      // Ensure the library is loaded before using it
      const sdk = new window.ChartsEmbedSDK({
        baseUrl: 'https://charts.mongodb.com/charts-project-0-llcvfbm',
      });

      const chart = sdk.createChart({
        chartId: '77949f01-c873-47a2-ad08-4f3e715b383e',
      });

      chart
        .render(document.getElementById('chart'))
        .catch(() => window.alert('Chart failed to initialise'));

      document
        .getElementById('refreshButton')
        .addEventListener('click', () => chart.refresh());
    };

    document.body.appendChild(script);
  },
};
</script>

<style scoped>
/* Add any specific styles for your chart component here */
</style>
