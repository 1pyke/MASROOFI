const ctx = document.getElementById('myChart').getContext('2d');
let dataTable;
let myChart;


const screens = {};
const screensLogic = {
  'history-screen': () => {
    const purchases = getItem('purchases');
    if (!purchases) {
      alert('you havent done any purchases yet');
      return false;
    }
    reintializeDataTable(purchases);
    return true;
  },
  'chart-screen': () => {
    const purchases = getItem('purchases');
    if (!purchases) {
      alert('you havent done any purchases yet');
      return false;
    }
    destroyChart();
    return true;
  }
}
const categories = [
  'Food & Drinks',
  'Clothes',
  'Equipment',
  'Travel',
  'Bills',
  'Groceries',
  'Home Needs',
  'Helping Others',
  'Gifts',
  'Transportation',
  'Education',
  'Books',
  'Technology',
  'Socializing',
  'Car Maintenance',
  'Entertainment',
  'Health Care',
  'Miscellaneous'
];

const backgroundColor = [
  'green',
  'red',
  'blue',
  'yellow',
  'darkviolet',
  'pink',
  'grey',
  'cyan',
  'slategrey',
  'seinna',
  'salmon',
  'peru',
  'orangered',
  'mintcream',
  'maroon',
  'lighcoral',
  'lemonchiffon',
  'gold'
];


initialize();



function initialize() {
  initializeCategories();
  initializeScreens();
  hideAllScreens();
  addRouterToPage();
  if (localStorage.getItem('username')) {
    openScreen('home-screen');
  } else {
    openScreen('username-screen');
  }
}

function reintializeDataTable(purchases) {
  var dataSet = purchases.map(purchase => Object.values(purchase));

  const columns = Object.keys(purchases[0]).map(title => ({ title }));
  columns.push({
    title: 'Actions', render: function (data, type, row, meta) {
      return `<button onclick="deleteFromPurchases(${meta.row})">X</button>`;
    }
  });

  if (dataTable) {
    dataTable.clear().destroy();
  }
  dataTable = $('#example').DataTable({
    data: dataSet,
    columns,
  });
}

function destroyChart() {
  if (myChart && myChart.destroy) {
    myChart.destroy();
  }
}

function initializeCategories() {
  const categoriesInput = document.getElementById('categories-input');
  for (let i = 0; i < categories.length; i++) {
    categoriesInput.innerHTML += `<option value="${categories[i]}">${categories[i]}</option>`;
  }
}

function initializeScreens() {
  const screensElements = document.querySelectorAll('[data-screen]');
  for (let i = 0; i < screensElements.length; i++) {
    const screenElement = screensElements[i];
    screens[screenElement.getAttribute('id')] = screenElement;
  }
}

function openScreen(screenName) {
  if (screensLogic[screenName]) {
    if (!screensLogic[screenName]()) {
      return;
    }
  }
  hideAllScreens();
  screens[screenName].classList.remove('hide');
}

function hideAllScreens() {
  for (let screenName in screens) {
    screens[screenName].classList.add('hide');
  }
}

function addRouterToPage() {
  const routerButtons = document.querySelectorAll('[data-open-screen]');
  for (let i = 0; i < routerButtons.length; i++) {
    routerButtons[i].addEventListener('click', () => {
      const screenToOpen = routerButtons[i].getAttribute('data-open-screen');
      openScreen(screenToOpen);
    })
  }
}

function getItem(key) {
  return JSON.parse(localStorage.getItem(key));
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function deleteFromPurchases(index) {
  const purchases = getItem('purchases');
  purchases.splice(index, 1);
  reintializeDataTable(purchases);
  setItem('purchases', purchases);
}




const usernameForm = document.getElementById('username-screen-form');
const usernameInput = document.getElementById('username-input');

usernameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  localStorage.setItem('username', usernameInput.value);
  openScreen('home-screen');
});


const dateFormat = 'YYYY-MM-DD, HH:mm, DDDD'
const submitPurchaseForm = document.getElementById('submit-purchase-form');
const amountInput = document.getElementById('amount-input');
const placeInput = document.getElementById('place-input');
const categoriesInput = document.getElementById('categories-input');


submitPurchaseForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const purchase = {
    category: categoriesInput.value,
    place: placeInput.value,
    amount: parseFloat(amountInput.value),
    date: moment().format(dateFormat),
  }

  let purchases;

  if (localStorage.getItem('purchases')) {
    purchases = JSON.parse(localStorage.getItem('purchases'));
    purchases.push(purchase);
  } else {
    purchases = [purchase];
  }

  setItem('purchases', purchases);

  openScreen('home-screen');
})


const backButtons = document.querySelectorAll('.back-button');

for (let i = 0; i < backButtons.length; i++) {
  const backButton = backButtons[i];
  backButton.addEventListener('click', () => {
    openScreen('home-screen');
  })
}




function formatPurchasesData(callback) {
  const purchases = getItem('purchases');

  const formatedData = {}
  for (let i = 0; i < purchases.length; i++) {
    const purchase = purchases[i];
    const data = callback(purchase);
    if (!formatedData[data]) {
      formatedData[data] = purchase.amount;
    } else {
      formatedData[data] += purchase.amount;
    }
  }

  return formatedData;
}


const generatePieChartButton = document.getElementById('generate-pie-chart-button');
const generateBarChartButton = document.getElementById('generate-bar-chart-button');
const generateBarChartButtonDate = document.getElementById('generate-bar-chart-button-date');


generatePieChartButton.addEventListener('click', () => {
  const purchases = getItem('purchases');

  const purchasesBasedOnCategory = {}
  for (let i = 0; i < purchases.length; i++) {
    const purchase = purchases[i];
    if (!purchasesBasedOnCategory[purchase.category]) {
      purchasesBasedOnCategory[purchase.category] = purchase.amount;
    } else {
      purchasesBasedOnCategory[purchase.category] += purchase.amount;
    }
  }
  destroyChart();
  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories,
      datasets: [{
        label: 'Amount',
        data: categories.map(category => {
          if (purchasesBasedOnCategory[category]) {
            return purchasesBasedOnCategory[category];
          }
          return 0;
        }),
        backgroundColor,
        borderWidth: 1
      }]
    },
  });
});
generateBarChartButton.addEventListener('click', () => {
  const data = formatPurchasesData((purchase) => purchase.category);
  destroyChart();
  myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Amount',
        data,
        backgroundColor,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
});
generateBarChartButtonDate.addEventListener('click', () => {
  const data = formatPurchasesData((purchase) => moment(purchase.date, dateFormat).format('YYYY-MM-DD'));
  destroyChart();
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Amount',
        data,
        borderColor: 'red',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
});




