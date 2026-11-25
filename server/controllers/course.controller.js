import Course from '../models/Course.js';
import Branch from '../models/Branch.js';

export async function listActiveCourses(req, res) {
  try {
    const courses = await Course.find({ isActive: true }).lean();
    const branches = await Branch.find({ isActive: true }).lean();

    const data = courses.map((c) => ({
      ...c,
      branches: branches.filter((b) => String(b.courseId) === String(c._id)),
    }));

    res.json({ courses: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getCourseById(req, res) {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const branches = await Branch.find({ courseId: course._id, isActive: true }).lean();
    res.json({ course: { ...course, branches } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

