const { STUDENTS } = require("../data/students");

const getStudents = (parsedUrl, res) => {
  const course = parsedUrl.searchParams.get("course");

  if (course) {
    const results = STUDENTS.filter((student) => student.course === +course);
    res.statusCode = 200;
    res.end(JSON.stringify(results));
  } else {
    res.statusCode = 200;
    res.end(JSON.stringify(STUDENTS));
  }
};

module.exports = { getStudents };
