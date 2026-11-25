import StudentProfile from '../models/StudentProfile.js';

export async function getProfile(req, res) {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await StudentProfile.create({ userId: req.user._id });
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updatePersonal(req, res) {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { personal: req.body } },
      { new: true, upsert: true }
    );
    res.json({ profile, message: 'Personal details saved.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAcademic(req, res) {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { academic: req.body } },
      { new: true, upsert: true }
    );
    res.json({ profile, message: 'Academic details saved.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

