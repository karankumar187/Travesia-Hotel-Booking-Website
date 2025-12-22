// Helper function to fetch user data from Clerk API
// This is used as a fallback when user is not in database

export const fetchUserFromClerk = async (userId) => {
  try {
    // Check if Clerk secret key is available
    if (!process.env.CLERK_SECRET_KEY) {
      console.warn("⚠️ CLERK_SECRET_KEY not set - cannot fetch user from Clerk API");
      return null;
    }

    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch user from Clerk API: ${response.status} ${response.statusText}`);
      return null;
    }

    const clerkUser = await response.json();
    
    // Extract user data from Clerk response
    const email = clerkUser.email_addresses?.[0]?.email_address || 
                 clerkUser.primary_email_address_id ? 
                   clerkUser.email_addresses?.find(e => e.id === clerkUser.primary_email_address_id)?.email_address :
                   null;
    const username = clerkUser.first_name && clerkUser.last_name 
      ? `${clerkUser.first_name} ${clerkUser.last_name}`.trim()
      : clerkUser.first_name || clerkUser.last_name || clerkUser.username || "Guest";
    const image = clerkUser.image_url || "";

    return {
      _id: userId,
      email: email,
      username: username,
      image: image,
      role: "user"
    };
  } catch (error) {
    console.error("❌ Error fetching user from Clerk API:", error.message);
    return null;
  }
};

