document.addEventListener('DOMContentLoaded', function () {
    const apiBaseUrl = 'http://127.0.0.1:10000/api';
    const userIdInput = document.getElementById('userIdInput');
    const userList = document.getElementById('user-list');

    // 當按下 Enter 時，根據輸入框內容加載數據
    userIdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            userList.innerHTML = ''; // 清空列表
            const enteredId = userIdInput.value.trim();
            if (enteredId) {
                fetchViolationById(enteredId).then(displayUserViolations);
            } else {
                fetchViolations(); // 如果輸入框為空，則加載所有用戶數據
            }
        }
    });

    // 初次加載時獲取所有違規資料
    fetchViolations();

    /**
     * 獲取所有違規用戶的資料
     */
    function fetchViolations() {
        fetch(`${apiBaseUrl}/users`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch violations');
                }
                return response.json();
            })
            .then((data) => {
                if (data.length > 0) {
                    // 發起所有請求並按照數據順序處理
                    const results = [];
                    const fetchPromises = data.map((user, index) => 
                        fetchViolationById(user.id_number).then((result) => {
                            results[index] = result;
                        })
                    );
                    Promise.all(fetchPromises).then(() => displayUserViolations(results.flat()));
                } else {
                    alert('No violation data available.');
                }
            })
            .catch((error) => {
                console.error('Error fetching violations data:', error);
                alert('Unable to fetch violations data.');
                userList.innerHTML = ''; // 清空列表
            });
    }

    /**
     * 獲取特定用戶的違規資料
     * @param {string} userId - 用戶 ID
     * @returns {Promise<Array>} 返回包含用戶違規資料的 Promise
     */
    function fetchViolationById(userId) {
        return fetch(`${apiBaseUrl}/users/${userId}/details`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch details for user ID ${userId}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.licenses) {
                    return data.licenses;
                } else {
                    alert(`No details found for user ID: ${userId}`);
                    return [];
                }
            })
            .catch((error) => {
                console.error(`Error fetching details for user ID ${userId}:`, error);
                alert('Unable to fetch user details.');
                return [];
            });
    }

    /**
     * 在頁面上顯示用戶違規資料
     * @param {Array} licensesArray - 包含違規資料的陣列
     */
    function displayUserViolations(licensesArray) {
        licensesArray.forEach((license) => {
            license.violations.forEach((violation) => {
                const ul = document.createElement('ul');
                ul.className = 'list-group list-group-horizontal';

                ul.innerHTML = `
                    <li class="list-group-item col-1">${license.id_number}</li>
                    <li class="list-group-item col-2">${license.license_type}</li>
                    <li class="list-group-item col-2">${violation.violation_type}</li>
                    <li class="list-group-item col-2">${violation.violation_date}</li>
                    <li class="list-group-item col-2">${violation.fine_amount}</li>
                    <li class="list-group-item col-2">${violation.payment_status}</li>
                    <li class="list-group-item col-1">
                        <button class="btn btn-info btn-sm" onclick="modify('${license.id_number}', '${license.license_id}', '${violation.violation_id}')">Modify</button>
                    </li>
                `;
                userList.appendChild(ul);
            });
        });
    }
});

/**
 * 跳轉到 updateViolation.html 頁面，並攜帶查詢參數
 * @param {string} idNumber - 用戶 ID
 * @param {string} licenseId - 執照 ID
 * @param {string} violationId - 違規 ID
 */
function modify(idNumber, licenseId, violationId) {
    const detailPage = 'updateViolation.html'; // 替換為實際的頁面路徑
    const detailUrl = `${detailPage}?id=${idNumber}&license=${licenseId}&violation=${violationId}`;
    window.location.href = detailUrl; // 跳轉到詳細頁面
}
