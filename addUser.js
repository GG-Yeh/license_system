const apiBaseUrl = 'http://127.0.0.1:10000/api';

document.addEventListener('DOMContentLoaded', () => {
    const addUserBtn = document.getElementById('addUserBtn');

    // 自动计算执照过期日期
    const calculateExpiryDate = (birthday) => {
        const birthDate = new Date(birthday);
        if (isNaN(birthDate.getTime())) {
            return null; // 返回 null 表示无效的日期
        }
        const expiryDate = new Date(birthDate.setFullYear(birthDate.getFullYear() + 75));
        return expiryDate.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
    };

    // 设置默认值为 birthday + 75 年
    const birthdayInput = document.getElementById('birthday');
    birthdayInput.addEventListener('input', () => {
        const birthday = birthdayInput.value.trim();
        const expiryDate = calculateExpiryDate(birthday);
        if (expiryDate) {
            document.getElementById('license1-expiry').value = expiryDate;
            document.getElementById('license2-expiry').value = expiryDate;
        }
    });

    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            const userData = {
                birthday: document.getElementById('birthday').value.trim(),
                contact: document.getElementById('contact').value.trim(),
                id_number: document.getElementById('id').value.trim(),
                name: document.getElementById('name').value.trim(),
                sex: document.getElementById('sex').value.trim(),
            };

            const license1 = {
                id_number: userData.id_number,
                license_type: 'Car',
                license_number: document.getElementById('license1-number').value.trim(),
                license_expiry_date: document.getElementById('license1-expiry').value.trim(),
            };

            const license2 = {
                id_number: userData.id_number,
                license_type: 'Motorcycle',
                license_number: document.getElementById('license2-number').value.trim(),
                license_expiry_date: document.getElementById('license2-expiry').value.trim(),
            };

            // Validate user data
            if (!userData.id_number || !userData.name || !userData.birthday || !userData.sex || !userData.contact) {
                alert('Please fill out all user fields!');
                return;
            }

            // Validate license data (at least one complete)
            const isLicense1Valid = license1.license_number && license1.license_expiry_date;
            const isLicense2Valid = license2.license_number && license2.license_expiry_date;

            if (!isLicense1Valid && !isLicense2Valid) {
                alert('Please fill out at least one complete license!');
                return;
            }

            // Upload user data first
            fetch(`${apiBaseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to add user!');
                    }
                    return response.json();
                })
                .then(data => {
                    alert('User added successfully!');

                    // Upload licenses if valid
                    if (isLicense1Valid) {
                        uploadLicense(license1);
                    }
                    if (isLicense2Valid) {
                        uploadLicense(license2);
                    }

                    // Reload page to reset form
                    location.reload();
                })
                .catch(error => {
                    alert('Error occurred during the process!');
                });
        });
    }
});

/**
 * Upload a license to the backend.
 * @param {Object} licenseData - The license data to upload.
 */
function uploadLicense(licenseData) {
    fetch(`${apiBaseUrl}/licenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(licenseData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to add license: ${licenseData.license_type}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error(`Error adding ${licenseData.license_type} license:`, error);
        });
}
