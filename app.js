// Import the functions I need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_yr7SB4Guyy5Q2t4XqmHdZ0tE6LXPkoA",
  authDomain: "usc-it-ideas.firebaseapp.com",
  projectId: "usc-it-ideas",
  storageBucket: "usc-it-ideas.firebasestorage.app",
  messagingSenderId: "754003756286",
  appId: "1:754003756286:web:0ac230fa79d642e25451af",
  measurementId: "G-25K8Z5MHC9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get HTML elements
const loginBtn = document.getElementById("loginBtn");
const microsoftLoginBtn = document.getElementById("microsoftLoginBtn");
const submitIdeaBtn = document.getElementById("submitIdea");
const ideaTextarea = document.getElementById("ideaText");
const ideasListSection = document.getElementById("ideasList");
const postIdeaSection = document.getElementById("postIdea");

// Auth modal elements
const authModal = document.getElementById("authModal");
const closeModalBtn = document.getElementById("closeModal");
const signupTab = document.getElementById("signupTab");
const loginTab = document.getElementById("loginTab");
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

// Signup form elements
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword = document.getElementById("signupConfirmPassword");
const signupBtn = document.getElementById("signupBtn");

// Login form elements
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");

let currentUser = null;

// Modal functions
function openAuthModal() {
  authModal.style.display = "flex";
}

function closeAuthModal() {
  authModal.style.display = "none";
}

closeModalBtn.addEventListener("click", closeAuthModal);

// Tab switching
signupTab.addEventListener("click", () => {
  signupForm.style.display = "block";
  loginForm.style.display = "none";
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
});

loginTab.addEventListener("click", () => {
  signupForm.style.display = "none";
  loginForm.style.display = "block";
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
});

// Handle signup
signupBtn.addEventListener("click", async () => {
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  const confirmPassword = signupConfirmPassword.value;

  if (!email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created successfully! You are now logged in.");
    closeAuthModal();
    signupEmail.value = "";
    signupPassword.value = "";
    signupConfirmPassword.value = "";
  } catch (error) {
    console.error("Error creating account:", error);
    alert(`Error: ${error.message}`);
  }
});

// Handle login
loginSubmitBtn.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in successfully!");
    closeAuthModal();
    loginEmail.value = "";
    loginPassword.value = "";
  } catch (error) {
    console.error("Error logging in:", error);
    alert(`Error: ${error.message}`);
  }
});

// Handle Google login/logout button click
loginBtn.addEventListener("click", () => {
  if (currentUser) {
    // User is logged in, so logout
    signOut(auth);
  } else {
    // Show auth modal with login options
    openAuthModal();
  }
});

// Add email/password signup button
const emailSignupBtn = document.getElementById("emailSignupBtn");
if (emailSignupBtn) {
  emailSignupBtn.addEventListener("click", () => {
    openAuthModal();
    signupForm.style.display = "block";
    loginForm.style.display = "none";
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
  });
}

// Handle Google login button in modal
const googleLoginBtn = document.getElementById("googleLoginBtn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    signInWithPopup(auth, provider)
      .then(() => closeAuthModal())
      .catch((error) => alert(`Google login error: ${error.message}`));
  });
}

// Handle Microsoft login button click
if (microsoftLoginBtn) {
  microsoftLoginBtn.addEventListener("click", () => {
    if (currentUser) {
      // User is logged in, so logout
      signOut(auth);
    } else {
      // User is not logged in, so login with Microsoft
      const provider = new OAuthProvider('microsoft.com');
      provider.addScopes('mail.read', 'calendar.read');
      provider.setCustomParameters({
        prompt: 'select_account',
        tenant: 'organizations'
      });
      signInWithPopup(auth, provider);
    }
  });
}

// Track auth state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    const providerID = user.providerData[0]?.providerId || 'unknown';
    loginBtn.textContent = `Logout (${user.email})`;
    if (microsoftLoginBtn) {
      microsoftLoginBtn.textContent = `Logout (${user.email})`;
    }
    postIdeaSection.style.display = "block";
  } else {
    loginBtn.textContent = "Login / Sign Up";
    if (microsoftLoginBtn) {
      microsoftLoginBtn.textContent = "Login with Microsoft";
    }
    postIdeaSection.style.display = "none";
  }
});

// Submit new idea
submitIdeaBtn.addEventListener("click", async () => {
  if (!currentUser) {
    alert("Please login first");
    return;
  }

  const ideaText = ideaTextarea.value.trim();
  if (!ideaText) {
    alert("Please enter an idea");
    return;
  }

  try {
    await addDoc(collection(db, "ideas"), {
      text: ideaText,
      author: currentUser.email,
      authorName: currentUser.displayName || "Anonymous",
      timestamp: new Date(),
      votes: 0
    });
    ideaTextarea.value = "";
  } catch (error) {
    console.error("Error adding idea:", error);
    alert("Error posting idea");
  }
});

// Listen for ideas in real-time
onSnapshot(collection(db, "ideas"), (snapshot) => {
  ideasListSection.innerHTML = "";
  
  snapshot.forEach((docSnap) => {
    const idea = docSnap.data();
    const ideaId = docSnap.id;
    
    const ideaDiv = document.createElement("div");
    ideaDiv.className = "idea-card";
    ideaDiv.innerHTML = `
      <p><strong>${idea.authorName}</strong> • ${idea.timestamp.toDate().toLocaleDateString()}</p>
      <p>${idea.text}</p>
      <div class="idea-actions">
        <button class="vote-btn" data-id="${ideaId}">👍 ${idea.votes || 0}</button>
      </div>
    `;
    
    ideaDiv.querySelector(".vote-btn").addEventListener("click", async () => {
      try {
        await updateDoc(doc(db, "ideas", ideaId), {
          votes: (idea.votes || 0) + 1
        });
      } catch (error) {
        console.error("Error updating votes:", error);
      }
    });
    
    ideasListSection.appendChild(ideaDiv);
  });
});
