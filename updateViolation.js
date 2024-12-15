document.addEventListener('DOMContentLoaded', () => { 
    const apiBaseUrl = 'https://license-system-nu.vercel.app/api';
    const deleteViolationBtn = document.getElementById('deleteViolationBtn');
    const updateViolationBtn = document.getElementById('updateViolationBtn');
    
    const userIdField = document.getElementById('id');
    const licenseTypeField = document.getElementById('licenseType');
    const violationDateField = document.getElementById('violationDate');
    const violationTypeField = document.getElementById('violationType');
    const paymentStatusField = document.getElementById('paymentStatus');
    const fineAmountField = document.getElementById('fineAmount');

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    const licenseId = urlParams.get('license');
    const violationId = urlParams.get('violation');

    if (userId && licenseId) {
        loadUserDetails(userId, licenseId, violationId);
    } else {
        alert('Missing parameters in the URL.');
    }

    if (deleteViolationBtn) {
        deleteViolationBtn.addEventListener('click', deleteViolation);
    }
    if (updateViolationBtn) {
        updateViolationBtn.addEventListener('click', UpdateViolation);
    }

    function loadUserDetails(userId, licenseId, violationId) {
        fetch(`${apiBaseUrl}/users/${userId}/details`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch user details. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const foundLicense = data.licenses.find(license => license.license_id.toString() === licenseId);

                if (!foundLicense) {
                    alert('License not found for the given user ID.');
                    return;
                }

                userIdField.value = foundLicense.id_number;
                licenseTypeField.value = foundLicense.license_type;

                if (violationId) {
                    const foundViolation = foundLicense.violations.find(violation => violation.violation_id.toString() === violationId);

                    if (!foundViolation) {
                        alert('Violation not found for the given license.');
                        return;
                    }

                    violationDateField.value = foundViolation.violation_date;
                    violationTypeField.value = foundViolation.violation_type;
                    paymentStatusField.value = foundViolation.payment_status;
                    fineAmountField.value = foundViolation.fine_amount;
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                alert('Error fetching user details. Please check the console for more information.');
            });
    }

    function deleteViolation() {
        if (!userId || !licenseId || !violationId) {
            alert('Missing parameters. Cannot delete violation.');
            return;
        }

        if (confirm('Are you sure you want to delete this violation?')) {
            fetch(`${apiBaseUrl}/violations/${violationId}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete violation');
                    }
                    alert('Violation deleted successfully!');
                    window.location.href = 'violationList.html';
                })
                .catch(error => {
                    console.error('Error deleting violation:', error);
                    alert('Error occurred while deleting violation.');
                });
        }
    }

    function UpdateViolation() {
        if (!userId || !licenseId) {
            alert('Missing parameters. Cannot save or update violation.');
            return;
        }

        const violationData = {
            id_number: userId,
            license_id: licenseId,
            violation_date: violationDateField.value,
            violation_type: violationTypeField.value,
            payment_status: paymentStatusField.value,
            fine_amount: parseFloat(fineAmountField.value),
        };

        if (Object.values(violationData).some(value => value === null || value === '')) {
            alert('Please fill out all required fields!');
            return;
        }

        fetch(`${apiBaseUrl}/violations/${violationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(violationData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to update violation`);
                }
                return response.json();
            })
            .then(data => {
                alert('Violation updated successfully!');
                window.location.href = 'violationList.html';
            })
            .catch(error => {
                console.error('Error updating violation:', error);
                alert('Error occurred while updating violation.');
            });
    }
});
