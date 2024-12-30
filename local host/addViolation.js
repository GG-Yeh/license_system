document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://127.0.0.1:10000/api';
    const addViolationBtn = document.getElementById('addViolationBtn');
    const userIdField = document.getElementById('id');
    const licenseTypeSelect = document.getElementById('licenseType');

    // Store license_type to license_id mapping
    let licenseTypeToIdMap = {};

    // Populate User ID dropdown
    fetch(`${apiBaseUrl}/users`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const dropdownMenu = document.getElementById('userDropdown');
            dropdownMenu.innerHTML = ''; // Clear existing options

            data.forEach(user => {
                const menuItem = document.createElement('li');
                const menuLink = document.createElement('a');

                menuLink.classList.add('dropdown-item');
                menuLink.href = '#';
                menuLink.textContent = user.id_number;
                menuLink.addEventListener('click', () => {
                    userIdField.value = user.id_number;
                    triggerLicenseTypeFetch(user.id_number);
                });

                menuItem.appendChild(menuLink);
                dropdownMenu.appendChild(menuItem);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });

    // Trigger fetching of user details when ID is entered or selected
    userIdField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const userId = userIdField.value.trim();
            if (userId) {
                triggerLicenseTypeFetch(userId);
            }
        }
    });

    function triggerLicenseTypeFetch(userId) {
        fetch(`${apiBaseUrl}/users/${userId}/details`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                licenseTypeSelect.innerHTML = '<option value="" selected disabled>Choose...</option>'; // Clear existing options
                licenseTypeToIdMap = {}; // Clear existing mapping

                if (data.licenses.length === 0) {
                    alert('No licenses found for this user.');
                    location.reload(); // 重载页面
                    return;
                }

                data.licenses.forEach(license => {
                    const option = document.createElement('option');
                    option.value = license.license_type;
                    option.textContent = license.license_type;
                    licenseTypeSelect.appendChild(option);

                    licenseTypeToIdMap[license.license_type] = license.license_id;
                });
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                alert('Failed to fetch user details. Please check the User ID.');
            });
    }

    if (addViolationBtn) {
        addViolationBtn.addEventListener('click', () => {   
            const licenseType = licenseTypeSelect.value.trim();       
            const violationData = {
                id_number: userIdField.value.trim(),
                license_id: licenseTypeToIdMap[licenseType] || '',
                violation_type: document.getElementById('violationType').value.trim(),
                violation_date: document.getElementById('violationDate').value.trim(),
                fine_amount: document.getElementById('fineAmount').value.trim(),
                payment_status: document.getElementById('paymentStatus').value.trim(),
            };

            // Validate violation data
            if (!violationData.id_number || !licenseType ||
                !violationData.violation_type || !violationData.violation_date ||
                !violationData.fine_amount || !violationData.payment_status) {
                alert('Please fill out all violation fields!');
                return;
            }

            // Add violation
            addViolation(apiBaseUrl, violationData)
                .then(data => {
                    alert('Violation added successfully!');
                    // Reload page to reset form
                    location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to add violation. Please try again.');
                });
        });
    }
});

function addViolation(apiBaseUrl, violationData) {
    return fetch(`${apiBaseUrl}/violations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(violationData),
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    });
}
