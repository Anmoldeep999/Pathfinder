// assets/js/account.js
// Account management page with CRUD operations

import { 
  getAccountProfile, 
  updateAccountProfile, 
  changePassword, 
  deleteAccount,
  getAccountActivity 
} from "./api.js";

// DOM Elements
const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const fullNameInput = document.getElementById("fullName");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const profileMessage = document.getElementById("profileMessage");
const passwordMessage = document.getElementById("passwordMessage");
const currentUserSpan = document.getElementById("currentUser");
const activityBody = document.getElementById("activityBody");
const btnRefreshProfile = document.getElementById("btnRefreshProfile");
const btnDeleteAccount = document.getElementById("btnDeleteAccount");
const deleteModal = document.getElementById("deleteModal");
const btnCancelDelete = document.getElementById("btnCancelDelete");
const btnConfirmDelete = document.getElementById("btnConfirmDelete");
const deleteConfirmPassword = document.getElementById("deleteConfirmPassword");

// Show message helper
function showMessage(element, message, isError = false) {
  element.innerHTML = `<span class="badge ${isError ? 'bad' : 'good'}">${message}</span>`;
  setTimeout(() => {
    element.innerHTML = "";
  }, 5000);
}

// Load profile data (READ)
async function loadProfile() {
  try {
    const profile = await getAccountProfile();
    usernameInput.value = profile.username || "";
    emailInput.value = profile.email || "";
    fullNameInput.value = profile.full_name || "";
    currentUserSpan.textContent = profile.username || "Unknown";
  } catch (err) {
    console.error("Failed to load profile:", err);
    showMessage(profileMessage, "Failed to load profile: " + err.message, true);
  }
}

// Update profile (UPDATE)
async function handleProfileUpdate(e) {
  e.preventDefault();
  
  const data = {
    email: emailInput.value.trim(),
    full_name: fullNameInput.value.trim()
  };
  
  try {
    await updateAccountProfile(data);
    showMessage(profileMessage, "Profile updated successfully!");
    await loadProfile();
  } catch (err) {
    console.error("Failed to update profile:", err);
    showMessage(profileMessage, "Failed to update profile: " + err.message, true);
  }
}

// Change password (UPDATE)
async function handlePasswordChange(e) {
  e.preventDefault();
  
  const currentPwd = currentPasswordInput.value;
  const newPwd = newPasswordInput.value;
  const confirmPwd = confirmPasswordInput.value;
  
  // Validation
  if (newPwd !== confirmPwd) {
    showMessage(passwordMessage, "New passwords do not match!", true);
    return;
  }
  
  if (newPwd.length < 6) {
    showMessage(passwordMessage, "Password must be at least 6 characters!", true);
    return;
  }
  
  try {
    await changePassword(currentPwd, newPwd);
    showMessage(passwordMessage, "Password changed successfully!");
    passwordForm.reset();
  } catch (err) {
    console.error("Failed to change password:", err);
    showMessage(passwordMessage, "Failed to change password: " + err.message, true);
  }
}

// Delete account (DELETE)
async function handleDeleteAccount() {
  const password = deleteConfirmPassword.value;
  
  if (!password) {
    alert("Please enter your password to confirm deletion.");
    return;
  }
  
  try {
    await deleteAccount(password);
    alert("Your account has been deleted.");
    logout();
  } catch (err) {
    console.error("Failed to delete account:", err);
    alert("Failed to delete account: " + err.message);
  }
}

// Load account activity
async function loadActivity() {
  try {
    const activities = await getAccountActivity();
    
    if (activities.length === 0) {
      activityBody.innerHTML = '<tr><td colspan="3" class="muted" style="text-align:center;">No recent activity</td></tr>';
      return;
    }
    
    activityBody.innerHTML = activities.map(act => `
      <tr>
        <td>${act.time}</td>
        <td>${act.action}</td>
        <td class="muted">${act.details}</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load activity:", err);
    activityBody.innerHTML = '<tr><td colspan="3" class="muted" style="text-align:center;">Failed to load activity</td></tr>';
  }
}

// Modal controls
function showDeleteModal() {
  deleteModal.style.display = "flex";
  deleteConfirmPassword.value = "";
  deleteConfirmPassword.focus();
}

function hideDeleteModal() {
  deleteModal.style.display = "none";
  deleteConfirmPassword.value = "";
}

// Event listeners
profileForm.addEventListener("submit", handleProfileUpdate);
passwordForm.addEventListener("submit", handlePasswordChange);
btnRefreshProfile.addEventListener("click", loadProfile);
btnDeleteAccount.addEventListener("click", showDeleteModal);
btnCancelDelete.addEventListener("click", hideDeleteModal);
btnConfirmDelete.addEventListener("click", handleDeleteAccount);

// Close modal on outside click
deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) {
    hideDeleteModal();
  }
});

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && deleteModal.style.display === "flex") {
    hideDeleteModal();
  }
});

// Initialize
loadProfile();
loadActivity();
