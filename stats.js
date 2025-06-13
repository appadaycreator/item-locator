function renderStats() {
  const items = loadItems();

  const itemCounts = {};
  items.forEach(item => {
    itemCounts[item.parent] = (itemCounts[item.parent] || 0) + 1;
  });
  const itemLabels = Object.keys(itemCounts);
  const itemValues = Object.values(itemCounts);
  new Chart(document.getElementById('itemsChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: itemLabels,
      datasets: [{
        label: 'アイテム数',
        data: itemValues,
        backgroundColor: '#4A90E2'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

document.addEventListener('DOMContentLoaded', renderStats);
