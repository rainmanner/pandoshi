
let contract;
let provider;
let globalBuyers = [];




let currentPage = 1;
const itemsPerPage = 10; // Adjust as needed

async function getBuyers() {
    try {
        // Replace this URL with your Node.js server endpoint
        const response = await fetch('https://pandoshi.com/buyers');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const buyersData = await response.json();
		displayLastUpdatedTime(buyersData.lastUpdated);

        // No need to sort here if your server already sends sorted data
        globalBuyers = buyersData.buyers.sort((a, b) => b.amount - a.amount);
    } catch (error) {
        console.error('Error fetching buyers:', error);
    }
}

function displayLastUpdatedTime(timestamp) {
    const date = new Date(timestamp);
    const formattedDate = date.toUTCString(); // Convert to a UTC string
    document.getElementById('lastUpdated').innerText = `Updated: ${formattedDate}`;
}



function getBonusAmount(position) {
    if (position === 1) return "10.000.000"; // Bonus for 1 place
    else if (position === 2) return "9.000.000"; // Bonus for 2 place
    else if (position === 3) return "8.000.000"; // Bonus for 3 place
    else if (position === 4) return "7.000.000"; // Bonus for 4 place
    else if (position === 5) return "6.000.000"; // Bonus for 5 place
    else if (position === 6) return "5.000.000"; // Bonus for 6 place
    else if (position === 7) return "4.000.000"; // Bonus for 7 place
    else if (position === 8) return "3.000.000"; // Bonus for 8 place
    else if (position === 9) return "2.000.000"; // Bonus for 9 place
    else if (position === 10) return "1.000.000"; // Bonus for 10 place
    else if (position >= 11 && position <= 20) return "100,000"; // Bonus for places 11 to 20
    else if (position >= 21 && position <= 50) return "10,000"; // Bonus for places 21 to 50
    return 0; // No bonus for other positions
}

function formatTokenAmount(amount) {
    const tokenAmount = Number(amount) / 1e18;
    return tokenAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatAddress(address) {
    return address.substring(0, 6) + '...' + address.substring(address.length - 6);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const toastEl = document.getElementById('copyToast');
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

async function searchAddress() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    if (searchValue === '') {
        currentPage = 1; // Reset to first page
        displayLeaderboard(globalBuyers);
    } else {
        const filteredBuyers = globalBuyers.filter(buyer => buyer.address.toLowerCase().includes(searchValue));
        currentPage = 1; // Reset to first page
        displayLeaderboard(filteredBuyers);
    }
}

async function displayLeaderboard(data) {
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'flex';

    try {
        // Ensure data is an array before proceeding
        if (!Array.isArray(data)) {
            data = globalBuyers;
        }

        setupPagination(data.length);
        updateTable(currentPage, data);

        spinner.style.display = 'none';
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        spinner.style.display = 'none';
    }
}




const maxPagesToShow = 3; // Maximum number of pages to display in the pagination

function setupPagination(totalItems) {
    const paginationUl = document.getElementById('pagination');
    paginationUl.innerHTML = '';
    const pageCount = Math.ceil(totalItems / itemsPerPage);
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    // Add previous button
    const prevLi = createPageItem(currentPage - 1, "Previous", currentPage === 1);
    paginationUl.appendChild(prevLi);

    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(pageCount, currentPage + halfPagesToShow);

    // Adjust the start and end page if near the beginning or end
    if (currentPage <= halfPagesToShow) {
        endPage = Math.min(maxPagesToShow, pageCount);
    }
    if (currentPage + halfPagesToShow >= pageCount) {
        startPage = Math.max(1, pageCount - maxPagesToShow + 1);
    }

    if (startPage > 1) {
        paginationUl.appendChild(createPageItem(1, '1'));
        if (startPage > 2) {
            paginationUl.appendChild(createPageItem(null, '...', true));
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationUl.appendChild(createPageItem(i, i.toString()));
    }

    if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
            paginationUl.appendChild(createPageItem(null, '...', true));
        }
        paginationUl.appendChild(createPageItem(pageCount, pageCount.toString()));
    }

    // Add next button
    const nextLi = createPageItem(currentPage + 1, "Next", currentPage === pageCount);
    paginationUl.appendChild(nextLi);
}

function createPageItem(pageNumber, text, isDisabled = false) {
    const li = document.createElement('li');
    li.classList.add('page-item');

    if (isDisabled || pageNumber === null) {
        li.classList.add('disabled');
    } else {
        if (pageNumber === currentPage) {
            li.classList.add('active');
        }
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${pageNumber})">${text}</a>`;
    }
    return li;
}

function changePage(page) {
    currentPage = page;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    if (searchValue) {
        const filteredBuyers = globalBuyers.filter(buyer => buyer.address.toLowerCase().includes(searchValue));
        updateTable(currentPage, filteredBuyers);
    } else {
        updateTable(currentPage, globalBuyers);
    }
    setupPagination(globalBuyers.length);
}


function updateTable(page, data) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = data.slice(start, end);

    const leaderboardTable = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];
    leaderboardTable.innerHTML = '';

    paginatedItems.forEach((buyer) => {
        const position = globalBuyers.findIndex(gb => gb.address === buyer.address) + 1;
        const formattedAmount = formatTokenAmount(buyer.amount);
        const formattedAddress = formatAddress(buyer.address);
        const bonusAmount = getBonusAmount(position);

        const row = leaderboardTable.insertRow();
        row.innerHTML = `
            <td>${position}</td>
            <td>${formattedAddress} <i class="fa-solid fa-copy copy-icon" onclick="copyToClipboard('${buyer.address}')"></i></td>
            <td>${formattedAmount}</td>
            <td>${bonusAmount}</td>
        `;
    });
}



document.getElementById('searchInput').addEventListener('input', searchAddress);
document.getElementById('searchInput').addEventListener('focus', () => currentPage = 1);

document.addEventListener('DOMContentLoaded', function() {
        getBuyers().then(() => displayLeaderboard());
});