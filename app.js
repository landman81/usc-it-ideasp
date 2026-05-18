// Import the functions I need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, setDoc, getDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
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

// Admin email - change this to your email for full access
const ADMIN_EMAIL = "lwevans@email.sc.edu";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Get HTML elements
const loginBtn = document.getElementById("loginBtn");
const changeDisplayNameBtn = document.getElementById("changeDisplayNameBtn");
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
const signupDisplayName = document.getElementById("signupDisplayName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirmPassword = document.getElementById("signupConfirmPassword");
const signupBtn = document.getElementById("signupBtn");

// Login form elements
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");

// Edit Idea Modal elements
const editIdeaModal = document.getElementById("editIdeaModal");
const closeEditModal = document.getElementById("closeEditModal");\nconst editIdeaText = document.getElementById("editIdeaText");
const saveEditBtn = document.getElementById("saveEditBtn");
let currentEditingIdeaId = null;

// Display Name Modal elements
const displayNameModal = document.getElementById("displayNameModal");
const closeDisplayNameModal = document.getElementById("closeDisplayNameModal");
const displayNameInput = document.getElementById("displayNameInput");
const saveDisplayNameBtn = document.getElementById("saveDisplayNameBtn");

let currentUser = null;
let currentDisplayName = null;
let isAdmin = false;

// Modal functions
function openAuthModal() {
  authModal.style.display = "flex";
}

function closeAuthModal() {
  authModal.style.display = "none";
  signupDisplayName.value = "";
  signupEmail.value = "";
  signupPassword.value = "";
  signupConfirmPassword.value = "";
  loginEmail.value = "";
  loginPassword.value = "";
}

closeModalBtn.addEventListener("click", closeAuthModal);
closeEditModal.addEventListener("click", () => {
  editIdeaModal.style.display = "none";
  currentEditingIdeaId = null;
});
closeDisplayNameModal.addEventListener("click", () => {
  displayNameModal.style.display = "none";
});

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
  const displayName = signupDisplayName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  const confirmPassword = signupConfirmPassword.value;

  if (!displayName || !email || !password || !confirmPassword) {
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
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save user data with display name
    await setDoc(doc(db, "users", user.uid), {
      displayName: displayName,
      email: email,
      createdAt: new Date()
    });
    
    alert("Account created successfully! You are now logged in.");
    closeAuthModal();
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
  } catch (error) {
    console.error("Error logging in:", error);
    alert(`Error: ${error.message}`);
  }
});

// Handle Google login button in modal
const googleLoginBtn = document.getElementById("googleLoginBtn");
const googleLoginBtn2 = document.getElementById("googleLoginBtn2");

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          // First time login with Google, ask for display name
          displayNameInput.value = user.displayName || "";
          displayNameModal.style.display = "flex";
        } else {
          closeAuthModal();
        }
      })
      .catch((error) => alert(`Google login error: ${error.message}`));
  });
}

if (googleLoginBtn2) {
  googleLoginBtn2.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
          displayNameInput.value = user.displayName || "";
          displayNameModal.style.display = "flex";
        } else {
          closeAuthModal();
        }
      })
      .catch((error) => alert(`Google login error: ${error.message}`));
  });
}

// Handle display name save
saveDisplayNameBtn.addEventListener("click", async () => {
  const displayName = displayNameInput.value.trim();
  
  if (!displayName) {
    alert("Please enter a display name");
    return;
  }
  
  try {
    await setDoc(doc(db, "users", currentUser.uid), {
      displayName: displayName,
      email: currentUser.email,
      createdAt: new Date()
    });
    displayNameModal.style.display = "none";
    closeAuthModal();
  } catch (error) {
    console.error("Error saving display name:", error);
    alert("Error saving display name");
  }
});

// Handle change display name button
if (changeDisplayNameBtn) {
  changeDisplayNameBtn.addEventListener("click", () => {
    displayNameInput.value = currentDisplayName || "";
    displayNameModal.style.display = "flex";
  });
}

// Handle login button
loginBtn.addEventListener("click", () => {
  if (currentUser) {
    signOut(auth);
  } else {
    openAuthModal();
  }
});

// Track auth state changes
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    // Check if user is admin
    isAdmin = user.email === ADMIN_EMAIL;
    
    // Get user's display name from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      currentDisplayName = userDoc.data().displayName;
    } else {
      currentDisplayName = user.displayName || "Anonymous";
    }
    
    loginBtn.textContent = `Logout (${user.email})`;
    if (changeDisplayNameBtn) {
      changeDisplayNameBtn.style.display = "inline-block";
    }
    postIdeaSection.style.display = "block";
  } else {
    currentDisplayName = null;
    isAdmin = false;
    loginBtn.textContent = "Login / Sign Up";
    if (changeDisplayNameBtn) {
      changeDisplayNameBtn.style.display = "none";
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
      authorId: currentUser.uid,
      author: currentUser.email,
      authorName: currentDisplayName || "Anonymous",
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0,
      upvoters: [],
      downvoters: []
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
    const isOwnIdea = currentUser && currentUser.uid === idea.authorId;
    const isAdminUser = isAdmin;
    const hasUpvoted = currentUser && idea.upvoters && idea.upvoters.includes(currentUser.uid);
    const hasDownvoted = currentUser && idea.downvoters && idea.downvoters.includes(currentUser.uid);
    
    const ideaDiv = document.createElement("div");
    ideaDiv.className = "idea-card";
    
    let actionsHTML = `
      <button class="vote-btn upvote-btn ${hasUpvoted ? 'voted' : ''}" data-id="${ideaId}" ${!currentUser ? 'disabled' : ''}>👍 ${idea.upvotes || 0}</button>
      <button class="vote-btn downvote-btn ${hasDownvoted ? 'voted' : ''}" data-id="${ideaId}" ${!currentUser ? 'disabled' : ''}>👎 ${idea.downvotes || 0}</button>
    `;
    
    if (isOwnIdea || isAdminUser) {
      actionsHTML += `
        <button class="edit-btn" data-id="${ideaId}">✏️ Edit</button>
        <button class="delete-btn" data-id="${ideaId}">🗑️ Delete</button>
      `;
    }
    
    ideaDiv.innerHTML = `
      <p><strong>${idea.authorName}</strong> • ${idea.timestamp.toDate().toLocaleDateString()}</p>\n      <p>${idea.text}</p>
      <div class="idea-actions">
        ${actionsHTML}
      </div>
    `;
    
    // Upvote button
    const upvoteBtn = ideaDiv.querySelector(".upvote-btn");
    if (upvoteBtn) {
      upvoteBtn.addEventListener("click", async () => {
        if (!currentUser) {
          alert("Please login to vote");
          return;
        }
        
        try {
          if (hasUpvoted) {
            // Remove upvote
            await updateDoc(doc(db, "ideas", ideaId), {
              upvotes: Math.max(0, (idea.upvotes || 1) - 1),
              upvoters: arrayRemove(currentUser.uid)
            });
          } else {
            // Add upvote and remove downvote if exists
            const newUpvoters = [...(idea.upvoters || [])];
            if (!newUpvoters.includes(currentUser.uid)) {
              newUpvoters.push(currentUser.uid);
            }
            
            const newDownvoters = (idea.downvoters || []).filter(id => id !== currentUser.uid);
            const downvoteChange = idea.downvoters && idea.downvoters.includes(currentUser.uid) ? -1 : 0;
            
            await updateDoc(doc(db, "ideas", ideaId), {
              upvotes: (idea.upvotes || 0) + 1,
              downvotes: Math.max(0, (idea.downvotes || 0) + downvoteChange),
              upvoters: newUpvoters,
              downvoters: newDownvoters
            });
          }
        } catch (error) {
          console.error("Error updating upvote:", error);
        }
      });
    }
    
    // Downvote button
    const downvoteBtn = ideaDiv.querySelector(".downvote-btn");
    if (downvoteBtn) {
      downvoteBtn.addEventListener("click", async () => {
        if (!currentUser) {
          alert("Please login to vote");
          return;
        }
        
        try {
          if (hasDownvoted) {
            // Remove downvote
            await updateDoc(doc(db, "ideas", ideaId), {
              downvotes: Math.max(0, (idea.downvotes || 1) - 1),
              downvoters: arrayRemove(currentUser.uid)
            });
          } else {
            // Add downvote and remove upvote if exists
            const newDownvoters = [...(idea.downvoters || [])];
            if (!newDownvoters.includes(currentUser.uid)) {
              newDownvoters.push(currentUser.uid);
            }
            
            const newUpvoters = (idea.upvoters || []).filter(id => id !== currentUser.uid);
            const upvoteChange = idea.upvoters && idea.upvoters.includes(currentUser.uid) ? -1 : 0;
            
            await updateDoc(doc(db, "ideas", ideaId), {
              downvotes: (idea.downvotes || 0) + 1,
              upvotes: Math.max(0, (idea.upvotes || 0) + upvoteChange),
              upvoters: newUpvoters,
              downvoters: newDownvoters
            });
          }
        } catch (error) {
          console.error("Error updating downvote:", error);
        }
      });
    }
    
    // Edit button
    const editBtn = ideaDiv.querySelector(".edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        currentEditingIdeaId = ideaId;
        editIdeaText.value = idea.text;
        editIdeaModal.style.display = "flex";
      });
    }
    
    // Delete button
    const deleteBtn = ideaDiv.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this idea?")) {
          try {
            await deleteDoc(doc(db, "ideas", ideaId));
          } catch (error) {
            console.error("Error deleting idea:", error);
            alert("Error deleting idea");
          }
        }
      });
    }
    
    ideasListSection.appendChild(ideaDiv);
  });
});

// Handle save edited idea
saveEditBtn.addEventListener("click", async () => {
  const updatedText = editIdeaText.value.trim();
  
  if (!updatedText) {
    alert("Idea cannot be empty");
    return;
  }
  
  try {
    await updateDoc(doc(db, "ideas", currentEditingIdeaId), {
      text: updatedText
    });
    editIdeaModal.style.display = "none";
    currentEditingIdeaId = null;
  } catch (error) {
    console.error("Error updating idea:", error);
    alert("Error updating idea");
  }
});
