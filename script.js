let currentStep = 1;
const form = document.getElementById("profileForm");

window.onload = function () {
    showStep(currentStep);
    loadCountries();
};

function showStep(step) {
    let steps = document.querySelectorAll(".form-step");
    steps.forEach((s) => (s.style.display = "none"));
    steps[step - 1].style.display = "block";
    currentStep = step;
}

function nextStep() {
    const currentForm = document.getElementById(`step-${currentStep}`);
    const inputs = currentForm.querySelectorAll('input, select');
    let valid = true;

    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            valid = false;
            input.style.borderColor = "red";
            input.classList.add('error-input');
        } else {
            input.style.borderColor = "";
            input.classList.remove('error-input');
        }
    });

    if (valid) {
        currentStep++;
        showStep(currentStep);
    } else {
        alert("Please fill in all required fields.");
    }
}

function prevStep() {
    currentStep--;
    showStep(currentStep);
}

function togglePasswordVisibility(inputId) {
    let passwordInput = document.getElementById(inputId);
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}

function checkPasswordMatch() {
    let password = document.getElementById("newPassword").value;
    let confirmPassword = document.getElementById("confirmNewPassword").value;
    let matchStatus = document.getElementById("passwordMatchStatus");
    let strength = document.getElementById("passwordStrength");

    if (password.length === 0) {
        strength.className = "";
        strength.textContent = "";
    } else if (password.length < 8) {
        strength.className = "weak";
        strength.textContent = "Weak";
    } else if (password.length < 12) {
        strength.className = "medium";
        strength.textContent = "Medium";
    } else {
        strength.className = "strong";
        strength.textContent = "Strong";
    }

    if (confirmPassword !== "") {
        if (password === confirmPassword) {
            matchStatus.textContent = "Passwords match";
            matchStatus.style.color = "green";
        } else {
            matchStatus.textContent = "Passwords do not match";
            matchStatus.style.color = "red";
        }
    } else {
        matchStatus.textContent = "";
    }
}

function toggleFields() {
    let profession = document.getElementById("profession").value;
    let companyField = document.getElementById("companyField");
    let genderSection = document.getElementById("genderSection");

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
    let otherGenderInput = document.getElementById("customGender");
    let genderRadios = document.querySelectorAll('input[name="gender"]');
    let otherSelected = false;

    genderRadios.forEach(radio => {
        if (radio.value === "Other" && radio.checked) {
            otherSelected = true;
        }
    });

    otherGenderInput.style.display = otherSelected ? "block" : "none";
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

function showSummary() {
    let steps = document.querySelectorAll(".form-step");
    steps.forEach((s) => (s.style.display = "none"));
    document.getElementById("step-4").style.display = "block";
    currentStep = 4;

    const formData = new FormData(form);
    let summaryContent = document.getElementById("summaryContent");
    summaryContent.innerHTML = `
        <h3>Personal Information</h3>
        <div class="summary-item"><strong>Username:</strong> <span>${formData.get("username")}</span></div>
    `;

    const newPassword = formData.get("newPassword");
    if (newPassword) {
        summaryContent.innerHTML += `<div class="summary-item"><strong>Password:</strong> <span>********</span></div>`;
    }

    const profilePhotoInput = document.getElementById('profilePhoto');
    if (profilePhotoInput.files && profilePhotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const photoPreviewHTML = `
                <div class="summary-item">
                    <strong>Profile Photo:</strong><br>
                    <img src="${e.target.result}" alt="Profile Photo" width="100" style="border-radius: 8px;">
                </div>
            `;
            summaryContent.innerHTML += photoPreviewHTML;
            appendRestOfSummary();
        }
        reader.readAsDataURL(profilePhotoInput.files[0]);
    } else {
        appendRestOfSummary();
    }

    function appendRestOfSummary() {
        summaryContent.innerHTML += `
            <h3>Profession Details</h3>
            <div class="summary-item"><strong>Profession:</strong> <span>${formData.get("profession")}</span></div>
        `;

        const company = formData.get("company");
        if (company) {
            summaryContent.innerHTML += `<div class="summary-item"><strong>Company:</strong> <span>${company}</span></div>`;
        }
        const gender = formData.get("gender");
        const customGender = formData.get("customGender");
        if (gender) {
            summaryContent.innerHTML += `<div class="summary-item"><strong>Gender:</strong> <span>${gender === "Other" ? customGender : gender}</span></div>`;
        }

        summaryContent.innerHTML += `
            <div class="summary-item"><strong>Address Line 1:</strong> <span>${formData.get("addressLine1")}</span></div>
            <h3>Preference Details</h3>
            <div class="summary-item"><strong>Country:</strong> <span>${formData.get("country")}</span></div>
            <div class="summary-item"><strong>State:</strong> <span>${formData.get("state")}</span></div>
            <div class="summary-item"><strong>City:</strong> <span>${formData.get("city")}</span></div>
            <div class="summary-item"><strong>Subscription Plan:</strong> <span>${formData.get("plan")}</span></div>
            <div class="summary-item"><strong>Newsletter:</strong> <span>${formData.get("newsletter") ? "Yes" : "No"}</span></div>
        `;
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        if (key === 'newsletter') {
            data[key] = value === 'on';
        } else {
            data[key] = value;
        }
    }
    const profilePhotoInput = document.getElementById('profilePhoto');
    let profilePhotoData = null;

    if (profilePhotoInput.files && profilePhotoInput.files[0]) {
        profilePhotoData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(profilePhotoInput.files[0]);
        });
    }
    data.profilePhoto = profilePhotoData;

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
});