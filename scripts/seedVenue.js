import "dotenv/config";
import mongoose from "mongoose";
import Venue from "../src/models/Venue.model.js";

const OAU_VENUES = [
  { name: "Amphitheatre", category: "event_center", location: { coordinates: [4.5215, 7.4836] } },
  { name: "AWO Complex", category: "lecture_hall", location: { coordinates: [4.5193, 7.4839] } },
  { name: "SUB - Students Union Building", category: "event_center", location: { coordinates: [4.5232, 7.4858] } },
  { name: "Hezekiah Oluwasanmi Library", category: "library", location: { coordinates: [4.5222, 7.4840] } },
  { name: "Faculty of Science", category: "faculty", location: { coordinates: [4.5232, 7.4842] } },
  { name: "Faculty of Arts", category: "faculty", location: { coordinates: [4.5241, 7.4839] } },
  { name: "Faculty of Social Sciences", category: "faculty", location: { coordinates: [4.5233, 7.4833] } },
  { name: "Faculty of Technology", category: "faculty", location: { coordinates: [4.5238, 7.4852] } },
  { name: "Sports Complex", category: "sports", location: { coordinates: [4.5245, 7.4872] } },
  { name: "OAU Conference Centre", category: "event_center", location: { coordinates: [4.5222, 7.4814] } },
  { name: "Africa Hall", category: "hostel", location: { coordinates: [4.5213, 7.4855] } },
  { name: "Moremi Hall", category: "hostel", location: { coordinates: [4.5208, 7.4847] } },
  { name: "Angola Hall", category: "hostel", location: { coordinates: [4.5220, 7.4845] } },
  { name: "Fajuyi Hall", category: "hostel", location: { coordinates: [4.5215, 7.4847] } },
  { name: "Awolowo Hall", category: "hostel", location: { coordinates: [4.5187, 7.4849] } },
  { name: "DLT - Department of Linguistics", category: "lecture_hall", location: { coordinates: [4.5245, 7.4841] } },
];

async function seedVenues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    for (const venue of OAU_VENUES) {
      const existing = await Venue.findOne({ name: venue.name });
      if (existing) {
        console.log(`ℹ️  Skipped: ${venue.name}`);
        continue;
      }
      await Venue.create({ ...venue, isVerified: true, createdBy: null });
      console.log(`✅ Created: ${venue.name}`);
    }

    console.log(`\n🎉 Seeded ${OAU_VENUES.length} OAU venues.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
}

seedVenues();