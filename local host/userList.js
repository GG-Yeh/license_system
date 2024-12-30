document.addEventListener('DOMContentLoaded', function () {
    const apiBaseUrl = 'http://127.0.0.1:10000/api';
    const userIdInput = document.getElementById('userIdInput');
    const userList = document.getElementById('user-list');

    // 初次加载时获取所有用户数据
    fetchUsers();

    // 当按下 Enter 时，根据输入框内容加载数据
    userIdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const enteredId = userIdInput.value.trim();
            if (enteredId) {
                fetchUserById(enteredId);
            } else {
                fetchUsers(); // 如果输入框为空，则加载所有用户数据
            }
        }
    });

    /**
     * Fetch all users from the backend API
     */
    function fetchUsers() {
        fetch(`${apiBaseUrl}/users`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                return response.json();
            })
            .then((data) => {
                displayUsers(data);
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
                alert('Unable to fetch user data.');
                userList.innerHTML = ''; // Clear the list if an error occurs
            });
    }

    /**
     * Fetch user by ID from the backend API
     * @param {string} userId - The ID of the user to fetch
     */
    function fetchUserById(userId) {
        fetch(`${apiBaseUrl}/users/${userId}/details`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('User not found');
                }
                return response.json();
            })
            .then((data) => {
                displayUsers([data.user]); // Wrap single user in an array for consistency
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
                alert('Unable to fetch user data for the entered ID.');
                userList.innerHTML = ''; // Clear the list if no data is found
            });
    }

    /**
     * Display a list of users on the page
     * @param {Array} users - Array of user objects
     */
    function displayUsers(users) {
        userList.innerHTML = ''; // Clear existing list

        users.forEach((user) => {
            const ul = document.createElement('ul');
            ul.className = 'list-group list-group-horizontal';

            ul.innerHTML = `
                <li class="list-group-item col-2">${user.id_number}</li>
                <li class="list-group-item col-3">${user.name}</li>
                <li class="list-group-item col-1">${user.sex}</li>
                <li class="list-group-item col-2">${user.birthday}</li>
                <li class="list-group-item col-3">${user.contact}</li>
                <li class="list-group-item col-1">
                    <button class="btn btn-info btn-sm" onclick="modify('${user.id_number}')">Modify</button>
                </li>
            `;
            userList.appendChild(ul);
        });
    }
});

/**
 * Navigate to the userDetail.html page with the user's ID as a query parameter
 * @param {string} idNumber - ID number of the user
 */
function modify(idNumber) {
    const detailPage = 'updateUser.html'; // Replace with the actual path to your userDetail.html
    const detailUrl = `${detailPage}?id=${idNumber}`;
    window.location.href = detailUrl; // Navigate to the detail page
}
