function renderStats() {
  const items = loadItems();
  const history = loadHistory();

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

  const searchCounts = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    searchCounts[d.toLocaleDateString()] = 0;
  }
  history.forEach(h => {
    if (h.action === 'search') {
      const key = new Date(h.timestamp).toLocaleDateString();
      if (searchCounts[key] !== undefined) searchCounts[key]++;
    }
  });
  const searchLabels = Object.keys(searchCounts);
  const searchValues = Object.values(searchCounts);
  new Chart(document.getElementById('searchChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: searchLabels,
      datasets: [{
        label: '検索回数',
        data: searchValues,
        backgroundColor: '#f6ad55',
        borderColor: '#ed8936',
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

document.addEventListener('DOMContentLoaded', renderStats);
