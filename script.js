let currentStep = 1;
showStep(currentStep);

function nextStep() {
    if (currentStep === 1) {
        const newPassword = document.getElementById("newPassword").value;
        const confirmNewPassword = document.getElementById("confirmNewPassword").value;
        if (newPassword !== confirmNewPassword) {
            alert("Passwords do not match. Please retype.");
            return;
        }
    }
    currentStep++;
    showStep(currentStep);
}

function prevStep() {
    currentStep--;
    showStep(currentStep);
}

function showStep(step) {
    document.querySelectorAll(".form-step").forEach((div, index) => {
        div.style.display = index === step - 1 ? "block" : "none";
    });

    if (step === 4) generateSummary();
}

function toggleFields() {
    const profession = document.getElementById("profession").value;
    const companyField = document.getElementById("companyField");
    const genderSection = document.getElementById("genderSection");

    if (profession === "Entrepreneur") {
        companyField.style.display = "none";
        genderSection.style.display = "block";
    } else if (profession === "Student") {
        companyField.style.display = "block";
        genderSection.style.display = "block";
    } else {
        companyField.style.display = "block";
        genderSection.style.display = "block";
    }
}



function handleGenderChange() {
    const otherGender = document.querySelector("input[name='gender'][value='Other']").checked;
    document.getElementById("customGender").style.display = otherGender ? "inline-block" : "none";
}

function checkPasswordMatch() {
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;
    const passwordMatchStatus = document.getElementById("passwordMatchStatus");

    if (confirmNewPassword !== "") {
        if (newPassword === confirmNewPassword) {
            passwordMatchStatus.textContent = "Passwords match";
            passwordMatchStatus.style.color = "green";
        } else {
            passwordMatchStatus.textContent = "Passwords do not match";
            passwordMatchStatus.style.color = "red";
        }
    } else {
        passwordMatchStatus.textContent = "";
    }
}

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const showCheckbox = passwordInput.nextElementSibling.querySelector('input[type="checkbox"]');

    if (showCheckbox.checked) {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}


const countrySelect = document.getElementById("country");
const stateSelect = document.getElementById("state");
const citySelect = document.getElementById("city");

async function loadCountries() {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
    const data = await res.json();
    countrySelect.innerHTML = `<option value="">Select Country</option>`;
    data.data.forEach(country => {
        const option = document.createElement("option");
        option.value = country.name;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

countrySelect.addEventListener("change", async () => {
    const country = countrySelect.value;
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country })
    });
    const data = await res.json();
    stateSelect.innerHTML = `<option value="">Select State</option>`;
    if (data && data.data && data.data.states) {
        data.data.states.forEach(state => {
            const option = document.createElement("option");
            option.value = state.name;
            option.textContent = state.name;
            stateSelect.appendChild(option);
        });
    }
    citySelect.innerHTML = `<option value="">Select City</option>`;
});

stateSelect.addEventListener("change", async () => {
    const country = countrySelect.value;
    const state = stateSelect.value;
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, state })
    });
    const data = await res.json();
    citySelect.innerHTML = `<option value="">Select City</option>`;
    if (data && data.data) {
        data.data.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
});

function generateSummary() {
    const summary = document.getElementById("summaryContent");
    summary.innerHTML = '';

    const formData = new FormData(document.getElementById("profileForm"));
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Profile Photo in Summary
    if (data.profilePhoto instanceof File) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const photoURL = e.target.result;
            const photoSummaryHTML = `
                <h4>Profile Photo</h4>
                <div class="summary-photo-container">
                    <img src="${photoURL}" alt="Profile Photo" class="profile-thumbnail">
                    <label>
                        <input type="checkbox" onclick="toggleFullImage(this, '${photoURL}')"> Show Full Image
                    </label>
                    <img id="fullImagePreview" src="" alt="Full Profile Photo" class="full-profile-image" style="display: none;">
                </div>
            `;
            summary.innerHTML = photoSummaryHTML + summary.innerHTML; // Add photo at the beginning
            appendSummaryDetails(data, summary);
        }
        reader.readAsDataURL(data.profilePhoto);
    } else {
        appendSummaryDetails(data, summary);
    }
}

function toggleFullImage(checkbox, imageURL) {
    const fullImagePreview = checkbox.parentNode.querySelector('.full-profile-image');
    if (checkbox.checked) {
        fullImagePreview.src = imageURL;
        fullImagePreview.style.display = 'block';
    } else {
        fullImagePreview.style.display = 'none';
        fullImagePreview.src = '';
    }
}

function appendSummaryDetails(data, summary) {
    summary.innerHTML += `<h4>Personal Information</h4>`;
    summary.innerHTML += `<div class="summary-item"><strong>Username:</strong> <span>${data.username}</span></div>`;
    if (data.newPassword) {
        summary.innerHTML += `<div class="summary-item"><strong>New Password:</strong> <span>********</span></div>`;
    }

    summary.innerHTML += `<h4>Professional Details</h4>`;
    summary.innerHTML += `<div class="summary-item"><strong>Profession:</strong> <span>${data.profession}</span></div>`;
    if (data.profession !== "Entrepreneur") {
        summary.innerHTML += `<div class="summary-item"><strong>Company:</strong> <span>${data.company || 'N/A'}</span></div>`;
    }
    if (data.gender) {
        summary.innerHTML += `<div class="summary-item"><strong>Gender:</strong> <span>${data.gender === 'Other' ? data.customGender : data.gender}</span></div>`;
    }
    if (data.addressLine1) {
        summary.innerHTML += `<div class="summary-item"><strong>Address:</strong> <span>${data.addressLine1}</span></div>`;
    }

    summary.innerHTML += `<h4>Preferences</h4>`;
    summary.innerHTML += `<div class="summary-item"><strong>Country:</strong> <span>${data.country}</span></div>`;
    summary.innerHTML += `<div class="summary-item"><strong>State:</strong> <span>${data.state}</span></div>`;
    summary.innerHTML += `<div class="summary-item"><strong>City:</strong> <span>${data.city}</span></div>`;
    summary.innerHTML += `<div class="summary-item"><strong>Subscription Plan:</strong> <span>${data.plan}</span></div>`;
    summary.innerHTML += `<div class="summary-item"><strong>Newsletter:</strong> <span>${data.newsletter === 'on' ? 'Yes' : 'No'}</span></div>`;
}

function showSummary() {
    currentStep = 4;
    showStep(currentStep);
}

async function submitForm(event) {
    event.preventDefault();
    const form = document.getElementById("profileForm");
    const formData = new FormData(form);

    try {
        const response = await fetch("http://localhost:5000/api/submit", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            alert("✅ Profile updated and saved successfully!");
            form.reset();
            currentStep = 1;
            showStep(currentStep);
            loadCountries();
        } else {
            const errorData = await response.json();
            alert("❌ Error: " + (errorData.message || "Failed to save profile."));
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("❌ Error: Failed to connect to the server.");
    }
}

document.addEventListener("DOMContentLoaded", loadCountries);
document.getElementById("profileForm").addEventListener("submit", submitForm);

