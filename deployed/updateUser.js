document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'https://license-system-nu.vercel.app/api';
    const deleteUserBtn = document.getElementById('deleteUserBtn');
    const deleteCarLicenseBtn = document.getElementById('deleteCarLicenseBtn');
    const deleteMotorcycleLicenseBtn = document.getElementById('deleteMotorcycleLicenseBtn');
    const updateUserBtn = document.getElementById('updateUserBtn');

    const userNameField = document.getElementById('name');
    const userIdField = document.getElementById('id');
    const userBirthdayField = document.getElementById('birthday');
    const userSexField = document.getElementById('sex');
    const userContactField = document.getElementById('contact');

    const license1NumField = document.getElementById('license1-number');
    const license1ExpiryField = document.getElementById('license1-expiry');
    const license2NumField = document.getElementById('license2-number');
    const license2ExpiryField = document.getElementById('license2-expiry');

    let license1ID = null; // Car License ID
    let license2ID = null; // Motorcycle License ID

    // 从 URL 获取用户 ID 并加载数据
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    if (userId) {
        loadUserDetails(userId); // 加载用户数据
    } else {
        alert('No user ID provided in the URL.');
    }

    // 绑定按钮事件
    deleteUserBtn.addEventListener('click', deleteUser);
    deleteCarLicenseBtn.addEventListener('click', deleteCarLicense);
    deleteMotorcycleLicenseBtn.addEventListener('click', deleteMotorcycleLicense);
    updateUserBtn.addEventListener('click', updateUser);

    function updateUser() {
        if (!userId) {
            alert('User ID is missing.');
            return;
        }

        // 收集并整理用户数据
        const updatedUserData = {
            name: userNameField.value.trim(),
            id_number: userIdField.value.trim(),
            birthday: userBirthdayField.value.trim(),
            sex: userSexField.value.trim(),
            contact: userContactField.value.trim(),
        };

        const license1 = {
            id_number: updatedUserData.id_number,
            license_id: license1ID,
            license_type: 'Car',
            license_number: license1NumField.value.trim(),
            license_expiry_date: license1ExpiryField.value.trim(),
        };

        const license2 = {
            id_number: updatedUserData.id_number,
            license_id: license2ID,
            license_type: 'Motorcycle',
            license_number: license2NumField.value.trim(),
            license_expiry_date: license2ExpiryField.value.trim(),
        };

        // 验证必填字段
        if (!updatedUserData.name || !updatedUserData.birthday || !updatedUserData.sex || !updatedUserData.contact) {
            alert('Please fill out all required fields!');
            return;
        }
        
        const isLicense1Valid = license1.license_number && license1.license_expiry_date;
        const isLicense2Valid = license2.license_number && license2.license_expiry_date;

        if ((license1ID || license1.license_number || license1.license_expiry_date)
            && !isLicense1Valid) {
            alert('Please fill out the Car license!');
            return;
        }
        if ((license2ID || license2.license_number || license2.license_expiry_date)
            && !isLicense2Valid) {
            alert('Please fill out the Motorcycle license!');
            return;
        }

        // 更新用户数据
        fetch(`${apiBaseUrl}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUserData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update user');
                }
                return response.json();
            })
            .then(() => {
                alert('User updated successfully!');

                // 更新执照数据
                const licensePromises = [];
                if (isLicense1Valid) {
                    licensePromises.push(updateLicense(license1));
                }
                if (isLicense2Valid) {
                    licensePromises.push(updateLicense(license2));
                }

                Promise.all(licensePromises).then(() => {
                    alert('All updates completed!');
                    window.location.href = 'userList.html';
                });
            })
            .catch(error => {
                alert('Error occurred during the process!');
                console.error('Error updating user:', error);
            });
    }

    function updateLicense(licenseData) {
        const licenseEndpoint = licenseData.license_id
            ? `${apiBaseUrl}/licenses/${licenseData.license_id}`
            : `${apiBaseUrl}/licenses`;

        return fetch(licenseEndpoint, {
            method: licenseData.license_id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(licenseData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to update ${licenseData.license_type} license`);
                }
                return response.json();
            })
            .then(data => {
                return data; // 返回更新结果供 Promise.all 使用
            })
            .catch(error => {
                console.error(`Error updating ${licenseData.license_type} license:`, error);
                alert(`Error updating ${licenseData.license_type} license`);
            });
    }

    function loadUserDetails(userId) {
        fetch(`${apiBaseUrl}/users/${userId}/details`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch user details. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const userDetails = data.user;
                const licenses = data.licenses;
                if (userDetails) {
                    userNameField.value = userDetails.name || '';
                    userIdField.value = userDetails.id_number || '';
                    userBirthdayField.value = userDetails.birthday || '';
                    userSexField.value = userDetails.sex || '';
                    userContactField.value = userDetails.contact || '';
                } else {
                    console.error('User details are missing in response:', data);
                    alert('Failed to load user details. Please try again.');
                }

                if (licenses && licenses.length > 0) {
                    licenses.forEach(license => {
                        if (license.license_type === 'Car') {
                            license1ID = license.license_id || null;
                            license1NumField.value = license.license_number || '';
                            license1ExpiryField.value = license.license_expiry_date || '';
                        } else if (license.license_type === 'Motorcycle') {
                            license2ID = license.license_id || null;
                            license2NumField.value = license.license_number || '';
                            license2ExpiryField.value = license.license_expiry_date || '';
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                alert('Error fetching user details. Please check the console for more information.');
            });
    }

    function deleteUser() {
        if (!userId) {
            alert('User ID is missing. Cannot delete user.');
            return;
        }

        if (confirm('Are you sure you want to delete this user?')) {
            fetch(`${apiBaseUrl}/users/${userId}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete user');
                    }
                    alert('User deleted successfully!');
                    window.location.href = 'userList.html'; // 返回用户列表页面
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                    alert('Error occurred while deleting user.');
                });
        }
    }

    function deleteCarLicense() {
        if (!license1ID) {
            alert('Car license ID is missing. Cannot delete car license.');
            return;
        }

        if (confirm('Are you sure you want to delete the car license?')) {
            fetch(`${apiBaseUrl}/licenses/${license1ID}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete car license');
                    }
                    alert('Car license deleted successfully!');
                    location.reload(); // 重载页面
                })
                .catch(error => {
                    console.error('Error deleting car license:', error);
                    alert('Error occurred while deleting car license.');
                });
        }
    }

    function deleteMotorcycleLicense() {
        if (!license2ID) {
            alert('Motorcycle license ID is missing. Cannot delete motorcycle license.');
            return;
        }

        if (confirm('Are you sure you want to delete the motorcycle license?')) {
            fetch(`${apiBaseUrl}/licenses/${license2ID}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete motorcycle license');
                    }
                    alert('Motorcycle license deleted successfully!');
                    location.reload(); // 重载页面
                })
                .catch(error => {
                    console.error('Error deleting motorcycle license:', error);
                    alert('Error occurred while deleting motorcycle license.');
                });
        }
    }
});
