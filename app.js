// Import the functions I need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

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

let currentUser = null;

// Handle Google login/logout button click
loginBtn.addEventListener("click", () => {
  if (currentUser) {
    // User is logged in, so logout
    signOut(auth);
  } else {
    // User is not logged in, so login with Google
    const provider = new GoogleAuthProvider();
    // Force account picker to show every time
    provider.setCustomParameters({ prompt: 'select_account' });
    signInWithPopup(auth, provider);
  }
});

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
      // Restrict to USC Microsoft accounts (optional)
      provider.setCustomParameters({
        prompt: 'select_account',
        tenant: 'organizations' // Forces organizational accounts
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
    loginBtn.textContent = "Login with Google";
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
