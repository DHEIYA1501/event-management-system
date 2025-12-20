import React, { useState, useEffect } from "react";
import { getProfile } from "../services/profileService";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const data = await getProfile();
    setProfile(data);
    setLoading(false);
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>👤 Profile Page</h2>
      
      <div style={{ 
        background: "#f8f9fa", 
        padding: "20px", 
        borderRadius: "8px",
        marginTop: "20px"
      }}>
        <h3>User Information</h3>
        <p><strong>Name:</strong> {user.name || "Not set"}</p>
        <p><strong>Email:</strong> {user.email || "Not set"}</p>
        <p><strong>Role:</strong> {user.role || "student"}</p>
        
        <div style={{ marginTop: "20px" }}>
          <button 
            onClick={loadProfile}
            style={{ 
              padding: "10px 20px", 
              background: "#28a745", 
              color: "white", 
              border: "none",
              marginRight: "10px"
            }}
          >
            Refresh Profile
          </button>
          
          <button 
            onClick={() => console.log("User data:", user)}
            style={{ 
              padding: "10px 20px", 
              background: "#6c757d", 
              color: "white", 
              border: "none"
            }}
          >
            Debug User Data
          </button>
        </div>
      </div>

      {profile && (
        <div style={{ 
          marginTop: "20px", 
          padding: "15px", 
          background: "#e7f5ff", 
          borderRadius: "8px"
        }}>
          <h4>Additional Data from API</h4>
          <pre style={{ background: "white", padding: "10px", fontSize: "12px" }}>
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Profile;